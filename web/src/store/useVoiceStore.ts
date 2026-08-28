import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  RecordingState, 
  STTEngine, 
  TTSEngine, 
  AudioSourceType,
  AIProvider, 
  APIKeysConfig, 
  TranscriptSegment, 
  SessionHistoryItem, 
  SpeechStats,
  ToneSentimentStats,
  VoiceMacroCard,
  RepurposeFormat 
} from '@/types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

interface VoiceStoreState {
  // Recording State
  recordingState: RecordingState;
  durationSeconds: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  volumeLevel: number; // 0 to 100
  isSpeakingDetected: boolean;
  audioSourceType: AudioSourceType;

  // Real Voice Audio Playback State
  isAudioPlaying: boolean;
  audioPlaybackRate: number;
  audioCurrentTime: number;
  audioDuration: number;

  // Transcript & Content State
  liveInterimText: string;
  segments: TranscriptSegment[];
  rawTranscript: string;
  polishedTranscript: string;
  summary: string;
  actionItems: string[];
  translatedText: string;
  targetTranslationLanguage: string;
  mindmapCode: string;
  repurposedContent: { format: RepurposeFormat; content: string } | null;
  activeWorkspaceTab: 'transcript' | 'dialogue' | 'polished' | 'summary' | 'mindmap' | 'repurpose' | 'actions' | 'tone';

  // Multi-Speaker Diarization State
  isMultiSpeakerMode: boolean;
  speaker1Name: string;
  speaker2Name: string;

  // Tone & Sentiment Analysis State
  toneStats: ToneSentimentStats;

  // Smart Voice Macro Cards (Auto-Kanban)
  macroCards: VoiceMacroCard[];

  // Stats & Speech Coach
  stats: SpeechStats;

  // Configuration & Settings
  selectedLanguage: string;
  sttEngine: STTEngine;
  ttsEngine: TTSEngine;
  selectedAIProvider: AIProvider;
  apiKeys: APIKeysConfig;
  noiseGateEnabled: boolean;
  highPassFilterEnabled: boolean;
  autoPunctuation: boolean;

  // AI Loading & Error State
  isAiProcessing: boolean;
  aiStatusMessage: string;
  errorMessage: string | null;

  // UI Modals & Drawers
  isSettingsOpen: boolean;
  isHistoryOpen: boolean;
  isUploadModalOpen: boolean;
  isChatDrawerOpen: boolean;
  isTheaterSubtitleOpen: boolean;

  // History & Chat
  history: SessionHistoryItem[];
  chatMessages: ChatMessage[];

  // Actions
  setRecordingState: (state: RecordingState) => void;
  setDurationSeconds: (duration: number | ((prev: number) => number)) => void;
  setAudioBlob: (blob: Blob | null, url: string | null) => void;
  setVolumeLevel: (vol: number) => void;
  setIsSpeakingDetected: (detected: boolean) => void;
  setAudioSourceType: (type: AudioSourceType) => void;

  setAudioPlaybackState: (state: { isPlaying?: boolean; rate?: number; currentTime?: number; duration?: number }) => void;
  
  setLiveInterimText: (text: string) => void;
  addTranscriptSegment: (segment: TranscriptSegment) => void;
  setRawTranscript: (text: string) => void;
  setPolishedTranscript: (text: string) => void;
  setSummary: (summary: string) => void;
  setActionItems: (items: string[]) => void;
  setTranslatedText: (text: string, lang: string) => void;
  setMindmapCode: (code: string) => void;
  setRepurposedContent: (repurpose: { format: RepurposeFormat; content: string } | null) => void;
  setActiveWorkspaceTab: (tab: 'transcript' | 'dialogue' | 'polished' | 'summary' | 'mindmap' | 'repurpose' | 'actions' | 'tone') => void;
  
  setIsMultiSpeakerMode: (enabled: boolean) => void;
  setSpeakerNames: (names: { speaker1?: string; speaker2?: string }) => void;

