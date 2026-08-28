'use client';

import React from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { WaveformVisualizer } from './WaveformVisualizer';
import { SpeechCoachWidget } from './SpeechCoachWidget';
import { Mic, MicOff, Pause, Play, Square, RotateCcw, Volume2, Sparkles, Upload, History, Settings2, MessageSquare } from 'lucide-react';

export const HeroRecordingZone: React.FC = () => {
  const {
    recordingState,
    durationSeconds,
    isSpeakingDetected,
    selectedLanguage,
    resetAll,
    setModalOpen,
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

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto gap-5">
      {/* Top Floating Action Bar */}
      <div className="flex flex-wrap items-center justify-between w-full px-2 gap-3">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border ${
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
            {recordingState === 'recording'
              ? (isSpeakingDetected ? '🎙️ Listening & Transcribing...' : '⏳ Waiting for Speech...')
              : recordingState === 'paused'
              ? '⏸️ Recording Paused'
              : '✨ Ready to Dictate'}
          </div>

          <div className="font-mono text-sm font-bold bg-neutral-900/80 border border-white/10 px-3 py-1.5 rounded-full text-neutral-200 backdrop-blur-md shadow-sm">
            ⏱️ {formatTimer(durationSeconds)}
          </div>
        </div>

        {/* Quick Modal Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen('upload', true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white transition-all shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            Upload Audio
          </button>
          <button
            onClick={() => setModalOpen('history', true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white transition-all shadow-sm"
          >
            <History className="w-3.5 h-3.5 text-violet-400" />
            Saved Notes
          </button>
          <button
            onClick={() => setModalOpen('chat', true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white transition-all shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            Ask AI
          </button>
          <button
            onClick={() => setModalOpen('settings', true)}
            className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white transition-all shadow-sm"
            title="Settings & API Keys"
          >
            <Settings2 className="w-4 h-4 text-neutral-400" />
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
            className="p-3.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-neutral-400 hover:text-rose-400 transition-all shadow-md active:scale-95"
            title="Clear & Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        {/* Master Record Button */}
        <button
          onClick={handleToggleRecord}
          className={`relative group p-6 rounded-full transition-all duration-300 shadow-2xl active:scale-95 flex items-center justify-center ${
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
            <Square className="w-8 h-8 fill-current" />
          ) : recordingState === 'paused' ? (
            <Play className="w-8 h-8 fill-current translate-x-0.5" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>

        {/* Pause / Resume Button */}
        {(recordingState === 'recording' || recordingState === 'paused') && (
          <button
            onClick={handlePauseResume}
            className="p-3.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-amber-400 transition-all shadow-md active:scale-95"
            title={recordingState === 'paused' ? 'Resume' : 'Pause'}
          >
            {recordingState === 'paused' ? (
              <Play className="w-5 h-5 fill-current" />
            ) : (
              <Pause className="w-5 h-5 fill-current" />
            )}
          </button>
        )}
      </div>

      {/* Helpful shortcut hint */}
      <p className="text-xs text-neutral-400 text-center">
        {recordingState === 'idle' ? (
          <>
            Click <strong className="text-neutral-200">Start</strong> to speak in{' '}
            <span className="text-violet-400 font-medium">{selectedLanguage}</span>. Speech transcribes live in real-time.
          </>
        ) : recordingState === 'recording' ? (
          <>
            Speaking now... Click the red stop button when finished.
          </>
        ) : (
          <>Recording paused. Click play to resume.</>
        )}
      </p>

      {/* Live Speech Coach Metrics */}
      <SpeechCoachWidget />
    </div>
  );
};
