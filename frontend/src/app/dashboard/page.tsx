'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/authStore';
import { 
  Award, Flame, TrendingUp, AlertTriangle, Calendar, FileCheck, 
  Grid, Trophy, Lightbulb, Compass, BarChart2, CheckSquare, Target, Sparkles, Building
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, stats, token, setStats } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Local state for goals checklist
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${backendUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.warn('Could not fetch server stats, running in sandbox store mode:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, token, setStats, router]);

  // Pre-calculated or mock stats for widgets
  const readinessScore = stats?.acceptanceRate !== undefined ? Math.min(stats.acceptanceRate + 45, 95) : 78;
  const placementProbability = Math.min(readinessScore + 5, 99);
  const totalSolved = stats?.submissionsCount || 12;
  const streakDays = stats?.streak?.currentStreak || 3;
  const resumeStrength = user?.targetRole ? 85 : 0;
  
  // Weekly goals derived from onboarding profile
  const rawGoals = stats?.onboarding?.weeklyGoals 
    ? JSON.parse(stats.onboarding.weeklyGoals) 
    : [
        "Solve 5 Arrays & Strings problems",
        "Record 1 HR Mock Interview session",
        "Refactor project descriptions in resume",
        "Revise Quant time & speed formulas"
      ];

  const handleToggleGoal = (goal: string) => {
    if (completedGoals.includes(goal)) {
      setCompletedGoals(completedGoals.filter((g) => g !== goal));
    } else {
      setCompletedGoals([...completedGoals, goal]);
    }
  };

  // 15 grid widgets details
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500 font-mono animate-pulse">Synchronizing dashboard grid...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col pb-12">
      <Navbar />

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 space-y-6 flex-grow">
        
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-950/20 to-zinc-950 p-6 rounded-2xl border border-zinc-900">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-2">
              <span>Welcome back, {user?.name || 'Candidate'}</span>
              <Sparkles className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Target Role: <span className="text-red-400 font-semibold">{user?.targetRole || 'Not Set'}</span> at {user?.dreamCompanies?.join(', ') || 'Dream Companies'}
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800 self-start md:self-auto">
            <span className="text-xs font-mono text-zinc-500">PREPARATION STATUS:</span>
            <span className="text-xs font-black text-red-500 glow-red-text">ACTIVE ROADMAP</span>
          </div>
        </div>

        {/* 15 WIDGETS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Widget 1: Placement Readiness Score (Gauge) */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Readiness Score</span>
              <Award className="w-4 h-4 text-red-500" />
            </div>
            <div className="my-4 flex items-center justify-center relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#1f1f23" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="48" cy="48" r="40" stroke="#9b1c1c" strokeWidth="8" fill="transparent" 
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * readinessScore) / 100}
                />
              </svg>
              <div className="absolute font-black text-xl text-white">{readinessScore}</div>
            </div>
            <p className="text-[10px] text-zinc-500 text-center">AI generated score based on active performance</p>
          </div>

          {/* Widget 2: DSA Progress Graph */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between col-span-1 md:col-span-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">DSA Progress Curve</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="h-24 flex items-end justify-between space-x-1.5 pt-4">
              {[15, 22, 10, 32, 28, 45, 38, 55, totalSolved].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-red-900 to-red-600 rounded-t"
                    style={{ height: `${Math.min(val * 1.5, 80)}px` }}
                  />
                  <span className="text-[9px] font-mono text-zinc-600 mt-1">W{idx + 1}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-2 border-t border-zinc-900">
              <span>Total Problems Solved: <strong>{totalSolved}</strong></span>
              <span>Target: 250</span>
            </div>
          </div>

          {/* Widget 3: Daily Streak */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Daily Activity Streak</span>
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            </div>
            <div className="py-2 text-center">
              <div className="text-4xl font-black text-orange-500 glow-red-text animate-pulse">{streakDays}</div>
              <p className="text-xs font-bold text-white mt-1">Active Days</p>
            </div>
            <p className="text-[10px] text-zinc-500 text-center">Practice every day to keep your ranking up!</p>
          </div>

          {/* Widget 4: Weak Topics Analysis */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Weak Topics Warning</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="space-y-2.5 my-3">
              {[
                { name: 'Dynamic Programming', score: 32 },
                { name: 'Graph Traversals', score: 45 },
                { name: 'Tree BST recursion', score: 50 }
              ].map((topic, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-medium">
                    <span className="text-zinc-300">{topic.name}</span>
                    <span className="text-red-500">{topic.score}% score</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 rounded-full">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: `${topic.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-zinc-600">AI advises picking easy DP questions to build logic</p>
          </div>

          {/* Widget 5: Upcoming Mock Interviews */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Mock Assessments</span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="space-y-2 my-2">
              <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800 text-[11px]">
                <div className="font-semibold text-white">Google DSA Assessment</div>
                <div className="text-zinc-500">Today, 06:00 PM</div>
              </div>
              <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800 text-[11px]">
                <div className="font-semibold text-white">HR Behavioral Audit</div>
                <div className="text-zinc-500">Tomorrow, 02:30 PM</div>
              </div>
            </div>
            <button 
              onClick={() => router.push('/mock-interview')}
              className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[10px] font-bold text-zinc-300 cursor-pointer"
            >
              Start Practice Session
            </button>
          </div>

          {/* Widget 6: Resume Strength Score */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">ATS Resume rating</span>
              <FileCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="py-2 text-center">
              <div className="text-3xl font-black text-emerald-500">{resumeStrength}%</div>
              <p className="text-[10px] text-zinc-400 mt-1">ATS Optimization Grade</p>
            </div>
            <button 
              onClick={() => router.push('/resume-analyzer')}
              className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[10px] font-bold text-zinc-300 cursor-pointer"
            >
              Audit Resume File
            </button>
          </div>

          {/* Widget 7: Coding Activity Heatmap */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between col-span-1 md:col-span-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Weekly Coding Activity Grid</span>
              <Grid className="w-4 h-4 text-zinc-600" />
            </div>
            <div className="grid grid-cols-7 gap-1.5 my-3">
              {Array.from({ length: 28 }).map((_, idx) => {
                const colors = ['bg-zinc-900', 'bg-red-950/60', 'bg-red-900/80', 'bg-red-700', 'bg-red-500'];
                // Seed activity randomly or map first few items as done
                const activityVal = idx < totalSolved ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2);
                return (
                  <div 
                    key={idx} 
                    className={`aspect-square rounded ${colors[activityVal]} border border-white/5`}
                    title={`Day ${idx + 1}: Submissions active`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
              <span>Less</span>
              <div className="flex space-x-1">
                <span className="w-2.5 h-2.5 bg-zinc-900 rounded inline-block" />
                <span className="w-2.5 h-2.5 bg-red-950 rounded inline-block" />
                <span className="w-2.5 h-2.5 bg-red-900 rounded inline-block" />
                <span className="w-2.5 h-2.5 bg-red-500 rounded inline-block" />
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Widget 8: Contest Ranking */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Mock Contest Ranking</span>
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-white">#142</div>
              <p className="text-[10px] text-zinc-400">Global Student Leaderboard</p>
            </div>
            <div className="text-[9px] text-zinc-500">Percentile: top 8.2% candidate</div>
          </div>

          {/* Widget 9: AI Suggestions Card */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Mentor AI Suggestion</span>
              <Lightbulb className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-xs text-zinc-300 italic my-3 leading-relaxed">
              "You solve Arrays quickly, but hesitate on Tree Recursion. Complete binary tree listings in Java to boost confidence."
            </p>
            <span className="text-[9px] text-zinc-600">Updated 5m ago based on code run logs</span>
          </div>

          {/* Widget 10: Placement Probability Predictor */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Placement Probability</span>
              <Compass className="w-4 h-4 text-purple-500" />
            </div>
            <div className="py-2 text-center">
              <div className="text-4xl font-extrabold text-red-500 glow-red-text">{placementProbability}%</div>
              <p className="text-[10px] text-zinc-400 mt-1">Chance of successful placement</p>
            </div>
            <p className="text-[9px] text-zinc-600 text-center">Calculated for dream company target listings</p>
          </div>

          {/* Widget 11: Skill Radar Graph (SVG) */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between col-span-1 md:col-span-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Candidate Skill Radar</span>
              <BarChart2 className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex justify-center my-3 relative">
              {/* Custom SVG Radar */}
              <svg className="w-36 h-36" viewBox="0 0 100 100">
                {/* Background grids */}
                <polygon points="50,10 90,40 75,85 25,85 10,40" fill="none" stroke="#27272a" strokeWidth="1" />
                <polygon points="50,25 80,47 68,80 32,80 20,47" fill="none" stroke="#27272a" strokeWidth="1" />
                {/* Axes lines */}
                <line x1="50" y1="50" x2="50" y2="10" stroke="#27272a" strokeWidth="0.8" />
                <line x1="50" y1="50" x2="90" y2="40" stroke="#27272a" strokeWidth="0.8" />
                <line x1="50" y1="50" x2="75" y2="85" stroke="#27272a" strokeWidth="0.8" />
                <line x1="50" y1="50" x2="25" y2="85" stroke="#27272a" strokeWidth="0.8" />
                <line x1="50" y1="50" x2="10" y2="40" stroke="#27272a" strokeWidth="0.8" />
                {/* Candidate Skill Polygon */}
                <polygon points="50,20 85,42 68,75 35,70 18,43" fill="rgba(155, 28, 28, 0.4)" stroke="#9b1c1c" strokeWidth="1.5" />
              </svg>
              {/* Radar labels */}
              <span className="absolute top-0 text-[8px] text-zinc-500 font-mono">DSA (80)</span>
              <span className="absolute top-[40%] right-0 text-[8px] text-zinc-500 font-mono">System Design (70)</span>
              <span className="absolute bottom-0 right-4 text-[8px] text-zinc-500 font-mono">HR Mock (85)</span>
              <span className="absolute bottom-0 left-4 text-[8px] text-zinc-500 font-mono">Aptitude (60)</span>
              <span className="absolute top-[40%] left-0 text-[8px] text-zinc-500 font-mono">Web Dev (75)</span>
            </div>
            <p className="text-[9px] text-zinc-500 text-center">Skill profile coordinates are balanced</p>
          </div>

          {/* Widget 12: Weekly Study Plan */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Weekly Study Plan</span>
              <CheckSquare className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="space-y-2 my-3 max-h-32 overflow-y-auto pr-1">
              {rawGoals.map((goal: string, idx: number) => {
                const isChecked = completedGoals.includes(goal);
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleToggleGoal(goal)}
                    className="flex items-start space-x-2 p-1.5 rounded bg-zinc-900/40 border border-zinc-900 hover:bg-zinc-900 cursor-pointer transition-colors"
                  >
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      readOnly
                      className="mt-0.5 rounded border-zinc-750 text-red-600 focus:ring-red-600 cursor-pointer" 
                    />
                    <span className={`text-[10px] leading-tight ${isChecked ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                      {goal}
                    </span>
                  </div>
                );
              })}
            </div>
            <span className="text-[9px] text-zinc-600 text-right">
              {completedGoals.length}/{rawGoals.length} completed
            </span>
          </div>

          {/* Widget 13: Goal Tracker */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Daily Goal Tracker</span>
              <Target className="w-4 h-4 text-red-500" />
            </div>
            <div className="py-2">
              <div className="flex justify-between text-[11px] text-zinc-400 font-bold mb-1">
                <span>Code Challenges</span>
                <span>{stats?.submissionsCount || 0} / 3 Daily</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-red-800 to-red-500 rounded-full" 
                  style={{ width: `${Math.min(((stats?.submissionsCount || 0) / 3) * 100, 100)}%` }} 
                />
              </div>
            </div>
            <p className="text-[9px] text-zinc-600">Submit 3 correct code testcases daily to maintain streak</p>
          </div>

          {/* Widget 14: Domain Progress */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Domain Learning Progress</span>
              <Compass className="w-4 h-4 text-red-500" />
            </div>
            <div className="my-2">
              <div className="text-lg font-black text-white">Full Stack Engineering</div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Syllabus Covered: 42%</p>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full mt-2">
                <div className="h-full bg-red-600 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>
            <span className="text-[9px] text-zinc-600">Current node: Express WebSockets</span>
          </div>

          {/* Widget 15: Company Preparation Tracker */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400">Company Preparedness</span>
              <Building className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="space-y-1.5 my-2">
              {['Google', 'Microsoft', 'Amazon'].map((comp, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-300 font-medium">{comp}</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-950/40 text-red-500 font-bold border border-red-950/20">
                    {40 + idx * 15}% Ready
                  </span>
                </div>
              ))}
            </div>
            <span className="text-[9px] text-zinc-600">Prep based on previous OA patterns</span>
          </div>

        </div>

        {/* AI Roadmap Milestones Accordion */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 mt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Compass className="w-5 h-5 text-red-500" />
            <h3 className="font-extrabold text-base text-white">Your AI Onboarding Roadmap</h3>
          </div>
          
          <div className="space-y-4">
            {(stats?.onboarding?.roadmap ? JSON.parse(stats.onboarding.roadmap) : [
              { title: "Master Languages Basics", timeframe: "Weeks 1-2", topics: ["Arrays", "Variables", "OOPs"], desc: "Basic collections, memory allocation, complexity analyses." },
              { title: "Data Structures Foundations", timeframe: "Weeks 3-6", topics: ["Stacks", "Queues", "Binary Trees"], desc: "Linked Lists, sorting and binary search exercises." },
              { title: "Company OA Prep", timeframe: "Weeks 7-9", topics: ["DP", "Graphs"], desc: "Solve previous coding contest patterns." }
            ]).map((step: any, idx: number) => (
              <div key={idx} className="flex gap-4 p-3 rounded-xl bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 transition-colors">
                <div className="w-7 h-7 rounded-full bg-red-950/40 border border-red-900 text-red-500 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <h4 className="font-bold text-sm text-white">{step.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono self-start sm:self-auto">
                      {step.timeframe}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{step.desc}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {step.topics?.map((topic: string, i: number) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/20 text-red-400 border border-red-950/40">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
