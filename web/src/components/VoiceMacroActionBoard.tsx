'use client';

import React, { useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faListCheck, 
  faPlus, 
  faTrashCan, 
  faCheck, 
  faLightbulb, 
  faCircleExclamation, 
  faCopy,
  faMicrophone
} from '@fortawesome/free-solid-svg-icons';
import { VoiceMacroCard } from '@/types';

export const VoiceMacroActionBoard: React.FC = () => {
  const { macroCards, toggleMacroCard, deleteMacroCard, addMacroCard } = useVoiceStore();
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<'task' | 'idea' | 'urgent'>('task');
  const [copied, setCopied] = useState(false);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addMacroCard({
      type: newType,
      text: newText.trim(),
      isCompleted: false,
    });
    setNewText('');
  };

  const handleCopyBoard = () => {
    if (macroCards.length === 0) return;
    const lines = macroCards.map(c => 
      c.type === 'task' 
        ? `- [${c.isCompleted ? 'x' : ' '}] ${c.text}`
        : c.type === 'idea'
        ? `💡 IDEA: ${c.text}`
        : `⚠️ URGENT: ${c.text}`
    ).join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tasks = macroCards.filter(c => c.type === 'task');
  const ideas = macroCards.filter(c => c.type === 'idea');
  const urgents = macroCards.filter(c => c.type === 'urgent');

  return (
    <div className="flex flex-col w-full h-full bg-neutral-950/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xs border border-emerald-500/30">
            <FontAwesomeIcon icon={faListCheck} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Voice Macro Action Board</h3>
            <p className="text-[10px] text-neutral-400">Auto-extracts spoken tasks, ideas, and urgent priorities</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-mono">
            {macroCards.filter(c => c.isCompleted).length}/{macroCards.length} Done
          </span>
          {macroCards.length > 0 && (
            <button
              onClick={handleCopyBoard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 transition-all"
            >
              <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? 'text-emerald-400 text-xs' : 'text-xs'} />
              {copied ? 'Copied!' : 'Copy Tasks'}
            </button>
          )}
        </div>
      </div>

      {/* Spoken Triggers Hint */}
      <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/5 text-[11px] text-neutral-300 flex items-center gap-2">
        <FontAwesomeIcon icon={faMicrophone} className="text-violet-400 text-xs flex-shrink-0" />
        <span>
          <strong>Spoken Voice Triggers:</strong> Say <code className="text-emerald-400 bg-neutral-950 px-1 py-0.5 rounded">"Task: ..."</code>, <code className="text-violet-400 bg-neutral-950 px-1 py-0.5 rounded">"Idea: ..."</code>, or <code className="text-rose-400 bg-neutral-950 px-1 py-0.5 rounded">"Important: ..."</code> while talking to auto-pin cards!
        </span>
      </div>

      {/* Action Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 overflow-y-auto min-h-[220px]">
        {/* 1. Tasks Column */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300 pb-2 border-b border-white/5">
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faListCheck} className="text-emerald-400 text-xs" />
              Action Items ({tasks.length})
            </span>
          </div>
          <div className="space-y-2 overflow-y-auto flex-1 max-h-56">
            {tasks.length > 0 ? (
              tasks.map(card => (
                <div
                  key={card.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2 transition-all ${
                    card.isCompleted
                      ? 'bg-neutral-950/40 border-white/5 text-neutral-500 line-through'
                      : 'bg-neutral-950/80 border-emerald-500/20 text-neutral-200 hover:border-emerald-500/40'
                  }`}
                >
                  <button
                    onClick={() => toggleMacroCard(card.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                      card.isCompleted
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-white/20 hover:border-emerald-400'
                    }`}
                  >
                    {card.isCompleted && <FontAwesomeIcon icon={faCheck} className="text-[9px]" />}
                  </button>
                  <span className="flex-1 leading-snug">{card.text}</span>
                  <button
                    onClick={() => deleteMacroCard(card.id)}
                    className="text-neutral-500 hover:text-rose-400 p-0.5 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-neutral-500 italic p-2">No tasks spoken yet</p>
            )}
          </div>
        </div>

        {/* 2. Ideas Column */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-violet-300 pb-2 border-b border-white/5">
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faLightbulb} className="text-violet-400 text-xs" />
              Spoken Ideas ({ideas.length})
            </span>
          </div>
          <div className="space-y-2 overflow-y-auto flex-1 max-h-56">
            {ideas.length > 0 ? (
              ideas.map(card => (
                <div
                  key={card.id}
                  className="p-2.5 rounded-lg border bg-neutral-950/80 border-violet-500/20 text-violet-200 text-xs flex items-start justify-between gap-2"
                >
                  <span className="flex-1 leading-snug">{card.text}</span>
                  <button
                    onClick={() => deleteMacroCard(card.id)}
                    className="text-neutral-500 hover:text-rose-400 p-0.5 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-neutral-500 italic p-2">No ideas spoken yet</p>
            )}
          </div>
        </div>

        {/* 3. Urgent / Important Column */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-rose-300 pb-2 border-b border-white/5">
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCircleExclamation} className="text-rose-400 text-xs" />
              Urgent & Alerts ({urgents.length})
            </span>
          </div>
          <div className="space-y-2 overflow-y-auto flex-1 max-h-56">
            {urgents.length > 0 ? (
              urgents.map(card => (
                <div
                  key={card.id}
                  className="p-2.5 rounded-lg border bg-rose-500/10 border-rose-500/30 text-rose-200 text-xs flex items-start justify-between gap-2"
                >
                  <span className="flex-1 leading-snug">{card.text}</span>
                  <button
                    onClick={() => deleteMacroCard(card.id)}
                    className="text-neutral-500 hover:text-rose-400 p-0.5 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-neutral-500 italic p-2">No alerts spoken yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Manual Quick Add Bar */}
      <form onSubmit={handleAddCard} className="flex items-center gap-2 pt-2 border-t border-white/5">
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as any)}
          className="bg-neutral-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 outline-none cursor-pointer"
        >
          <option value="task">Task</option>
          <option value="idea">Idea</option>
          <option value="urgent">Urgent</option>
        </select>
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add manual item..."
          className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-neutral-100 outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={!newText.trim()}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xs" />
          Add
        </button>
      </form>
    </div>
  );
};
