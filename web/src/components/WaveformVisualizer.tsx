'use client';

import React, { useRef, useEffect } from 'react';
import { useVoiceStore } from '@/store/useVoiceStore';

interface WaveformVisualizerProps {
  analyserData: Uint8Array | null;
  height?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  analyserData,
  height = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordingState, isSpeakingDetected, volumeLevel } = useVoiceStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      if (recordingState !== 'recording' && recordingState !== 'paused') {
        // Idle ambient gentle wave
        ctx.beginPath();
        ctx.lineWidth = 2;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.4)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)');
        ctx.strokeStyle = gradient;

        for (let x = 0; x < width; x++) {
          const y = h / 2 + Math.sin(x * 0.02 + phase) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        phase += 0.03;
        animationId = requestAnimationFrame(render);
        return;
      }

      // Active Recording: Multi-Bar Frequency Spectrum with glowing caps
      const barCount = 48;
      const barWidth = (width / barCount) * 0.65;
      const gap = (width / barCount) * 0.35;

      for (let i = 0; i < barCount; i++) {
        let value = 0;
        if (analyserData && analyserData.length > 0) {
          const dataIndex = Math.floor((i / barCount) * (analyserData.length * 0.7));
          value = analyserData[dataIndex] || 0;
        }

        // Boost responsiveness
        const normalizedVal = (value / 255) * (h * 0.85);
        const minHeight = isSpeakingDetected ? 6 : 3;
        const barHeight = Math.max(normalizedVal, minHeight);

        const x = i * (barWidth + gap) + gap / 2;
        const y = (h - barHeight) / 2;

        // Dynamic gradient based on amplitude
        const barGradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isSpeakingDetected) {
          barGradient.addColorStop(0, '#38BDF8'); // Cyan light
          barGradient.addColorStop(0.5, '#818CF8'); // Indigo
          barGradient.addColorStop(1, '#C084FC'); // Purple
        } else {
          barGradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
          barGradient.addColorStop(1, 'rgba(168, 85, 247, 0.4)');
        }

        ctx.fillStyle = barGradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();

        // Neon Glow effect for active speaking
        if (isSpeakingDetected && barHeight > 15) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#818CF8';
        } else {
          ctx.shadowBlur = 0;
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyserData, recordingState, isSpeakingDetected, volumeLevel]);

  return (
    <div className="w-full relative flex items-center justify-center overflow-hidden rounded-2xl bg-neutral-950/60 border border-white/10 backdrop-blur-md px-4 py-3 shadow-inner">
      <canvas
        ref={canvasRef}
        width={720}
        height={height}
        className="w-full max-w-2xl h-[70px] block"
      />
    </div>
  );
};
