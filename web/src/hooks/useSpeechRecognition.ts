'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { TranscriptSegment } from '@/types';

// SpeechRecognition type declarations for cross-browser support
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export function useSpeechRecognition() {
  const {
    recordingState,
    selectedLanguage,
    setLiveInterimText,
    addTranscriptSegment,
    setRawTranscript,
    rawTranscript,
    updateStats,
    setErrorMessage,
  } = useVoiceStore();

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const segmentStartTimeRef = useRef<number>(0);

  const startRecognition = useCallback(() => {
    isManuallyStoppedRef.current = false;
    segmentStartTimeRef.current = Date.now();

    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage('Speech Recognition API is not supported in this browser. Please use Chrome, Edge, Safari, or connect a cloud Whisper API key.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interimStr = '';
        let finalizedPhrase = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalizedPhrase += transcript + ' ';
          } else {
            interimStr += transcript;
          }
        }

        setLiveInterimText(interimStr);

        if (finalizedPhrase.trim()) {
          const newSegment: TranscriptSegment = {
            id: `seg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            text: finalizedPhrase.trim(),
            startTime: segmentStartTimeRef.current,
            endTime: Date.now(),
            confidence: event.results[event.results.length - 1]?.[0]?.confidence || 0.95,
          };

          addTranscriptSegment(newSegment);
          setLiveInterimText('');
          updateStats();
          segmentStartTimeRef.current = Date.now();
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (event.error === 'no-speech') {
          // Expected during silence, ignore
          return;
        }
        if (event.error === 'aborted') {
          return;
        }
        console.warn('Speech recognition warning:', event.error);
      };

      recognition.onend = () => {
        // Auto-restart if still in recording state and not manually stopped
        if (!isManuallyStoppedRef.current && useVoiceStore.getState().recordingState === 'recording') {
          try {
            recognition.start();
          } catch {
            // Ignore if already active
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: unknown) {
      console.error('Failed to start speech recognition:', err);
    }
  }, [selectedLanguage, setLiveInterimText, addTranscriptSegment, updateStats, setErrorMessage]);

  const stopRecognition = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setLiveInterimText('');
    updateStats();
  }, [setLiveInterimText, updateStats]);

  // Restart recognition if language changes while actively recording
  useEffect(() => {
    if (recordingState === 'recording' && recognitionRef.current) {
      recognitionRef.current.abort();
      startRecognition();
    }
  }, [selectedLanguage, recordingState, startRecognition]);

  return {
    startRecognition,
    stopRecognition,
  };
}
