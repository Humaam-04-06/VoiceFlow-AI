'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';

export function useAudioRecorder() {
  const {
    recordingState,
    setRecordingState,
    setDurationSeconds,
    setAudioBlob,
    setVolumeLevel,
    setIsSpeakingDetected,
    noiseGateEnabled,
    highPassFilterEnabled,
  } = useVoiceStore();

  const [analyserData, setAnalyserData] = useState<Uint8Array | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const processAudioVolume = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    setAnalyserData(dataArray);

    // Calculate RMS volume level
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    const normalizedVolume = Math.min(Math.round((average / 128) * 100), 100);
    setVolumeLevel(normalizedVolume);

    // Voice Activity Detection threshold
    const isSpeaking = normalizedVolume > 8;
    setIsSpeakingDetected(isSpeaking);

    animationFrameRef.current = requestAnimationFrame(processAudioVolume);
  }, [setVolumeLevel, setIsSpeakingDetected]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: noiseGateEnabled,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      mediaStreamRef.current = stream;

      // Setup AudioContext & Filter Chain
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      if (highPassFilterEnabled) {
        // High-pass filter at 80Hz to eliminate low-frequency rumble
        const highPass = audioCtx.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = 80;
        source.connect(highPass);
        highPass.connect(analyser);
      } else {
        source.connect(analyser);
      }

      // Start Volume Visualizer loop
      processAudioVolume();

      // MediaRecorder for local playback / export
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob, audioUrl);
      };

      recorder.start(1000); // 1-second chunks
      setRecordingState('recording');

      // Start duration timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds(prev => prev + 1);
      }, 1000);

      return true;
    } catch (err: unknown) {
      console.error('Microphone access failed:', err);
      return false;
    }
  }, [noiseGateEnabled, highPassFilterEnabled, setRecordingState, setDurationSeconds, setAudioBlob, processAudioVolume]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [setRecordingState]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds(prev => prev + 1);
      }, 1000);
    }
  }, [setRecordingState, setDurationSeconds]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setRecordingState('idle');
    setVolumeLevel(0);
    setIsSpeakingDetected(false);
  }, [setRecordingState, setVolumeLevel, setIsSpeakingDetected]);

  return {
    recordingState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    analyserData,
  };
}
