'use client';

import React, { useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { STTEngine, TTSEngine, AIProvider } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faGear,
  faSliders,
  faKey,
  faMicrophone,
  faVolumeHigh,
  faShieldHalved,
  faArrowUpRightFromSquare,
  faWandMagicSparkles,
  faRobot,
  faBolt
} from '@fortawesome/free-solid-svg-icons';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setModalOpen,
    sttEngine,
    setSttEngine,
    ttsEngine,
    setTtsEngine,
    selectedAIProvider,
    setSelectedAIProvider,
    apiKeys,
    setApiKey,
    noiseGateEnabled,
    highPassFilterEnabled,
    autoPunctuation,
    setAudioFilterSettings,
  } = useVoiceStore();

  const [activeTab, setActiveTab] = useState<'ai' | 'audio'>('ai');

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-white/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center text-sm border border-violet-500/20">
              <FontAwesomeIcon icon={faGear} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Application Settings</h2>
              <p className="text-[10px] text-neutral-400">Configure Latest Gemini 2.5 / 2.0, GPT-4o, Claude 3.7 & Audio DSP</p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen('settings', false)}
            className="w-8 h-8 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-white/10 bg-neutral-950/40 gap-4">
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FontAwesomeIcon icon={faKey} className="text-xs" />
            AI Model Keys (Gemini 2.5/2.0, GPT-4o, Claude 3.7)
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'audio'
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FontAwesomeIcon icon={faSliders} className="text-xs" />
            Audio DSP & Noise Filter
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'ai' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-neutral-950/60 border border-white/5 text-xs text-neutral-300 flex items-start gap-2.5">
                <FontAwesomeIcon icon={faBolt} className="text-cyan-400 text-xs mt-0.5" />
                <p>
                  Equipped with the latest frontier models: <strong>Google Gemini 2.5 / 2.0 Flash</strong>, <strong>OpenAI GPT-4o</strong>, and <strong>Claude 3.7 Sonnet</strong>. Keys are stored locally on your device.
                </p>
              </div>

              {/* 1. Google Gemini */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faRobot} className="text-violet-400" />
                    Google Gemini 2.5 / 2.0 Flash (Free Tier)
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-violet-400 hover:underline flex items-center gap-1"
                  >
                    Get Free Key
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[9px]" />
                  </a>
                </div>
                <input
                  type="password"
                  value={apiKeys.geminiKey || ''}
                  onChange={(e) => setApiKey('geminiKey', e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-violet-500"
                />
              </div>

              {/* 2. OpenAI GPT */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faRobot} className="text-emerald-400" />
                    OpenAI GPT-4o Flagship API Key
                  </label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Get Key
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[9px]" />
                  </a>
                </div>
                <input
                  type="password"
                  value={apiKeys.openaiKey || ''}
                  onChange={(e) => setApiKey('openaiKey', e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-emerald-500"
                />
              </div>

              {/* 3. Anthropic Claude */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faRobot} className="text-amber-400" />
                    Anthropic Claude 3.7 Sonnet (Hybrid Reasoning) Key
                  </label>
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Get Key
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[9px]" />
                  </a>
                </div>
                <input
                  type="password"
                  value={apiKeys.claudeKey || ''}
                  onChange={(e) => setApiKey('claudeKey', e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Noise Gate & DSP Filter */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400 text-xs" />
                      DSP Noise Reduction & Fan Filter
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Multi-stage low-pass and high-pass filters to cut background hiss
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={noiseGateEnabled}
                    onChange={(e) => setAudioFilterSettings({ noiseGate: e.target.checked })}
                    className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* 85Hz High Pass */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faMicrophone} className="text-cyan-400 text-xs" />
                      85Hz Low-End Rumble Cut
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Removes table bumps, mic handling pops, and electrical hum
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={highPassFilterEnabled}
                    onChange={(e) => setAudioFilterSettings({ highPass: e.target.checked })}
                    className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Neural TTS Engine */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faVolumeHigh} className="text-violet-400" />
                  Neural Text-to-Speech (TTS) Voice Engine
                </label>
                <select
                  value={ttsEngine}
                  onChange={(e) => setTtsEngine(e.target.value as TTSEngine)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="kokoro">Kokoro-82M Neural Voice (Ultra-Realistic)</option>
                  <option value="edge-neural">Microsoft Edge Neural TTS</option>
                  <option value="browser">Web Speech Native Engine</option>
                  <option value="openai">OpenAI Neural TTS (tts-1)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-neutral-950/60 flex items-center justify-end">
          <button
            onClick={() => setModalOpen('settings', false)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md active:scale-95"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
