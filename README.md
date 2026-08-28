# 🎙️ VoiceFlow AI — Voice to Text & Universal Speech Intelligence Studio

An intelligent, privacy-first, ultra-fast **Voice-to-Text & Speech Transcription Application** designed for cross-platform deployment across **Web** and **Mobile** (iOS & Android). Powered by the **OpenAI Whisper** and **whisper.cpp** (C/C++ port) ecosystem with built-in **100% Free speech recognition**, **Font Awesome SVG iconography**, **Real Voice Playback & Audio Download**, **Neural TTS**, **Live Tone Radar**, **Voice Macro Action Boards**, **Multi-Speaker Diarization**, and a **Multi-LLM BYOK (Bring Your Own Key)** suite.

---

## 🌟 Live Demo & Preview

- **Web App URL**: `http://localhost:3000` (Local Dev)
- **Repository**: [https://github.com/Humaam-04-06/Voice_To_Text_App](https://github.com/Humaam-04-06/Voice_To_Text_App)
- **License**: MIT

---

## 🛠️ Complete Tech Stack

| Layer | Technology | Purpose & Capabilities |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router) + React 19** | Ultra-fast Server-Side Rendering, Turbopack compilation, and modern client hooks. |
| **Language** | **TypeScript 5** | Strict type safety across all audio buffers, speech segments, and AI dispatcher payloads. |
| **Styling & Theme** | **Tailwind CSS v4 + Glassmorphic CSS** | Sleek dark mode by default, neon radial gradients, custom scrollbars, and micro-interactions. |
| **Iconography** | **Font Awesome SVG Icons (`@fortawesome/react-fontawesome`)** | Crisp, professional vector icons with zero default emoji reliance. |
| **Audio Processing** | **Web Audio API (`AudioContext`, `AnalyserNode`, `BiquadFilterNode`)** | Real-time 44.1kHz audio capture, 80Hz high-pass filter, volume RMS detection, and noise suppression. |
| **Speech Recognition** | **Web Speech API + Whisper Cloud API (`whisper-large-v3`)** | 100% Free infinite in-browser dictation + cloud Whisper audio fallback. |
| **Speech Synthesis (TTS)** | **Kokoro-82M Neural + Edge Neural TTS + Web Speech** | Studio-quality human voice playback directly inside the browser. |
| **Real Voice Playback** | **HTML5 Audio Engine + Blob URL Exporter** | Replay user's real human voice with scrub bar, speed multiplier (1x-2x), and 1-click audio file download. |
| **State Management** | **Zustand 5 (with LocalStorage persistence)** | Lightweight, zero-boilerplate global state for transcripts, audio state, and API keys. |
| **AI Intelligence Engine** | **Multi-Provider BYOK Engine + Free Local NLP** | Unified dispatcher supporting Gemini, OpenAI, Claude, Groq, DeepSeek, Groq LLaMA-3.3, and offline regex/NLP. |
| **Export Engines** | **jsPDF + Canvas-Confetti** | 1-Click PDF formatting, `.SRT` Subtitles, `.TXT`, `.MD`, and celebration confetti. |

---

## ✨ Implemented Core Features

### 1. 🎙️ Real-Time Live Speech Dictation (100% Free)
- **Zero-Latency Streaming**: Speak and watch words transcribe live in real-time.
- **Multilingual Support**: Real-time recognition across 20+ languages (English, Urdu, Hindi, Spanish, French, German, Arabic, Mandarin, Japanese, Russian, etc.).
- **Live Canvas Audio Waveform Visualizer**: 48-band reactive frequency spectrum bouncing to user pitch and volume with glowing neon caps.

### 2. 🎧 Real Human Voice Playback & Audio Save
- **Instant Voice Replay**: Listen to what you just said in your real recorded human voice right after dictating.
- **Custom Playback Speeds**: Toggle `1.0x`, `1.25x`, `1.5x`, and `2.0x` speed with scrub slider.
- 💾 **Save Audio to PC**: 1-Click download of original audio `.webm` recording.

### 3. 🎭 Live Tone & Sentiment Emotional Radar
- **Vocal Mood & Delivery Analysis**: Real-time detection of speech dynamics (Confidence %, Vocal Energy %, Executive Impact %).
- **AI Delivery Coaching**: Instant feedback on cadence, persuasion, and clarity.

### 4. 🪄 Smart Voice Macro Triggers & Action Board (Auto-Kanban)
- **Voice Macro Parser**: Say `"Task: ..."`, `"Idea: ..."`, or `"Important: ..."` while speaking to automatically pin cards to a live interactive Kanban checklist.
- **Interactive Checkboxes & Copy**: Check off completed tasks and export task lists to Markdown.

### 5. 👥 Multi-Speaker Diarization (Dialogue Splitter)
- **Host & Guest Separation**: Organize speech into color-coded dialogue bubbles (Speaker 1 in violet, Speaker 2 in cyan).
- **Customizable Speaker Names**: Assign custom names (e.g., "John", "Sarah") for podcast and interview transcripts.

