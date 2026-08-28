# 🎙️ Voice-To-Text App

An intelligent, privacy-first, ultra-fast **Voice-to-Text & Speech Transcription Application** designed for cross-platform deployment across **Web** and **Mobile** (iOS & Android). Powered by the state-of-the-art **OpenAI Whisper** and high-performance **whisper.cpp** (C/C++ port) ecosystem.

---

## 🌟 Overview

The **Voice-To-Text App** enables seamless, real-time speech transcription, audio file dictation, multilingual translation, and audio intelligence. Built with privacy, speed, and accuracy in mind, it supports both **client-side on-device inference** (via WebAssembly/WebGPU and Native C++ bindings) and **high-throughput backend server processing**.

```
                           ┌────────────────────────┐
                           │   Voice-to-Text Core   │
                           │ (Whisper / whisper.cpp)│
                           └───────────┬────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
      ┌─────────▼───────────┐                       ┌─────────▼───────────┐
      │   🌐 Web Client     │                       │  📱 Mobile Client   │
      │ Next.js / WebAudio  │                       │ React Native / Expo │
      │  (WASM + WebGPU)    │                       │ (whisper.cpp CoreML)│
      └─────────────────────┘                       └─────────────────────┘
```

---

## ✨ Key Features

- **⚡ Real-Time Streaming Speech-to-Text**: Low-latency voice capture and live transcription using `AudioWorklet` and micro-chunk processing.
- **🔒 Privacy-First / 100% Offline Capability**: Runs quantized Whisper models directly on user devices without sending sensitive voice data to third-party servers.
- **🌍 Multilingual & Automatic Language Detection**: Automatic language recognition across 99+ languages with built-in English translation.
- **⏱️ Precise Timestamps & Word-Level Alignment**: High-fidelity subtitle (`.srt`, `.vtt`) and structured transcript generation with exact timestamps.
- **📁 File Transcription & Batch Processing**: Support for MP3, WAV, M4A, FLAC, OGG, and WebM file uploads with asynchronous processing.
- **🎛️ Noise Suppression & VAD (Voice Activity Detection)**: Built-in voice activity detection to ignore silence and background noise, saving battery and compute power.
- **🌓 Modern, Accessible UI**: Premium responsive interface with dark/light themes, waveform visualizers, interactive transcript search, and one-click export (TXT, JSON, SRT, Markdown).

---

## 🧠 Supported Whisper Models & Hardware Footprint

| Model | Parameters | Memory Required (FP16 / Q4_0) | Relative Speed | Recommended Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **tiny / tiny.en** | ~39 M | ~75 MB / ~31 MB | ~32x | Ultra-fast mobile/web streaming, low-end devices |
| **base / base.en** | ~74 M | ~142 MB / ~57 MB | ~16x | Balanced real-time dictation & notes |
| **small / small.en**| ~244 M | ~466 MB / ~182 MB | ~6x | High-accuracy mobile/web transcribing |
| **medium / medium.en** | ~769 M | ~1.5 GB / ~515 MB | ~2x | High accuracy desktop & server workloads |
| **large-v3 / turbo**| ~1550 M | ~3.1 GB / ~1.1 GB | ~1x / ~8x | Professional studio quality & complex accents |

---

## 🏗️ Architecture & Planned Modules

```
Voice_To_Text_App/
├── web/                  # Web Application (Next.js / TypeScript / WebAudio / WASM)
├── mobile/               # Mobile Application (React Native / Expo / whisper.cpp bindings)
├── server/               # Optional Backend Transcription API (FastAPI / whisper.cpp Server)
├── docs/                 # Documentation, API Specs & Architecture Guides
└── README.md             # Project README & Setup
```

---

## 🚀 Target Platforms & Capabilities

### 1. Web Application (`/web`)
- **Browser-native capture**: Web Audio API with `AudioWorkletProcessor` capturing 16kHz mono PCM.
- **Dual Mode**:
  - *Local Mode*: In-browser inference via `whisper.wasm` or ONNX WebGPU (zero server cost, offline).
  - *Cloud Mode*: WebSocket streaming to backend Whisper server for maximum model accuracy (`large-v3-turbo`).
- **Interactive Editor**: Synchronized audio playback with word highlighting, correction, and copy/export.

### 2. Mobile Application (`/mobile`)
- **Native iOS & Android**: Powered by React Native / Expo with `react-native-whisper` (C++ `whisper.cpp` engine).
- **Hardware Acceleration**: Apple Metal / CoreML on iOS, and Android NNAPI / Vulkan GPU on Android.
- **Background Recording**: Persistent audio recording with floating widget and audio service support.

---

## 🛠️ Quick Start & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x+)
- [Git](https://git-scm.com/)
- [Python 3.10+](https://www.python.org/) (if running backend API / server)

### Getting Started
```bash
# Clone the repository
git clone https://github.com/your-username/Voice_To_Text_App.git
cd Voice_To_Text_App

# Explore modules (once initialized)
# Web:
cd web && npm install && npm run dev

# Mobile:
cd mobile && npm install && npx expo start
```

---

## 📄 License & Attribution

- **Whisper**: OpenAI (MIT License)
- **whisper.cpp**: Georgi Gerganov & GGML Community (MIT License)
- **Application Code**: Licensed under the [MIT License](LICENSE).
