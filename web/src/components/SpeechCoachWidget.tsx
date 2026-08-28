'use client';

import React from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGaugeHigh, 
  faTriangleExclamation, 
  faBolt, 
  faChartSimple, 
  faCircleCheck 
} from '@fortawesome/free-solid-svg-icons';

export const SpeechCoachWidget: React.FC = () => {
  const { stats } = useVoiceStore();

  const getPaceStatus = (wpm: number) => {
    if (wpm === 0) return { text: 'Ready', color: 'text-neutral-400', bg: 'bg-neutral-500/10 border-neutral-500/20' };
    if (wpm < 110) return { text: 'Relaxed / Slow', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
    if (wpm <= 165) return { text: 'Ideal Pace', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    return { text: 'Fast Pace', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
  };

  const pace = getPaceStatus(stats.wpm);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      {/* 1. Words Per Minute (WPM) */}
      <div className="bg-neutral-900/70 border border-white/10 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group hover:border-violet-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <FontAwesomeIcon icon={faGaugeHigh} className="text-violet-400 text-xs" />
            Speaking Pace
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pace.bg} ${pace.color}`}>
            {pace.text}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">{stats.wpm}</span>
          <span className="text-xs text-neutral-400">WPM</span>
        </div>
        <div className="w-full bg-neutral-800 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(Math.max((stats.wpm / 220) * 100, 5), 100)}%` }}
          />
        </div>
      </div>

      {/* 2. Filler Words Detector */}
      <div className="bg-neutral-900/70 border border-white/10 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md hover:border-violet-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-400 text-xs" />
            Filler Words
          </span>
          <span className="text-[10px] text-neutral-400">"um, uh, like"</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold tracking-tight font-mono ${stats.fillerWordsCount > 4 ? 'text-amber-400' : 'text-white'}`}>
            {stats.fillerWordsCount}
          </span>
          <span className="text-xs text-neutral-400">detected</span>
        </div>
        <div className="text-[11px] text-neutral-400 truncate mt-1">
          {Object.keys(stats.fillerWordsList).length > 0 ? (
            Object.entries(stats.fillerWordsList)
              .map(([word, count]) => `${word} (${count})`)
              .join(', ')
          ) : (
            <span className="text-emerald-400/80 flex items-center gap-1">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs text-emerald-400" /> Clean speech
            </span>
          )}
        </div>
      </div>

      {/* 3. Clarity & Flow Score */}
      <div className="bg-neutral-900/70 border border-white/10 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md hover:border-violet-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <FontAwesomeIcon icon={faBolt} className="text-cyan-400 text-xs" />
            Clarity Score
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">{stats.clarityScore}%</span>
        </div>
        <div className="w-full bg-neutral-800 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${stats.clarityScore}%` }}
          />
        </div>
      </div>

      {/* 4. Total Words & Duration */}
      <div className="bg-neutral-900/70 border border-white/10 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md hover:border-violet-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <FontAwesomeIcon icon={faChartSimple} className="text-emerald-400 text-xs" />
            Word Count
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            {Math.floor(stats.durationSeconds / 60)}:{(stats.durationSeconds % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">{stats.wordCount}</span>
          <span className="text-xs text-neutral-400">words</span>
        </div>
        <div className="text-[11px] text-neutral-400 mt-1 font-mono">
          {stats.charCount} characters
        </div>
      </div>
    </div>
  );
};
