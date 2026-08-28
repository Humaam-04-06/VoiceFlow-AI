'use client';

import React, { useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { SUPPORTED_LANGUAGES } from '@/lib/constants/languages';
import { dispatchAITask } from '@/lib/ai/aiDispatcher';
import { speakText, stopSpeech } from '@/lib/audio/ttsEngine';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faGlobe, 
  faMicrophone, 
  faVolumeHigh, 
  faVolumeXmark, 
  faArrowsRotate, 
  faUser, 
  faUserTie,
  faRightLeft,
  faPlay,
  faStop
} from '@fortawesome/free-solid-svg-icons';

interface BabelMessage {
  id: string;
  sender: 'personA' | 'personB';
  originalText: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  timestamp: number;
}

export const BabelTranslatorModal: React.FC = () => {
  const {
    isBabelModalOpen,
    setModalOpen,
    selectedAIProvider,
    apiKeys,
    ttsEngine,
  } = useVoiceStore() as any;

  const [langA, setLangA] = useState('en-US');
  const [langB, setLangB] = useState('es-ES');
  const [activeSpeaker, setActiveSpeaker] = useState<'personA' | 'personB' | null>(null);
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [conversation, setConversation] = useState<BabelMessage[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  if (!isBabelModalOpen) return null;

  const langAObj = SUPPORTED_LANGUAGES.find(l => l.code === langA) || SUPPORTED_LANGUAGES[0];
  const langBObj = SUPPORTED_LANGUAGES.find(l => l.code === langB) || SUPPORTED_LANGUAGES[1];

  const handleTranslateAndSpeak = async (sender: 'personA' | 'personB', text: string) => {
    if (!text.trim()) return;

    const fromLangObj = sender === 'personA' ? langAObj : langBObj;
    const toLangObj = sender === 'personA' ? langBObj : langAObj;

    setIsTranslating(true);
    try {
      const res = await dispatchAITask({
        action: 'translate',
        text,
        provider: selectedAIProvider,
        apiKeys,
        targetLanguage: toLangObj.name,
      });

      const translated = res.success && res.result ? res.result : text;

      const newMsg: BabelMessage = {
        id: `babel-${Date.now()}`,
        sender,
        originalText: text,
        translatedText: translated,
        fromLang: fromLangObj.name,
        toLang: toLangObj.name,
        timestamp: Date.now(),
      };

      setConversation(prev => [newMsg, ...prev]);

      if (sender === 'personA') setInputA('');
      else setInputB('');

      // Speak the translation aloud in the receiver's language
      speakText(
        {
          text: translated,
          engine: ttsEngine,
          language: toLangObj.code,
          openaiKey: apiKeys?.openaiKey,
        },
        () => {},
        () => {},
        () => {}
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    const temp = langA;
    setLangA(langB);
    setLangB(temp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="bg-neutral-950 border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center text-sm shadow-md">
              <FontAwesomeIcon icon={faGlobe} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Live 2-Way Babel Duplex Universal Translator
              </h3>
              <p className="text-[10px] text-neutral-400">Speak in 2 different languages with live simultaneous translation & voice playback</p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen('babel', false)}
            className="w-8 h-8 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Dual Language Header Selector */}
        <div className="flex items-center justify-between px-6 py-3 bg-neutral-900/40 border-b border-white/5 gap-3">
          {/* Person A Language */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <span className="text-xs font-semibold text-violet-300">Person A:</span>
            <select
              value={langA}
              onChange={(e) => setLangA(e.target.value)}
              className="bg-neutral-900 border border-violet-500/30 rounded-xl px-2.5 py-1 text-xs text-white outline-none"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapLanguages}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-cyan-400 flex items-center justify-center transition-all shadow-sm"
            title="Swap Languages"
          >
            <FontAwesomeIcon icon={faRightLeft} className="text-xs" />
          </button>

          {/* Person B Language */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-600/30 text-cyan-300 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faUserTie} />
            </div>
            <span className="text-xs font-semibold text-cyan-300">Person B:</span>
            <select
              value={langB}
              onChange={(e) => setLangB(e.target.value)}
              className="bg-neutral-900 border border-cyan-500/30 rounded-xl px-2.5 py-1 text-xs text-white outline-none"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Conversation Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-[280px] max-h-[380px] bg-neutral-950/60">
          {conversation.length > 0 ? (
            conversation.map(msg => {
              const isA = msg.sender === 'personA';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1.5 p-4 rounded-2xl border transition-all max-w-[85%] ${
                    isA
                      ? 'bg-violet-950/20 border-violet-500/30 text-violet-100 mr-auto'
                      : 'bg-cyan-950/20 border-cyan-500/30 text-cyan-100 ml-auto'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className={isA ? 'text-violet-300' : 'text-cyan-300'}>
                      {isA ? `Person A (${msg.fromLang})` : `Person B (${msg.fromLang})`}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 italic">"{msg.originalText}"</p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${isA ? 'text-violet-200' : 'text-cyan-200'}`}>
                      ➔ {msg.translatedText}
                    </p>
                    <button
                      onClick={() => speakText({ text: msg.translatedText, engine: ttsEngine, language: isA ? langB : langA, openaiKey: apiKeys?.openaiKey })}
                      className="text-neutral-400 hover:text-white p-1"
                      title="Replay Voice"
                    >
                      <FontAwesomeIcon icon={faVolumeHigh} className="text-xs" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 text-neutral-500 gap-2">
              <FontAwesomeIcon icon={faGlobe} className="text-3xl text-neutral-600 mb-1" />
              <p className="text-xs font-semibold">Start the duplex conversation</p>
              <p className="text-[11px] text-neutral-500">Person A speaks {langAObj.name}, Person B speaks {langBObj.name}</p>
            </div>
          )}
        </div>

        {/* Dual Input Triggers (Person A & Person B) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-white/10 bg-neutral-900/80 p-4 gap-4">
          {/* Person A Input */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-neutral-950/70 border border-violet-500/20">
            <div className="flex items-center justify-between text-xs text-violet-300 font-semibold">
              <span>Person A ({langAObj.name})</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTranslateAndSpeak('personA', inputA)}
                placeholder={`Type or speak in ${langAObj.name}...`}
                className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500"
              />
              <button
                onClick={() => handleTranslateAndSpeak('personA', inputA)}
                disabled={!inputA.trim() || isTranslating}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold disabled:opacity-40 transition-all shadow-md"
              >
                Send
              </button>
            </div>
          </div>

          {/* Person B Input */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-neutral-950/70 border border-cyan-500/20">
            <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold">
              <span>Person B ({langBObj.name})</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTranslateAndSpeak('personB', inputB)}
                placeholder={`Type or speak in ${langBObj.name}...`}
                className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleTranslateAndSpeak('personB', inputB)}
                disabled={!inputB.trim() || isTranslating}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold disabled:opacity-40 transition-all shadow-md"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
