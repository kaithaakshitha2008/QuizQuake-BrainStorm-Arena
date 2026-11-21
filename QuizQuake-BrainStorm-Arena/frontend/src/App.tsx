import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { DemoWalkthroughModal } from './components/DemoWalkthroughModal.js';
import { Dashboard } from './pages/Dashboard.js';
import { TopicSelection } from './pages/TopicSelection.js';
import { QuizPage } from './pages/QuizPage.js';
import { ResultsPage } from './pages/ResultsPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { ReviewPage } from './pages/ReviewPage.js';
import { useAudioFx } from './hooks/useAudioFx.js';
import { Zap } from 'lucide-react';

export function App() {
  const { soundEnabled, toggleSound } = useAudioFx();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0B1020] text-slate-100">
        <Navbar
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onOpenDemo={() => setIsDemoOpen(true)}
        />

        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/topics" element={<TopicSelection />} />
            <Route path="/quiz/:sessionId" element={<QuizPage />} />
            <Route path="/results/:sessionId" element={<ResultsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/review/:sessionId" element={<ReviewPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <DemoWalkthroughModal
          isOpen={isDemoOpen}
          onClose={() => setIsDemoOpen(false)}
        />

        {/* Global Footer */}
        <footer className="border-t border-[#1F2E52]/60 py-6 bg-[#0B1020]/90 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-light fill-primary-light" />
              <span className="font-semibold text-slate-300">QuizQuake: BrainStorm Arena</span>
              <span>— AI-Inspired Adaptive Learning & Diagnostic Assessment</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Stack: React • TypeScript • Node.js • Express • SQLite • Chart.js</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
