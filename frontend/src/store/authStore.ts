import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  college?: string;
  year?: string;
  degree?: string;
  domainInterest?: string;
  targetRole?: string;
  preferredLanguages?: string[];
  dreamCompanies?: string[];
  skillLevel?: string;
}

interface Stats {
  streak: { currentStreak: number; longestStreak: number };
  onboarding: any;
  submissionsCount: number;
  interviewsCount: number;
  acceptanceRate: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  stats: Stats | null;
  setAuth: (user: User, token: string) => void;
  setStats: (stats: Stats) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Safe window/localStorage access for SSR compatibility in Next.js
  const getInitialToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jajo_token');
    }
    return null;
  };

  const getInitialUser = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jajo_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  };

  return {
    user: getInitialUser(),
    token: getInitialToken(),
    stats: null,
    setAuth: (user, token) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('jajo_token', token);
        localStorage.setItem('jajo_user', JSON.stringify(user));
      }
      set({ user, token });
    },
    setStats: (stats) => set({ stats }),
    updateUser: (updates) => {
      set((state) => {
        if (!state.user) return state;
        const updatedUser = { ...state.user, ...updates };
        if (typeof window !== 'undefined') {
          localStorage.setItem('jajo_user', JSON.stringify(updatedUser));
        }
        return { user: updatedUser };
      });
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jajo_token');
        localStorage.removeItem('jajo_user');
      }
      set({ user: null, token: null, stats: null });
    }
  };
});