### 6. 🎬 Floating Dual-Language Theater Subtitle Bar
- **Cinematic Subtitle Overlay**: Floating live caption bar showing real-time original speech on top and live translated subtitles beneath with fullscreen and font zoom controls.

### 7. 📊 Live Speech Coach & WPM Gauge
- **Words Per Minute (WPM)**: Real-time pace tracker with sweet-spot indicators.
- **Filler Word Radar**: Detects and counts verbal tics (*"um"*, *"uh"*, *"like"*, *"basically"*).
- **Clarity & Fluency Score**: Live 0-100% speech fluency index.

### 8. 🧠 Universal Multi-LLM BYOK & 100% Free Offline NLP
- **Free Local Engine**: Grammar polish, filler word removal, bullet summaries, and task extraction with zero API keys.
- **BYOK Cloud Providers**: Gemini 2.0 Flash, Claude 3.5 Sonnet, GPT-4o, Groq LLaMA-3.3, Grok 2, DeepSeek Reasoner, KIMI.

### 9. 📑 1-Click Multi-Format Repurposer Studio
Transform transcripts into:
- 📧 **Executive Email Draft**
- 📋 **Meeting Minutes (MoM) with Action Items**
- 🧵 **Twitter / X Thread**
- 💼 **LinkedIn Thought Leadership Post**
- 🎓 **Study Flashcards & Review Quiz**
- 📰 **SEO Blog Article Outline**

### 10. 🧠 Voice-to-Mindmap (Mermaid.js Visualizer)
- Converts spoken thoughts and brainstorms into structured interactive concept trees.

### 11. 🔊 Neural Text-to-Speech (TTS) Suite
- Read back transcripts, summaries, or translations with **Kokoro-82M** or **Microsoft Edge Neural** studio voices.

### 12. 📁 Drag-and-Drop Audio File Uploader
- Upload `.mp3`, `.wav`, `.m4a`, `.ogg`, or `.webm` files up to 50MB with built-in player and Whisper transcription.

### 13. 💬 Interactive "Chat with Transcript"
- Ask questions and extract specific information from your recorded voice notes.

### 14. 🔒 Private Local History & Multi-Export
- Encrypted local browser storage (IndexedDB / LocalStorage) with search.
- 1-Click Copy and export to **TXT**, **PDF**, **SRT Subtitles**, and **Markdown**.

---

## 📁 Repository Structure

```
Voice_To_Text_App/
├── web/                           # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/transcribe/    # Whisper audio transcription route
│   │   │   ├── globals.css        # Glassmorphic Tailwind theme & animations
│   │   │   ├── layout.tsx         # Root layout with Font Awesome CSS & SEO
│   │   │   └── page.tsx           # Main application page
│   │   ├── components/            # UI Components with Font Awesome SVG icons
│   │   │   ├── AudioFileUploadModal.tsx
│   │   │   ├── AudioPlaybackPlayer.tsx      # Real voice replay & audio download
│   │   │   ├── ChatDrawer.tsx
│   │   │   ├── HeroRecordingZone.tsx
│   │   │   ├── HistoryDrawer.tsx
│   │   │   ├── MindmapViewer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── SpeechCoachWidget.tsx
│   │   │   ├── TheaterSubtitleModal.tsx     # Floating dual-language subtitles
│   │   │   ├── ToneSentimentRadar.tsx       # Live emotional mood & tone HUD
│   │   │   ├── TranscriptionWorkspace.tsx   # Multi-tab workspace & dialogue
│   │   │   ├── VoiceMacroActionBoard.tsx    # Spoken triggers & Kanban tasks
│   │   │   └── WaveformVisualizer.tsx
│   │   ├── hooks/                 # Custom Audio & Speech Hooks
│   │   │   ├── useAudioRecorder.ts
│   │   │   └── useSpeechRecognition.ts
│   │   ├── lib/
│   │   │   ├── ai/                # Multi-LLM & Local NLP dispatchers
│   │   │   │   ├── aiDispatcher.ts
│   │   │   │   └── localNlp.ts
│   │   │   ├── audio/             # TTS and audio filter engines
│   │   │   │   └── ttsEngine.ts
│   │   │   └── constants/         # Supported multilingual list
│   │   │       └── languages.ts
│   │   ├── store/                 # Zustand Global Voice Store
│   │   │   └── useVoiceStore.ts
│   │   └── types/                 # TypeScript type definitions
│   │       └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── mobile/                        # Planned Mobile App (React Native / whisper.cpp)
└── README.md                      # Project Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x+)
- Modern browser (Chrome, Edge, Brave, Safari)

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/Humaam-04-06/Voice_To_Text_App.git
cd Voice_To_Text_App/web

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 📄 License & Attribution

- **Whisper**: OpenAI (MIT License)
- **whisper.cpp**: Georgi Gerganov & GGML Community (MIT License)
- **Application Code**: Licensed under the [MIT License](LICENSE).
