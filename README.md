# 📄 CV Maker — ATS Studio

[![CI](https://github.com/Onlorath/cv-maker/actions/workflows/ci.yml/badge.svg)](https://github.com/Onlorath/cv-maker/actions/workflows/ci.yml)
[![Go Version](https://img.shields.io/badge/Go-1.26+-00ADD8?style=flat&logo=go)](https://golang.org)
[![React Version](https://img.shields.io/badge/React-19.2+-61DAFB?style=flat&logo=react)](https://react.dev)
[![Wails v2](https://img.shields.io/badge/Wails-v2.15+-DF0000?style=flat&logo=wails)](https://wails.io)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**CV Maker** is a high-performance, modern desktop application designed to craft ATS-compliant (Applicant Tracking System) resumes and match candidate profiles with real job descriptions using **Google Gemini AI**.

Built with **Go (Hexagonal / Clean Architecture)**, **Wails v2**, **React 19**, and **SQLite**.

---

## ✨ Features

- 🎯 **Deterministic ATS Compliance Engine**: Analyzes formatting, contact info, date chronology, and section layout to ensure maximum parsing readability by ATS filters.
- 🤖 **Gemini AI Job Description Matcher**: Paste any target job posting to automatically calculate a weighted matching score, extract missing keywords, and get personalized improvement suggestions.
- ⚡ **Real-Time A4 Document Preview**: Pixel-perfect responsive document preview with dynamic scaling and typography.
- 🌐 **Full Multi-Language Support (i18n)**: Instant zero-latency switching between English and Turkish across the entire UI and resume schema.
- 🔒 **Secure Local-First Architecture**: All personal data is stored locally in an embedded SQLite database. API keys are safely persisted using OS-level encrypted keyrings (macOS Keychain / Windows Credential Manager).
- 🎨 **Modern Native Design**: Smooth drag-and-drop section reordering (`@dnd-kit`), dark/light theme switcher, and macOS native window styling.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Desktop Runtime** | [Wails v2](https://wails.io/) | Native Go + Webview bridge and IPC |
| **Backend Core** | [Go (Golang)](https://go.dev/) | Hexagonal Domain Architecture, ATS Engine & SQLite repository |
| **Database** | [SQLite](https://modernc.org/sqlite) + [sqlx](https://github.com/jmoiron/sqlx) | Pure Go embedded local persistence with Goose migrations |
| **AI / LLM** | [Google Gemini AI SDK](https://github.com/google/generative-ai-go) | Intelligent job matching and bullet-point translation |
| **Frontend UI** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | High-performance reactive UI |
| **Styling** | [TailwindCSS](https://tailwindcss.com/) + CSS Variables | Glassmorphic design and light/dark theme system |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) | Centralized, reactive client store |

---

## 🚀 Getting Started

### Prerequisites

- **Go**: 1.23+
- **Node.js**: 20+ & npm
- **Wails CLI**: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Onlorath/cv-maker.git
   cd cv-maker
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend && npm install && cd ..
   ```

3. **Run in development mode**:
   ```bash
   wails dev
   ```

---

## 🧪 Code Quality & Testing

Run all validation checks locally with the included Makefile:

```bash
# Run Go unit tests, Go vet, TypeScript typecheck, and Oxlint
make check
```

---

## 📦 Building for Production

To build a standalone desktop package:

```bash
# On macOS
wails build -clean
```
The compiled output will be generated in `build/bin/`.

---

## 📄 License

This project is licensed under the MIT License.
