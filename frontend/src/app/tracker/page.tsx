'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/authStore';
import { 
  Briefcase, Plus, Calendar, DollarSign, Edit3, 
  Trash2, Sparkles, FolderPlus, ArrowRight, X 
} from 'lucide-react';

interface Application {
  id: string;
  company: string;
  role: string;
  stage: 'WISHLIST' | 'APPLIED' | 'OA' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  salary?: string;
  notes?: string;
  lastUpdate: string;
}

export default function PlacementTracker() {
  const { token } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal control
  const [showAddModal, setShowAddModal] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [stage, setStage] = useState<'WISHLIST' | 'APPLIED' | 'OA' | 'INTERVIEW' | 'OFFER' | 'REJECTED'>('WISHLIST');
  const [salary, setSalary] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch applications list
  const fetchApplications = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/tracker`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch {
      // Offline fallback mockup Kanban list
      const offlineApps: Application[] = [
        { id: 'app1', company: 'Google', role: 'Software Engineer Intern', stage: 'INTERVIEW', salary: '$45/hr', notes: 'Prepare for trees and recursion. Review system designs.', lastUpdate: new Date().toISOString() },
        { id: 'app2', company: 'Amazon', role: 'SDE-1 Graduate', stage: 'APPLIED', salary: '$120k/yr', notes: 'Completed assessment round last Tuesday.', lastUpdate: new Date().toISOString() },
        { id: 'app3', company: 'Microsoft', role: 'Full Stack Engineer', stage: 'WISHLIST', salary: '$135k/yr', notes: 'Applications opening next month.', lastUpdate: new Date().toISOString() }
      ];
      setApplications(offlineApps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token]);

  // Create new application record
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return;

    const payload = { company, role, stage, salary, notes };

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/tracker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchApplications();
        setShowAddModal(false);
        resetForm();
      }
    } catch {
      // Sandbox fallback addition
      const mockNew: Application = {
        id: `app_${Math.random()}`,
        company,
        role,
        stage,
        salary,
        notes,
        lastUpdate: new Date().toISOString()
      };
      setApplications([mockNew, ...applications]);
      setShowAddModal(false);
      resetForm();
    }
  };

  // Update application stage or parameters
  const handleStageChange = async (id: string, newStage: any) => {
    const appToUpdate = applications.find((a) => a.id === id);
    if (!appToUpdate) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/tracker/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stage: newStage })
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch {
      // Sandbox fallback update
      setApplications(
        applications.map((a) => (a.id === id ? { ...a, stage: newStage, lastUpdate: new Date().toISOString() } : a))
      );
    }
  };

  // Delete application record
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this placement record?')) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/tracker/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch {
      setApplications(applications.filter((a) => a.id !== id));
    }
  };

  const resetForm = () => {
    setCompany('');
    setRole('');
    setStage('WISHLIST');
    setSalary('');
    setNotes('');
  };

  // Stage columns
  const columns: { id: Application['stage']; label: string; color: string }[] = [
    { id: 'WISHLIST', label: 'Wishlist', color: 'border-zinc-800 bg-zinc-900/10' },
    { id: 'APPLIED', label: 'Applied', color: 'border-blue-900/40 bg-blue-950/5' },
    { id: 'OA', label: 'Online Test (OA)', color: 'border-amber-900/40 bg-amber-950/5' },
    { id: 'INTERVIEW', label: 'Interviews', color: 'border-purple-900/40 bg-purple-950/5' },
    { id: 'OFFER', label: 'Offers', color: 'border-emerald-900/40 bg-emerald-950/5' },
    { id: 'REJECTED', label: 'Rejected', color: 'border-red-950 bg-red-950/5' }
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 mt-8 space-y-6 flex-grow flex flex-col">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Placement Kanban Board</h1>
            <p className="text-xs text-zinc-400">Track and update application stages throughout technical hiring pipelines</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-xs font-bold text-white transition-all glow-red flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Opportunity</span>
          </button>
        </div>

        {/* Kanban Board Container */}
        {loading ? (
          <p className="text-center text-zinc-500 font-mono py-12">Syncing kanban stages...</p>
        ) : (
          <div className="flex-grow overflow-x-auto pb-4 flex space-x-4 items-stretch min-h-[500px]">
            {columns.map((col) => {
              const colApps = applications.filter((app) => app.stage === col.id);
              return (
                <div 
                  key={col.id}
                  className={`w-72 shrink-0 border rounded-2xl p-4 flex flex-col justify-between ${col.color}`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-900/80">
                      <span className="text-xs font-extrabold text-white">{col.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 font-bold font-mono">
                        {colApps.length}
                      </span>
                    </div>

                    {/* Cards List */}
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {colApps.length === 0 ? (
                        <p className="text-[10px] text-zinc-600 text-center py-8 font-mono">No items here</p>
                      ) : (
                        colApps.map((app) => (
                          <div 
                            key={app.id}
                            className="glass-panel p-3.5 rounded-xl border border-zinc-850 hover:border-red-950 transition-all space-y-3"
                          >
                            <div>
                              <h4 className="font-extrabold text-sm text-white">{app.company}</h4>
                              <p className="text-[11px] text-zinc-400 mt-0.5">{app.role}</p>
                            </div>

                            {app.salary && (
                              <div className="flex items-center space-x-1 text-[10px] text-zinc-400 font-mono">
                                <DollarSign className="w-3 h-3 text-red-500" />
                                <span>{app.salary}</span>
                              </div>
                            )}

                            {app.notes && (
                              <p className="text-[10px] text-zinc-500 leading-normal italic line-clamp-2">
                                "{app.notes}"
                              </p>
                            )}

                            {/* Move and delete actions */}
                            <div className="flex justify-between items-center pt-2 border-t border-zinc-900/60 text-[10px]">
                              {/* Move dropdown */}
                              <select
                                value={app.stage}
                                onChange={(e) => handleStageChange(app.id, e.target.value)}
                                className="bg-zinc-900 text-zinc-400 border border-zinc-800 rounded px-1.5 py-0.5 text-[9px] cursor-pointer"
                              >
                                <option value="WISHLIST">Wishlist</option>
                                <option value="APPLIED">Applied</option>
                                <option value="OA">OA Test</option>
                                <option value="INTERVIEW">Interview</option>
                                <option value="OFFER">Offer</option>
                                <option value="REJECTED">Rejected</option>
                              </select>

                              {/* Delete */}
                              <button 
                                onClick={() => handleDelete(app.id)}
                                className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add opportunity Dialog modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-zinc-800 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
                <h3 className="font-extrabold text-sm text-white">Add Placement Opportunity</h3>
                <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">COMPANY NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">JOB ROLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SDE Intern"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">COLUMN STAGE</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as any)}
                      className="w-full px-2 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600 cursor-pointer"
                    >
                      <option value="WISHLIST">Wishlist</option>
                      <option value="APPLIED">Applied</option>
                      <option value="OA">OA Test</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="OFFER">Offer</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">ANNUAL SALARY / STIPEND</label>
                    <input
                      type="text"
                      placeholder="e.g. $40/hr or $120k"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">AUDIT NOTES</label>
                  <textarea
                    rows={2}
                    placeholder="Add interview updates or syllabus targets..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 mt-2 rounded bg-red-800 hover:bg-red-700 text-xs font-bold text-white transition-all glow-red flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Create Entry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
