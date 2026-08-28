import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoiceFlow AI — Real-Time Voice to Text & Universal AI Speech Studio',
  description: '100% Free speech-to-text live dictation, audio transcription, Kokoro neural TTS, and AI intelligence suite supporting Gemini, OpenAI, Claude, Groq, and DeepSeek.',
  keywords: ['voice to text', 'speech to text', 'whisper', 'ai transcription', 'kokoro tts', 'gemini speech'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#09090b] text-[#f4f4f5] min-h-screen selection:bg-violet-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
