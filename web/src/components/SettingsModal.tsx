'use client';

import React, { useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { 
  X, 
  KeyRound, 
  Volume2, 
  Sliders, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Cpu, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { TTSEngine, AIProvider } from '@/types';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setModalOpen,
    apiKeys,
    setApiKey,
    ttsEngine,
    setTtsEngine,
    selectedAIProvider,
    setSelectedAIProvider,
    noiseGateEnabled,
    highPassFilterEnabled,
    autoPunctuation,
    setAudioFilterSettings,
  } = useVoiceStore();

  const [activeTab, setActiveTab] = useState<'keys' | 'audio' | 'tts'>('keys');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  if (!isSettingsOpen) return null;

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-white/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">App Settings & AI Keys</h2>
              <p className="text-xs text-neutral-400">Configure BYOK AI Models, Audio Filters & TTS</p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen('settings', false)}
            className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/5 bg-neutral-900/50">
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'keys'
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            AI API Keys (BYOK)
          </button>
          <button
            onClick={() => setActiveTab('tts')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'tts'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Text-to-Speech (TTS)
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'audio'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Audio & Filter Controls
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: AI KEYS */}
          {activeTab === 'keys' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-200 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-white">100% Client-Side Privacy</p>
                  <p className="text-[11px] text-violet-300/90 leading-relaxed mt-0.5">
                    Your API keys are stored locally on your device. Keys are used to unlock higher model limits and advanced summarization/translations.
                  </p>
                </div>
              </div>

              {/* Gemini Key */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Google Gemini API Key <span className="text-emerald-400 text-[10px]">(Free Tier Available)</span>
                </label>
                <div className="relative">
                  <input
                    type={showKeys['gemini'] ? 'text' : 'password'}
                    value={apiKeys.geminiKey || ''}
                    onChange={(e) => setApiKey('geminiKey', e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-neutral-100 font-mono outline-none focus:border-violet-500 text-xs pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('gemini')}
                    className="absolute right-2.5 top-2 text-neutral-400 hover:text-white"
                  >
                    {showKeys['gemini'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Groq Key */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Groq Cloud API Key <span className="text-cyan-400 text-[10px]">(Fastest LLaMA-3.3 & Whisper Free Tier)</span>
                </label>
                <div className="relative">
                  <input
                    type={showKeys['groq'] ? 'text' : 'password'}
                    value={apiKeys.groqKey || ''}
                    onChange={(e) => setApiKey('groqKey', e.target.value)}
                    placeholder="gsk_..."
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-neutral-100 font-mono outline-none focus:border-cyan-500 text-xs pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('groq')}
                    className="absolute right-2.5 top-2 text-neutral-400 hover:text-white"
                  >
                    {showKeys['groq'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* OpenAI Key */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">OpenAI API Key (GPT-4o & Whisper)</label>
                <div className="relative">
                  <input
                    type={showKeys['openai'] ? 'text' : 'password'}
                    value={apiKeys.openaiKey || ''}
                    onChange={(e) => setApiKey('openaiKey', e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-neutral-100 font-mono outline-none focus:border-violet-500 text-xs pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('openai')}
                    className="absolute right-2.5 top-2 text-neutral-400 hover:text-white"
                  >
                    {showKeys['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Claude Key */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Anthropic Claude API Key</label>
                <div className="relative">
                  <input
                    type={showKeys['claude'] ? 'text' : 'password'}
                    value={apiKeys.claudeKey || ''}
                    onChange={(e) => setApiKey('claudeKey', e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-neutral-100 font-mono outline-none focus:border-violet-500 text-xs pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('claude')}
                    className="absolute right-2.5 top-2 text-neutral-400 hover:text-white"
                  >
                    {showKeys['claude'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* DeepSeek Key */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">DeepSeek API Key (DeepSeek-V3 / R1)</label>
                <div className="relative">
                  <input
                    type={showKeys['deepseek'] ? 'text' : 'password'}
                    value={apiKeys.deepseekKey || ''}
                    onChange={(e) => setApiKey('deepseekKey', e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-neutral-100 font-mono outline-none focus:border-violet-500 text-xs pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('deepseek')}
                    className="absolute right-2.5 top-2 text-neutral-400 hover:text-white"
                  >
                    {showKeys['deepseek'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TTS SETTINGS */}
          {activeTab === 'tts' && (
            <div className="space-y-4 text-xs">
              <p className="text-neutral-400">
                Choose your preferred neural voice synthesis engine for reading back transcripts and translations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setTtsEngine('kokoro')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    ttsEngine === 'kokoro'
                      ? 'bg-violet-500/15 border-violet-500 text-white'
                      : 'bg-neutral-950/60 border-white/10 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 font-semibold">
                    <span>🥇 Kokoro-82M Neural</span>
                    <span className="text-[10px] text-emerald-400 font-mono">100% Free</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Hyper-realistic human tone and emotional cadence running via WebAssembly/ONNX.
                  </p>
                </button>

                <button
                  onClick={() => setTtsEngine('edge-neural')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    ttsEngine === 'edge-neural'
                      ? 'bg-cyan-500/15 border-cyan-500 text-white'
                      : 'bg-neutral-950/60 border-white/10 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 font-semibold">
                    <span>🥈 Microsoft Edge Neural</span>
                    <span className="text-[10px] text-cyan-400 font-mono">100% Free</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    High-definition cloud studio voices in 70+ languages with zero API key required.
                  </p>
                </button>

                <button
                  onClick={() => setTtsEngine('browser')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    ttsEngine === 'browser'
                      ? 'bg-emerald-500/15 border-emerald-500 text-white'
                      : 'bg-neutral-950/60 border-white/10 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 font-semibold">
                    <span>🥉 Browser Native Voice</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Instant</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Zero download, zero latency hardware-accelerated device speech synthesis.
                  </p>
                </button>

                <button
                  onClick={() => setTtsEngine('openai')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    ttsEngine === 'openai'
                      ? 'bg-indigo-500/15 border-indigo-500 text-white'
                      : 'bg-neutral-950/60 border-white/10 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 font-semibold">
                    <span>🏅 OpenAI TTS-1</span>
                    <span className="text-[10px] text-amber-400 font-mono">BYOK Key</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    OpenAI Studio alloy & shimmer voices (requires OpenAI API Key in Settings).
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO & FILTERS */}
          {activeTab === 'audio' && (
            <div className="space-y-4 text-xs">
              <p className="text-neutral-400">
                Fine-tune microphone filters and audio processing for crystal clear speech recognition.
              </p>

              <div className="space-y-3">
                {/* Noise Gate Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950/60 border border-white/10">
                  <div>
                    <h4 className="font-semibold text-white">Smart Noise Gate & Suppression</h4>
                    <p className="text-[11px] text-neutral-400">
                      Eliminates background fan noise, keyboard typing, and room echo.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={noiseGateEnabled}
                    onChange={(e) => setAudioFilterSettings({ noiseGate: e.target.checked })}
                    className="w-5 h-5 accent-violet-600 rounded cursor-pointer"
                  />
                </div>

                {/* High Pass Filter */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950/60 border border-white/10">
                  <div>
                    <h4 className="font-semibold text-white">80Hz High-Pass Rumble Filter</h4>
                    <p className="text-[11px] text-neutral-400">
                      Cuts low-frequency microphone thumps and desk vibrations.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={highPassFilterEnabled}
                    onChange={(e) => setAudioFilterSettings({ highPass: e.target.checked })}
                    className="w-5 h-5 accent-violet-600 rounded cursor-pointer"
                  />
                </div>

                {/* Auto Punctuation */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950/60 border border-white/10">
                  <div>
                    <h4 className="font-semibold text-white">Live Auto-Punctuation</h4>
                    <p className="text-[11px] text-neutral-400">
                      Automatically inserts commas and periods based on natural voice pauses.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoPunctuation}
                    onChange={(e) => setAudioFilterSettings({ autoPunc: e.target.checked })}
                    className="w-5 h-5 accent-violet-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-neutral-950/60 flex items-center justify-end">
          <button
            onClick={() => setModalOpen('settings', false)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg transition-all"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
