# Y.A.N.A. Frontend

**You Are Not Alone** — An emotionally intelligent AI companion interface.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL (default: http://localhost:8000)

# 3. Start development server
npm run dev
```

## Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── YanaLogo.jsx          # SVG logo with dynamic theme color
│   ├── ParticleBackground.jsx # Animated particle canvas
│   ├── LoadingScreen.jsx      # Reusable loading overlay
│   ├── ThemeSwitcher.jsx      # Theme selection modal
│   └── UpdateProfileModal.jsx # Profile edit modal
├── pages/
│   ├── SplashScreen.jsx       # 4-second intro
│   ├── Login.jsx              # Auth - login
│   ├── Register.jsx           # Auth - register
│   ├── PersonalityTest.jsx    # 34-question personality survey
│   ├── Introduction.jsx       # YANA intro + name/age form
│   ├── CompanionGeneration.jsx # Animated generation screen
│   └── Chat.jsx               # Main chat interface
├── services/
│   ├── api.js                 # Axios instance with interceptors
│   ├── authService.js         # Auth API calls
│   ├── chatService.js         # Chat + streaming
│   └── personalityService.js  # Personality API calls
├── context/
│   ├── AuthContext.jsx        # Authentication state
│   └── ThemeContext.jsx       # Theme state
└── theme/
    └── themes.js              # Theme definitions
```

## API Endpoints Used

| Method | Endpoint | Usage |
|--------|----------|-------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login → returns token |
| GET | `/auth/profile` | Get current user |
| PUT | `/auth/profile` | Update name/age/etc |
| GET | `/personality/questions` | (optional, we use hardcoded) |
| POST | `/personality/submit` | Submit answers |
| POST | `/chat/` | Stream chat response |
| GET | `/chat/sessions` | List all sessions |
| GET | `/chat/messages/{id}` | Load session messages |
| PUT | `/chat/rename` | Rename session |
| DELETE | `/chat/delete/{id}` | Delete session |

## Themes

- **Light Warm** (default) — Soft sandy warmth
- **Dark Calm** — Deep moody brown-black
- **Blue Serenity** — Clear sky blue
- **Peach Comfort** — Warm coral tones
