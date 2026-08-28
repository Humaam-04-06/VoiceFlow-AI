# 🎙️ VoiceFlow AI — Voice to Text & Universal Speech Intelligence Studio

An intelligent, privacy-first, ultra-fast **Voice-to-Text & Speech Transcription Application** designed for cross-platform deployment across **Web** and **Mobile** (iOS & Android). Powered by the **OpenAI Whisper** and **whisper.cpp** (C/C++ port) ecosystem with built-in **100% Free speech recognition**, **Font Awesome SVG iconography**, **Neural TTS**, and a **Multi-LLM BYOK (Bring Your Own Key)** suite.

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
| **State Management** | **Zustand 5 (with LocalStorage persistence)** | Lightweight, zero-boilerplate global state for transcripts, audio state, and API keys. |
| **AI Intelligence Engine** | **Multi-Provider BYOK Engine + Free Local NLP** | Unified dispatcher supporting Gemini, OpenAI, Claude, Groq, DeepSeek, Groq LLaMA-3.3, and offline regex/NLP. |
| **Export Engines** | **jsPDF + Canvas-Confetti** | 1-Click PDF formatting, `.SRT` Subtitles, `.TXT`, `.MD`, and celebration confetti. |

---

## ✨ Implemented Core Features

### 1. 🎙️ Real-Time Live Speech Dictation (100% Free)
- **Zero-Latency Streaming**: Speak and watch words transcribe live in real-time.
- **Multilingual Support**: Real-time recognition across 20+ languages (English, Urdu, Hindi, Spanish, French, German, Arabic, Mandarin, Japanese, Russian, etc.).
- **Live Canvas Audio Waveform Visualizer**: 48-band reactive frequency spectrum bouncing to user pitch and volume with glowing neon caps.

### 2. 📊 Live Presentation & Speech Coach HUD
- **Words Per Minute (WPM) Gauge**: Real-time pace tracker with visual sweet-spot indicators (Relaxed, Ideal, Fast).
- **Filler Word Radar**: Detects and counts verbal tics (*"um"*, *"uh"*, *"like"*, *"you know"*, *"basically"*).
- **Clarity & Flow Score**: Live 0-100% speech fluency index.
- **Word & Character Counter**: Real-time timestamped statistics.

### 3. 🧠 Universal Multi-LLM BYOK & 100% Free Offline NLP
- **Zero Key Needed (Free Local Engine)**: Client-side grammar polish, filler word removal, bullet summaries, and task extraction without sending data outside your device.
- **BYOK Cloud Providers**:
  - Google Gemini (`gemini-2.0-flash`, `gemini-1.5-pro`)
  - Groq Cloud (`llama-3.3-70b-versatile`, `whisper-large-v3`)
  - OpenAI (`gpt-4o`, `gpt-4o-mini`, `whisper-1`, `tts-1`)
  - Anthropic Claude (`claude-3-5-sonnet`, `claude-3-5-haiku`)
  - DeepSeek (`deepseek-chat`, `deepseek-reasoner`)
  - xAI Grok (`grok-2`)
  - Moonshot KIMI (`moonshot-v1`)

### 4. 📑 1-Click Multi-Format Repurposer Studio
Instantly transform raw speech into:
- 📧 **Executive Email Draft**
- 📋 **Meeting Minutes (MoM) with Task Checkboxes**
- 🧵 **Twitter / X Thread**
- 💼 **LinkedIn Thought Leadership Post**
- 🎓 **Study Flashcards & Review Quiz**
- 📰 **SEO Blog Article Outline**

### 5. 🧠 Voice-to-Mindmap (Concept Visualizer)
- Automatically converts spoken brainstorms and lectures into structured visual **Mermaid.js Concept Trees** with 1-click copy.

### 6. 🔊 Neural Text-to-Speech (TTS) Suite
- Read back transcripts, translated text, or summaries with **Kokoro-82M** or **Microsoft Edge Neural** voices with speed and pitch modulation.

### 7. 📁 Drag-and-Drop Audio File Uploader
- Upload `.mp3`, `.wav`, `.m4a`, `.ogg`, or `.webm` files up to 50MB with built-in player and Whisper transcription.

### 8. 💬 Interactive "Chat with Transcript"
- Side-drawer allowing users to ask specific questions about what was discussed in their recorded speech.

### 9. 🔒 Private Local History & Multi-Export
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
│   │   │   ├── ChatDrawer.tsx
│   │   │   ├── HeroRecordingZone.tsx
│   │   │   ├── HistoryDrawer.tsx
│   │   │   ├── MindmapViewer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── SpeechCoachWidget.tsx
│   │   │   ├── TranscriptionWorkspace.tsx
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
