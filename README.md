# 🎙️ VoiceFlow AI — Universal Voice Intelligence Studio (Web & Mobile)

An intelligent, privacy-first, ultra-fast **Voice-to-Text & Speech Transcription Suite** built for cross-platform deployment across **Web** (Next.js 16 + React 19) and **Mobile** (React Native + whisper.cpp CoreML / NPU). Powered by **OpenAI Whisper**, **whisper.cpp** (C/C++ native engine), **Kokoro-82M Neural TTS**, and a **Multi-LLM BYOK & 100% Free Local NLP** suite.

---

## 🌟 Live Demo & Repository

- **Web App**: `http://localhost:3000` (Local Dev)
- **Repository**: [https://github.com/Humaam-04-06/Voice_To_Text_App](https://github.com/Humaam-04-06/Voice_To_Text_App)
- **License**: MIT

---

## 🛠️ Complete Multi-Platform Tech Stack

| Layer | Web Application (`/web`) | Mobile Application (`/mobile`) |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router) + React 19** | **React Native (0.76) + Expo SDK 52** |
| **Language** | **TypeScript 5 (Strict)** | **TypeScript 5 (Strict)** |
| **STT Engine** | **Web Speech API + Groq Whisper Large-v3** | **`whisper.cpp` (C++) via `whisper.rn` (100% Offline)** |
| **Hardware Accel** | **Web Audio API DSP Filter Nodes** | **Apple CoreML / Neural Engine & Android NPU** |
| **Audio Processing** | **48kHz Web Audio DSP (85Hz HighPass, LowPass, Compressor, Notch)** | **`expo-av` + Native Hardware Microphones** |
| **TTS Engine** | **Kokoro-82M + Edge Neural + Web Speech** | **Native Speech Synthesis / Kokoro** |
| **Iconography** | **Font Awesome SVG Icons (`@fortawesome/react-fontawesome`)** | **Vector Icons** |
| **State Management** | **Zustand 5 (with IndexedDB / LocalStorage)** | **Zustand 5 (AsyncStorage)** |
| **Document Export** | **jsPDF (Formal MoM & Transcript) + Canvas-Confetti** | **Native Share Sheet & PDF Exporter** |

---

## ✨ Implemented Core Features

### 1. 🎙️ Real-Time Live Speech Dictation (100% Free)
- **Zero-Latency Streaming**: Speak and watch words transcribe live in real-time.
- **Multilingual Support**: Real-time recognition across 20+ languages (English, Urdu, Hindi, Spanish, French, German, Arabic, Mandarin, Japanese, etc.).
- **Live Reactive Waveform**: 48-band frequency spectrum visualizer with glowing neon caps.

### 2. 🌐 2-Way "Babel Mode" (Live Duplex Universal Translator)
- **Simultaneous 2-Way Translation**: Two people speaking different languages (e.g. Person A in English, Person B in Spanish/Urdu).
- Transcribes, translates, and automatically speaks aloud in the partner's native language using Neural TTS.

### 3. 🔇 Multi-Stage DSP Noise Cancellation & Audio Clarity
- **85Hz High-Pass Rumble Filter**: Eliminates table bumps, mic pops, and AC hum.
- **8500Hz Low-Pass Filter**: Removes computer fan noise and coil whine.
- **60Hz Ground Loop Notch**: Cuts electrical power interference.
- **Dynamics Vocal Compressor**: Balances vocal levels and silences room noise floors.

### 4. 🎚️ Studio Vocal Mastering & Radio Host EQ Presets
- **Clean DSP**: Balanced studio noise reduction.
- **Podcast Warmth**: Low-end richness boost (+3dB at 150Hz).
- **Broadcast Radio**: Presence & high-end air boost (+2.5dB at 3.5kHz).
- **Crisp Clarity**: Mid-range articulation boost for rapid speech.

### 5. 📑 Official Corporate Meeting Minutes (MoM) & Executive PDF
- Transforms meeting transcripts into formal corporate documents with *Objectives*, *Key Discussions*, *Decision Matrix*, and *Action Items*.
- 1-Click **"MoM PDF"** export with formal executive approval signature blocks.

