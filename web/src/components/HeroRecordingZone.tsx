'use client';

import React, { useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { WaveformVisualizer } from './WaveformVisualizer';
import { SpeechCoachWidget } from './SpeechCoachWidget';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faPlay,
  faPause,
  faStop,
  faRotateLeft,
  faClock,
  faCloudArrowUp,
  faBookmark,
  faSliders,
  faComments,
  faWaveSquare,
  faHeadphones,
  faCirclePause,
  faCircleExclamation,
  faWandMagicSparkles,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

export const HeroRecordingZone: React.FC = () => {
  const {
    recordingState,
    durationSeconds,
    isSpeakingDetected,
    selectedLanguage,
    rawTranscript,
    errorMessage,
    setErrorMessage,
    setRawTranscript,
    resetAll,
    setModalOpen,
    updateStats,
  } = useVoiceStore();

  const {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    analyserData,
  } = useAudioRecorder();

  const { startRecognition, stopRecognition } = useSpeechRecognition();

  const handleToggleRecord = async () => {
    if (recordingState === 'idle') {
      const ok = await startRecording();
      if (ok) {
        startRecognition();
      }
    } else if (recordingState === 'recording') {
      stopRecording();
      stopRecognition();
    } else if (recordingState === 'paused') {
      resumeRecording();
      startRecognition();
    }
  };

  const handlePauseResume = () => {
    if (recordingState === 'recording') {
      pauseRecording();
      stopRecognition();
    } else if (recordingState === 'paused') {
      resumeRecording();
      startRecognition();
    }
  };

  const handleReset = () => {
    stopRecording();
    stopRecognition();
    resetAll();
  };

  // One-click demo speech loader to test all features instantly
  const handleLoadDemoSpeech = () => {
    const demo =
      "Hello everyone, today we are discussing the architecture for our cross-platform voice to text application. We um need to make sure that we support both in-browser speech recognition and 100% offline Whisper inference. Like, the action items are: first, finalize the Next.js web application with Kokoro neural TTS, and second, prepare the React Native mobile codebase with Apple CoreML and Android NPU acceleration. Please send the final review by Friday.";
    setRawTranscript(demo);
    updateStats();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto gap-5">
      {/* Error / Browser Notice Banner */}
      {errorMessage && (
        <div className="w-full p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start justify-between gap-3 animate-fade-in shadow-md">
          <div className="flex items-start gap-2.5">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-amber-400 text-sm mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-amber-400 hover:text-white p-1"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
          </button>
        </div>
      )}

      {/* Top Floating Action Bar */}
      <div className="flex flex-wrap items-center justify-between w-full px-2 gap-3">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border ${
            recordingState === 'recording'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 animate-pulse'
              : recordingState === 'paused'
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : 'bg-neutral-800/80 border-white/10 text-neutral-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              recordingState === 'recording'
                ? 'bg-rose-500 animate-ping'
                : recordingState === 'paused'
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`} />
            <FontAwesomeIcon
              icon={
                recordingState === 'recording'
                  ? faWaveSquare
                  : recordingState === 'paused'
                  ? faCirclePause
                  : faHeadphones
              }
              className="text-[11px]"
            />
            {recordingState === 'recording'
              ? (isSpeakingDetected ? 'Listening & Transcribing...' : 'Waiting for Speech...')
              : recordingState === 'paused'
              ? 'Recording Paused'
              : 'Ready to Dictate'}
          </div>

          <div className="font-mono text-xs font-bold bg-neutral-900/80 border border-white/10 px-3 py-1.5 rounded-full text-neutral-200 backdrop-blur-md shadow-sm flex items-center gap-1.5">
            <FontAwesomeIcon icon={faClock} className="text-violet-400 text-[11px]" />
            {formatTimer(durationSeconds)}
          </div>
        </div>

        {/* Quick Modal Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen('upload', true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faCloudArrowUp} className="text-cyan-400 text-xs" />
            Upload Audio
          </button>
          <button
            onClick={() => setModalOpen('history', true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faBookmark} className="text-violet-400 text-xs" />
            Saved Notes
          </button>
          <button
            onClick={() => setModalOpen('chat', true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faComments} className="text-emerald-400 text-xs" />
            Ask AI
          </button>
          <button
            onClick={() => setModalOpen('settings', true)}
            className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white transition-all shadow-sm w-8 h-8 flex items-center justify-center"
            title="Settings & Audio Filters"
          >
            <FontAwesomeIcon icon={faSliders} className="text-xs text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Main Reactive Waveform Box */}
      <WaveformVisualizer analyserData={analyserData} />

      {/* Central Pulsing Microphone Controls */}
      <div className="flex items-center justify-center gap-4 my-2">
        {/* Reset Button */}
        {durationSeconds > 0 && (
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-neutral-400 hover:text-rose-400 transition-all shadow-md active:scale-95 flex items-center justify-center"
            title="Clear & Reset"
          >
            <FontAwesomeIcon icon={faRotateLeft} className="text-base" />
          </button>
        )}

        {/* Master Record Button */}
        <button
          onClick={handleToggleRecord}
          className={`relative group w-20 h-20 rounded-full transition-all duration-300 shadow-2xl active:scale-95 flex items-center justify-center ${
            recordingState === 'recording'
              ? 'bg-rose-500 text-white shadow-rose-500/50 hover:bg-rose-600 scale-105'
              : recordingState === 'paused'
              ? 'bg-amber-500 text-white shadow-amber-500/50 hover:bg-amber-600'
              : 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-violet-500/40 hover:shadow-violet-500/60 hover:scale-105'
          }`}
        >
          {/* Animated Glow Rings when recording */}
          {recordingState === 'recording' && (
            <>
              <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-25" />
              <span className="absolute -inset-2 rounded-full border-2 border-rose-400/40 animate-pulse" />
            </>
          )}

          {recordingState === 'recording' ? (
            <FontAwesomeIcon icon={faStop} className="text-2xl" />
          ) : recordingState === 'paused' ? (
            <FontAwesomeIcon icon={faPlay} className="text-2xl translate-x-0.5" />
          ) : (
            <FontAwesomeIcon icon={faMicrophone} className="text-2xl" />
          )}
        </button>

        {/* Pause / Resume Button */}
        {(recordingState === 'recording' || recordingState === 'paused') && (
          <button
            onClick={handlePauseResume}
            className="w-12 h-12 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-amber-400 transition-all shadow-md active:scale-95 flex items-center justify-center"
            title={recordingState === 'paused' ? 'Resume' : 'Pause'}
          >
            <FontAwesomeIcon
              icon={recordingState === 'paused' ? faPlay : faPause}
              className="text-base"
            />
          </button>
        )}
      </div>

      {/* Helpful hint and demo trigger */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-neutral-400 text-center">
          {recordingState === 'idle' ? (
            <>
              Click <strong className="text-neutral-200">Start</strong> to speak in{' '}
              <span className="text-violet-400 font-medium">{selectedLanguage}</span>. Speech transcribes live in real-time.
            </>
          ) : recordingState === 'recording' ? (
            <>
              Speaking now... Click the stop button when finished.
            </>
          ) : (
            <>Recording paused. Click play to resume.</>
          )}
        </p>

        {!rawTranscript && recordingState === 'idle' && (
          <button
            onClick={handleLoadDemoSpeech}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-violet-300 hover:text-violet-200 transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[10px] text-violet-400" />
            Try 1-Click Sample Speech Demo
          </button>
        )}
      </div>

      {/* Live Speech Coach Metrics */}
      <SpeechCoachWidget />
    </div>
  );
};
