# StreakForge — Gamified Productivity Engine

StreakForge is a premium gamified productivity and discipline management platform featuring a gorgeous animated "Lamp Theme" UI with dark glassmorphism styling and ambient glowing effects.

This repository combines two core systems:
- **Node.js Express + MongoDB Backend** (`backend/`) — featuring user auth, JWT tokens, secure password hashing, rate limiting, and email verification.
- **Vite + React Frontend** (`frontend/`) — featuring premium glassmorphism interfaces, smooth drifting ambient backgrounds, interactive tab panels, streak analytics, habit forge tracker, notes, and event board.
- **Legacy Python Backend** (`backend-python/`) — preserved original FastAPI implementation.
- **Legacy Streamlit Prototype** (`app.py`, `streakforge.py`) — original monolithic desktop prototype.

---

## Features
- **User Authentication**: Secure signup, login, password hashing (bcrypt), and stateful JWT token validation.
- **Email Verification**: Production-ready verification flow using `nodemailer`. Falls back to console-logging verification URLs in development mode.
- **The habit Forge**: Pillar-based habit tracking (Iron, Mind, General) with interactive neon indicators and progress metrics.
- **The Event Board**: Manage tactical tasks and deadlines. Includes timeline schedules, timeless logs, and automatic archival during midnight reset.
- **Field Notes**: Rich text masonry-grid thoughts ledger.
- **The Ledger**: Detailed streak analytics tracker (Master Streaks, PB, and Shadow Streaks).
- **Midnight Reset & Forge Reset**: Interactive functions to evaluate streaks, reset daily habits, and archive completed cards.

---

## Setup & Running Locally

### 1. Run the Backend Server
Prerequisite: Node.js (v18+)

```bash
cd backend
npm install
npm run dev
```

The server will start at `http://localhost:8000`.

#### Database Setup
By default, the server attempts to connect to local MongoDB at `mongodb://127.0.0.1:27017/streakforge`. 
- **If a local MongoDB is not running**, the backend automatically spins up an in-memory MongoDB fallback server (`mongodb-memory-server`) to enable seamless testing with zero configuration.
- To configure an external or cloud database (like MongoDB Atlas), set the `MONGO_URI` environment variable in `backend/.env`.

#### Email Verification Setup
To enable production email verification, configure the SMTP settings in `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@streakforge.app
```
*If SMTP credentials are not supplied, the backend enters Dev Mode, logging verification URLs directly to the terminal, and auto-verifying users when needed.*

---

### 2. Run the Frontend Client
```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:5173`. Open this URL in your browser to enter the Forge!

---

## Technical Architecture

### Backend Stack
- **Express.js**: Lightweight framework for handling APIs.
- **Mongoose**: Schemas for MongoDB mapping (`User`, `Habit`, `Event`, `Note`, `UserState`).
- **Helmet**: Secures response HTTP headers.
- **CORS**: Configured with credentials and origin whitelisting.
- **Express Rate Limit**: Protects authentication paths from brute-force attempts.

### Frontend Stack
- **React**: Declarative component framework.
- **Lucide React**: Modern iconography system.
- **Vanilla CSS Grid/Flexbox**: Precision modern layouts.
- **Theme Variables**: Centrally designed custom HSL color variables and layout spacing systems matching the custom Lamp Theme.
