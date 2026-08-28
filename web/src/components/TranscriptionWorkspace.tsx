'use client';

import React, { useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { dispatchAITask } from '@/lib/ai/aiDispatcher';
import { speakText, stopSpeech } from '@/lib/audio/ttsEngine';
import { MindmapViewer } from './MindmapViewer';
import { AudioPlaybackPlayer } from './AudioPlaybackPlayer';
import { ToneSentimentRadar } from './ToneSentimentRadar';
import { VoiceMacroActionBoard } from './VoiceMacroActionBoard';
import { SUPPORTED_LANGUAGES } from '@/lib/constants/languages';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy,
  faCheck,
  faWandMagicSparkles,
  faFileLines,
  faLanguage,
  faShareNodes,
  faVolumeHigh,
  faVolumeXmark,
  faBookmark,
  faFilePdf,
  faFileCode,
  faListCheck,
  faDiagramProject,
  faEnvelope,
  faHashtag,
  faBriefcase,
  faGraduationCap,
  faNewspaper,
  faArrowsRotate,
  faUsers,
  faFire,
  faUserTie,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { RepurposeFormat } from '@/types';

export const TranscriptionWorkspace: React.FC = () => {
  const {
    rawTranscript,
    liveInterimText,
    segments,
    polishedTranscript,
    summary,
    actionItems,
    translatedText,
    targetTranslationLanguage,
    mindmapCode,
    repurposedContent,
    activeWorkspaceTab,
    selectedAIProvider,
    apiKeys,
    ttsEngine,
    selectedLanguage,
    isAiProcessing,
    aiStatusMessage,
    isMultiSpeakerMode,
    speaker1Name,
    speaker2Name,
    setRawTranscript,
    setPolishedTranscript,
    setSummary,
    setActionItems,
    setTranslatedText,
    setMindmapCode,
    setRepurposedContent,
    setActiveWorkspaceTab,
    setIsMultiSpeakerMode,
    setSpeakerNames,
    setIsAiProcessing,
    saveCurrentSessionToHistory,
  } = useVoiceStore();

  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [targetLang, setTargetLang] = useState(targetTranslationLanguage || 'es-ES');
  const [repurposeFormat, setRepurposeFormat] = useState<RepurposeFormat>('email');

  // Trigger 1-Click Copy with Confetti
  const handleCopy = (textToCopy: string) => {
    if (!textToCopy.trim()) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#8B5CF6', '#06B6D4', '#10B981']
      });
    } catch {}

    setTimeout(() => setCopied(false), 2000);
  };

  // AI Transformations
  const handleFixGrammar = async () => {
    if (!rawTranscript.trim()) return;
    setIsAiProcessing(true, 'Fixing Grammar & Eliminating Filler Words...');
    try {
      const res = await dispatchAITask({
        action: 'grammar',
        text: rawTranscript,
        provider: selectedAIProvider,
        apiKeys,
      });
      if (res.success && res.result) {
        setPolishedTranscript(res.result);
        setActiveWorkspaceTab('polished');
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSummarize = async () => {
    if (!rawTranscript.trim()) return;
    setIsAiProcessing(true, 'Extracting Key Takeaways & Action Items...');
    try {
      const res = await dispatchAITask({
        action: 'summarize',
        text: rawTranscript,
        provider: selectedAIProvider,
        apiKeys,
      });
      if (res.success && res.result) {
        setSummary(res.result);
        if (res.actionItems) setActionItems(res.actionItems);
        setActiveWorkspaceTab('summary');
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleTranslate = async () => {
    if (!rawTranscript.trim()) return;
    const targetLangObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLang);
    setIsAiProcessing(true, `Translating to ${targetLangObj?.name || targetLang}...`);
    try {
      const res = await dispatchAITask({
        action: 'translate',
        text: rawTranscript,
        provider: selectedAIProvider,
        apiKeys,
        targetLanguage: targetLangObj?.name || targetLang,
      });
      if (res.success && res.result) {
        setTranslatedText(res.result, targetLang);
        setActiveWorkspaceTab('polished');
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleRepurpose = async (format: RepurposeFormat) => {
    if (!rawTranscript.trim()) return;
    setRepurposeFormat(format);
    setIsAiProcessing(true, `Repurposing to ${format.replace('-', ' ')}...`);
    try {
      const res = await dispatchAITask({
        action: 'repurpose',
        text: rawTranscript,
        provider: selectedAIProvider,
        apiKeys,
        repurposeFormat: format,
      });
      if (res.success && res.result) {
        setRepurposedContent({ format, content: res.result });
        setActiveWorkspaceTab('repurpose');
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Text to Speech playback
  const handleToggleTTS = (text: string) => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      if (!text.trim()) return;
      setIsSpeaking(true);
      speakText(
        {
          text,
          engine: ttsEngine,
          language: selectedLanguage,
          openaiKey: apiKeys.openaiKey,
        },
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        (err) => {
          console.warn(err);
          setIsSpeaking(false);
        }
      );
    }
  };

  // Export handlers
  const handleExportTxt = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = (text: string, isExecutiveMoM: boolean = false) => {
    const doc = new jsPDF();
    
    // Header Banner
    doc.setFillColor(15, 23, 42); // Dark slate
    doc.rect(0, 0, 210, 24, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(isExecutiveMoM ? 'OFFICIAL EXECUTIVE MEETING MINUTES (MoM)' : 'VOICEFLOW AI TRANSCRIPT & SUMMARY', 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${new Date().toLocaleString()} | Language: ${selectedLanguage}`, 14, 32);

    if (isExecutiveMoM) {
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('1. MEETING OBJECTIVE & CONTEXT', 14, 42);
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 45, 196, 45);

      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const splitObj = doc.splitTextToSize(summary || text.slice(0, 300), 180);
      doc.text(splitObj, 14, 52);

      const nextY = 52 + splitObj.length * 6 + 8;
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('2. DETAILED DISCUSSION & TRANSCRIPTION', 14, nextY);
      doc.line(14, nextY + 3, 196, nextY + 3);

      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const splitBody = doc.splitTextToSize(text, 180);
      doc.text(splitBody, 14, nextY + 10);

      // Signatures at footer
      const sigY = Math.min(nextY + 10 + splitBody.length * 5 + 16, 260);
      doc.setDrawColor(148, 163, 184);
      doc.line(14, sigY, 80, sigY);
      doc.line(120, sigY, 186, sigY);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Prepared By: Host / Speaker 1', 14, sigY + 5);
      doc.text('Approved By: Executive / Client', 120, sigY + 5);

      doc.save(`executive-meeting-minutes-${Date.now()}.pdf`);
    } else {
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 14, 40);
      doc.save(`transcript-${Date.now()}.pdf`);
    }
  };

  const handleExportSRT = (text: string) => {
    const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
    let srtContent = '';
    let startSec = 0;

    sentences.forEach((sentence, idx) => {
      const endSec = startSec + 4;
      const fmtTime = (s: number) => {
        const hh = String(Math.floor(s / 3600)).padStart(2, '0');
        const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        const ss = String(s % 60).padStart(2, '0');
        return `${hh}:${mm}:${ss},000`;
      };
      srtContent += `${idx + 1}\n${fmtTime(startSec)} --> ${fmtTime(endSec)}\n${sentence.trim()}\n\n`;
      startSec = endSec + 1;
    });

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitles-${Date.now()}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentActiveText =
    activeWorkspaceTab === 'polished'
      ? polishedTranscript || translatedText || rawTranscript
      : activeWorkspaceTab === 'summary'
      ? summary || rawTranscript
      : activeWorkspaceTab === 'repurpose'
      ? repurposedContent?.content || rawTranscript
      : rawTranscript;

  const getRepurposeIcon = (fmt: RepurposeFormat) => {
    switch (fmt) {
      case 'email': return faEnvelope;
      case 'twitter-thread': return faHashtag;
      case 'linkedin-post': return faBriefcase;
      case 'meeting-minutes': return faListCheck;
      case 'study-flashcards': return faGraduationCap;
      case 'blog-outline': return faNewspaper;
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto bg-neutral-900/70 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* AI Processing Overlay Banner */}
      {isAiProcessing && (
        <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 py-1.5 px-4 text-center text-xs font-semibold text-white flex items-center justify-center gap-2 z-20 animate-pulse shadow-md">
          <FontAwesomeIcon icon={faArrowsRotate} className="text-xs animate-spin" />
          <span>{aiStatusMessage || 'AI Intelligence at work...'}</span>
        </div>
      )}

      {/* Real Recorded Voice Replay Bar */}
      <AudioPlaybackPlayer />

      {/* Workspace Navigation Tabs & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 mt-1">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-neutral-950/60 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveWorkspaceTab('transcript')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeWorkspaceTab === 'transcript'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FontAwesomeIcon icon={faFileLines} className="text-violet-400 text-xs" />
            Transcript
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('dialogue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeWorkspaceTab === 'dialogue'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FontAwesomeIcon icon={faUsers} className="text-cyan-400 text-xs" />
            Speakers Dialogue
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('actions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeWorkspaceTab === 'actions'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FontAwesomeIcon icon={faListCheck} className="text-emerald-400 text-xs" />
            Action Board
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('tone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeWorkspaceTab === 'tone'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FontAwesomeIcon icon={faFire} className="text-rose-400 text-xs" />
            Tone Radar
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('polished')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeWorkspaceTab === 'polished'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-cyan-400 text-xs" />
            Polished
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeWorkspaceTab === 'summary'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FontAwesomeIcon icon={faListCheck} className="text-emerald-400 text-xs" />
            Summary
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('mindmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeWorkspaceTab === 'mindmap'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FontAwesomeIcon icon={faDiagramProject} className="text-indigo-400 text-xs" />
            Mindmap
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('repurpose')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeWorkspaceTab === 'repurpose'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FontAwesomeIcon icon={faShareNodes} className="text-amber-400 text-xs" />
            Repurpose
          </button>
        </div>

        {/* 1-Click Action Utilities */}
        <div className="flex items-center gap-2">
          {/* Read Aloud TTS */}
          <button
            onClick={() => handleToggleTTS(currentActiveText)}
            disabled={!currentActiveText.trim()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isSpeaking
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                : 'bg-neutral-800 hover:bg-neutral-700 border-white/10 text-neutral-300 hover:text-white'
            }`}
            title="Read Aloud with Neural TTS"
          >
            <FontAwesomeIcon
              icon={isSpeaking ? faVolumeXmark : faVolumeHigh}
              className={isSpeaking ? 'text-rose-400 text-xs' : 'text-violet-400 text-xs'}
            />
            {isSpeaking ? 'Stop Voice' : 'Read Aloud'}
          </button>

          {/* Master 1-Click Copy */}
          <button
            onClick={() => handleCopy(currentActiveText)}
            disabled={!currentActiveText.trim()}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 disabled:opacity-50 transition-all active:scale-95"
            title="Copy all text in 1 click"
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? 'text-emerald-300 text-xs' : 'text-xs'} />
            {copied ? 'Copied!' : '1-Click Copy'}
          </button>

          {/* Save to History */}
          <button
            onClick={() => {
              saveCurrentSessionToHistory();
              confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
            }}
            disabled={!rawTranscript.trim()}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-neutral-300 hover:text-white transition-all disabled:opacity-40 w-8 h-8 flex items-center justify-center"
            title="Save Note to History"
          >
            <FontAwesomeIcon icon={faBookmark} className="text-emerald-400 text-xs" />
          </button>
        </div>
      </div>

      {/* AI One-Click Transformation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-3 px-1 border-b border-white/5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Fix Grammar */}
          <button
            onClick={handleFixGrammar}
            disabled={!rawTranscript.trim() || isAiProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-white/10 hover:border-cyan-500/30 transition-all disabled:opacity-40 font-medium"
          >
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-cyan-400 text-xs" />
            Fix Grammar
          </button>

          {/* Smart Summarize */}
          <button
            onClick={handleSummarize}
            disabled={!rawTranscript.trim() || isAiProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-white/10 hover:border-emerald-500/30 transition-all disabled:opacity-40 font-medium"
          >
            <FontAwesomeIcon icon={faListCheck} className="text-emerald-400 text-xs" />
            Summarize
          </button>

          {/* Translate */}
          <div className="flex items-center gap-1.5 bg-neutral-800/90 border border-white/10 rounded-xl px-2 py-0.5">
            <FontAwesomeIcon icon={faLanguage} className="text-indigo-400 text-xs ml-1" />
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-transparent text-neutral-200 text-xs py-1 outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
                  {lang.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleTranslate}
              disabled={!rawTranscript.trim() || isAiProcessing}
              className="px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold disabled:opacity-40 ml-1 transition-all"
            >
              Translate
            </button>
          </div>
        </div>

        {/* Export Dropdown / Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleExportTxt(currentActiveText)}
            disabled={!currentActiveText.trim()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium border border-white/5 transition-all"
            title="Download Plain TXT"
          >
            <FontAwesomeIcon icon={faFileLines} className="text-[10px] text-neutral-400" />
            .TXT
          </button>
          <button
            onClick={() => handleExportPDF(currentActiveText, false)}
            disabled={!currentActiveText.trim()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium border border-white/5 transition-all"
            title="Download Formatted PDF"
          >
            <FontAwesomeIcon icon={faFilePdf} className="text-[10px] text-rose-400" />
            .PDF
          </button>
          <button
            onClick={() => handleExportPDF(currentActiveText, true)}
            disabled={!currentActiveText.trim()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-cyan-300 text-[11px] font-semibold border border-white/5 transition-all"
            title="Download Official Corporate Meeting Minutes (MoM) PDF"
          >
            <FontAwesomeIcon icon={faBriefcase} className="text-[10px] text-cyan-400" />
            MoM PDF
          </button>
          <button
            onClick={() => handleExportSRT(currentActiveText)}
            disabled={!currentActiveText.trim()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium border border-white/5 transition-all"
            title="Download SRT Subtitles"
          >
            <FontAwesomeIcon icon={faFileCode} className="text-[10px] text-amber-400" />
            .SRT
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-4 min-h-[300px] flex flex-col">
        {activeWorkspaceTab === 'mindmap' ? (
          <MindmapViewer />
        ) : activeWorkspaceTab === 'actions' ? (
          <VoiceMacroActionBoard />
        ) : activeWorkspaceTab === 'tone' ? (
          <ToneSentimentRadar />
        ) : activeWorkspaceTab === 'dialogue' ? (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Speaker Name Customizers */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-950/60 border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="text-cyan-400 text-xs" />
                <span className="font-bold text-white">Multi-Speaker Diarization</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={speaker1Name}
                  onChange={(e) => setSpeakerNames({ speaker1: e.target.value })}
                  placeholder="Speaker 1 Name"
                  className="bg-neutral-900 border border-violet-500/40 rounded-xl px-3 py-1 text-xs text-violet-300 outline-none w-36 font-semibold"
                />
                <input
                  type="text"
                  value={speaker2Name}
                  onChange={(e) => setSpeakerNames({ speaker2: e.target.value })}
                  placeholder="Speaker 2 Name"
                  className="bg-neutral-900 border border-cyan-500/40 rounded-xl px-3 py-1 text-xs text-cyan-300 outline-none w-36 font-semibold"
                />
              </div>
            </div>

            {/* Dialogue Bubble Feed */}
            <div className="space-y-3 p-4 rounded-2xl bg-neutral-950/80 border border-white/10 min-h-[240px] max-h-[400px] overflow-y-auto">
              {segments.length > 0 ? (
                segments.map((seg, idx) => {
                  const isSpeaker1 = seg.speaker === 'speaker-1' || idx % 2 === 0;
                  return (
                    <div
                      key={seg.id || idx}
                      className={`flex flex-col gap-1 p-3.5 rounded-2xl border transition-all ${
                        isSpeaker1
                          ? 'bg-violet-950/20 border-violet-500/30 text-violet-100 mr-8'
                          : 'bg-cyan-950/20 border-cyan-500/30 text-cyan-100 ml-8'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={`flex items-center gap-1.5 ${isSpeaker1 ? 'text-violet-300' : 'text-cyan-300'}`}>
                          <FontAwesomeIcon icon={isSpeaker1 ? faUserTie : faUser} className="text-xs" />
                          {isSpeaker1 ? speaker1Name : speaker2Name}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {new Date(seg.startTime || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-neutral-200 mt-1">{seg.text}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-neutral-500 text-center py-12 italic">
                  Start speaking to see dialogue bubbles organized by speaker...
                </p>
              )}
            </div>
          </div>
        ) : activeWorkspaceTab === 'repurpose' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {(['email', 'meeting-minutes', 'twitter-thread', 'linkedin-post', 'study-flashcards', 'blog-outline'] as RepurposeFormat[]).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => handleRepurpose(fmt)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    repurposeFormat === fmt
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <FontAwesomeIcon icon={getRepurposeIcon(fmt)} className="text-xs" />
                  {fmt.replace('-', ' ')}
                </button>
              ))}
            </div>
            <textarea
              value={repurposedContent?.content || ''}
              onChange={(e) => setRepurposedContent({ format: repurposeFormat, content: e.target.value })}
              placeholder="Select a format above to repurpose your voice transcript..."
              className="w-full h-80 bg-neutral-950/80 border border-white/10 rounded-2xl p-5 text-neutral-200 text-sm leading-relaxed font-sans outline-none focus:border-amber-500/50 resize-y backdrop-blur-md"
            />
          </div>
        ) : (
          <div className="relative flex-1 flex flex-col">
            <textarea
              value={
                activeWorkspaceTab === 'polished'
                  ? polishedTranscript || translatedText || ''
                  : activeWorkspaceTab === 'summary'
                  ? summary || ''
                  : rawTranscript
              }
              onChange={(e) => {
                if (activeWorkspaceTab === 'polished') setPolishedTranscript(e.target.value);
                else if (activeWorkspaceTab === 'summary') setSummary(e.target.value);
                else setRawTranscript(e.target.value);
              }}
              placeholder={
                activeWorkspaceTab === 'polished'
                  ? 'Click "Fix Grammar" or "Translate" to view polished text here...'
                  : activeWorkspaceTab === 'summary'
                  ? 'Click "Summarize" to generate key points and action items...'
                  : 'Start speaking or typing here... Speech will transcribe live in real-time.'
              }
              className="w-full min-h-[260px] flex-1 bg-neutral-950/80 border border-white/10 rounded-2xl p-5 text-neutral-100 text-base leading-relaxed font-sans outline-none focus:border-violet-500/50 resize-y backdrop-blur-md shadow-inner"
            />

            {/* Interim live speech overlay ticker */}
            {liveInterimText && activeWorkspaceTab === 'transcript' && (
              <div className="mt-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm italic animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                <span>{liveInterimText}...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
