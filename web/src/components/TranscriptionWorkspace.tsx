'use client';

import React, { useState } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { dispatchAITask } from '@/lib/ai/aiDispatcher';
import { speakText, stopSpeech } from '@/lib/audio/ttsEngine';
import { MindmapViewer } from './MindmapViewer';
import { SUPPORTED_LANGUAGES } from '@/lib/constants/languages';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import {
  Copy,
  Check,
  Sparkles,
  FileText,
  Languages,
  Share2,
  Download,
  Volume2,
  VolumeX,
  RefreshCw,
  Trash2,
  BookmarkPlus,
  Send,
  SlidersHorizontal,
  FileCode,
  CheckSquare,
  FileSpreadsheet
} from 'lucide-react';
import { RepurposeFormat } from '@/types';

export const TranscriptionWorkspace: React.FC = () => {
  const {
    rawTranscript,
    liveInterimText,
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
    setRawTranscript,
    setPolishedTranscript,
    setSummary,
    setActionItems,
    setTranslatedText,
    setMindmapCode,
    setRepurposedContent,
    setActiveWorkspaceTab,
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
    } catch {
      // Confetti fallback
    }

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

  const handleExportPDF = (text: string) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Voice-To-Text AI Transcript', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.line(14, 32, 196, 32);
    doc.setFontSize(11);
    doc.setTextColor(20);
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 14, 40);
    doc.save(`transcript-${Date.now()}.pdf`);
  };

  const handleExportSRT = (text: string) => {
    // Generate simple SRT format with 4-second blocks
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

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto bg-neutral-900/70 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* AI Processing Overlay Banner */}
      {isAiProcessing && (
        <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 py-1.5 px-4 text-center text-xs font-semibold text-white flex items-center justify-center gap-2 z-20 animate-pulse shadow-md">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>{aiStatusMessage || 'AI Intelligence at work...'}</span>
        </div>
      )}

      {/* Workspace Navigation Tabs & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 mt-1">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-neutral-950/60 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveWorkspaceTab('transcript')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeWorkspaceTab === 'transcript'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-violet-400" />
            Raw Transcript
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('polished')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeWorkspaceTab === 'polished'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Polished / Translated
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeWorkspaceTab === 'summary'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            Summary & Tasks
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('mindmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeWorkspaceTab === 'mindmap'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
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
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            Repurpose Studio
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
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-violet-400" />}
            {isSpeaking ? 'Stop Voice' : 'Read Aloud'}
          </button>

          {/* Master 1-Click Copy */}
          <button
            onClick={() => handleCopy(currentActiveText)}
            disabled={!currentActiveText.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 disabled:opacity-50 transition-all active:scale-95"
            title="Copy all text in 1 click"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : '1-Click Copy'}
          </button>

          {/* Save to History */}
          <button
            onClick={() => {
              saveCurrentSessionToHistory();
              confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
            }}
            disabled={!rawTranscript.trim()}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-neutral-300 hover:text-white transition-all disabled:opacity-40"
            title="Save Note to History"
          >
            <BookmarkPlus className="w-4 h-4 text-emerald-400" />
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-white/10 hover:border-cyan-500/30 transition-all disabled:opacity-40 font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            ✨ Fix Grammar
          </button>

          {/* Smart Summarize */}
          <button
            onClick={handleSummarize}
            disabled={!rawTranscript.trim() || isAiProcessing}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-white/10 hover:border-emerald-500/30 transition-all disabled:opacity-40 font-medium"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            📝 Summarize
          </button>

          {/* Translate */}
          <div className="flex items-center gap-1 bg-neutral-800/90 border border-white/10 rounded-xl px-2 py-0.5">
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-transparent text-neutral-200 text-xs py-1 outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
                  {lang.flag} {lang.name}
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
            className="px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium border border-white/5 transition-all"
            title="Download TXT"
          >
            .TXT
          </button>
          <button
            onClick={() => handleExportPDF(currentActiveText)}
            disabled={!currentActiveText.trim()}
            className="px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium border border-white/5 transition-all"
            title="Download PDF"
          >
            .PDF
          </button>
          <button
            onClick={() => handleExportSRT(currentActiveText)}
            disabled={!currentActiveText.trim()}
            className="px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium border border-white/5 transition-all"
            title="Download SRT Subtitles"
          >
            .SRT
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-4 min-h-[300px] flex flex-col">
        {activeWorkspaceTab === 'mindmap' ? (
          <MindmapViewer />
        ) : activeWorkspaceTab === 'repurpose' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {(['email', 'meeting-minutes', 'twitter-thread', 'linkedin-post', 'study-flashcards', 'blog-outline'] as RepurposeFormat[]).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => handleRepurpose(fmt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    repurposeFormat === fmt
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
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
                  ? 'Click "✨ Fix Grammar" or "Translate" to view polished text here...'
                  : activeWorkspaceTab === 'summary'
                  ? 'Click "📝 Summarize" to generate key points and action items...'
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
