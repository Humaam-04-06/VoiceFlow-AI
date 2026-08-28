'use client';

import React from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { SUPPORTED_LANGUAGES } from '@/lib/constants/languages';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMicrophoneLines, 
  faGear, 
  faGlobe, 
  faWandMagicSparkles,
  faCircleCheck
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

export const Navbar: React.FC = () => {
  const {
    selectedLanguage,
    setSelectedLanguage,
    selectedAIProvider,
    setSelectedAIProvider,
    setModalOpen,
  } = useVoiceStore();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-neutral-950/80 border-b border-white/10 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-violet-500/30 text-white flex items-center justify-center">
            <FontAwesomeIcon icon={faMicrophoneLines} className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Voice<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">Flow</span> AI
              </h1>
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <FontAwesomeIcon icon={faCircleCheck} className="text-[9px]" />
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
          <div className="flex items-center gap-2 bg-neutral-900/90 border border-white/10 rounded-2xl px-3 py-1.5 shadow-sm">
            <FontAwesomeIcon icon={faGlobe} className="text-xs text-violet-400 flex-shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 font-medium outline-none cursor-pointer pr-1"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* AI Intelligence Provider Switcher */}
          <div className="hidden md:flex items-center gap-2 bg-neutral-900/90 border border-white/10 rounded-2xl px-3 py-1.5 shadow-sm">
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-xs text-cyan-400 flex-shrink-0" />
            <select
              value={selectedAIProvider}
              onChange={(e) => setSelectedAIProvider(e.target.value as any)}
              className="bg-transparent text-xs text-neutral-200 font-medium outline-none cursor-pointer pr-1"
            >
              <option value="free-local" className="bg-neutral-900 text-white">
                Free Local NLP (Offline)
              </option>
              <option value="gemini" className="bg-neutral-900 text-white">
                Google Gemini (Free Tier)
              </option>
              <option value="openai" className="bg-neutral-900 text-white">
                OpenAI GPT-4o (BYOK)
              </option>
              <option value="claude" className="bg-neutral-900 text-white">
                Anthropic Claude 3.5 (BYOK)
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
            className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-neutral-400 hover:text-white transition-all shadow-sm flex items-center justify-center w-8 h-8"
            title="View Private GitHub Repository"
          >
            <FontAwesomeIcon icon={faGithub} className="text-sm" />
          </a>

          {/* Babel 2-Way Live Translator Trigger */}
          <button
            onClick={() => setModalOpen('babel', true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 hover:from-cyan-600/40 hover:to-indigo-600/40 border border-cyan-500/30 text-cyan-300 hover:text-white transition-all shadow-sm active:scale-95"
            title="Open 2-Way Live Babel Universal Translator"
          >
            <FontAwesomeIcon icon={faGlobe} className="text-xs text-cyan-400" />
            <span className="hidden sm:inline">Babel Mode</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setModalOpen('settings', true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-neutral-200 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FontAwesomeIcon icon={faGear} className="text-xs text-cyan-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
