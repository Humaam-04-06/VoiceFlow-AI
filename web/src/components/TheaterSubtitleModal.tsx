'use client';

import React, { useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { SUPPORTED_LANGUAGES } from '@/lib/constants/languages';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faClosedCaptioning, 
  faExpand, 
  faCompress, 
  faLanguage,
  faMicrophone,
  faCircle,
  faTv
} from '@fortawesome/free-solid-svg-icons';

export const TheaterSubtitleModal: React.FC = () => {
  const {
    isTheaterSubtitleOpen,
    setModalOpen,
    liveInterimText,
    rawTranscript,
    translatedText,
    selectedLanguage,
    targetTranslationLanguage,
    recordingState,
  } = useVoiceStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');

  if (!isTheaterSubtitleOpen) return null;

  const currentSpeech = liveInterimText || rawTranscript.slice(-180) || 'Listening for speech in real-time...';
  const currentTranslation = translatedText.slice(-180) || '(Live translated subtitles will display here)';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in ${
      isFullscreen ? 'p-0' : 'p-4'
    }`}>
      <div className={`bg-neutral-950 border border-white/20 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden transition-all ${
        isFullscreen ? 'h-full rounded-none border-none' : 'h-[500px]'
      }`}>
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600/30 text-violet-400 flex items-center justify-center text-sm border border-violet-500/30">
              <FontAwesomeIcon icon={faClosedCaptioning} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Dual-Language Theater Live Subtitles
                <span className="flex items-center gap-1 text-[10px] text-rose-400 font-mono px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                  <FontAwesomeIcon icon={faCircle} className="text-[7px] animate-ping" /> LIVE
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size toggle */}
            <div className="flex items-center bg-neutral-900 border border-white/10 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'normal' ? 'bg-violet-600 text-white' : 'text-neutral-400'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2.5 py-1 rounded-lg font-bold ${fontSize === 'large' ? 'bg-violet-600 text-white' : 'text-neutral-400'}`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('huge')}
                className={`px-2.5 py-1 rounded-lg font-extrabold ${fontSize === 'huge' ? 'bg-violet-600 text-white' : 'text-neutral-400'}`}
              >
                A++
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-8 h-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-all"
              title="Toggle Fullscreen"
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="text-xs" />
            </button>

            {/* Close */}
            <button
              onClick={() => setModalOpen('theater', false)}
              className="w-8 h-8 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
            >
              <FontAwesomeIcon icon={faXmark} className="text-base" />
            </button>
          </div>
        </div>

        {/* Cinematic Subtitle Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-3xl space-y-6 z-10">
            {/* Primary Original Spoken Subtitle */}
            <div className={`font-medium text-white tracking-wide leading-relaxed drop-shadow-md transition-all ${
              fontSize === 'normal' ? 'text-lg' : fontSize === 'large' ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
            }`}>
              "{currentSpeech}"
            </div>

            {/* Divider line */}
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto opacity-70" />

            {/* Secondary Translated Subtitle */}
            <div className={`font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 tracking-wide leading-relaxed drop-shadow transition-all ${
              fontSize === 'normal' ? 'text-base' : fontSize === 'large' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
            }`}>
              {currentTranslation}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="px-6 py-3 border-t border-white/10 bg-neutral-900/60 flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={faMicrophone} className="text-emerald-400 text-xs" />
            Spoken: <strong>{selectedLanguage}</strong>
          </span>
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={faLanguage} className="text-cyan-400 text-xs" />
            Target Translation: <strong>{targetTranslationLanguage}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
