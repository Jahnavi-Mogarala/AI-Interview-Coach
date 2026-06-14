'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/authStore';
import { 
  Award, Clock, CheckCircle2, AlertCircle, Sparkles, 
  HelpCircle, ChevronRight, BookOpen, RefreshCw 
} from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface AptitudeTest {
  id: string;
  title: string;
  category: 'QUANT' | 'VERBAL' | 'LOGICAL';
  duration: number; // in minutes
  questions: string; // JSON representation
}

export default function AptitudePlatform() {
  const { token, stats, setStats } = useAuthStore();
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<AptitudeTest | null>(null);

  // Active quiz states
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [quizRunning, setQuizRunning] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${backendUrl}/api/aptitude/tests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTests(data);
        }
      } catch {
        // Fallback mock diagnostic tests
        const offlineTests: AptitudeTest[] = [
          {
            id: 'apt-quant-1',
            title: 'Quantitative Aptitude Diagnostic Mock',
            category: 'QUANT',
            duration: 5,
            questions: JSON.stringify([
              {
                question: 'A train 120m long passes a telegraph post in 6 seconds. Find the speed of the train in km/hr.',
                options: ['60 km/hr', '72 km/hr', '80 km/hr', '90 km/hr'],
                answer: '72 km/hr',
                explanation: 'Speed = Distance / Time = 120m / 6s = 20 m/s. Convert to km/hr: 20 * 18/5 = 72 km/hr.'
              },
              {
                question: 'The ratio of two numbers is 3:4 and their LCM is 180. The second number is:',
                options: ['30', '45', '60', '80'],
                answer: '60',
                explanation: 'Let numbers be 3x and 4x. LCM = 12x = 180 => x = 15. The second number is 4 * 15 = 60.'
              }
            ])
          },
          {
            id: 'apt-logical-1',
            title: 'Logical Reasoning Basics',
            category: 'LOGICAL',
            duration: 5,
            questions: JSON.stringify([
              {
                question: 'Find the next number in the sequence: 3, 5, 9, 17, 33, ...',
                options: ['50', '65', '49', '60'],
                answer: '65',
                explanation: 'The pattern is *2 - 1. (3*2-1=5, 5*2-1=9, etc.) So, 33*2-1 = 65.'
              }
            ])
          }
        ];
        setTests(offlineTests);
      }
    };

    fetchTests();
  }, [token]);

  // Countdown timer logic
  useEffect(() => {
    if (quizRunning && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (quizRunning && timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [quizRunning, timeLeft]);

  // Initialize test parameters
  const handleStartTest = (test: AptitudeTest) => {
    setSelectedTest(test);
    setAnswers({});
    setTimeLeft(test.duration * 60);
    setQuizRunning(true);
    setQuizFinished(false);
    setResults(null);
  };

  // Submit test and fetch scoring explanation
  const handleSubmitQuiz = async () => {
    if (!selectedTest) return;
    setQuizRunning(false);

    const timeSpent = selectedTest.duration * 60 - timeLeft;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/aptitude/tests/${selectedTest.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers, timeSpent })
      });
      const data = await res.json();
      setResults(data);
      setQuizFinished(true);

      // Increment streak locally
      if (stats) {
        setStats({
          ...stats,
          streak: { ...stats.streak, currentStreak: stats.streak.currentStreak }
        });
      }
    } catch {
      // Offline fallback grading logic
      const questionsList = JSON.parse(selectedTest.questions);
      let correct = 0;
      questionsList.forEach((q: Question, idx: number) => {
        if (answers[idx] === q.answer) correct++;
      });
      const pct = Math.round((correct / questionsList.length) * 100);

      setResults({
        correctCount: correct,
        totalCount: questionsList.length,
        percentage: pct,
        questions: questionsList
      });
      setQuizFinished(true);
    }
  };

  const getCategoryBadge = (cat: string) => {
    if (cat === 'QUANT') return 'text-amber-500 bg-amber-950/40 border-amber-950';
    if (cat === 'VERBAL') return 'text-blue-500 bg-blue-950/40 border-blue-950';
    return 'text-purple-500 bg-purple-950/40 border-purple-950';
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col pb-12">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 mt-8 space-y-6 flex-grow">
        
        {/* Intro */}
        <div className="border-b border-zinc-900 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Placement Aptitude Simulator</h1>
            <p className="text-xs text-zinc-400">Master Quant, Verbal, and Logical Diagnostic Assessments for hiring exams</p>
          </div>
          {selectedTest && (
            <button
              onClick={() => setSelectedTest(null)}
              className="py-1 px-3 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 rounded text-xs font-bold text-zinc-500 hover:text-white cursor-pointer"
            >
              Exit Test
            </button>
          )}
        </div>

        {!selectedTest ? (
          /* List of timed tests */
          <div className="grid grid-cols-1 gap-4">
            {tests.length === 0 ? (
              <p className="text-center text-zinc-500 font-mono py-12">Searching aptitude directories...</p>
            ) : (
              tests.map((test) => (
                <div 
                  key={test.id}
                  onClick={() => handleStartTest(test)}
                  className="p-5 rounded-xl bg-zinc-950/60 border border-zinc-900 hover:border-red-950 hover:bg-zinc-900/40 transition-all cursor-pointer flex justify-between items-center gap-4"
                >
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-sm text-white">{test.title}</h3>
                    <div className="flex space-x-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${getCategoryBadge(test.category)} font-bold`}>
                        {test.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-500 font-mono flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-red-500" />
                        <span>{test.duration} mins</span>
                      </span>
                    </div>
                  </div>
                  <button className="py-2 px-4 rounded bg-zinc-900 hover:bg-red-950/30 border border-zinc-850 hover:border-red-900 text-xs font-bold text-zinc-300 hover:text-red-500 transition-all cursor-pointer">
                    Launch Mock
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Timed Test Platform console */
          <div className="space-y-6">
            
            {/* Clock Banner */}
            <div className="glass-panel p-4 rounded-xl border border-zinc-900 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-white">{selectedTest.title}</h3>
                <span className="text-[10px] text-zinc-500">Solve all questions before clock stops</span>
              </div>
              {quizRunning && (
                <div className="flex items-center space-x-1.5 bg-red-950/30 border border-red-900/40 text-red-500 px-3 py-1.5 rounded-lg animate-pulse">
                  <Clock className="w-4 h-4 fill-red-900/10" />
                  <span className="text-xs font-black font-mono">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>

            {/* Timed Test MCQs */}
            {!quizFinished ? (
              <div className="space-y-6">
                {JSON.parse(selectedTest.questions).map((q: Question, qIdx: number) => {
                  const selectedOpt = answers[qIdx];
                  return (
                    <div key={qIdx} className="glass-panel p-5 rounded-2xl border border-zinc-900 space-y-3">
                      <div className="text-xs font-bold text-white">Question {qIdx + 1}: {q.question}</div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt) => {
                          const isChosen = selectedOpt === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAnswers({ ...answers, [qIdx]: opt })}
                              className={`text-left p-3 rounded-lg text-xs border transition-all cursor-pointer ${
                                isChosen 
                                  ? 'bg-red-950/40 text-red-500 border-red-950 font-semibold glow-red' 
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={handleSubmitQuiz}
                  className="py-3 px-6 rounded-lg bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-xs font-bold text-white transition-all glow-red flex items-center justify-center space-x-1 w-full sm:w-auto cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Diagnostic Exam</span>
                </button>
              </div>
            ) : (
              /* Performance breakdown report */
              <div className="space-y-6">
                
                {/* Result metrics bar */}
                {results && (
                  <div className="glass-panel p-6 rounded-2xl border border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center">
                    <div className="space-y-1 pr-6 border-r border-zinc-900">
                      <div className="text-4xl font-black text-red-500 glow-red-text">{results.percentage}%</div>
                      <div className="text-xs font-bold text-white">Diagnostic Score</div>
                    </div>

                    <div className="space-y-1 pr-6 border-r border-zinc-900 text-zinc-400">
                      <div className="text-2xl font-bold text-white">
                        {results.correctCount} / {results.totalCount}
                      </div>
                      <div className="text-xs font-bold">Correct Answers</div>
                    </div>

                    <div>
                      <button
                        onClick={() => setSelectedTest(null)}
                        className="py-2.5 px-5 bg-red-800 hover:bg-red-700 rounded text-xs font-bold text-white glow-red transition-all cursor-pointer"
                      >
                        Return to Mock List
                      </button>
                    </div>
                  </div>
                )}

                {/* Question Reviews */}
                {results?.questions?.map((q: Question, qIdx: number) => {
                  const selectedOpt = answers[qIdx];
                  const isCorrect = selectedOpt === q.answer;
                  return (
                    <div key={qIdx} className="glass-panel p-5 rounded-2xl border border-zinc-900 space-y-3">
                      <div className="text-xs font-bold text-white">Question {qIdx + 1}: {q.question}</div>
                      
                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono flex justify-between items-center">
                        <div>Your Answer: <strong className={isCorrect ? 'text-emerald-500' : 'text-red-500'}>{selectedOpt || 'Skipped'}</strong></div>
                        <div>Correct Answer: <strong className="text-emerald-500">{q.answer}</strong></div>
                      </div>

                      <div className="p-3.5 bg-red-950/10 border border-red-900/30 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-bold text-red-500 font-mono block">FORMULA & EXPLANATION DETAILS:</span>
                        <p className="text-xs text-zinc-300 font-mono leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}

              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
