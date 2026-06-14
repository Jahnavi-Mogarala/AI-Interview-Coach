'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/authStore';
import { 
  Users, BarChart2, ShieldAlert, Plus, 
  Settings, FolderPlus, ArrowRight, CheckCircle2 
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  college: string;
  role: string;
  createdAt: string;
}

export default function AdminConsole() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states to upload problem
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [category, setCategory] = useState('DSA');
  const [description, setDescription] = useState('');
  const [testCasesText, setTestCasesText] = useState('[\n  { "input": "[2,7]\\n9", "output": "[0,1]", "isHidden": false }\n]');
  const [templateText, setTemplateText] = useState('{\n  "python": "def solve():\\n    pass",\n  "javascript": "function solve() {\\n\\n}"\n}');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    if (user.role !== 'ADMIN') {
      alert('Access Denied. Admins Only!');
      router.push('/dashboard');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // Fetch stats
        const statsRes = await fetch(`${backendUrl}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch users list
        const usersRes = await fetch(`${backendUrl}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setStudents(usersData);
        }
      } catch (err) {
        console.warn('Admin API not reachable. Loading sandbox mock admin states.');
        setStats({
          studentCount: 142,
          submissionCount: 890,
          interviewCount: 320,
          languagesUsed: ['JavaScript', 'Python', 'C++'],
          successRate: 85
        });
        setStudents([
          { id: 'usr1', name: 'Jahnavi Mogarala', email: 'jahnavi@jajo.ai', college: 'Global Institute of Tech', role: 'STUDENT', createdAt: new Date().toISOString() },
          { id: 'usr2', name: 'Bob Smith', email: 'bob@jajo.ai', college: 'Stanford University', role: 'STUDENT', createdAt: new Date().toISOString() },
          { id: 'admin1', name: 'JAJO Administrator', email: 'admin@jajo.ai', college: 'JAJO AI Head Office', role: 'ADMIN', createdAt: new Date().toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user, token, router]);

  // Create problem solve uploader
  const handleUploadProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      const parsedTest = JSON.parse(testCasesText);
      const parsedTemplate = JSON.parse(templateText);

      const payload = {
        title,
        difficulty,
        category,
        description,
        testCases: parsedTest,
        templateCode: parsedTemplate
      };

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/admin/problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Challenge added successfully!');
        setTitle('');
        setDescription('');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (err: any) {
      alert('Failed: ' + err.message + '. Verify JSON syntax parameters!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500 font-mono animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col pb-12">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 mt-8 space-y-6 flex-grow">
        
        {/* Intro */}
        <div className="border-b border-zinc-900 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-1.5">
              <Settings className="w-6 h-6 text-red-500" />
              <span>JAJO Admin Management Panel</span>
            </h1>
            <p className="text-xs text-zinc-400">Moderates student metrics, audits code runs, and publishes coding challenges</p>
          </div>
          <span className="text-[10px] px-3 py-1 rounded bg-red-950/20 text-red-500 border border-red-950 font-bold font-mono">
            ROOT AUTHENTICATED
          </span>
        </div>

        {/* Global Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { label: 'REGISTERED STUDENTS', val: stats.studentCount, icon: Users },
              { label: 'COMPILED SOLUTIONS', val: stats.submissionCount, icon: BarChart2 },
              { label: 'MOCK INTERVIEWS', val: stats.interviewCount, icon: ShieldAlert },
              { label: 'AVERAGE PASS RATE', val: `${stats.successRate}%`, icon: CheckCircle2 }
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="glass-panel p-4 rounded-xl border border-zinc-900 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-bold text-zinc-500 font-mono mb-1">{s.label}</div>
                    <div className="text-2xl font-black text-white">{s.val}</div>
                  </div>
                  <Icon className="w-5 h-5 text-red-500" />
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Users Auditor List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-zinc-900 space-y-3">
              <h3 className="font-extrabold text-sm text-white">Registered Candidate Directory</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 font-mono">
                      <th className="pb-2">NAME</th>
                      <th className="pb-2">EMAIL</th>
                      <th className="pb-2">COLLEGE / INSTITUTE</th>
                      <th className="pb-2">ROLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-zinc-900/60 hover:bg-zinc-950/40 text-zinc-300">
                        <td className="py-2.5 font-bold text-white">{student.name || 'Student Candidate'}</td>
                        <td className="py-2.5 font-mono">{student.email}</td>
                        <td className="py-2.5 text-zinc-400">{student.college || 'N/A'}</td>
                        <td className="py-2.5">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black ${
                            student.role === 'ADMIN' ? 'bg-red-950/40 text-red-500' : 'bg-zinc-900 text-zinc-500'
                          }`}>
                            {student.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Code problem creation */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-zinc-900 space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center space-x-1">
                <FolderPlus className="w-4.5 h-4.5 text-red-500" />
                <span>Upload New Coding Question</span>
              </h3>

              <form onSubmit={handleUploadProblem} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">CHALLENGE TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reverse Linked List"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">DIFFICULTY</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-2 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600 cursor-pointer"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">CATEGORY</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-2 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600 cursor-pointer"
                    >
                      <option value="DSA">Data Structures</option>
                      <option value="CP">Competitive Coding</option>
                      <option value="SQL">Database / SQL</option>
                      <option value="SYSTEM_DESIGN">System Design</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">PROBLEM DESCRIPTION</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter description markdown..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">TEST CASES JSON</label>
                  <textarea
                    rows={2.5}
                    value={testCasesText}
                    onChange={(e) => setTestCasesText(e.target.value)}
                    className="w-full p-2.5 rounded bg-zinc-900 border border-zinc-850 text-[10px] font-mono text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">TEMPLATE CODE JSON</label>
                  <textarea
                    rows={2.5}
                    value={templateText}
                    onChange={(e) => setTemplateText(e.target.value)}
                    className="w-full p-2.5 rounded bg-zinc-900 border border-zinc-850 text-[10px] font-mono text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded bg-red-800 hover:bg-red-700 text-xs font-bold text-white transition-all glow-red flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Publish Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
