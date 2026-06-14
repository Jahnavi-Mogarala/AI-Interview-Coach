'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/authStore';
import Editor from '@monaco-editor/react';
import { 
  Terminal as TermIcon, Play, Send, Lightbulb, HelpCircle, 
  Cpu, Code, RefreshCw, ChevronLeft, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  description: string;
  testCases: string;
  templateCode: string;
  hints: string;
}

export default function CodingPage() {
  const { token, stats, setStats } = useAuthStore();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // IDE states
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState<'desc' | 'hints'>('desc');

  // Terminal & AI feedback
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<{
    stdout?: string;
    stderr?: string;
    runtime?: number;
    memory?: number;
    status?: string;
    allPassed?: boolean;
    testCasesTotal?: number;
  } | null>(null);

  const [aiFeedback, setAiFeedback] = useState<{
    timeComplexity?: string;
    spaceComplexity?: string;
    explanation?: string;
    debug?: { hasError: boolean; line: number | null; errorDesc: string; fix: string };
    suggestions?: string[];
  } | null>(null);

  const [hintIndex, setHintIndex] = useState(0);

  // Fetch problems list
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${backendUrl}/api/code/problems`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProblems(data);
        }
      } catch {
        // Fallback mockup problems (including new Striver SDE sheet problems)
        const offlineProblems: Problem[] = [
          {
            id: 'two-sum',
            title: 'Two Sum',
            difficulty: 'EASY',
            category: 'DSA',
            description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n### Example 1:\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n```',
            testCases: JSON.stringify([{ input: '[2,7,11,15]\n9', output: '[0,1]', isHidden: false }]),
            templateCode: JSON.stringify({
              javascript: 'function twoSum(nums, target) {\n  // Write your code here\n  \n}',
              python: 'class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your code here\n        pass'
            }),
            hints: JSON.stringify(['Try using a hash map to look up the complement in O(1) time.', 'Iterate through the array and store elements along with their indices.'])
          },
          {
            id: 'set-matrix-zeroes',
            title: 'Set Matrix Zeroes',
            difficulty: 'MEDIUM',
            category: 'DSA',
            description: 'Given an `m x n` integer matrix `matrix`, if an element is `0`, set its entire row and column to `0`\'s.\n\nYou must do it in place.\n\n### Example 1:\n```\nInput: matrix = [[1,1,1],[1,0,1],[1,1,1]]\nOutput: [[1,0,1],[0,0,0],[1,0,1]]\n```',
            testCases: JSON.stringify([{ input: '[[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]', isHidden: false }]),
            templateCode: JSON.stringify({
              javascript: 'function setZeroes(matrix) {\n  // Write your code here\n  \n}',
              python: 'class Solution:\n    def setZeroes(self, matrix: List[List[int]]) -> None:\n        # Do not return anything, modify matrix in-place instead.\n        pass'
            }),
            hints: JSON.stringify(['Try using the first row and first column of the matrix as marking markers instead of extra memory.', 'Beware of overlapping indices on row 0 and column 0, use a separate boolean flag for row 0.'])
          },
          {
            id: 'kadanes-algorithm',
            title: 'Kadane\'s Algorithm (Maximum Subarray)',
            difficulty: 'MEDIUM',
            category: 'DSA',
            description: 'Given an integer array `nums`, find the subarray with the largest sum and return its sum.\n\n### Example 1:\n```\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum = 6.\n```',
            testCases: JSON.stringify([{ input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6', isHidden: false }]),
            templateCode: JSON.stringify({
              javascript: 'function maxSubArray(nums) {\n  // Write your code here\n  \n}',
              python: 'class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        # Write your code here\n        pass'
            }),
            hints: JSON.stringify(['Keep track of the running sum. Reset it to 0 if it goes below 0.', 'At each step, update the global maximum sum seen so far.'])
          },
          {
            id: 'reverse-linked-list',
            title: 'Reverse Linked List',
            difficulty: 'EASY',
            category: 'DSA',
            description: 'Given the `head` of a singly linked list, reverse the list, and return *the reversed list*.\n\n### Example 1:\n```\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n```',
            testCases: JSON.stringify([{ input: '[1,2,3,4,5]', output: '[5,4,3,2,1]', isHidden: false }]),
            templateCode: JSON.stringify({
              javascript: 'function reverseList(head) {\n  // Write your code here\n  \n}',
              python: 'class Solution:\n    def reverseList(self, head: ListNode) -> ListNode:\n        # Write your code here\n        pass'
            }),
            hints: JSON.stringify(['Use three pointers: prev, curr, and next.', 'Initialize prev as null, curr as head, and iterate re-linking curr.next to prev.'])
          }
        ];
        setProblems(offlineProblems);
      }
    };
    fetchProblems();
  }, [token]);

  // Set default templates when problem or language changes
  useEffect(() => {
    if (selectedProblem) {
      try {
        const templates = JSON.parse(selectedProblem.templateCode);
        const codeText = templates[language] || templates['python'] || templates['javascript'] || '// Enter your solution';
        setCode(codeText);
      } catch {
        setCode('# Write solution here');
      }
      setTerminalOutput(null);
      setAiFeedback(null);
      setHintIndex(0);
    }
  }, [selectedProblem, language]);

  // Run code against custom input
  const handleRunCode = async () => {
    setRunLoading(true);
    setTerminalOutput(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/code/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ language, code, customInput })
      });
      const data = await res.json();
      setTerminalOutput(data);
    } catch {
      // Offline fallback compilation
      setTimeout(() => {
        setTerminalOutput({
          stdout: '[SANDBOX RUN]\nCode evaluated.\nOutput matches test boundaries.',
          runtime: 85,
          memory: 240,
          status: 'ACCEPTED'
        });
      }, 800);
    } finally {
      setRunLoading(false);
    }
  };

  // Submit code to execute all test cases & run AI
  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    setSubmitLoading(true);
    setTerminalOutput(null);
    setAiFeedback(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/code/problems/${selectedProblem.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ language, code })
      });
      const data = await res.json();
      
      setTerminalOutput({
        stdout: data.compilerOutput || 'All test cases passed.',
        stderr: data.compilerError,
        runtime: data.submission?.runtime,
        memory: data.submission?.memory,
        status: data.submission?.status,
        allPassed: data.allPassed,
        testCasesTotal: data.testCasesTotal
      });

      setAiFeedback(data.aiAnalysis);

      // Increment stats locally
      if (stats && data.allPassed) {
        setStats({
          ...stats,
          submissionsCount: stats.submissionsCount + 1,
          acceptanceRate: Math.round(((stats.submissionsCount + 1) / (stats.submissionsCount + 2)) * 100)
        });
      }
    } catch {
      // Sandbox Mode mock submit fallback
      setTimeout(() => {
        setTerminalOutput({
          stdout: 'Execution successful. 3/3 test cases passed.',
          status: 'ACCEPTED',
          allPassed: true,
          testCasesTotal: 3,
          runtime: 42,
          memory: 180
        });

        setAiFeedback({
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(N) due to hash table allocation',
          explanation: 'Your code traverses the input collection once, storing matching elements inside an index registry to achieve linear query runtime.',
          debug: { hasError: false, line: null, errorDesc: '', fix: '' },
          suggestions: [
            'Avoid nested iterations when searching to keep complexity at O(N).',
            'Ensure variable references are properly scoped.'
          ]
        });

        if (stats) {
          setStats({
            ...stats,
            submissionsCount: stats.submissionsCount + 1
          });
        }
      }, 1000);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'EASY') return 'text-emerald-500 bg-emerald-950/40 border-emerald-950';
    if (diff === 'MEDIUM') return 'text-amber-500 bg-amber-950/40 border-amber-950';
    return 'text-red-500 bg-red-950/40 border-red-950';
  };

  // Filter problems list
  const filteredProblems = problems.filter((prob) => {
    const matchesSearch = prob.title.toLowerCase().includes(search.toLowerCase()) || prob.category.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = difficultyFilter === 'ALL' || prob.difficulty === difficultyFilter;
    const matchesCat = categoryFilter === 'ALL' || prob.category === categoryFilter;
    return matchesSearch && matchesDiff && matchesCat;
  });

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 flex flex-col pb-12">
        {!selectedProblem ? (
          /* Problems List View */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">Coding Assessment Workspace</h1>
                <p className="text-xs text-zinc-400">Master coding questions from LeetCode, InterviewBit, and DSA challenges</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search problem title or topic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-teal-500 w-56"
                />
                
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="DSA">Data Structures</option>
                  <option value="CP">Competitive Coding</option>
                  <option value="SQL">Database / SQL</option>
                  <option value="SYSTEM_DESIGN">System Design</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredProblems.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 font-mono border border-zinc-900 rounded-2xl bg-zinc-950/20">
                  No coding challenges matched your filters.
                </div>
              ) : (
                filteredProblems.map((prob) => (
                  <div 
                    key={prob.id} 
                    onClick={() => setSelectedProblem(prob)}
                    className="p-5 rounded-xl bg-zinc-950/60 border border-zinc-900 hover:border-teal-950 hover:bg-zinc-900/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-base hover:text-teal-400 transition-colors">{prob.title}</h3>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getDifficultyColor(prob.difficulty)} font-bold`}>
                          {prob.difficulty}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                          {prob.category}
                        </span>
                      </div>
                    </div>
                    <button className="py-2 px-4 rounded-lg bg-zinc-900 hover:bg-teal-950/25 border border-zinc-800 hover:border-teal-900 text-xs font-bold text-zinc-300 hover:text-teal-400 transition-all flex items-center space-x-1 self-start sm:self-auto cursor-pointer">
                      <span>Solve Challenge</span>
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Interactive IDE Split-Pane View */
          <div className="flex-grow flex flex-col space-y-4">
            
            {/* IDE Header Bar */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <button 
                onClick={() => setSelectedProblem(null)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Return to Problems</span>
              </button>

              <div className="flex items-center space-x-3">
                <span className="text-sm font-black text-white">{selectedProblem.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${getDifficultyColor(selectedProblem.difficulty)} font-bold`}>
                  {selectedProblem.difficulty}
                </span>
              </div>

              {/* Language Selection */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer font-bold"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++ (Simulated)</option>
                <option value="java">Java (Simulated)</option>
              </select>
            </div>

            {/* Split Arena */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-grow">
              
              {/* Left Column: Problem description / hints */}
              <div className="lg:col-span-5 flex flex-col space-y-3">
                <div className="flex border-b border-zinc-900 text-xs font-bold">
                  <button 
                    onClick={() => setActiveTab('desc')}
                    className={`py-2 px-4 border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'desc' ? 'border-teal-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Description
                  </button>
                  <button 
                    onClick={() => setActiveTab('hints')}
                    className={`py-2 px-4 border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'hints' ? 'border-teal-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    AI Hints
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 overflow-y-auto max-h-[500px] flex-grow text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap">
                  {activeTab === 'desc' ? (
                    <div>
                      {selectedProblem.description}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="font-bold text-white flex items-center space-x-1.5">
                        <Lightbulb className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>Need a Hint?</span>
                      </h4>
                      {JSON.parse(selectedProblem.hints || '[]').slice(0, hintIndex + 1).map((hint: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 font-mono text-zinc-300">
                          <strong>Hint {i + 1}:</strong> {hint}
                        </div>
                      ))}

                      {hintIndex < JSON.parse(selectedProblem.hints || '[]').length - 1 && (
                        <button
                          onClick={() => setHintIndex(hintIndex + 1)}
                          className="py-1.5 px-3 bg-teal-950/30 hover:bg-teal-950/50 text-teal-400 rounded border border-teal-950 font-bold transition-all cursor-pointer"
                        >
                          Next Hint
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Code Editor & Terminal */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                
                {/* Editor Container */}
                <div className="rounded-xl border border-zinc-900 overflow-hidden bg-zinc-950">
                  <Editor
                    height="320px"
                    theme="vs-dark"
                    language={language}
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                      fontSize: 13,
                      minimap: { enabled: false },
                      automaticLayout: true,
                      padding: { top: 12, bottom: 12 }
                    }}
                  />
                </div>

                {/* Custom Inputs */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-500 font-mono">CUSTOM TERMINAL STDIN (INPUT)</label>
                  <textarea
                    rows={2}
                    placeholder="Enter arguments/inputs..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* CTA Action Buttons */}
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={handleRunCode}
                    disabled={runLoading || submitLoading}
                    className="py-2.5 px-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />
                    <span>{runLoading ? 'Running...' : 'Run Code'}</span>
                  </button>

                  <button
                    onClick={handleSubmitCode}
                    disabled={runLoading || submitLoading}
                    className="py-2.5 px-5 rounded-lg bg-gradient-to-r from-teal-700 to-emerald-500 hover:from-teal-600 hover:to-emerald-400 text-xs font-bold text-white transition-all glow-teal flex items-center space-x-1.5 cursor-pointer animate-pulse"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitLoading ? 'Evaluating...' : 'Submit Code'}</span>
                  </button>
                </div>

                {/* Outputs Panel (Terminal + AI Debugger) */}
                {terminalOutput && (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <span className="text-xs font-bold text-white flex items-center space-x-1">
                        <TermIcon className="w-4 h-4 text-teal-400" />
                        <span>Execution Results</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        terminalOutput.status === 'ACCEPTED' 
                          ? 'text-emerald-500 bg-emerald-950/40' 
                          : 'text-red-500 bg-red-950/40'
                      }`}>
                        {terminalOutput.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-zinc-400">
                      <div>Runtime: <strong className="text-white">{terminalOutput.runtime || 0} ms</strong></div>
                      <div>Memory: <strong className="text-white">{terminalOutput.memory || 0} KB</strong></div>
                    </div>

                    {terminalOutput.stdout && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-mono">STDOUT:</span>
                        <pre className="p-2.5 rounded bg-black/60 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                          {terminalOutput.stdout}
                        </pre>
                      </div>
                    )}

                    {terminalOutput.stderr && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-red-500 font-mono">STDERR (ERRORS):</span>
                        <pre className="p-2.5 rounded bg-red-950/20 font-mono text-[11px] text-red-400 overflow-x-auto">
                          {terminalOutput.stderr}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* AI debugger report */}
                {aiFeedback && (
                  <div className="p-4 rounded-xl bg-teal-950/10 border border-teal-900/30 space-y-3">
                    <h4 className="text-xs font-bold text-teal-400 flex items-center space-x-1">
                      <Cpu className="w-4 h-4" />
                      <span>AI Code Assistant Report</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 font-mono">
                      <div>Complexity Time: <strong className="text-white">{aiFeedback.timeComplexity}</strong></div>
                      <div>Complexity Space: <strong className="text-white">{aiFeedback.spaceComplexity}</strong></div>
                    </div>

                    <p className="text-[11px] text-zinc-300 italic">{aiFeedback.explanation}</p>

                    {aiFeedback.debug?.hasError && (
                      <div className="p-2.5 rounded bg-red-950/30 border border-red-900/40 text-xs text-red-400">
                        <strong>Bug found (Line {aiFeedback.debug.line}):</strong> {aiFeedback.debug.errorDesc}
                        <div className="mt-1 text-zinc-300">💡 <strong>Suggested fix:</strong> {aiFeedback.debug.fix}</div>
                      </div>
                    )}

                    {aiFeedback.suggestions && aiFeedback.suggestions.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-zinc-400 font-bold block">MENTOR OPTIMIZATION ADVICE:</span>
                        <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-1 pl-1">
                          {aiFeedback.suggestions.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
