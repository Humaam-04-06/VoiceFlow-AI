'use client';

import React from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faKey, 
  faGear, 
  faXmark, 
  faArrowUpRightFromSquare,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

interface ApiKeyRequiredModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  featureName?: string;
}

export const ApiKeyRequiredModal: React.FC<ApiKeyRequiredModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  featureName: propFeatureName,
}) => {
  const { 
    isKeyRequiredModalOpen, 
    closeKeyRequiredModal, 
    keyRequiredFeatureName, 
    setModalOpen 
  } = useVoiceStore();

  const isVisible = propIsOpen !== undefined ? propIsOpen : isKeyRequiredModalOpen;
  const activeFeatureName = propFeatureName || keyRequiredFeatureName || 'AI Feature';

  if (!isVisible) return null;

  const handleClose = () => {
    if (propOnClose) propOnClose();
    closeKeyRequiredModal();
  };

  const handleOpenSettings = () => {
    handleClose();
    setModalOpen('settings', true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-scale-up">
        {/* Sweet Alert Top Glow Header */}
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-500/20 via-neutral-900 to-neutral-900 border-b border-white/5 text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>

          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow-xl shadow-amber-500/40 mb-3 animate-bounce">
            <FontAwesomeIcon icon={faKey} />
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white">
            AI API Key Required
          </h2>
          <p className="text-xs text-amber-200/90 mt-1 max-w-sm leading-relaxed">
            To use <strong>{activeFeatureName}</strong>, please provide an API key for <strong>Google Gemini</strong>, <strong>OpenAI GPT</strong>, or <strong>Claude</strong> first. Otherwise, this feature cannot process your speech.
          </p>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="p-6 space-y-4 text-xs">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider text-neutral-400">
            How to get your API Key (100% Free & Fast):
          </h3>

          <div className="space-y-2.5">
            {/* 1. Google Gemini */}
            <div className="p-3 rounded-2xl bg-neutral-950/70 border border-white/5 flex items-center justify-between gap-3 hover:border-violet-500/30 transition-all">
              <div>
                <span className="font-bold text-violet-300">1. Google Gemini 2.5 / 2.0 (100% Free)</span>
                <p className="text-[11px] text-neutral-400">Fast, generous free daily limits & zero cost</p>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 font-semibold text-[11px] border border-violet-500/30 transition-all"
              >
                Get Key
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[9px]" />
              </a>
            </div>

            {/* 2. OpenAI GPT */}
            <div className="p-3 rounded-2xl bg-neutral-950/70 border border-white/5 flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-all">
              <div>
                <span className="font-bold text-emerald-300">2. OpenAI GPT-4o Flagship</span>
                <p className="text-[11px] text-neutral-400">Omni multimodal model for chat and translation</p>
              </div>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30 transition-all"
              >
                Get Key
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[9px]" />
              </a>
            </div>

            {/* 3. Anthropic Claude */}
            <div className="p-3 rounded-2xl bg-neutral-950/70 border border-white/5 flex items-center justify-between gap-3 hover:border-amber-500/30 transition-all">
              <div>
                <span className="font-bold text-amber-300">3. Anthropic Claude 3.7 Sonnet</span>
                <p className="text-[11px] text-neutral-400">Latest hybrid reasoning & flawless formatting</p>
              </div>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 font-semibold text-[11px] border border-amber-500/30 transition-all"
              >
                Get Key
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[9px]" />
              </a>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-neutral-950/80 flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="text-xs text-neutral-400 hover:text-white px-3 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleOpenSettings}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white transition-all shadow-lg shadow-violet-500/30 active:scale-95"
          >
            <FontAwesomeIcon icon={faGear} className="text-xs" />
            Open Settings & Paste Key
          </button>
        </div>
      </div>
    </div>
  );
};
