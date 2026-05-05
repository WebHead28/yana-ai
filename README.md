# YANA AI — *You Are Not Alone*

> An emotionally intelligent AI companion that adapts to your personality, remembers who you are, and grows with you through every conversation.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend Reference](#backend-reference)
- [Frontend Reference](#frontend-reference)
- [Personality System](#personality-system)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)

---

## Overview

YANA is a full-stack AI companion application built with **FastAPI** on the backend and **React + Vite** on the frontend. It features a personality assessment system that shapes how YANA communicates with each individual user — responses are dynamically adapted based on psychological traits like anxiety level, emotional openness, attachment need, and more.

Users complete a 33-question psychometric assessment during onboarding. YANA uses those scores to build a personality vector, which is then translated into natural-language behavioral instructions injected into every GPT prompt. The result is a companion that feels different for each person — more reassuring for anxious users, more independent for users who prefer space.

---

## Features

- 🧠 **Adaptive Personality Engine** — 6-dimensional personality vector shapes every response
- 💬 **Streaming Chat** — Real-time typewriter effect via server-sent token streaming
- 🗂️ **Multi-Session Conversations** — Create, rename, delete, and revisit past chats
- 🔐 **JWT Authentication** — Stateless auth with 24-hour token expiry
- 🧬 **Passive Memory Extraction** — YANA picks up your name and age from natural conversation
- 👤 **User Profiles** — Personalized name, nickname, and age stored per account
- 🌗 **Dark / Light Mode** — Theme preference persisted across sessions
- 🛡️ **Safety Guardrails** — Built-in rule preventing medical advice, with graceful redirection

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | FastAPI |
| Language Model | OpenAI GPT-4.1-mini (streaming) |
| Database | SQLite via SQLAlchemy ORM |
| Authentication | JWT (JSON Web Tokens) |
| Frontend Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| HTTP Client | Axios + native Fetch (streaming) |
| Routing | React Router DOM |

---

## Project Structure

```
yana-ai/
├── backend/
│   └── app/
│       ├── main.py                  # FastAPI entrypoint, router registration
│       ├── .env                     # API keys (not committed)
│       ├── core/
│       │   ├── config.py            # Environment variable loader
│       │   ├── database.py          # SQLAlchemy engine, session, Base
│       │   ├── auth_service.py      # JWT creation and validation
│       │   ├── dependencies.py      # get_current_user auth guard
│       │   ├── llm.py               # OpenAI streaming client
│       │   └── memory_extractor.py  # Passive fact extraction from messages
│       ├── models/
│       │   ├── user_table.py        # User ORM model
│       │   ├── users.py             # User service (create, auth, complete)
│       │   ├── user_state.py        # In-memory conversation history store
│       │   ├── profile_memory.py    # In-memory profile store (prototyping)
│       │   ├── personality_table.py # UserPersonality ORM model
│       │   ├── chat_session.py      # ChatSession ORM model
│       │   └── chat_message.py      # ChatMessage ORM model
│       ├── personality/
│       │   ├── personality_test.py  # 33 survey questions (static data)
│       │   ├── deduction.py         # Converts answers → personality vector
│       │   ├── adaptive.py          # Personality vector → LLM instructions
│       │   ├── presets.py           # Named persona configurations
│       │   ├── engine.py            # PersonalityEngine class
│       │   └── formatter.py        # Response post-processing
│       ├── schemas/
│       │   ├── auth.py              # Register/Login Pydantic models
│       │   └── chat.py              # ChatRequest Pydantic model
│       └── routes/
│           ├── auth.py              # /auth/* endpoints
│           ├── personality.py       # /personality/* endpoints
│           └── chat.py              # /chat/* endpoints
│
└── frontend/
    └── yana-frontend/
        ├── index.html               # SPA shell
        ├── package.json
        ├── vite.config.js           # Dev proxy → localhost:8000
        ├── tailwind.config.js       # DM Sans/Mono fonts, dark mode class
        ├── postcss.config.js
        └── src/
            ├── main.jsx             # React root mount
            ├── index.css            # Global styles + Tailwind layers
            ├── App.jsx              # Router, context providers, route guards
            ├── context/
            │   ├── AuthContext.jsx  # Auth state (token, login, logout)
            │   └── ThemeContext.jsx # Light/dark theme state
            ├── services/
            │   ├── api.js           # Axios instance + interceptors
            │   ├── authService.js   # Auth API calls
            │   ├── chatService.js   # Chat + session API calls (+ streaming)
            │   └── personalityService.js  # Personality API calls
            ├── components/
            │   ├── ChatMessage.jsx  # Single chat bubble (user/assistant)
            │   ├── MessageInput.jsx # Input bar with streaming guard
            │   ├── Sidebar.jsx      # Session list with rename/delete
            │   └── ThemeToggle.jsx  # Sun/moon theme switcher
            └── pages/
                ├── Login.jsx        # Sign-in + post-login routing
                ├── Register.jsx     # Account creation
                ├── PersonalityTest.jsx  # 33-question slider assessment
                ├── ProfileSetup.jsx # Optional name/nickname/age setup
                └── Chat.jsx         # Main chat interface
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/)

### Backend Setup

```bash
cd backend/app

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic[email] python-jose openai python-dotenv

# Configure environment
echo "OPENAI_API_KEY=your_key_here" > .env

# Start the server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend/yana-frontend

# Install dependencies
npm install

# Start the dev server (proxies API calls to localhost:8000)
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Backend Reference

### Authentication (`app/core/auth_service.py`)

YANA uses **JWT tokens** with a 24-hour expiry. Tokens are signed with a secret key, stateless, and validated on every protected request via the `get_current_user` FastAPI dependency.

### Database (`app/core/database.py`)

SQLite with SQLAlchemy ORM. Tables are auto-created on startup via `Base.metadata.create_all()`. Four persistent tables: `users`, `user_personality`, `chat_sessions`, `chat_messages`.

### LLM Streaming (`app/core/llm.py`)

Uses OpenAI's GPT-4.1-mini with streaming enabled. Tokens are yielded one at a time as they arrive, creating a live typewriter effect on the frontend. Falls back gracefully if OpenAI is unavailable.

### Memory Extraction (`app/core/memory_extractor.py`)

Scans every incoming user message for patterns like `"my name is"`, `"call me"`, and `"I am X years old"`. Matching fields are silently updated on the User database record — no form required.

---

## Frontend Reference

### Auth Flow

1. User registers → redirected to `/login`
2. User logs in → token stored in `localStorage` + React state
3. If `personality_completed` is `false` → redirect to `/personality`
4. Otherwise → redirect to `/chat`

### Streaming Chat

`chatService.sendMessage` uses the native **Fetch API** (not Axios) to access the raw readable stream. Each arriving token is appended to an in-progress assistant message placeholder, updating the UI word by word.

### Route Guards

- `ProtectedRoute` — redirects unauthenticated users to `/login`
- `PublicRoute` — redirects already-authenticated users to `/chat`

---

## Personality System

The personality system is the core differentiator of YANA. It runs in three stages:

### 1. Assessment (`personality_test.py`)
33 questions across four sections: **Personality Traits**, **Emotional Patterns**, **Stress and Coping**, and **Mental Wellness Indicators**. Each answered on a 1–7 scale via slider.

### 2. Scoring (`deduction.py`)
Answers are averaged into 6 personality dimensions:

| Dimension | Description |
|---|---|
| Emotional Openness | Willingness to share feelings |
| Anxiety Level | Tendency toward worry and overthinking |
| Attachment Need | Desire for closeness and reassurance |
| Emotional Stability | Consistency of mood and reactions |
| Avoidance | Tendency to withdraw under stress |
| Social Energy | Comfort and energy around others |

### 3. Adaptation (`adaptive.py`)
Dimensions above certain thresholds generate natural-language directives appended to every GPT system prompt. Examples:

- **High anxiety** → *"Use strong reassurance. Write in comforting, flowing paragraphs."*
- **Low attachment need** → *"Maintain emotional independence. Give space."*

All responses are constrained to 1–2 paragraphs of 80–120 words with a thoughtful follow-up question.

### Persona Presets (`presets.py`)

| Preset | Description |
|---|---|
| `yana_core` | Default emotionally intelligent companion (production) |
| `ruka_girlfriend` | Expressive, affectionate, anime-inspired persona |

---

## API Endpoints

### Auth — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create a new account |
| POST | `/auth/login` | No | Authenticate and receive JWT |
| GET | `/auth/profile` | Yes | Get current user profile |
| PUT | `/auth/profile` | Yes | Update name, nickname, age, email |

### Personality — `/personality`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/personality/questions` | No | Get all 33 survey questions |
| POST | `/personality/submit` | Yes | Submit answers, compute and save vector |

### Chat — `/chat`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/chat/` | Yes | Send message, get streaming response |
| GET | `/chat/sessions` | Yes | List all conversation sessions |
| GET | `/chat/messages/{session_id}` | Yes | Get full message history for a session |
| PUT | `/chat/rename` | Yes | Rename a session |
| DELETE | `/chat/delete/{session_id}` | Yes | Delete a session and all its messages |

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `OPENAI_API_KEY` | `backend/app/.env` | Required for LLM integration |
| `VITE_API_URL` | Frontend `.env` (optional) | Backend base URL; defaults to Vite proxy |

> **Note:** Never commit `.env` files. Add them to `.gitignore`.

---

## License

This project is currently undocumented regarding license. Please contact the maintainer for usage terms.
