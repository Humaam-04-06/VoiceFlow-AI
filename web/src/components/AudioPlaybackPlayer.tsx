'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faPause, 
  faRotateLeft, 
  faDownload, 
  faVolumeHigh, 
  faVolumeXmark,
  faWaveSquare,
  faMicrophone
} from '@fortawesome/free-solid-svg-icons';

export const AudioPlaybackPlayer: React.FC = () => {
  const { audioUrl, audioBlob, durationSeconds } = useVoiceStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(durationSeconds || 0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (durationSeconds > 0) {
      setTotalDuration(durationSeconds);
    }
  }, [durationSeconds]);

  if (!audioUrl) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setTotalDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIdx]);
  };

  const handleDownloadAudio = () => {
    if (!audioBlob && !audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `voice-recording-${Date.now()}.webm`;
    a.click();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-neutral-950/80 border border-violet-500/30 rounded-2xl p-4 backdrop-blur-xl shadow-lg flex flex-col gap-3 animate-fade-in my-2">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleTimeUpdate}
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faMicrophone} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              Original Voice Recording
            </h4>
            <p className="text-[10px] text-neutral-400">Replay your real recorded human voice</p>
          </div>
        </div>

        {/* Speed & Download Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={cycleSpeed}
            className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white font-mono text-[11px] font-semibold transition-all"
            title="Change Playback Speed"
          >
            {playbackRate}x
          </button>
          <button
            onClick={handleDownloadAudio}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Save Audio File to PC"
          >
            <FontAwesomeIcon icon={faDownload} className="text-xs" />
            <span>Save Audio</span>
          </button>
        </div>
      </div>

      {/* Playback Controls & Scrubber */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center flex-shrink-0 transition-all shadow-md active:scale-95"
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="text-xs" />
        </button>

        {/* Restart Button */}
        <button
          onClick={handleRestart}
          className="w-8 h-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center flex-shrink-0 transition-all"
          title="Replay from start"
        >
          <FontAwesomeIcon icon={faRotateLeft} className="text-xs" />
        </button>

        {/* Time Scrubber Slider */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-[10px] font-mono text-neutral-400 w-9 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={totalDuration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <span className="text-[10px] font-mono text-neutral-400 w-9">
            {formatTime(totalDuration)}
          </span>
        </div>

        {/* Mute Toggle */}
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.muted = !isMuted;
              setIsMuted(!isMuted);
            }
          }}
          className="w-8 h-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center flex-shrink-0"
        >
          <FontAwesomeIcon icon={isMuted ? faVolumeXmark : faVolumeHigh} className="text-xs" />
        </button>
      </div>
    </div>
  );
};
