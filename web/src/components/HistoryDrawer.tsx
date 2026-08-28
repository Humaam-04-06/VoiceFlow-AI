'use client';

import React, { useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { SessionHistoryItem } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faBookmark,
  faClockRotateLeft,
  faTrashCan,
  faFileLines,
  faMagnifyingGlass,
  faShareNodes,
  faClock,
  faCircleCheck,
  faDownload,
  faMicrophone
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

  const filteredHistory = history.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.rawText.toLowerCase().includes(q) ||
      item.summary?.toLowerCase().includes(q) ||
      item.language.toLowerCase().includes(q) ||
      item.tags?.some(t => t.toLowerCase().includes(q))
    );
  });

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-950 border-l border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-neutral-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center text-sm border border-violet-500/20">
                <FontAwesomeIcon icon={faClockRotateLeft} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Voice Vault & History</h2>
                <p className="text-[10px] text-neutral-400">Searchable semantic archive of all your dictations</p>
              </div>
            </div>
            <button
              onClick={() => setModalOpen('history', false)}
              className="w-8 h-8 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faXmark} className="text-base" />
            </button>
          </div>

          {/* Semantic Search Bar */}
          <div className="p-4 border-b border-white/5 bg-neutral-900/30">
            <div className="relative flex items-center">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3.5 text-xs text-neutral-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask Voice Vault (e.g. budget, tasks, ideas)..."
                className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-200 outline-none focus:border-violet-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-neutral-500 hover:text-white"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-xs" />
                </button>
              )}
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900/80 border border-white/5 hover:border-violet-500/30 transition-all flex flex-col gap-2.5 group cursor-pointer"
                  onClick={() => loadSessionFromHistory(item)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSessionFromHistory(item.id);
                      }}
                      className="text-neutral-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete recording"
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                    </button>
                  </div>

                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {item.rawText}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} className="text-[9px]" />
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-300">
                      {item.wordCount} words • {formatDuration(item.durationSeconds)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 text-neutral-500 gap-3">
                <FontAwesomeIcon icon={faBookmark} className="text-3xl text-neutral-600" />
                <p className="text-xs font-medium">
                  {searchQuery ? 'No matching voice notes found' : 'No saved sessions yet'}
                </p>
                <p className="text-[11px] text-neutral-600 max-w-xs">
                  {searchQuery
                    ? 'Try searching with different keywords or terms.'
                    : 'Click the bookmark icon in the workspace to save your voice transcripts here.'}
                </p>
              </div>
            )}
          </div>

          {/* Footer Clear All */}
          {history.length > 0 && (
            <div className="p-4 border-t border-white/10 bg-neutral-900/60 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 font-mono">
                {history.length} saved {history.length === 1 ? 'session' : 'sessions'}
              </span>
              <button
                onClick={clearHistory}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-medium hover:underline"
              >
                Clear All History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
