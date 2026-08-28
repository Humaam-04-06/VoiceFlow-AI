'use client';

import React, { useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faClockRotateLeft, 
  faMagnifyingGlass, 
  faTrashCan, 
  faArrowUpRightFromSquare, 
  faClock, 
  faFileLines,
  faBookmark
} from '@fortawesome/free-solid-svg-icons';

export const HistoryDrawer: React.FC = () => {
  const {
    isHistoryOpen,
    setModalOpen,
    history,
    loadSessionFromHistory,
    deleteSessionFromHistory,
    clearHistory,
  } = useVoiceStore();

  const [searchQuery, setSearchQuery] = useState('');

  if (!isHistoryOpen) return null;

  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.rawText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border-l border-white/10 w-full max-w-md h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-violet-400 text-sm" />
            <h2 className="text-sm font-bold text-white">Saved Voice Notes & History</h2>
          </div>
          <button
            onClick={() => setModalOpen('history', false)}
            className="w-8 h-8 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past voice notes & transcripts..."
              className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 hover:border-violet-500/40 transition-all flex flex-col gap-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faBookmark} className="text-[10px] text-violet-400" />
                    {item.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSessionFromHistory(item.id);
                    }}
                    className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                  </button>
                </div>

                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {item.rawText}
                </p>

                <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 font-mono">
                      <FontAwesomeIcon icon={faClock} className="text-[10px] text-neutral-400" />
                      {Math.floor(item.durationSeconds / 60)}:{(item.durationSeconds % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faFileLines} className="text-[10px] text-neutral-400" />
                      {item.wordCount} words
                    </span>
                  </div>

                  <button
                    onClick={() => loadSessionFromHistory(item)}
                    className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                  >
                    Load <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-center">
              <FontAwesomeIcon icon={faClockRotateLeft} className="text-3xl text-neutral-600 mb-2" />
              <p className="text-xs font-medium">No saved recordings found</p>
              <p className="text-[11px] text-neutral-400 max-w-xs mt-1">
                Record a speech and click the bookmark icon to save it permanently in your browser.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-neutral-950/60 flex items-center justify-between">
            <span className="text-xs text-neutral-400">{history.length} saved sessions</span>
            <button
              onClick={clearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
