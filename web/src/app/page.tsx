'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroRecordingZone } from '@/components/HeroRecordingZone';
import { TranscriptionWorkspace } from '@/components/TranscriptionWorkspace';
import { SettingsModal } from '@/components/SettingsModal';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { ChatDrawer } from '@/components/ChatDrawer';
import { AudioFileUploadModal } from '@/components/AudioFileUploadModal';
import { TheaterSubtitleModal } from '@/components/TheaterSubtitleModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBolt, 
  faMicrochip, 
  faShieldHalved, 
  faHeart,
  faCodeBranch
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-violet-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-0 w-[500px] h-[500px] bg-cyan-600/5 blur-3xl pointer-events-none -z-10" />

      {/* Navigation */}
      <Navbar />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Top Hero Recording Zone */}
        <section aria-label="Speech Recording Controls">
          <HeroRecordingZone />
        </section>

        {/* Central Transcription Workspace */}
        <section aria-label="Transcription Workspace">
          <TranscriptionWorkspace />
        </section>

        {/* Feature Highlight Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto w-full pt-4">
          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/5 flex items-start gap-3 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 mt-0.5 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faBolt} className="text-sm" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">100% Free & Real-Time</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                Continuous speech recognition in your browser with zero latency and infinite duration.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/5 flex items-start gap-3 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 mt-0.5 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faMicrochip} className="text-sm" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Multi-AI Intelligence (BYOK)</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                Connect Gemini, Claude, Grok, GPT-4o, DeepSeek, or use the built-in free offline engine.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/5 flex items-start gap-3 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 mt-0.5 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">100% Private & Local</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                Your voice recordings and keys stay stored on your device with local IndexedDB history.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Global Modals & Drawers */}
      <SettingsModal />
      <HistoryDrawer />
      <ChatDrawer />
      <AudioFileUploadModal />
      <TheaterSubtitleModal />

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-6 px-4 text-center text-xs text-neutral-500 bg-neutral-950/80 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 justify-center">
            Built with <FontAwesomeIcon icon={faHeart} className="text-rose-500 text-xs inline" /> for high-speed speech intelligence.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Powered by OpenAI Whisper & Kokoro Neural TTS</span>
            <a
              href="https://github.com/Humaam-04-06/Voice_To_Text_App"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:underline flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faGithub} className="text-xs" />
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
