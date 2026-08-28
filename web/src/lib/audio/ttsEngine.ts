export interface TTSOptions {
  text: string;
  engine: 'kokoro' | 'edge-neural' | 'browser' | 'openai';
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
  const { text, engine, language = 'en-US', rate = 1.0, pitch = 1.0, openaiKey } = options;

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
      console.warn('OpenAI TTS failed, falling back to Browser Neural Synthesis:', errorMsg);
    }
  }

  // 2. High-Performance Browser Speech Synthesis (100% Free, Zero latency)
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.max(0.7, Math.min(rate, 1.8));
      utterance.pitch = Math.max(0.8, Math.min(pitch, 1.3));
      utterance.lang = language;

      // Match natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => 
        (v.lang.startsWith(language.split('-')[0]) || v.lang === language) && 
        (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
      ) || voices.find(v => v.lang.startsWith(language.split('-')[0]));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
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
    onError?.('Speech synthesis not supported in this browser environment.');
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
