# QuizQuake: BrainStorm Arena ⚡🧠
### AI-Inspired Adaptive Learning and Assessment Platform

> **ADAPTIVE LEARNING • SMART ASSESSMENT • WEAKNESS DETECTION • REMEDIAL ENGINE**

---

## 1. Project Overview

**QuizQuake: BrainStorm Arena** is an intelligent assessment and learning engine designed to transform traditional static testing. Traditional quizzes only tell students how many questions they got right; QuizQuake tells students:
1. **What they know** and **what they don't know** at a granular subtopic level.
2. **How their ability changes** during the test using dynamic difficulty scaling.
3. **Which precise concepts require improvement** (e.g. *Deadlock Avoidance in Operating Systems*).
4. **Targeted remedial practice** generated immediately for their identified weak areas.

---

## 2. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Visualization**: Chart.js & react-chartjs-2 (Interactive Radar Chart, Subtopic Bar Chart, Trajectory Line Chart)
- **Reporting & FX**: jsPDF (Exportable Diagnostic Certificate/Report), Canvas Confetti, Web Audio API Synthesizer
- **Backend**: Node.js, Express, TypeScript, Zod Data Validation
- **Database**: SQLite (`sql.js` WebAssembly engine with persistent file-backed storage)
- **Architecture**: Clean 3-Tier Architecture (Presentation, Application/Engine, and Data Layer)

---

## 3. Core Architecture

```
PRESENTATION LAYER
React + TypeScript + Tailwind CSS
Dashboard • Arena Selection • Adaptive Quiz Screen • Results • Solutions Review • History
                │
                ▼ REST API / JSON
APPLICATION LAYER (Express.js + TypeScript)
├── Adaptive Engine       (Consecutive-answer scaling: Easy ⇆ Medium ⇆ Hard)
├── Quiz Engine           (Question progression, validation, streak tracking)
├── Timer Engine          (Absolute expiry synchronization, per-question tracking)
├── Diagnostic Engine     (Domain & subtopic accuracy classification, AI insights)
└── Remedial Engine       (Targeted 5-question dynamic practice drills)
                │
                ▼ SQLite Queries
DATA LAYER
SQLite (`quizquake.sqlite`)
Tables: Students • Topics • Questions (60 MCQs) • QuizSessions • Answers • Attempts
```

---

## 4. The 10 Main Application Modules

1. **Student Dashboard**: Performance metrics (Total Quizzes, Average Accuracy, 4-Day Learning Streak, Strongest Topic, Weakest Topic, Recent Assessments table, 1-Click Arena Launch).
2. **Topic Selection Module**: Subject selection for *Data Structures*, *Algorithms*, *Operating Systems*, *Computer Networks*, or *All Core Topics (Mixed Arena)* with customizable quiz length and time limit.
3. **Adaptive Question Engine**:
   - Initial difficulty: **Medium**.
   - **2 consecutive correct answers** $\rightarrow$ Increase difficulty by 1 level (capped at Hard).
   - **1 incorrect answer** $\rightarrow$ Decrease difficulty by 1 level (capped at Easy), streak resets.
   - **1 correct answer** $\rightarrow$ Maintain current level.
   - **2 consecutive incorrect answers** $\rightarrow$ Continue at lower level.
4. **Question Repository**: 60 curated CS MCQs across 4 topics and 16 subtopics (5 Easy, 5 Medium, 5 Hard each) with detailed conceptual explanations.
5. **Timer Engine**: Synchronized countdown timer with absolute expiry calculation, warning alert when $\le$ 2 minutes remain, and automatic submission at zero.
6. **Diagnostic Analysis Engine**: Granular hierarchical calculation of accuracy:
   $$\text{Accuracy} = \frac{\text{Correct}}{\text{Total}} \times 100$$
   - **80–100%**: Strong (Emerald)
   - **60–79%**: Good (Blue)
   - **40–59%**: Needs Improvement (Amber)
   - **Below 40%**: Weak (Rose)
7. **Interactive Radar Chart**: Chart.js radar visualization displaying multidimensional domain mastery with clickable drill-down filtering.
8. **Solution Review Module**: Full post-test audit showing original question, student answer, verified solution, time spent per question, and in-depth conceptual explanation.
9. **Attempt History Logger**: SQLite-backed history tracking longitudinal progress with an accuracy improvement curve across attempts.
10. **Remedial Quiz Generator**: Automatically synthesizes a targeted 5-question drill focused exclusively on the student's identified weak subtopics (e.g., Deadlocks, Memory Management).
11. **Bonus - Exportable PDF Report**: Downloadable diagnostic certificate generated client-side via `jsPDF`.

---

## 5. Live Hackathon Demonstration Guide (Winning Flow)

To demonstrate QuizQuake's intelligence live to judges:

1. **Start Assessment**: Choose *All Topics (Mixed Arena)* or *Operating Systems* at default Medium difficulty.
2. **First 2 Questions**: Answer 2 questions correctly $\rightarrow$ Watch the notification banner celebrate 2 consecutive correct answers and **promote the difficulty to Hard**.
3. **Hard Question (Vulnerability Test)**: Answer a *Deadlocks / Deadlock Avoidance* question incorrectly $\rightarrow$ Watch the engine immediately detect the gap and **downscale to Medium**.
4. **Complete Quiz**: Finish remaining questions.
5. **View Diagnostic Radar**: See the radar chart and subtopic bar chart pinpoint **Deadlocks** as a weak area ($< 40\%$).
6. **Trigger Remedial Practice**: Click **"Practice Weak Topics (5 Qs)"** $\rightarrow$ The engine instantly generates a customized 5-question remedial drill focusing on Deadlock concepts.
7. **Export PDF**: Click the PDF icon to download the formal Diagnostic Assessment Report.

---

## 6. Project Directory Structure

```
QuizQuake/
├── backend/
│   ├── src/
│   │   ├── controllers/    # quizController, questionController, reportController
│   │   ├── services/       # adaptiveEngine, diagnosticEngine, quizService, remedialEngine
│   │   ├── routes/         # quizRoutes, questionRoutes, reportRoutes
│   │   ├── database/       # db.ts (SQLite WebAssembly), schema.sql
│   │   ├── data/           # questions.json (60 MCQs across 4 topics)
│   │   ├── types/          # TypeScript definitions
│   │   └── server.ts       # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Timer, QuestionCard, DifficultyBadge, RadarChart, etc.
│   │   ├── pages/          # Dashboard, TopicSelection, QuizPage, ResultsPage, HistoryPage, ReviewPage
│   │   ├── hooks/          # useQuizTimer, useAudioFx
│   │   ├── services/       # api.ts (REST client)
│   │   ├── types/          # TypeScript definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── package.json            # Root monorepo scripts
└── README.md
```

---

## 7. Installation and Running Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
# Server starts on http://localhost:5050
```

### 3. Start Frontend Client
```bash
cd frontend
npm run dev
# Vite client starts on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.