  // Macro Card Actions
  toggleMacroCard: (id: string) => void;
  deleteMacroCard: (id: string) => void;
  addMacroCard: (card: Omit<VoiceMacroCard, 'id' | 'timestamp'>) => void;
  
  updateStats: () => void;
  setSelectedLanguage: (lang: string) => void;
  setSttEngine: (engine: STTEngine) => void;
  setTtsEngine: (engine: TTSEngine) => void;
  setSelectedAIProvider: (provider: AIProvider) => void;
  setApiKey: (provider: keyof APIKeysConfig, key: string) => void;
  setAudioFilterSettings: (settings: { noiseGate?: boolean; highPass?: boolean; autoPunc?: boolean }) => void;
  
  setIsAiProcessing: (processing: boolean, msg?: string) => void;
  setErrorMessage: (err: string | null) => void;

  setModalOpen: (modal: 'settings' | 'history' | 'upload' | 'chat' | 'theater', isOpen: boolean) => void;
  
  saveCurrentSessionToHistory: (title?: string) => void;
  loadSessionFromHistory: (session: SessionHistoryItem) => void;
  deleteSessionFromHistory: (id: string) => void;
  clearHistory: () => void;
  
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  resetAll: () => void;
}

const COMMON_FILLER_WORDS = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 'literally', 'so yeah'];

