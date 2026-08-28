# 🎙️ VoiceFlow AI — Universal Voice Intelligence Studio (Web & Mobile)

An intelligent, privacy-first, ultra-fast **Voice-to-Text & Speech Transcription Suite** built for cross-platform deployment across **Web** (Next.js 16 + React 19) and **Mobile** (React Native + whisper.cpp CoreML / NPU). Powered by **OpenAI Whisper**, **whisper.cpp** (C/C++ native engine), **Multilingual Neural TTS Engine**, and focused exclusively on the latest frontier models: **Google Gemini 2.5 / 2.0 Flash**, **OpenAI GPT-4o Flagship**, and **Anthropic Claude 3.7 Sonnet (Hybrid Reasoning)**.

---

## 🌟 Live Demo & Repository

- **Web App**: `http://localhost:3000` (Local Dev)
- **Repository**: [https://github.com/Humaam-04-06/Voice_To_Text_App](https://github.com/Humaam-04-06/Voice_To_Text_App)
- **License**: MIT

---

## 🔑 Latest AI Models & Step-by-Step API Key Setup

VoiceFlow AI is equipped with the latest, highest-performing foundation models:

| Provider | Frontier Model | How to Get Your API Key |
| :--- | :--- | :--- |
| 🌟 **Google Gemini** | `gemini-2.5-flash` / `gemini-2.0-flash` (100% Free Tier) | 1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)<br>2. Sign in with Google and click **Create API key**<br>3. Paste into VoiceFlow Settings. |
| ⚡ **OpenAI** | `gpt-4o` (Omni Flagship Multimodal) | 1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)<br>2. Create a new Secret Key<br>3. Paste into VoiceFlow Settings. |
| 🧠 **Anthropic Claude** | `claude-3-7-sonnet-20250219` (Hybrid Reasoning) | 1. Go to [Anthropic Console](https://console.anthropic.com/settings/keys)<br>2. Generate an API Key<br>3. Paste into VoiceFlow Settings. |

> [!IMPORTANT]
> **Universal SweetAlert Key Guard Everywhere**:
> Whenever a user clicks any AI-powered feature or tab without an active API key, VoiceFlow immediately presents a guided SweetAlert modal with direct links and instructions on how to get their key in 10 seconds.
> 
> **Guarded Features**:
> 1. 🪄 **Polished Tab & Fix Grammar Button**
> 2. 📑 **Summary Tab & Summarize Button**
> 3. 🌐 **Translate Button & Multilingual Selector**
> 4. 🧠 **Mindmap Tab & Generate Mindmap Button**
> 5. 📢 **Repurpose Tab & Format Buttons** (Email, Twitter, LinkedIn, MoM, Flashcards, Blog)
> 6. 💬 **Ask AI Transcript Chat**
> 7. 🗣️ **2-Way Babel Universal Translator**

---

## 🌍 Authentic Multilingual Translation & Voice Synthesis

- **True Native Script Translation**: Translates accurately into native scripts (Urdu `اردو`, Arabic `العربية`, Hindi `हिन्दी`, Spanish `Español`, French `Français`, German `Deutsch`, Chinese `中文`, Japanese `日本語`, etc.).
- **Authentic Neural Speech Engine**: Speaks aloud in native human pronunciation and accents using high-fidelity multilingual neural voice streams, ensuring Urdu is spoken in pure Urdu, Arabic in fluent Arabic, and Spanish in natural Spanish.

---

## 🛠️ Multi-Platform Tech Stack

| Layer | Web Application (`/web`) | Mobile Application (`/mobile`) |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router) + React 19** | **React Native (0.76) + Expo SDK 52** |
| **Language** | **TypeScript 5 (Strict)** | **TypeScript 5 (Strict)** |
| **STT Engine** | **Web Speech API + Groq Whisper Large-v3** | **`whisper.cpp` (C++) via `whisper.rn` (100% Offline)** |
| **Hardware Accel** | **Web Audio API DSP Filter Nodes** | **Apple CoreML / Neural Engine & Android NPU** |
| **Audio Processing** | **48kHz Web Audio DSP (85Hz HighPass, LowPass, Compressor, Notch)** | **`expo-av` + Native Hardware Microphones** |
| **TTS Engine** | **Multilingual Neural Stream + Kokoro-82M + Edge Neural + Web Speech** | **Native Speech Synthesis / Kokoro** |
| **Iconography** | **Font Awesome SVG Icons (`@fortawesome/react-fontawesome`)** | **Vector Icons** |
| **State Management** | **Zustand 5 (with IndexedDB / LocalStorage)** | **Zustand 5 (AsyncStorage)** |
| **Document Export** | **jsPDF (Formal MoM & Transcript) + Canvas-Confetti** | **Native Share Sheet & PDF Exporter** |