### 6. 🔍 "Ask My Voice Vault" (Semantic Audio Search)
- Real-time keyword and topic search across all saved voice notes and history with instant session recall.

### 7. 🪄 Smart Voice Macro Triggers & Action Board (Auto-Kanban)
- Say `"Task: ..."`, `"Idea: ..."`, or `"Important: ..."` while speaking to automatically pin interactive cards to a live task board.

### 8. 👥 Multi-Speaker Diarization (Dialogue Splitter)
- Color-coded dialogue bubbles (Speaker 1 in violet, Speaker 2 in cyan) with customizable speaker names.

### 9. 🎬 Floating Dual-Language Theater Subtitles
- Floating cinematic subtitle overlay with live original speech on top and translated subtitles below.

### 10. 📹 Video / Audio URL Importer
- Import online lectures, streaming audio feeds, and video URLs for direct speech extraction and summarization.

### 11. 🧠 Multi-LLM BYOK & 100% Free Offline NLP
- Zero-cost local regex NLP engine + BYOK support for Gemini, Claude 3.5, GPT-4o, Groq LLaMA-3.3, Grok 2, DeepSeek, and KIMI.

### 12. 📱 100% Offline Mobile Companion App (`/mobile`)
- On-device speech recognition powered by `whisper.cpp` running on iOS CoreML and Android NPU with zero server latency and total privacy.

---

## 📁 Repository Structure

```
Voice_To_Text_App/
├── web/                           # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/transcribe/    # Whisper audio transcription route
│   │   │   ├── globals.css        # Glassmorphic Tailwind theme
│   │   │   ├── layout.tsx         # Root layout with Font Awesome CSS & SEO
│   │   │   └── page.tsx           # Main application page
│   │   ├── components/            # UI Components with Font Awesome SVG icons
│   │   │   ├── AudioFileUploadModal.tsx   # File & Video URL importer
│   │   │   ├── AudioPlaybackPlayer.tsx    # Real voice replay & EQ presets
│   │   │   ├── BabelTranslatorModal.tsx   # 2-Way live duplex translator
│   │   │   ├── ChatDrawer.tsx
│   │   │   ├── HeroRecordingZone.tsx
│   │   │   ├── HistoryDrawer.tsx          # Semantic Voice Vault search
│   │   │   ├── MindmapViewer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── SpeechCoachWidget.tsx
│   │   │   ├── TheaterSubtitleModal.tsx   # Floating dual subtitles
│   │   │   ├── ToneSentimentRadar.tsx     # Live emotional mood & tone HUD
│   │   │   ├── TranscriptionWorkspace.tsx # Workspace & MoM PDF exporter
│   │   │   ├── VoiceMacroActionBoard.tsx  # Spoken triggers & Kanban tasks
│   │   │   └── WaveformVisualizer.tsx
│   │   ├── hooks/
│   │   │   ├── useAudioRecorder.ts        # Multi-stage DSP noise filter
│   │   │   └── useSpeechRecognition.ts
│   │   ├── lib/
│   │   │   ├── ai/                        # Multi-LLM & Local NLP dispatchers
│   │   │   ├── audio/                     # TTS and audio filter engines
│   │   │   └── constants/                 # Supported multilingual list
│   │   ├── store/                         # Zustand Global Voice Store
│   │   └── types/                         # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
├── mobile/                        # React Native / Expo Mobile App
│   ├── src/
│   │   └── services/
│   │       └── whisperEngine.ts   # whisper.cpp CoreML / NPU offline engine
│   ├── App.tsx                    # Mobile App entry point
│   ├── app.json                   # Mobile configuration
│   └── package.json
└── README.md                      # Master Project Documentation
```

---

## 🚀 Quick Start Guide

### Web Application (`/web`)
```bash
cd web
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### Mobile Application (`/mobile`)
```bash
cd mobile
npm install
npx expo start
```

---

## 📄 License & Attribution

- **Whisper**: OpenAI (MIT License)
- **whisper.cpp**: Georgi Gerganov & GGML Community (MIT License)
- **Application Code**: Licensed under the [MIT License](LICENSE).