export const useVoiceStore = create<VoiceStoreState>()(
  persist(
    (set, get) => ({
      // Recording Initial
      recordingState: 'idle',
      durationSeconds: 0,
      audioBlob: null,
      audioUrl: null,
      volumeLevel: 0,
      isSpeakingDetected: false,
      audioSourceType: 'microphone',

      // Real Voice Audio Playback Initial
      isAudioPlaying: false,
      audioPlaybackRate: 1.0,
      audioCurrentTime: 0,
      audioDuration: 0,

      // Transcript Initial
      liveInterimText: '',
      segments: [],
      rawTranscript: '',
      polishedTranscript: '',
      summary: '',
      actionItems: [],
      translatedText: '',
      targetTranslationLanguage: 'es-ES',
      mindmapCode: '',
      repurposedContent: null,
      activeWorkspaceTab: 'transcript',

      // Multi-Speaker Initial
      isMultiSpeakerMode: false,
      speaker1Name: 'Speaker 1 (Host)',
      speaker2Name: 'Speaker 2 (Guest)',

      // Tone Sentiment Initial
      toneStats: {
        confidence: 90,
        energy: 85,
        executivePresence: 88,
        primaryMood: 'Confident & Persuasive',
        coachingTip: 'Steady pace with clear enunciation and confident pitch.',
      },

      // Macro Cards Initial
      macroCards: [],

      // Stats Initial
      stats: {
        wpm: 0,
        wordCount: 0,
        charCount: 0,
        durationSeconds: 0,
        fillerWordsCount: 0,
        fillerWordsList: {},
        clarityScore: 100,
      },

      // Settings Initial
      selectedLanguage: 'en-US',
      sttEngine: 'web-speech',
      ttsEngine: 'kokoro',
      selectedAIProvider: 'free-local',
      apiKeys: {},
      noiseGateEnabled: true,
      highPassFilterEnabled: true,
      autoPunctuation: true,

      // AI State
      isAiProcessing: false,
      aiStatusMessage: '',
      errorMessage: null,

      // Modals
      isSettingsOpen: false,
      isHistoryOpen: false,
      isUploadModalOpen: false,
      isChatDrawerOpen: false,
      isTheaterSubtitleOpen: false,

      // History & Chat
      history: [],
      chatMessages: [],

      // Actions
      setRecordingState: (recordingState) => set({ recordingState }),
      setDurationSeconds: (durationSeconds) => 
        set((state) => ({
          durationSeconds: typeof durationSeconds === 'function' ? durationSeconds(state.durationSeconds) : durationSeconds
        })),
      setAudioBlob: (audioBlob, audioUrl) => set({ audioBlob, audioUrl }),
      setVolumeLevel: (volumeLevel) => set({ volumeLevel }),
      setIsSpeakingDetected: (isSpeakingDetected) => set({ isSpeakingDetected }),
      setAudioSourceType: (audioSourceType) => set({ audioSourceType }),

      setAudioPlaybackState: (playback) =>
        set((state) => ({
          isAudioPlaying: playback.isPlaying ?? state.isAudioPlaying,
          audioPlaybackRate: playback.rate ?? state.audioPlaybackRate,
          audioCurrentTime: playback.currentTime ?? state.audioCurrentTime,
          audioDuration: playback.duration ?? state.audioDuration,
        })),

      setLiveInterimText: (liveInterimText) => set({ liveInterimText }),
      addTranscriptSegment: (segment) => 
        set((state) => {
          // Assign alternating speakers in multi-speaker mode
          const currentSpeaker = state.isMultiSpeakerMode
            ? (state.segments.length % 2 === 0 ? 'speaker-1' : 'speaker-2')
            : 'speaker-1';

          const segmentWithSpeaker: TranscriptSegment = {
            ...segment,
            speaker: segment.speaker || currentSpeaker,
          };

          const newSegments = [...state.segments, segmentWithSpeaker];
          const newRaw = newSegments.map(s => s.text).join(' ');

          // Real-time Voice Macro Triggers detection (Task, Idea, Important)
          const lowerSeg = segment.text.toLowerCase();
          const newCards = [...state.macroCards];

          if (lowerSeg.includes('task:') || lowerSeg.includes('todo:') || lowerSeg.includes('action:')) {
            const taskText = segment.text.replace(/^(task|todo|action):\s*/i, '');
            newCards.push({
              id: `macro-${Date.now()}`,
              type: 'task',
              text: taskText || segment.text,
              isCompleted: false,
              timestamp: Date.now(),
            });
          } else if (lowerSeg.includes('idea:') || lowerSeg.includes('brainstorm:')) {
            const ideaText = segment.text.replace(/^(idea|brainstorm):\s*/i, '');
            newCards.push({
              id: `macro-${Date.now()}`,
              type: 'idea',
              text: ideaText || segment.text,
              isCompleted: false,
              timestamp: Date.now(),
            });
          } else if (lowerSeg.includes('important:') || lowerSeg.includes('urgent:')) {
            const alertText = segment.text.replace(/^(important|urgent):\s*/i, '');
            newCards.push({
              id: `macro-${Date.now()}`,
              type: 'urgent',
              text: alertText || segment.text,
              isCompleted: false,
              timestamp: Date.now(),
            });
          }

          return { 
            segments: newSegments, 
            rawTranscript: newRaw,
            macroCards: newCards 
          };
        }),

      setRawTranscript: (rawTranscript) => set({ rawTranscript }),
      setPolishedTranscript: (polishedTranscript) => set({ polishedTranscript }),
      setSummary: (summary) => set({ summary }),
      setActionItems: (actionItems) => set({ actionItems }),
      setTranslatedText: (translatedText, targetTranslationLanguage) => set({ translatedText, targetTranslationLanguage }),
      setMindmapCode: (mindmapCode) => set({ mindmapCode }),
      setRepurposedContent: (repurposedContent) => set({ repurposedContent }),
      setActiveWorkspaceTab: (activeWorkspaceTab) => set({ activeWorkspaceTab }),

      setIsMultiSpeakerMode: (isMultiSpeakerMode) => set({ isMultiSpeakerMode }),
      setSpeakerNames: (names) => set((state) => ({
        speaker1Name: names.speaker1 ?? state.speaker1Name,
        speaker2Name: names.speaker2 ?? state.speaker2Name,
      })),

      toggleMacroCard: (id) =>
        set((state) => ({
          macroCards: state.macroCards.map(c => c.id === id ? { ...c, isCompleted: !c.isCompleted } : c)
        })),

      deleteMacroCard: (id) =>
        set((state) => ({
          macroCards: state.macroCards.filter(c => c.id !== id)
        })),

      addMacroCard: (card) =>
        set((state) => ({
          macroCards: [...state.macroCards, { id: `macro-${Date.now()}`, timestamp: Date.now(), ...card }]
        })),

      updateStats: () => {
        const { rawTranscript, durationSeconds } = get();
        const text = rawTranscript.trim();
        if (!text) {
          set({
            stats: {
              wpm: 0,
              wordCount: 0,
              charCount: 0,
              durationSeconds,
              fillerWordsCount: 0,
              fillerWordsList: {},
              clarityScore: 100,
            },
            toneStats: {
              confidence: 90,
              energy: 85,
              executivePresence: 88,
              primaryMood: 'Ready to Listen',
              coachingTip: 'Speak with your natural conversational tone.',
            }
          });
          return;
        }

        const words = text.split(/\s+/).filter(Boolean);
        const wordCount = words.length;
        const charCount = text.length;
        const minutes = Math.max(durationSeconds / 60, 0.1);
        const wpm = Math.round(wordCount / minutes);

        // Count filler words
        const fillerList: Record<string, number> = {};
        let totalFillers = 0;
        const lowerText = text.toLowerCase();

        COMMON_FILLER_WORDS.forEach(filler => {
          const regex = new RegExp(`\\b${filler}\\b`, 'gi');
          const matches = lowerText.match(regex);
          if (matches && matches.length > 0) {
            fillerList[filler] = matches.length;
            totalFillers += matches.length;
          }
        });

        // Clarity score calculation
        let clarity = 100;
        const fillerRatio = wordCount > 0 ? (totalFillers / wordCount) * 100 : 0;
        clarity -= Math.min(fillerRatio * 5, 40);
        if (wpm < 80 || wpm > 200) {
          clarity -= 15;
        }

        // Tone & Sentiment Analysis calculation
        let confidence = 85;
        let energy = 80;
        let executivePresence = 85;
        let mood = 'Balanced & Clear';
        let tip = 'Great delivery and balanced tone.';

        if (wpm >= 130 && wpm <= 165 && totalFillers <= 2) {
          confidence = 96;
          energy = 92;
          executivePresence = 94;
          mood = 'Confident & Persuasive';
          tip = 'Optimal speaking cadence with high executive presence.';
        } else if (wpm > 175) {
          energy = 95;
          confidence = 78;
          mood = 'High Energy / Rapid';
          tip = 'Try slowing down slightly at sentence ends for maximum audience retention.';
        } else if (wpm < 100 && wpm > 0) {
          confidence = 82;
          energy = 70;
          mood = 'Deliberate & Thoughtful';
          tip = 'Good clarity; consider slightly picking up tempo for dynamic engagement.';
        }

        set({
          stats: {
            wpm,
            wordCount,
            charCount,
            durationSeconds,
            fillerWordsCount: totalFillers,
            fillerWordsList: fillerList,
            clarityScore: Math.max(Math.round(clarity), 20),
          },
          toneStats: {
            confidence,
            energy,
            executivePresence,
            primaryMood: mood,
            coachingTip: tip,
          }
        });
      },

      setSelectedLanguage: (selectedLanguage) => set({ selectedLanguage }),
      setSttEngine: (sttEngine) => set({ sttEngine }),
      setTtsEngine: (ttsEngine) => set({ ttsEngine }),
      setSelectedAIProvider: (selectedAIProvider) => set({ selectedAIProvider }),
      
      setApiKey: (provider, key) => 
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key }
        })),

      setAudioFilterSettings: (settings) =>
        set((state) => ({
          noiseGateEnabled: settings.noiseGate ?? state.noiseGateEnabled,
          highPassFilterEnabled: settings.highPass ?? state.highPassFilterEnabled,
          autoPunctuation: settings.autoPunc ?? state.autoPunctuation,
        })),

      setIsAiProcessing: (isAiProcessing, aiStatusMessage = '') => 
        set({ isAiProcessing, aiStatusMessage }),

      setErrorMessage: (errorMessage) => set({ errorMessage }),

      setModalOpen: (modal, isOpen) => {
        if (modal === 'settings') set({ isSettingsOpen: isOpen });
        if (modal === 'history') set({ isHistoryOpen: isOpen });
        if (modal === 'upload') set({ isUploadModalOpen: isOpen });
        if (modal === 'chat') set({ isChatDrawerOpen: isOpen });
        if (modal === 'theater') set({ isTheaterSubtitleOpen: isOpen });
      },

      saveCurrentSessionToHistory: (customTitle) => {
        const { rawTranscript, polishedTranscript, summary, actionItems, mindmapCode, macroCards, durationSeconds, stats, selectedLanguage, audioBlob } = get();
        if (!rawTranscript.trim()) return;

        const defaultTitle = rawTranscript.slice(0, 40) + (rawTranscript.length > 40 ? '...' : '');
        const newItem: SessionHistoryItem = {
          id: `session-${Date.now()}`,
          title: customTitle || defaultTitle || 'Untitled Speech Session',
          createdAt: Date.now(),
          durationSeconds,
          wordCount: stats.wordCount,
          rawText: rawTranscript,
          polishedText: polishedTranscript || undefined,
          summary: summary || undefined,
          actionItems: actionItems.length > 0 ? actionItems : undefined,
          mindmapMermaid: mindmapCode || undefined,
          macroCards: macroCards.length > 0 ? macroCards : undefined,
          language: selectedLanguage,
          tags: ['voice-note'],
          isPinned: false,
          hasAudioBlob: Boolean(audioBlob),
        };

        set((state) => ({
          history: [newItem, ...state.history]
        }));
      },

      loadSessionFromHistory: (session) => {
        set({
          rawTranscript: session.rawText,
          polishedTranscript: session.polishedText || '',
          summary: session.summary || '',
          actionItems: session.actionItems || [],
          mindmapCode: session.mindmapMermaid || '',
          macroCards: session.macroCards || [],
          durationSeconds: session.durationSeconds,
          selectedLanguage: session.language,
          activeWorkspaceTab: 'transcript',
          isHistoryOpen: false,
        });
        get().updateStats();
      },

      deleteSessionFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter(item => item.id !== id)
        })),

      clearHistory: () => set({ history: [] }),

      addChatMessage: (msg) => {
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: Date.now(),
          ...msg,
        };
        set((state) => ({ chatMessages: [...state.chatMessages, newMsg] }));
      },

      clearChat: () => set({ chatMessages: [] }),

      resetAll: () => set({
        recordingState: 'idle',
        durationSeconds: 0,
        audioBlob: null,
        audioUrl: null,
        liveInterimText: '',
        segments: [],
        rawTranscript: '',
        polishedTranscript: '',
        summary: '',
        actionItems: [],
        translatedText: '',
        mindmapCode: '',
        macroCards: [],
        repurposedContent: null,
        activeWorkspaceTab: 'transcript',
        chatMessages: [],
        errorMessage: null,
        stats: {
          wpm: 0,
          wordCount: 0,
          charCount: 0,
          durationSeconds: 0,
          fillerWordsCount: 0,
          fillerWordsList: {},
          clarityScore: 100,
        },
        toneStats: {
          confidence: 90,
          energy: 85,
          executivePresence: 88,
          primaryMood: 'Ready to Listen',
          coachingTip: 'Speak with your natural conversational tone.',
        }
      })
    }),
    {
      name: 'voice-to-text-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        selectedLanguage: state.selectedLanguage,
        sttEngine: state.sttEngine,
        ttsEngine: state.ttsEngine,
        selectedAIProvider: state.selectedAIProvider,
        history: state.history,
        noiseGateEnabled: state.noiseGateEnabled,
        highPassFilterEnabled: state.highPassFilterEnabled,
        autoPunctuation: state.autoPunctuation,
        speaker1Name: state.speaker1Name,
        speaker2Name: state.speaker2Name,
      }),
    }
  )
);
