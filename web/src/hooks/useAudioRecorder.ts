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

      // 1. Request hardware-level Echo Cancellation, Noise Suppression, and Auto Gain
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
        },
      });

      mediaStreamRef.current = stream;

      // 2. Setup Web Audio DSP Noise Cancellation Graph
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 48000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);

      // Node A: High-Pass Filter (Cuts 85Hz low-frequency room rumble, desk bumps & AC hum)
      const highPass = audioCtx.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.value = 85;
      highPass.Q.value = 0.7;

      // Node B: Low-Pass Filter (Cuts >8500Hz high-frequency hiss, fan noise, and coil whine)
      const lowPass = audioCtx.createBiquadFilter();
      lowPass.type = 'lowpass';
      lowPass.frequency.value = 8500;
      lowPass.Q.value = 0.7;

      // Node C: 50Hz/60Hz AC Power Line Notch Hum Filter
      const notchFilter = audioCtx.createBiquadFilter();
      notchFilter.type = 'notch';
      notchFilter.frequency.value = 60;
      notchFilter.Q.value = 4.0;

      // Node D: Studio Dynamics Compressor (Levels vocal volume & eliminates background noise floor)
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
      compressor.knee.setValueAtTime(30, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(4, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

      // Node E: Analyser for live visualizer
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Node F: Destination Stream for clean noise-canceled recording
      const destination = audioCtx.createMediaStreamDestination();

      // Connect DSP Filter Chain
      if (highPassFilterEnabled && noiseGateEnabled) {
        source.connect(highPass);
        highPass.connect(lowPass);
        lowPass.connect(notchFilter);
        notchFilter.connect(compressor);
        compressor.connect(analyser);
        compressor.connect(destination);
      } else {
        source.connect(compressor);
        compressor.connect(analyser);
        compressor.connect(destination);
      }

      // Start Volume Visualizer loop
      processAudioVolume();

      // Record from the clean, noise-filtered DSP destination stream!
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(destination.stream, { 
        mimeType,
        audioBitsPerSecond: 128000
      });
      
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

      recorder.start(1000); // 1-second clean chunks
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