---

## ✨ Implemented Core Features

### 1. 🎙️ Real-Time Live Speech Dictation (100% Free)
- **Zero-Latency Streaming**: Speak and watch words transcribe live in real-time.
- **Multilingual Support**: Real-time recognition across 20+ languages.
- **Live Reactive Waveform**: 48-band frequency spectrum visualizer with glowing neon caps.

### 2. 🛡️ Universal SweetAlert API Key Guard & Quick Setup
- Automatically guards all AI features and tabs (**Polished**, **Summary**, **Translate**, **Mindmap**, **Repurpose**, **Ask AI**, **Babel Mode**), popping up an alert with 1-click key guides if no key is entered.

### 3. 🌐 2-Way "Babel Mode" (Live Duplex Universal Translator)
- Two people speaking different languages into one device. Transcribes, translates into native script, and speaks aloud using authentic Neural Voice Synthesis.

### 4. 🔇 Multi-Stage DSP Noise Cancellation & Audio Clarity
- Cuts low-frequency rumble (85Hz High-Pass), high-frequency fan hiss (8500Hz Low-Pass), 60Hz AC electrical hum, and dynamically compresses vocals.

### 5. 🎚️ Studio Vocal Mastering & Radio Host EQ Presets
- 1-Click EQ mastering for replay audio: `Clean DSP`, `Podcast Warmth`, `Broadcast Radio`, and `Crisp Clarity`.

### 6. 📑 Official Corporate Meeting Minutes (MoM) & Executive PDF
- Generates official structured meeting minutes with discussion breakdown, decisions, action item tables, and executive signature blocks.

### 7. 🔍 "Ask My Voice Vault" (Semantic Audio Search)
- Search across months of saved voice notes by concept or keyword with instant recall.

### 8. 🪄 Smart Voice Macro Triggers & Action Board (Auto-Kanban)
- Say `"Task: ..."`, `"Idea: ..."`, or `"Important: ..."` while speaking to automatically pin interactive cards to a live task board.

### 9. 👥 Multi-Speaker Diarization (Dialogue Splitter)
- Color-coded dialogue bubbles (Speaker 1 in violet, Speaker 2 in cyan) with customizable speaker names.

### 10. 🎬 Floating Dual-Language Theater Subtitles
- Floating cinematic subtitle overlay with live original speech on top and translated subtitles below.

### 11. 📹 Video / Audio URL Importer
- Import online lectures, streaming audio feeds, and video URLs for direct speech extraction and summarization.

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
│   │   │   ├── ApiKeyRequiredModal.tsx    # Universal SweetAlert API key guard
│   │   │   ├── AudioFileUploadModal.tsx   # File & Video URL importer
│   │   │   ├── AudioPlaybackPlayer.tsx    # Real voice replay & EQ presets
│   │   │   ├── BabelTranslatorModal.tsx   # 2-Way live duplex translator
│   │   │   ├── ChatDrawer.tsx             # Ask AI transcript chat
│   │   │   ├── HeroRecordingZone.tsx
│   │   │   ├── HistoryDrawer.tsx          # Semantic Voice Vault search
│   │   │   ├── MindmapViewer.tsx          # Concept mindmap generator
│   │   │   ├── Navbar.tsx                 # Gemini 2.5/2.0, GPT-4o, Claude 3.7 switcher
│   │   │   ├── SettingsModal.tsx          # Key settings with step-by-step guides
│   │   │   ├── SpeechCoachWidget.tsx
│   │   │   ├── TheaterSubtitleModal.tsx   # Floating dual subtitles
│   │   │   ├── ToneSentimentRadar.tsx     # Live emotional mood & tone HUD
│   │   │   ├── TranscriptionWorkspace.tsx # Workspace, tabs, & MoM PDF exporter
│   │   │   ├── VoiceMacroActionBoard.tsx  # Spoken triggers & Kanban tasks
│   │   │   └── WaveformVisualizer.tsx
│   │   ├── hooks/
│   │   │   ├── useAudioRecorder.ts        # Multi-stage DSP noise filter
│   │   │   └── useSpeechRecognition.ts
│   │   ├── lib/
│   │   │   ├── ai/                        # Gemini 2.5, GPT-4o, Claude 3.7 dispatchers
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
