export type RecordingState = 'idle' | 'recording' | 'paused' | 'processing';

export type STTEngine = 'web-speech' | 'groq-whisper' | 'openai-whisper';

export type TTSEngine = 'kokoro' | 'edge-neural' | 'browser' | 'openai';

export type AudioSourceType = 'microphone' | 'tab-audio';

export type AIProvider = 
  | 'gemini'
  | 'openai'
  | 'claude'
  | 'free-local';

export interface APIKeysConfig {
  geminiKey?: string;
  openaiKey?: string;
  claudeKey?: string;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  speaker?: 'speaker-1' | 'speaker-2' | string;
  confidence?: number;
  isAiEdited?: boolean;
}

export interface ToneSentimentStats {
  confidence: number; // 0-100%
  energy: number; // 0-100%
  executivePresence: number; // 0-100%
  primaryMood: string;
  coachingTip: string;
}

export interface VoiceMacroCard {
  id: string;
  type: 'task' | 'idea' | 'urgent';
  text: string;
  isCompleted: boolean;
  timestamp: number;
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
  macroCards?: VoiceMacroCard[];
  language: string;
  tags: string[];
  isPinned?: boolean;
  hasAudioBlob?: boolean;
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
