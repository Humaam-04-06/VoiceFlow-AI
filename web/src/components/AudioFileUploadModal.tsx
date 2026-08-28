'use client';

import React, { useState, useRef } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faCloudArrowUp, 
  faFileAudio, 
  faPlay, 
  faPause, 
  faWandMagicSparkles,
  faArrowsRotate
} from '@fortawesome/free-solid-svg-icons';

export const AudioFileUploadModal: React.FC = () => {
  const {
    isUploadModalOpen,
    setModalOpen,
    setRawTranscript,
    setActiveWorkspaceTab,
    setAudioBlob,
    updateStats,
  } = useVoiceStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  if (!isUploadModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  const handleTranscribeFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      setTimeout(() => {
        const sampleText = `Transcription for ${selectedFile.name}: In this recorded audio session, we explored the new product architecture, discussed team milestones for Q3, and finalized the voice intelligence roadmap. Action items include completing the web application testing and preparing mobile prototypes.`;
        setRawTranscript(sampleText);
        if (selectedFile && audioUrl) {
          setAudioBlob(selectedFile, audioUrl);
        }
        updateStats();
        setIsProcessing(false);
        setModalOpen('upload', false);
        setActiveWorkspaceTab('transcript');
      }, 1500);
    } catch {
      setIsProcessing(false);
    }
  };

  const togglePlay = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <FontAwesomeIcon icon={faCloudArrowUp} className="text-cyan-400 text-sm" />
            <h2 className="text-sm font-bold text-white">Upload & Transcribe Audio File</h2>
          </div>
          <button
            onClick={() => setModalOpen('upload', false)}
            className="w-8 h-8 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Dropzone Body */}
        <div className="p-6 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/15 hover:border-cyan-500/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-neutral-950/40 hover:bg-neutral-950/80 transition-all text-center group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/mp4,video/webm"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform mb-3 flex items-center justify-center">
              <FontAwesomeIcon icon={faFileAudio} className="text-3xl" />
            </div>
            <p className="text-xs font-semibold text-white">
              {selectedFile ? selectedFile.name : 'Drag & drop your audio file or browse'}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Supports MP3, WAV, M4A, FLAC, OGG, and WebM (up to 50MB)
            </p>
          </div>

          {/* Audio Player Preview */}
          {audioUrl && (
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-white/10 flex items-center justify-between gap-3">
              <audio
                ref={audioPlayerRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 transition-all font-bold flex items-center justify-center flex-shrink-0"
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="text-sm" />
              </button>
              <div className="flex-1 truncate">
                <p className="text-xs font-semibold text-white truncate">{selectedFile?.name}</p>
                <p className="text-[10px] text-neutral-400 font-mono">
                  {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-neutral-950/60 flex items-center justify-between">
          <button
            onClick={() => setModalOpen('upload', false)}
            className="text-xs text-neutral-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleTranscribeFile}
            disabled={!selectedFile || isProcessing}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white disabled:opacity-50 transition-all shadow-lg"
          >
            <FontAwesomeIcon icon={isProcessing ? faArrowsRotate : faWandMagicSparkles} className={`text-xs ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Transcribing Audio...' : 'Start Transcription'}
          </button>
        </div>
      </div>
    </div>
  );
};
