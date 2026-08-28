'use client';

import React from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFaceSmile, 
  faFire, 
  faBrain, 
  faLightbulb, 
  faAward,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

export const ToneSentimentRadar: React.FC = () => {
  const { toneStats, stats } = useVoiceStore();

  return (
    <div className="flex flex-col w-full h-full bg-neutral-950/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center text-xs shadow-md shadow-amber-500/20">
            <FontAwesomeIcon icon={faFire} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Tone & Emotional Sentiment Radar</h3>
            <p className="text-[10px] text-neutral-400">Live vocal mood, confidence, and delivery feedback</p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
          <FontAwesomeIcon icon={faFaceSmile} className="text-xs" />
          <span>{toneStats.primaryMood}</span>
        </div>
      </div>

      {/* 3 Metric Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Confidence Gauge */}
        <div className="bg-neutral-900/70 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <FontAwesomeIcon icon={faAward} className="text-violet-400 text-xs" />
              Confidence
            </span>
            <span className="text-xs font-mono font-bold text-violet-300">{toneStats.confidence}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${toneStats.confidence}%` }}
            />
          </div>
        </div>

        {/* Energy & Dynamics */}
        <div className="bg-neutral-900/70 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <FontAwesomeIcon icon={faFire} className="text-rose-400 text-xs" />
              Vocal Energy
            </span>
            <span className="text-xs font-mono font-bold text-rose-300">{toneStats.energy}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${toneStats.energy}%` }}
            />
          </div>
        </div>

        {/* Executive Presence */}
        <div className="bg-neutral-900/70 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <FontAwesomeIcon icon={faBrain} className="text-cyan-400 text-xs" />
              Executive Impact
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300">{toneStats.executivePresence}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${toneStats.executivePresence}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Tone Delivery Coaching Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-cyan-950/40 border border-violet-500/20 flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center flex-shrink-0 mt-0.5">
          <FontAwesomeIcon icon={faLightbulb} className="text-xs" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-violet-200">AI Speech Delivery Insight</h4>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            {toneStats.coachingTip}
          </p>
        </div>
      </div>
    </div>
  );
};
