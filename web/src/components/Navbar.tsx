'use client';

import React from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { SUPPORTED_LANGUAGES } from '@/lib/constants/languages';
import { 
  Mic2, 
  Settings2, 
  History, 
  Upload, 
  Sparkles, 
  MessageSquare,
  Globe2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    selectedLanguage,
    setSelectedLanguage,
    selectedAIProvider,
    setSelectedAIProvider,
    setModalOpen,
  } = useVoiceStore();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-neutral-950/70 border-b border-white/10 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-violet-500/30 text-white flex items-center justify-center">
            <Mic2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Voice<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">Flow</span> AI
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                100% Free
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Speech-to-Text & Universal AI Studio
            </p>
          </div>
        </div>

        {/* Middle Selectors: Language & AI Model */}
        <div className="flex items-center gap-2">
          {/* Spoken Language Picker */}
          <div className="flex items-center gap-1.5 bg-neutral-900/90 border border-white/10 rounded-2xl px-3 py-1.5 shadow-sm">
            <Globe2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 font-medium outline-none cursor-pointer pr-1"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* AI Intelligence Provider Switcher */}
          <div className="hidden md:flex items-center gap-1.5 bg-neutral-900/90 border border-white/10 rounded-2xl px-3 py-1.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <select
              value={selectedAIProvider}
              onChange={(e) => setSelectedAIProvider(e.target.value as any)}
              className="bg-transparent text-xs text-neutral-200 font-medium outline-none cursor-pointer pr-1"
            >
              <option value="free-local" className="bg-neutral-900 text-white">
                ⚡ Free Local NLP (Offline)
              </option>
              <option value="gemini" className="bg-neutral-900 text-white">
                ✨ Google Gemini (Free Tier)
              </option>
              <option value="groq" className="bg-neutral-900 text-white">
                🚀 Groq LLaMA-3.3 (Free Tier)
              </option>
              <option value="openai" className="bg-neutral-900 text-white">
                🧠 OpenAI GPT-4o (BYOK)
              </option>
              <option value="claude" className="bg-neutral-900 text-white">
                🎭 Anthropic Claude (BYOK)
              </option>
              <option value="deepseek" className="bg-neutral-900 text-white">
                🔮 DeepSeek-V3 (BYOK)
              </option>
              <option value="grok" className="bg-neutral-900 text-white">
                ⚡ xAI Grok (BYOK)
              </option>
              <option value="kimi" className="bg-neutral-900 text-white">
                🌙 Moonshot KIMI (BYOK)
              </option>
            </select>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* GitHub Repo link */}
          <a
            href="https://github.com/Humaam-04-06/Voice_To_Text_App"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-neutral-400 hover:text-white transition-all shadow-sm"
            title="View Private GitHub Repository"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Settings Trigger */}
          <button
            onClick={() => setModalOpen('settings', true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-neutral-200 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
