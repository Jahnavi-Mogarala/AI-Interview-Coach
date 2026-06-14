'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/authStore';
import { 
  BookOpen, HelpCircle, RefreshCw, Layout, Play, 
  ArrowRight, Award, Compass, Sparkles, ChevronDown 
} from 'lucide-react';

interface DSATopic {
  id: string;
  name: string;
  theory: string;
  visualType: 'array' | 'stack' | 'queue' | 'tree';
  flashcards: { front: string; back: string }[];
  quiz: { q: string; opts: string[]; a: string; desc: string }[];
}

export default function DSALearning() {
  const { user } = useAuthStore();
  const [selectedTopic, setSelectedTopic] = useState<DSATopic | null>(null);

  // Visualization states
  const [windowLeft, setWindowLeft] = useState(0);
  const [windowRight, setWindowRight] = useState(2);
  const [stackElements, setStackElements] = useState<number[]>([12, 45, 8]);
  const [queueElements, setQueueElements] = useState<number[]>([15, 30, 42]);

  // Flashcards state
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const topicsList: DSATopic[] = [
    {
      id: 'arrays-strings',
      name: 'Arrays & Strings',
      theory: 'An Array is a linear data structure that collects elements of the same data type in contiguous memory locations. A String is essentially an array of characters. Common patterns include Sliding Window, Two Pointers, and Prefix Sums.',
      visualType: 'array',
      flashcards: [
        { front: 'What is the time complexity of searching in an unsorted array?', back: 'O(N) since we must check every element in the worst case.' },
        { front: 'What is the Sliding Window technique?', back: 'A method to perform checks over a subarray of size K by sliding boundaries, avoiding re-calculation.' }
      ],
      quiz: [
        {
          q: 'Which traversal technique evaluates characters from both ends of a sequence?',
          opts: ['Two Pointers', 'Breadth First Search', 'Binary Search Tree', 'Dynamic Programming'],
          a: 'Two Pointers',
          desc: 'Two Pointers utilizes two indexes (start and end) converging to find combinations.'
        }
      ]
    },
    {
      id: 'stacks-queues',
      name: 'Stacks & Queues',
      theory: 'A Stack is a Last-In-First-Out (LIFO) structure (elements added to the top are removed first). A Queue is a First-In-First-Out (FIFO) structure (elements added to the rear are removed from the front).',
      visualType: 'stack',
      flashcards: [
        { front: 'What is the core difference between Stacks and Queues?', back: 'Stacks use LIFO (Last In First Out), while Queues use FIFO (First In First Out).' }
      ],
      quiz: [
        {
          q: 'Which structure is ideal for parsing parenthesis nested pairs?',
          opts: ['Queue', 'Stack', 'Graph', 'HashMap'],
          a: 'Stack',
          desc: 'Stacks track nested boundaries cleanly, popping the latest open parenthesise on finding closed pairs.'
        }
      ]
    },
    {
      id: 'dynamic-programming',
      name: 'Dynamic Programming (DP)',
      theory: 'Dynamic Programming is an optimization technique that solves complex problems by breaking them down into simpler overlapping subproblems, solving each subproblem once, and storing their solutions (Memoization/Tabulation) to avoid redundant computations.',
      visualType: 'tree',
      flashcards: [
        { front: 'What is Memoization in Dynamic Programming?', back: 'Top-down caching of subproblem results inside arrays or hash maps.' },
        { front: 'What is Tabulation?', back: 'Bottom-up iteration, building tables from baseline conditions to goal results.' }
      ],
      quiz: [
        {
          q: 'What are the two key characteristics a problem must exhibit to be solved by DP?',
          opts: ['Overlapping subproblems & Optimal substructure', 'Sorted arrays & Binary trees', 'LIFO & FIFO ordering', 'Greedy choices & Backtracking'],
          a: 'Overlapping subproblems & Optimal substructure',
          desc: 'Dynamic Programming requires that subproblems are repeated (overlapping) and optimal subproblem solutions lead to optimal overall solutions (optimal substructure).'
        }
      ]
    }
  ];

  const pushToStack = () => {
    const newVal = Math.floor(Math.random() * 90) + 10;
    setStackElements([newVal, ...stackElements].slice(0, 5));
  };

  const popFromStack = () => {
    setStackElements(stackElements.slice(1));
  };

  const enqueue = () => {
    const newVal = Math.floor(Math.random() * 90) + 10;
    setQueueElements([...queueElements, newVal].slice(0, 5));
  };

  const dequeue = () => {
    setQueueElements(queueElements.slice(1));
  };

  const handleSelectTopic = (topic: DSATopic) => {
    setSelectedTopic(topic);
    setFlippedIndex(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-6 flex-grow">
        
        {/* Left Side: Topic Selection Checklist */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900">
            <h3 className="font-extrabold text-sm text-white flex items-center space-x-1.5 mb-3">
              <Compass className="w-4 h-4 text-red-500" />
              <span>DSA Syllabus Outline</span>
            </h3>
            
            <div className="space-y-1">
              {topicsList.map((topic) => {
                const isSelected = selectedTopic?.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleSelectTopic(topic)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? 'bg-red-950/40 text-red-500 border-red-950'
                        : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{topic.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Topic Content Panels */}
        <div className="flex-grow space-y-6">
          {!selectedTopic ? (
            <div className="glass-panel p-12 rounded-2xl border border-zinc-900 text-center space-y-4 max-w-xl mx-auto my-12">
              <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-900 text-red-500 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="font-extrabold text-xl text-white">Choose a DSA Module</h2>
              <p className="text-sm text-zinc-400">
                Explore theory, watch index pointer step-by-step simulations, flip vocabulary index flashcards, and test comprehension with timed quizzes.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-zinc-900 pb-4">
                <div className="flex items-center space-x-2 text-red-500 text-xs font-mono mb-1">
                  <Sparkles className="w-3.5 h-3.5 fill-red-500" />
                  <span>DYNAMICAL DSA COMPANION</span>
                </div>
                <h2 className="text-2xl font-black text-white">{selectedTopic.name}</h2>
              </div>

              {/* Theory Summary */}
              <div className="glass-panel p-5 rounded-2xl border border-zinc-900">
                <h3 className="font-bold text-sm text-white mb-2">Conceptual Theory</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">{selectedTopic.theory}</p>
              </div>

              {/* Interactive Visualization Panel */}
              <div className="glass-panel p-5 rounded-2xl border border-zinc-900">
                <h3 className="font-bold text-sm text-white mb-3 flex items-center justify-between">
                  <span>Interactive Pointer Simulation</span>
                  <span className="text-[10px] text-zinc-500 font-mono">STEP-BY-STEP VISUALIZER</span>
                </h3>

                {/* Array sliding window visualizer */}
                {selectedTopic.visualType === 'array' && (
                  <div className="space-y-4">
                    <div className="flex justify-center space-x-2.5 py-6 overflow-x-auto bg-black/40 rounded-xl border border-zinc-900">
                      {[12, 45, 8, 30, 22, 18, 92, 5].map((val, idx) => {
                        const isInWindow = idx >= windowLeft && idx <= windowRight;
                        return (
                          <div 
                            key={idx} 
                            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold font-mono text-xs border transition-all ${
                              isInWindow
                                ? 'bg-red-800/80 border-red-500 text-white glow-red'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                            }`}
                          >
                            <span>{val}</span>
                            <span className="text-[7px] text-zinc-400 font-mono mt-0.5">{idx}</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Window Controls */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setWindowLeft(Math.max(0, windowLeft - 1))}
                          className="py-1 px-2.5 bg-zinc-900 rounded text-zinc-300 hover:text-white border border-zinc-800 cursor-pointer"
                        >
                          Left Ptr -
                        </button>
                        <button 
                          onClick={() => setWindowLeft(Math.min(windowRight, windowLeft + 1))}
                          className="py-1 px-2.5 bg-zinc-900 rounded text-zinc-300 hover:text-white border border-zinc-800 cursor-pointer"
                        >
                          Left Ptr +
                        </button>
                      </div>
                      <div className="font-mono text-red-500 text-[10px]">
                        Window bounds: [{windowLeft}, {windowRight}] Subarray Sum: {
                          [12, 45, 8, 30, 22, 18, 92, 5].slice(windowLeft, windowRight + 1).reduce((a, b) => a + b, 0)
                        }
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setWindowRight(Math.max(windowLeft, windowRight - 1))}
                          className="py-1 px-2.5 bg-zinc-900 rounded text-zinc-300 hover:text-white border border-zinc-800 cursor-pointer"
                        >
                          Right Ptr -
                        </button>
                        <button 
                          onClick={() => setWindowRight(Math.min(7, windowRight + 1))}
                          className="py-1 px-2.5 bg-zinc-900 rounded text-zinc-300 hover:text-white border border-zinc-800 cursor-pointer"
                        >
                          Right Ptr +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stack LIFO Visualizer */}
                {selectedTopic.visualType === 'stack' && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center py-6 bg-black/40 rounded-xl border border-zinc-900 min-h-36 justify-end">
                      <div className="w-24 border-x border-b border-zinc-800 rounded-b p-1.5 flex flex-col space-y-1.5">
                        {stackElements.length === 0 ? (
                          <div className="text-[10px] text-zinc-600 text-center py-6 font-mono">Stack Empty</div>
                        ) : (
                          stackElements.map((val, idx) => (
                            <div 
                              key={idx} 
                              className={`py-2 text-center rounded bg-red-950/60 border border-red-900 text-xs font-bold text-red-400 font-mono transition-all ${
                                idx === 0 ? 'animate-bounce border-red-500 text-white' : ''
                              }`}
                            >
                              {val} {idx === 0 ? '(TOP)' : ''}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center space-x-3 text-xs">
                      <button 
                        onClick={pushToStack}
                        className="py-1.5 px-4 bg-red-800 hover:bg-red-700 text-white rounded font-bold cursor-pointer"
                      >
                        Push Element
                      </button>
                      <button 
                        onClick={popFromStack}
                        disabled={stackElements.length === 0}
                        className="py-1.5 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded font-bold cursor-pointer"
                      >
                        Pop (LIFO)
                      </button>
                    </div>
                  </div>
                )}

                {/* Tree / Dynamic visualizer */}
                {selectedTopic.visualType === 'tree' && (
                  <div className="py-6 flex justify-center bg-black/40 rounded-xl border border-zinc-900">
                    <div className="space-y-4 text-center">
                      <div className="flex justify-center space-x-8">
                        <div className="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center text-xs font-bold font-mono border border-red-600 relative">
                          R
                          <div className="absolute -bottom-6 -left-3 w-6 h-0.5 bg-zinc-850 rotate-45" />
                          <div className="absolute -bottom-6 -right-3 w-6 h-0.5 bg-zinc-850 -rotate-45" />
                        </div>
                      </div>
                      <div className="flex justify-center space-x-12">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center text-xs font-bold font-mono border border-zinc-800">L</div>
                        <div className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center text-xs font-bold font-mono border border-zinc-800">R</div>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono">Overlapping subproblems solve memoization states.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Flashcards Panel */}
              <div className="glass-panel p-5 rounded-2xl border border-zinc-900">
                <h3 className="font-bold text-sm text-white mb-3">Syllabus Vocabulary Flashcards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedTopic.flashcards.map((card, idx) => {
                    const isFlipped = flippedIndex === idx;
                    return (
                      <div 
                        key={idx}
                        onClick={() => setFlippedIndex(isFlipped ? null : idx)}
                        className="min-h-24 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-center cursor-pointer hover:border-red-950 transition-all select-none"
                      >
                        <p className={`text-xs font-bold ${isFlipped ? 'text-red-400 font-normal italic' : 'text-white'}`}>
                          {isFlipped ? card.back : card.front}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mock Quiz Panel */}
              <div className="glass-panel p-5 rounded-2xl border border-zinc-900">
                <h3 className="font-bold text-sm text-white mb-3">Topic Diagnostic Assessment</h3>

                <div className="space-y-4">
                  {selectedTopic.quiz.map((q, idx) => {
                    const selectedOpt = quizAnswers[idx];
                    return (
                      <div key={idx} className="space-y-3">
                        <div className="text-xs font-semibold text-white">Q1. {q.q}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.opts.map((opt) => {
                            const isChosen = selectedOpt === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: opt })}
                                className={`text-left p-2.5 rounded-lg text-xs border transition-all cursor-pointer ${
                                  isChosen
                                    ? 'bg-red-950/40 text-red-500 border-red-950 font-semibold'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className={`p-3 rounded-lg text-xs ${
                            selectedOpt === q.a 
                              ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/40' 
                              : 'bg-red-950/30 text-red-400 border border-red-900/40'
                          }`}>
                            {selectedOpt === q.a 
                              ? '✓ Correct answer!' 
                              : `✗ Incorrect. Correct answer was: ${q.a}`}
                            <p className="mt-1 text-[11px] text-zinc-300 font-mono">{q.desc}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length === 0}
                      className="py-2 px-5 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 rounded text-xs font-bold text-white transition-all glow-red disabled:opacity-50 cursor-pointer"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="py-2 px-5 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
                    >
                      Reset Quiz
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </main>
    </div>
  );
}
