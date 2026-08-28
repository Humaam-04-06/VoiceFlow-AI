export type RecordingState = 'idle' | 'recording' | 'paused' | 'processing';

export type STTEngine = 'web-speech' | 'groq-whisper' | 'openai-whisper';

export type TTSEngine = 'kokoro' | 'edge-neural' | 'browser' | 'openai';

export type AIProvider = 
  | 'free-local'
  | 'gemini'
  | 'groq'
  | 'openai'
  | 'claude'
  | 'grok'
  | 'kimi'
  | 'deepseek'
  | 'openrouter';

export interface APIKeysConfig {
  geminiKey?: string;
  groqKey?: string;
  openaiKey?: string;
  claudeKey?: string;
  grokKey?: string;
  kimiKey?: string;
  deepseekKey?: string;
  openrouterKey?: string;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string;
  confidence?: number;
  isAiEdited?: boolean;
}

export interface SessionHistoryItem {
  id: string;
  title: string;
  createdAt: number;
  durationSeconds: number;
  wordCount: number;
  rawText: string;
  polishedText?: string;
  summary?: string;
  actionItems?: string[];
  mindmapMermaid?: string;
  language: string;
  tags: string[];
  isPinned?: boolean;
}

export interface SpeechStats {
  wpm: number;
  wordCount: number;
  charCount: number;
  durationSeconds: number;
  fillerWordsCount: number;
  fillerWordsList: Record<string, number>;
  clarityScore: number; // 0 to 100
}

export type RepurposeFormat = 
  | 'email'
  | 'twitter-thread'
  | 'linkedin-post'
  | 'meeting-minutes'
  | 'study-flashcards'
  | 'blog-outline';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}
