'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import { Bell, Flame, LogOut, Menu, X, User, Code, FileText, BarChart2, BookOpen, MessageSquare, Briefcase, Award } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, stats, logout } = useAuthStore();
  const { notifications, clearNotifications } = useSocketStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
    { name: 'Coding Practice', path: '/coding', icon: Code },
    { name: 'DSA Learning', path: '/dsa', icon: BookOpen },
    { name: 'Mock Interview', path: '/mock-interview', icon: MessageSquare },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { name: 'Placement Tracker', path: '/tracker', icon: Briefcase },
    { name: 'Aptitude tests', path: '/aptitude', icon: Award },
  ];

  if (!user) return null;

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-zinc-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center glow-red font-black text-white text-lg tracking-wider">
            J
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-red-500 transition-colors">
              JAJO <span className="text-red-600 glow-red-text">AI</span>
            </span>
            <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">Placement Mentor</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-red-950/40 text-red-500 border border-red-900/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Action Widgets */}
        <div className="flex items-center space-x-3">
          {/* Streak Indicator */}
          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-orange-500 animate-pulse">
            <Flame className="w-4 h-4 fill-orange-500" />
            <span className="font-bold text-xs">{stats?.streak?.currentStreak || 1} Days</span>
          </div>

          {/* Real-time Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white relative"
            >
              <Bell className="w-4.5 h-4.5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full glow-red" />
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-4 z-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm text-white">Live notifications</h4>
                  <button onClick={clearNotifications} className="text-xs text-red-500 hover:underline">
                    Clear all
                  </button>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">No recent placement updates.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/40 text-xs">
                        <div className="font-semibold text-white">{notif.title}</div>
                        <div className="text-zinc-400 mt-0.5">{notif.message}</div>
                        <div className="text-[10px] text-zinc-600 mt-1">{new Date(notif.createdAt).toLocaleTimeString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin link */}
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="p-2 rounded-lg bg-red-950/20 border border-red-950 text-red-500 hover:bg-red-950/40 text-xs font-bold"
            >
              Admin Panel
            </Link>
          )}

          {/* Logout Trigger */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-red-950/20 hover:border-red-900/30 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          {/* Mobile Hamburguer */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-zinc-800/60 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-red-950/40 text-red-500' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-950/20 text-left font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}
