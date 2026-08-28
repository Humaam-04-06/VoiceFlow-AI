'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { Sparkles, Download, Copy, Check, RefreshCw } from 'lucide-react';
import { dispatchAITask } from '@/lib/ai/aiDispatcher';

export const MindmapViewer: React.FC = () => {
  const {
    mindmapCode,
    rawTranscript,
    selectedAIProvider,
    apiKeys,
    setMindmapCode,
    isAiProcessing,
    setIsAiProcessing,
  } = useVoiceStore();

  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleGenerateMindmap = async () => {
    if (!rawTranscript.trim()) return;
    setIsAiProcessing(true, 'Generating Visual Mindmap...');
    try {
      const res = await dispatchAITask({
        action: 'mindmap',
        text: rawTranscript,
        provider: selectedAIProvider,
        apiKeys,
      });
      if (res.success && res.result) {
        setMindmapCode(res.result);
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleCopyCode = () => {
    if (!mindmapCode) return;
    navigator.clipboard.writeText(mindmapCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse lines to display as structured visual nodes
  const lines = (mindmapCode || '')
    .split('\n')
    .filter(l => l.trim() && !l.trim().startsWith('mindmap'));

  return (
    <div className="flex flex-col w-full h-full min-h-[360px] bg-neutral-950/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Interactive Concept Mindmap</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
            Mermaid Graph
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateMindmap}
            disabled={!rawTranscript.trim() || isAiProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAiProcessing ? 'animate-spin' : ''}`} />
            Regenerate Mindmap
          </button>
          {mindmapCode && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          )}
        </div>
      </div>

      {/* Visual Mindmap Tree Display */}
      {mindmapCode ? (
        <div ref={containerRef} className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
          <div className="flex flex-col items-center gap-4 max-w-xl w-full">
            {/* Root Node */}
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-white font-bold text-base shadow-lg shadow-indigo-500/30 border border-white/20 text-center animate-fade-in">
              🎙️ {lines[0]?.replace(/[()"[\]root:]/g, '').trim() || 'Voice Concept Root'}
            </div>

            {/* Tree Branch Connectors */}
            <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-cyan-500/50" />

            {/* Child Node Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
              {lines.slice(1, 10).map((line, idx) => {
                const cleanLabel = line.replace(/[()"[\]-]/g, '').trim();
                if (!cleanLabel) return null;
                const isSubnode = line.startsWith('      ');
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all text-xs flex items-center gap-2 shadow-sm ${
                      isSubnode
                        ? 'bg-neutral-900/60 border-white/5 text-neutral-400'
                        : 'bg-neutral-900/90 border-cyan-500/30 text-cyan-200 font-medium hover:border-cyan-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                    <span className="truncate">{cleanLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400">
          <Sparkles className="w-10 h-10 text-neutral-600 mb-3" />
          <p className="text-sm font-medium text-neutral-300">No Mindmap Generated Yet</p>
          <p className="text-xs text-neutral-400 max-w-sm mt-1">
            Speak or dictate your thoughts, then click "Generate Mindmap" to visualize your ideas as a structured concept map.
          </p>
        </div>
      )}
    </div>
  );
};
