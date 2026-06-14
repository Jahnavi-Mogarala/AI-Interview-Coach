# 🏆 JAJO AI - Your Personal AI Placement Mentor (Latest Release)

An advanced, production-ready **AI Interview Coach & Placement Preparation Platform** designed for students preparing for placements, internships, coding interviews, and technical hiring processes. It merges the capabilities of coding sandboxes (like LeetCode/InterviewBit), AI mock interviews, ATS resume checkers, and job trackers into a single premium interface.


WEBSITE DEPLOYED LINK : https://ai-interview-coach-git-main-jahnavi-mogaralas-projects.vercel.app/dashboard

https://ai-interview-coach-git-main-jahnavi-mogaralas-projects.vercel.app/


---


## 💎 Branding & Aesthetics

- **Brand Name**: **JAJO AI**
- **Tagline**: *"Your Personal AI Placement Mentor"*
- **Design System**: Matte-dark theme (`#030303` / `#09090b`) contrasted with Premium Blue-Green (Teal/Emerald/Cyan) highlights (`#0d9488` / `#10b981` / `#06b6d4`) and silver/platinum metallic gradients.
- **Components**: Glassmorphism, smooth micro-animations, neon status glows, and real-time responsive analytics.

---

## 🌟 Core Features

- **Interactive IDE Coding Workspace**: 
  - Complete with local Python & JavaScript compilers.
  - Features SDE-focused coding problems including popular choices from **Striver's SDE Sheet** (*Set Matrix Zeroes*, *Kadane's Algorithm*, *Reverse Linked List*) with automated test suites and AI debugging.
- **DSA & Core CS Learning Hub**: 
  - Educational modules covering Data Structures, DBMS, Operating Systems, and Computer Networks.
  - Interactive Step-by-Step Visualizers, including a **CPU Queue Scheduler** (Round Robin simulation) and a **Network Encapsulation Stack** layers model.
  - Flip-card vocabulary memorizers and timed diagnostic timed quizzes.
- **AI Mock Interview Arena**: 
  - Simulate real-time technical & HR rounds with text or voice interactive feedback.
  - Speech synthesis (TTS) & recognition (STT) parsing user pacing, confidence, grammar, and technical mistakes.
- **ATS Resume Analyzer**: 
  - Scan PDF resumes against industry standards, outputting immediate keyword analysis, formatting reviews, and optimization scores.
- **Placement Tracker & Job Kanban**: 
  - Fully interactive drag-and-drop Kanban tracker keeping logs of job application stages (Wishlist, Applied, OA, Interview, Offer, Rejected).
- **Secure Email Auth & OTP Recovery**: 
  - Strict input email validation and 6-character password length checks.
  - Fully functional secure password recovery cycle verifying email ownership using server-tracked 6-digit OTP codes and `/auth/reset-password`.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand (Session Storage), React Query (Data Caching), Recharts (Progress Analytics), Monaco Code Editor.
- **Backend**: Node.js, Express.js, Socket.IO (Bidirectional Real-Time WebSockets).
- **ORM & Database**: Prisma ORM with PostgreSQL.
- **AI Integrations**: OpenAI API (GPT-4o-mini / Whisper evaluations) with custom smart local fallback handlers.
- **Speech Engine**: Web Speech API (`webkitSpeechRecognition` & `speechSynthesis`) for zero-cost voice mock technical rounds.
- **Parsers**: `pdf-parse` for resume ATS keyword searches.

---

## 📂 Directory Structure

```
AI-Interview-Coach/
├── package.json               # Root scripts runner
├── docker-compose.yml          # Container orchestration (DB + API + App)
├── backend/
│   ├── src/
│   │   ├── config/            # Database configurations (Prisma Client)
│   │   ├── controllers/       # Route request handlers
│   │   ├── middleware/        # JWT Authentication protectors
│   │   ├── routes/            # API endpoints binder
│   │   ├── services/          # AI logic, compilers, WebSockets
│   │   ├── utils/             # InMemory db fallbacks
│   │   └── server.ts          # Express entrypoint
│   ├── prisma/                # DB relational schemas
│   ├── Dockerfile
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/               # Next.js 15 routing routes
    │   ├── components/        # React panels (Navbar, Providers)
    │   ├── store/             # Zustand state stores (Auth, Sockets)
    │   └── styles/
    ├── Dockerfile
    └── package.json
```

---

## ⚡ Setup & Launch Instructions

### Option 1: Run Locally (Recommended for Development)

#### 1. Clone & Configure Environment
Duplicate the environment template in the backend directory:
```bash
cp backend/.env.example backend/.env
```
*(Optionally paste your `OPENAI_API_KEY` into `backend/.env` to unlock live OpenAI grading, or leave it blank to automatically trigger Sandbox Mode with contextually rich mock evaluations.)*

#### 2. Install Dependencies
Run from the root directory to install all packages:
```bash
npm run install:all
```

#### 3. Run Dev Servers Concurrently
Boot the backend server (port 5000) and the Next.js app (port 3000) with a single command:
```bash
npm run dev
```

Visit the application at: **`http://localhost:3000`**

---

### Option 2: Build with Docker Compose (Production Ready)

Launch the database, backend, and Next.js frontend together in isolated environments:
```bash
docker-compose up --build
```
- Frontend app: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Database: `localhost:5432`

---

## 🔐 Sandbox Mode (Instant Local Testing)
To make local evaluation easy without database configuration, the server is equipped with a **Smart Mock DB & LLM Fallback**.
- Click **"Launch Instant Sandbox Mode"** on the home screen to log in immediately.
- The coding sandbox will execute Python and JavaScript code locally in a secure subprocess.
- Resume and interview panels will utilize mock generators to evaluate responses dynamically.

---

## 📡 API Reference Chart

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register new student credentials (with email check) | No |
| **POST** | `/api/auth/login` | Login and issue session cookies (with email check) | No |
| **POST** | `/api/auth/forgot-password` | Request recovery OTP code for password reset | No |
| **POST** | `/api/auth/verify-otp` | Validate the 6-digit verification code | No |
| **POST** | `/api/auth/reset-password` | Set new password verifying ownership | No |
| **GET** | `/api/auth/me` | Fetch active profile and dashboard stats | Yes (JWT) |
| **POST** | `/api/onboarding` | Submit survey and generate AI roadmap | Yes (JWT) |
| **GET** | `/api/code/problems` | List LeetCode style problems | Yes (JWT) |
| **POST** | `/api/code/run` | Compile code inputs in Python/JS | Yes (JWT) |
| **POST** | `/api/code/problems/:id/submit` | Evaluate tests & run AI debugger | Yes (JWT) |
| **POST** | `/api/interview/start` | Initialize Mock Interview (HR/DSA) | Yes (JWT) |
| **POST** | `/api/interview/:id/message` | Process chat turn & voice parameters | Yes (JWT) |
| **POST** | `/api/resume/analyze` | Parse resume PDF and output ATS scores | Yes (JWT) |
| **GET** | `/api/tracker` | Retrieve applications for Kanban board | Yes (JWT) |
| **POST** | `/api/tracker` | Add opportunity entry to Kanban board | Yes (JWT) |
| **GET** | `/api/aptitude/tests` | List Quant/Verbal timed diagnostics | Yes (JWT) |
