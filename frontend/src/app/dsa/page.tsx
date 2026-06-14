'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/authStore';
import { 
  BookOpen, HelpCircle, RefreshCw, Layout, Play, 
  ArrowRight, Award, Compass, Sparkles, ChevronDown, Plus, Cpu
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
  const [stackElements, setStackElements] = useState<string[]>(['12', '45', '8']);

  // CPU Queue Scheduler simulation states
  const [queueProcesses, setQueueProcesses] = useState<{ id: string; burst: number }[]>([
    { id: 'P1', burst: 25 },
    { id: 'P2', burst: 15 },
    { id: 'P3', burst: 35 }
  ]);
  const [cpuProcess, setCpuProcess] = useState<{ id: string; burst: number } | null>(null);
  const [completedProcesses, setCompletedProcesses] = useState<string[]>([]);
  const [timeQuantum] = useState(10);
  const [processCounter, setProcessCounter] = useState(4);

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
          desc: 'Stacks track nested boundaries cleanly, popping the latest open parenthesis on finding closed pairs.'
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
    },
    {
      id: 'dbms',
      name: 'Database Management Systems (DBMS)',
      theory: 'DBMS is software designed to manage databases. Key concepts include ACID properties (Atomicity, Consistency, Isolation, Durability) for transaction integrity, Normalization (1NF, 2NF, 3NF, BCNF) to reduce redundancy, and Indexing (B-Trees, Hash Indexes) to speed up query execution.',
      visualType: 'array',
      flashcards: [
        { front: 'What are ACID properties?', back: 'Atomicity (all or nothing), Consistency (valid state transitions), Isolation (independent concurrent transactions), Durability (persistent changes).' },
        { front: 'What is the purpose of Normalization?', back: 'To minimize data redundancy and dependency by organizing fields and table relationships.' },
        { front: 'Why are B+ Trees preferred for database indexes?', back: 'They keep data sorted, allowing logarithmic search, insertions, and deletions. B+ Tree leaves are linked, making range queries extremely fast.' }
      ],
      quiz: [
        {
          q: 'Which database index structure is most efficient for exact key-value match lookups?',
          opts: ['Hash Index', 'B+ Tree Index', 'Inverted Index', 'Bitmap Index'],
          a: 'Hash Index',
          desc: 'Hash indexes offer O(1) time complexity for exact matches, whereas B+ trees offer O(log N) but excel at range queries.'
        }
      ]
    },
    {
      id: 'operating-systems',
      name: 'Operating Systems (OS)',
      theory: 'An OS manages hardware, resource allocation, and program execution. Core topics include Process Management (Processes, threads, contexts), CPU Scheduling (Round Robin, FIFO, SJF), Memory Management (Paging, virtual memory), and Deadlocks (Mutual exclusion, hold & wait, no preemption, circular wait).',
      visualType: 'queue',
      flashcards: [
        { front: 'What is a Deadlock?', back: 'A state where a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process.' },
        { front: 'What is the difference between a process and a thread?', back: 'A process is an executing program instance with its own memory space, while a thread is a segment of execution within a process sharing the same memory.' },
        { front: 'What is Virtual Memory?', back: 'A technique that maps developer virtual addresses to physical storage addresses, enabling execution of processes larger than physical RAM.' }
      ],
      quiz: [
        {
          q: 'Which of the following is NOT one of the Coffman conditions required for a deadlock to occur?',
          opts: ['Preemption', 'Mutual Exclusion', 'Hold and Wait', 'Circular Wait'],
          a: 'Preemption',
          desc: 'No Preemption is required for deadlock; if preemption is allowed, resources can be reclaimed, breaking the deadlock.'
        }
      ]
    },
    {
      id: 'computer-networks',
      name: 'Computer Networks (CN)',
      theory: 'Computer Networks connect nodes to share resources. Key frameworks include the OSI 7-Layer Model (Physical, Data Link, Network, Transport, Session, Presentation, Application), the TCP 3-Way Handshake (SYN -> SYN-ACK -> ACK) for connection-oriented transport, and DNS (Domain Name System) translating domain names to IP addresses.',
      visualType: 'stack',
      flashcards: [
        { front: 'What happens during the TCP 3-Way Handshake?', back: 'Client sends SYN, Server replies with SYN-ACK, Client sends ACK. Connection is then established.' },
        { front: 'What is DNS?', back: 'Domain Name System - it maps human-readable domain names (like google.com) to machine IP addresses.' },
        { front: 'Which layer of the OSI model is responsible for routing packets across networks?', back: 'The Network Layer (Layer 3) handles routing using IP addresses.' }
      ],
      quiz: [
        {
          q: 'In the OSI model, packet encapsulation occurs as data moves down the stack. Which layer adds the TCP/UDP port headers?',
          opts: ['Transport Layer', 'Network Layer', 'Data Link Layer', 'Application Layer'],
          a: 'Transport Layer',
          desc: 'The Transport Layer (Layer 4) handles end-to-end communication and adds ports, segmenting data.'
        }
      ]
    }
  ];

  // Stack operations
  const pushToStack = () => {
    if (selectedTopic?.id === 'computer-networks') {
      const headers = ['Physical Header', 'Ethernet Frame', 'IP Header', 'TCP Port Header', 'HTTP Data'];
      const nextHeader = headers[Math.min(stackElements.length, headers.length - 1)];
      setStackElements([nextHeader, ...stackElements].slice(0, 5));
    } else {
      const newVal = (Math.floor(Math.random() * 90) + 10).toString();
      setStackElements([newVal, ...stackElements].slice(0, 5));
    }
  };

  const popFromStack = () => {
    setStackElements(stackElements.slice(1));
  };

  // CPU Queue Scheduler operations
  const enqueueProcess = () => {
    const burst = Math.floor(Math.random() * 40) + 10;
    const newProc = { id: `P${processCounter}`, burst };
    setQueueProcesses([...queueProcesses, newProc]);
    setProcessCounter(processCounter + 1);
  };

  const runRoundRobinStep = () => {
    if (queueProcesses.length === 0 && !cpuProcess) {
      alert('Ready Queue is empty! Enqueue more processes.');
      return;
    }

    let active = cpuProcess;
    let tempQueue = [...queueProcesses];

    // If no active process in CPU, pull from queue head
    if (!active) {
      active = tempQueue[0];
      tempQueue = tempQueue.slice(1);
    }

    // Execute step
    if (active) {
      if (active.burst > timeQuantum) {
        // Exceeds quantum, decrement and push to tail
        const updated = { ...active, burst: active.burst - timeQuantum };
        setCpuProcess(null);
        setQueueProcesses([...tempQueue, updated]);
      } else {
        // Completes
        setCompletedProcesses([...completedProcesses, active.id]);
        setCpuProcess(null);
        setQueueProcesses(tempQueue);
      }
    }
  };

  const resetQueueSimulator = () => {
    setQueueProcesses([
      { id: 'P1', burst: 25 },
      { id: 'P2', burst: 15 },
      { id: 'P3', burst: 35 }
    ]);
    setCpuProcess(null);
    setCompletedProcesses([]);
    setProcessCounter(4);
  };

  const handleSelectTopic = (topic: DSATopic) => {
    setSelectedTopic(topic);
    setFlippedIndex(null);
    setQuizAnswers({});
    setQuizSubmitted(false);

    // Initial Stack defaults for CN
    if (topic.id === 'computer-networks') {
      setStackElements(['Ethernet Frame', 'IP Header', 'TCP Port Header']);
    } else {
      setStackElements(['12', '45', '8']);
    }
    resetQueueSimulator();
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-6 flex-grow">
        
        {/* Left Side: Topic Selection Checklist */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900">
            <h3 className="font-extrabold text-sm text-white flex items-center space-x-1.5 mb-3">
              <Compass className="w-4 h-4 text-teal-400" />
              <span>DSA & Core CS Syllabus</span>
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
                        ? 'bg-teal-955/40 text-teal-400 border-teal-950 glow-teal'
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
              <div className="w-12 h-12 rounded-xl bg-teal-950/40 border border-teal-900 text-teal-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="font-extrabold text-xl text-white">Choose a Learning Module</h2>
              <p className="text-sm text-zinc-400">
                Explore theory, watch index pointer step-by-step simulations, flip vocabulary index flashcards, and test comprehension with timed quizzes.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-zinc-900 pb-4">
                <div className="flex items-center space-x-2 text-teal-400 text-xs font-mono mb-1">
                  <Sparkles className="w-3.5 h-3.5 fill-teal-400" />
                  <span>DYNAMICAL LEARNING COMPANION</span>
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
                                ? 'bg-teal-800/80 border-teal-500 text-white glow-teal'
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
                      <div className="font-mono text-teal-400 text-[10px]">
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

                {/* Stack LIFO / Encapsulation Visualizer */}
                {selectedTopic.visualType === 'stack' && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center py-6 bg-black/40 rounded-xl border border-zinc-900 min-h-36 justify-end">
                      <div className="w-56 border-x border-b border-zinc-800 rounded-b p-1.5 flex flex-col space-y-1.5">
                        {stackElements.length === 0 ? (
                          <div className="text-[10px] text-zinc-600 text-center py-6 font-mono">Stack Empty</div>
                        ) : (
                          stackElements.map((val, idx) => (
                            <div 
                              key={idx} 
                              className={`py-2 px-1 text-center rounded bg-teal-950/60 border border-teal-900 text-[10px] font-bold text-teal-400 font-mono transition-all ${
                                idx === 0 ? 'animate-bounce border-teal-500 text-white' : ''
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
                        className="py-1.5 px-4 bg-teal-700 hover:bg-teal-650 text-white rounded font-bold cursor-pointer glow-teal"
                      >
                        {selectedTopic.id === 'computer-networks' ? 'Encapsulate Header' : 'Push Element'}
                      </button>
                      <button 
                        onClick={popFromStack}
                        disabled={stackElements.length === 0}
                        className="py-1.5 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded font-bold cursor-pointer"
                      >
                        {selectedTopic.id === 'computer-networks' ? 'Decapsulate (Pop)' : 'Pop (LIFO)'}
                      </button>
                    </div>
                  </div>
                )}

                {/* CPU Queue Scheduler (Round Robin) Visualizer */}
                {selectedTopic.visualType === 'queue' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-black/40 rounded-xl border border-zinc-900 min-h-40">
                      
                      {/* Ready Queue (FIFO) */}
                      <div className="border border-zinc-850 p-3 rounded-lg bg-zinc-950/60 space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-500 font-bold block mb-1.5 uppercase font-mono">Ready Queue (FIFO)</span>
                          <div className="flex flex-wrap gap-1.5">
                            {queueProcesses.length === 0 ? (
                              <div className="text-[10px] text-zinc-650 font-mono py-2">Queue Empty</div>
                            ) : (
                              queueProcesses.map((proc, idx) => (
                                <div key={idx} className="px-2.5 py-1.5 rounded bg-teal-950/50 border border-teal-900 text-[10px] font-mono text-teal-400 font-bold">
                                  {proc.id} ({proc.burst}ms)
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={enqueueProcess}
                          className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded font-bold text-[10px] flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-teal-400" />
                          <span>Add Random Process</span>
                        </button>
                      </div>

                      {/* CPU Core Execution Slot */}
                      <div className="border border-zinc-850 p-3 rounded-lg bg-zinc-950/60 flex flex-col justify-between items-center text-center">
                        <span className="text-[10px] text-zinc-500 font-bold block mb-1 uppercase font-mono w-full text-left">CPU Core Execution</span>
                        <div className="flex-grow flex flex-col items-center justify-center py-4">
                          {cpuProcess ? (
                            <div className="px-5 py-3.5 rounded-xl bg-teal-900/40 border border-teal-500 text-xs font-mono font-black text-white glow-teal animate-pulse">
                              <Cpu className="w-5 h-5 mx-auto mb-1 text-teal-400" />
                              {cpuProcess.id} <br />
                              Burst: {cpuProcess.burst}ms
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-600 font-mono">Core Idle</span>
                          )}
                        </div>
                        <button 
                          onClick={runRoundRobinStep}
                          className="w-full py-1.5 bg-teal-700 hover:bg-teal-650 text-white rounded font-bold text-[10px] flex items-center justify-center space-x-1 cursor-pointer glow-teal"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Run Robin Cycle</span>
                        </button>
                      </div>

                      {/* Completed Queue */}
                      <div className="border border-zinc-850 p-3 rounded-lg bg-zinc-950/60 space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-500 font-bold block mb-1.5 uppercase font-mono">Completed Tasks</span>
                          <div className="flex flex-wrap gap-1.5">
                            {completedProcesses.length === 0 ? (
                              <div className="text-[10px] text-zinc-650 font-mono py-2">None Finished</div>
                            ) : (
                              completedProcesses.map((pid, idx) => (
                                <div key={idx} className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                                  ✓ {pid}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={resetQueueSimulator}
                          className="w-full py-1.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 border border-zinc-900 rounded font-bold text-[10px] cursor-pointer"
                        >
                          Reset Simulation
                        </button>
                      </div>

                    </div>
                    <div className="p-2.5 bg-zinc-900/30 border border-zinc-850 rounded-lg text-[9px] text-zinc-500 leading-relaxed font-mono">
                      ℹ️ Time Quantum = <strong>{timeQuantum}ms</strong>. Running a cycle pulls the head process into the CPU. If its burst time exceeds {timeQuantum}ms, it spends {timeQuantum}ms executing and is re-queued at the tail of the Ready Queue. Otherwise, it executes to completion.
                    </div>
                  </div>
                )}

                {/* Tree / Dynamic visualizer */}
                {selectedTopic.visualType === 'tree' && (
                  <div className="py-6 flex justify-center bg-black/40 rounded-xl border border-zinc-900">
                    <div className="space-y-4 text-center">
                      <div className="flex justify-center space-x-8">
                        <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold font-mono border border-teal-500 relative">
                          R
                          <div className="absolute -bottom-6 -left-3 w-6 h-0.5 bg-zinc-800 rotate-45" />
                          <div className="absolute -bottom-6 -right-3 w-6 h-0.5 bg-zinc-800 -rotate-45" />
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
                        className="min-h-24 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-center cursor-pointer hover:border-teal-950 transition-all select-none"
                      >
                        <p className={`text-xs font-bold ${isFlipped ? 'text-teal-400 font-normal italic' : 'text-white'}`}>
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
                                    ? 'bg-teal-955/40 text-teal-400 border-teal-950 font-semibold glow-teal'
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
                      className="py-2 px-5 bg-gradient-to-r from-teal-700 to-emerald-500 hover:from-teal-650 hover:to-emerald-400 rounded text-xs font-bold text-white transition-all glow-teal disabled:opacity-50 cursor-pointer"
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
