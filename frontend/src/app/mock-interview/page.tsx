'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/authStore';
import { 
  MessageSquare, Mic, MicOff, Volume2, Send, Play, 
  CheckCircle2, Compass, AlertCircle, RefreshCw, Star, Info 
} from 'lucide-react';

interface ChatMessage {
  role: 'interviewer' | 'user';
  text: string;
  timestamp: string;
}

export default function MockInterview() {
  const { token } = useAuthStore();
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Selector choices
  const [type, setType] = useState('DSA'); // DSA, HR, SYSTEM_DESIGN etc.
  const [mode, setMode] = useState('TEXT'); // TEXT, VOICE

  // Chat console
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  // Voice recording triggers
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecognizer, setSpeechRecognizer] = useState<any>(null);
  const speakStartTime = useRef<number | null>(null);

  // Auto-scroll chat ref
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognizer = new SpeechRecognition();
        recognizer.continuous = false;
        recognizer.interimResults = false;
        recognizer.lang = 'en-US';

        recognizer.onstart = () => {
          setIsRecording(true);
          speakStartTime.current = Date.now();
        };

        recognizer.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript;
          setUserInput((prev) => (prev ? prev + ' ' + speechResult : speechResult));
        };

        recognizer.onerror = (err: any) => {
          console.error('Speech recognition error:', err);
          setIsRecording(false);
        };

        recognizer.onend = () => {
          setIsRecording(false);
        };

        setSpeechRecognizer(recognizer);
      }
    }
  }, []);

  // Text-To-Speech reader
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && mode === 'VOICE') {
      // Clean up brackets like [Speech Coach Feedback...]
      const cleanText = text.replace(/\[.*?\]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.cancel(); // cancel previous
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // Start interview
  const handleStart = async () => {
    setLoadingMsg(true);
    setChatLog([]);
    setIsFinished(false);
    setFeedback(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, mode })
      });
      const data = await res.json();
      setSession(data.session);
      
      const firstMsg: ChatMessage = {
        role: 'interviewer',
        text: data.firstQuestion,
        timestamp: new Date().toISOString()
      };
      setChatLog([firstMsg]);
      setInterviewStarted(true);

      // Speak question if Voice mode is active
      setTimeout(() => speakText(data.firstQuestion), 400);
    } catch {
      // Sandbox Mode Local Mock Start
      const mockQuestion = type === 'DSA' 
        ? "Hello! Let's begin the technical round. Please design a function that detects cycle patterns in linked nodes."
        : "Welcome! Tell me about yourself and your primary project achievements.";

      setSession({ id: 'mock-session-id', type, mode });
      setChatLog([{ role: 'interviewer', text: mockQuestion, timestamp: new Date().toISOString() }]);
      setInterviewStarted(true);
      setTimeout(() => speakText(mockQuestion), 400);
    } finally {
      setLoadingMsg(false);
    }
  };

  // Toggle voice recorder
  const toggleRecording = () => {
    if (!speechRecognizer) {
      alert('Speech Recognition is not supported in this browser. Try Chrome, Edge or Safari!');
      return;
    }

    if (isRecording) {
      speechRecognizer.stop();
    } else {
      speechRecognizer.start();
    }
  };

  // Submit response
  const handleSendResponse = async () => {
    if (!userInput.trim()) return;
    const userMsg = userInput.trim();
    setUserInput('');
    setLoadingMsg(true);

    // Calculate speaking speed (WPM)
    let speakingSpeed: number | null = null;
    if (speakStartTime.current) {
      const durationMin = (Date.now() - speakStartTime.current) / 60000;
      const wordCount = userMsg.split(/\s+/).length;
      speakingSpeed = Math.round(wordCount / (durationMin || 0.1));
      // Cap normal speed boundaries
      if (speakingSpeed > 250) speakingSpeed = 150;
      if (speakingSpeed < 30) speakingSpeed = 90;
    }

    // Update chat log locally
    const newChatLog = [...chatLog, { role: 'user' as const, text: userMsg, timestamp: new Date().toISOString() }];
    setChatLog(newChatLog);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/interview/${session.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg, speakingSpeed })
      });
      const data = await res.json();

      setChatLog([...newChatLog, {
        role: 'interviewer',
        text: data.nextQuestion,
        timestamp: new Date().toISOString()
      }]);

      if (data.isFinished) {
        setIsFinished(true);
        setFeedback(data.evaluation);
      } else {
        setTimeout(() => speakText(data.nextQuestion), 500);
      }
    } catch {
      // Sandbox offline mockup response logic
      setTimeout(() => {
        const mockIsFinished = newChatLog.length >= 7;
        const nextPrompt = mockIsFinished 
          ? "Thank you for completing the interview! I am generating your evaluation metrics now." 
          : "That makes sense. Can you explain the time and space complexity implications of that choice?";

        setChatLog([...newChatLog, {
          role: 'interviewer',
          text: nextPrompt,
          timestamp: new Date().toISOString()
        }]);

        if (mockIsFinished) {
          setIsFinished(true);
          setFeedback({
            scoreConfidence: 85,
            scoreCommunication: 78,
            scoreLogic: 90,
            scoreOptimization: 80,
            feedback: "Outstanding work! Your logical approach was clean and correct. Pacing was confident, with occasional pauses. Practice speaking continuously to improve communication score.",
            mistakes: [
              "Could have discussed space trade-offs of using iterative tables vs recursive stacks.",
              "Minor hesitation when explaining cycle pointers."
            ]
          });
        } else {
          setTimeout(() => speakText(nextPrompt), 500);
        }
      }, 1000);
    } finally {
      setLoadingMsg(false);
      speakStartTime.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col pb-12">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 mt-8 space-y-6 flex-grow">
        
        {/* Intro Header */}
        <div className="border-b border-zinc-900 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">AI Mock Interview Arena</h1>
            <p className="text-xs text-zinc-400 font-mono">Simulate real-time technical & HR rounds with voice synthesis feedback</p>
          </div>
          {interviewStarted && (
            <button 
              onClick={() => setInterviewStarted(false)}
              className="py-1 px-2.5 bg-zinc-900 border border-zinc-800 rounded text-xs font-bold text-zinc-500 hover:text-white cursor-pointer"
            >
              Reset Arena
            </button>
          )}
        </div>

        {!interviewStarted ? (
          /* Interview configuration page */
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-850 max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-900 text-red-500 flex items-center justify-center mx-auto glow-red">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-white">Configure Interview Session</h3>
              <p className="text-xs text-zinc-500">Pick domain subjects and mode to build sandbox simulation</p>
            </div>

            <div className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 font-mono">CHOOSE ROUND TYPE</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['DSA', 'HR', 'SYSTEM_DESIGN', 'SQL', 'AI_ML'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        type === t
                          ? 'bg-red-800 text-white border-red-600 glow-red'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 font-mono">COMMUNICATION INTERACTIVE MODE</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'TEXT', label: 'Standard Text chat' },
                    { val: 'VOICE', label: 'Voice Interactive (TTS/STT)' }
                  ].map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => setMode(m.val)}
                      className={`p-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        mode === m.val
                          ? 'bg-red-800 text-white border-red-600 glow-red'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-2 p-3 bg-zinc-900/50 border border-zinc-850 rounded-lg text-[10px] text-zinc-500">
                <Info className="w-4 h-4 text-red-500 shrink-0" />
                <p className="leading-normal">
                  In <strong>Voice mode</strong>, the browser reads out questions automatically. Click "Speak Response" (requires microphone permissions) to transcript answers directly. Pacing, tone, and filler words are evaluated.
                </p>
              </div>

              <button
                onClick={handleStart}
                className="w-full py-3 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 rounded-lg text-sm font-bold text-white transition-all glow-red flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Initialize AI Interviewer</span>
              </button>
            </div>
          </div>
        ) : (
          /* Live Chat & Evaluation console */
          <div className="space-y-4">
            
            {/* Chat Messages Log */}
            <div className="glass-panel p-4 rounded-2xl border border-zinc-900 h-96 overflow-y-auto space-y-4 bg-zinc-950/20">
              {chatLog.map((msg, i) => {
                const isInterviewer = msg.role === 'interviewer';
                return (
                  <div key={i} className={`flex ${isInterviewer ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] p-3.5 rounded-xl border text-xs leading-relaxed ${
                      isInterviewer 
                        ? 'bg-zinc-900 border-zinc-850 text-zinc-200 rounded-tl-none' 
                        : 'bg-red-950/30 border-red-900/40 text-red-400 rounded-tr-none'
                    }`}>
                      <div className="font-bold font-mono text-[9px] text-zinc-500 mb-1">
                        {isInterviewer ? 'AI INTERVIEWER' : 'CANDIDATE'}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {loadingMsg && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-zinc-850 p-3 rounded-xl rounded-tl-none text-xs text-zinc-500 italic animate-pulse">
                    AI is grading and formulating follow-up questions...
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Actions Bar */}
            {!isFinished && (
              <div className="flex items-center space-x-2">
                {mode === 'VOICE' && (
                  <button
                    onClick={toggleRecording}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isRecording 
                        ? 'bg-red-600 border-red-500 text-white animate-pulse glow-red' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                    title={isRecording ? 'Stop Recording' : 'Speak Response'}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}

                <input
                  type="text"
                  placeholder={isRecording ? 'Listening... speak clearly.' : 'Type your answer or explanation here...'}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendResponse()}
                  className="flex-grow p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
                />

                <button
                  onClick={handleSendResponse}
                  disabled={loadingMsg || !userInput.trim()}
                  className="p-3 rounded-xl bg-red-800 hover:bg-red-700 text-white transition-colors cursor-pointer"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
            )}

            {/* Final Performance Evaluation Drawer */}
            {isFinished && feedback && (
              <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-6 animate-pulse">
                <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
                  <span className="text-sm font-extrabold text-white flex items-center space-x-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>AI Evaluation Scorecard</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">ROUND COMPLETED</span>
                </div>

                {/* Score indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'CONFIDENCE', val: feedback.scoreConfidence },
                    { label: 'COMMUNICATION', val: feedback.scoreCommunication },
                    { label: 'LOGIC & CRITICAL', val: feedback.scoreLogic },
                    { label: 'OPTIMIZATION', val: feedback.scoreOptimization }
                  ].map((s, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 text-center">
                      <div className="text-xs font-bold text-zinc-500 mb-1">{s.label}</div>
                      <div className="text-3xl font-black text-white">{s.val}%</div>
                    </div>
                  ))}
                </div>

                {/* Overall advice text */}
                <div className="p-4 rounded-xl bg-red-950/10 border border-red-900/30 space-y-2">
                  <h4 className="text-xs font-bold text-red-500 flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-red-500" />
                    <span>Mentor Recommendations</span>
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">{feedback.feedback}</p>
                </div>

                {/* Mistakes Audit */}
                {feedback.mistakes && feedback.mistakes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-400 block">AREAS SPOTTED FOR IMPROVEMENT:</span>
                    <ul className="space-y-1.5">
                      {feedback.mistakes.map((mistake: string, i: number) => (
                        <li key={i} className="text-xs text-zinc-400 flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setInterviewStarted(false)}
                  className="py-2.5 px-6 bg-red-800 hover:bg-red-700 rounded-lg text-xs font-bold text-white glow-red transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
