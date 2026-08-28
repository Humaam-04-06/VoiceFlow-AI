export interface TTSOptions {
  text: string;
  engine?: 'kokoro' | 'edge-neural' | 'browser' | 'openai';
  language?: string;
  voiceName?: string;
  rate?: number; // 0.5 to 2.0
  pitch?: number; // 0.5 to 1.5
  openaiKey?: string;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudioElement: HTMLAudioElement | null = null;

export async function speakText(
  options: TTSOptions, 
  onStart?: () => void, 
  onEnd?: () => void, 
  onError?: (err: string) => void
): Promise<void> {
  const { text, engine = 'browser', language = 'en-US', rate = 1.0, pitch = 1.0, openaiKey } = options;

  if (!text || !text.trim()) {
    onError?.('No text provided to speak.');
    return;
  }

  stopSpeech();

  // 1. OpenAI TTS (if BYOK key provided)
  if (engine === 'openai' && openaiKey?.trim()) {
    try {
      onStart?.();
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text.slice(0, 4000),
          voice: 'alloy'
        })
      });
      if (!res.ok) throw new Error(`OpenAI TTS Error ${res.status}`);
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      activeAudioElement = new Audio(audioUrl);
      activeAudioElement.onended = () => {
        onEnd?.();
        URL.revokeObjectURL(audioUrl);
      };
      activeAudioElement.onerror = () => onError?.('Audio playback failed.');
      await activeAudioElement.play();
      return;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn('OpenAI TTS failed, falling back to Neural Synthesis:', errorMsg);
    }
  }

  // 2. High-Fidelity Multilingual Neural TTS Engine (Supports Urdu, Hindi, Arabic, Spanish, French, etc.)
  try {
    const langCode = language.split('-')[0].toLowerCase();
    const cleanText = text.replace(/\[Translated.*?\]:\s*/gi, '').trim();
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(cleanText.slice(0, 450))}`;

    onStart?.();
    const audio = new Audio(ttsUrl);
    audio.playbackRate = Math.max(0.75, Math.min(rate, 1.5));
    activeAudioElement = audio;

    let fallbackTriggered = false;

    audio.onended = () => {
      onEnd?.();
      activeAudioElement = null;
    };

    audio.onerror = () => {
      if (!fallbackTriggered) {
        fallbackTriggered = true;
        speakViaBrowserSynthesis(cleanText, language, rate, pitch, onStart, onEnd, onError);
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (!fallbackTriggered) {
          fallbackTriggered = true;
          speakViaBrowserSynthesis(cleanText, language, rate, pitch, onStart, onEnd, onError);
        }
      });
    }
    return;
  } catch (err) {
    console.warn('Neural TTS stream failed, using Web Speech API fallback:', err);
    speakViaBrowserSynthesis(text, language, rate, pitch, onStart, onEnd, onError);
  }
}

function speakViaBrowserSynthesis(
  text: string,
  language: string,
  rate: number,
  pitch: number,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: string) => void
) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.max(0.7, Math.min(rate, 1.8));
      utterance.pitch = Math.max(0.8, Math.min(pitch, 1.3));
      utterance.lang = language;

      const voices = window.speechSynthesis.getVoices();
      const langPrefix = language.split('-')[0].toLowerCase();
      
      const exactVoice = voices.find(v => v.lang.toLowerCase() === language.toLowerCase() || v.lang.toLowerCase().startsWith(langPrefix));
      if (exactVoice) {
        utterance.voice = exactVoice;
      }

      utterance.onstart = () => onStart?.();
      utterance.onend = () => onEnd?.();
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          onError?.(`Speech synthesis error: ${e.error}`);
        }
        onEnd?.();
      };

      activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      onError?.('Browser speech synthesis failed.');
      onEnd?.();
    }
  } else {
    onError?.('Speech synthesis not supported in this browser.');
    onEnd?.();
  }
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined') {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (activeAudioElement) {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement = null;
    }
    activeUtterance = null;
  }
}

export function pauseSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
  if (activeAudioElement) {
    activeAudioElement.pause();
  }
}

export function resumeSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
  if (activeAudioElement) {
    activeAudioElement.play();
  }
}
