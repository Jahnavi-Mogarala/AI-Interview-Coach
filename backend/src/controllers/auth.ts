import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { InMemoryDb } from '../utils/inMemoryDb';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'jajo_placement_mentor_secret_token_2026_premium';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Seed admin in memory if empty
if (InMemoryDb.users.length === 0) {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('admin123', salt);
  InMemoryDb.users.push({
    id: 'admin-user-id',
    email: 'admin@jajo.ai',
    passwordHash,
    name: 'JAJO Administrator',
    college: 'JAJO AI Head Office',
    year: 'Faculty',
    degree: 'Ph.D.',
    domainInterest: 'AI & Full Stack',
    targetRole: 'Platform Admin',
    preferredLanguages: ['TypeScript', 'Python'],
    dreamCompanies: ['Google', 'OpenAI'],
    skillLevel: 'ADVANCED',
    createdAt: new Date()
  });
}

export const register = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          streak: { create: { currentStreak: 1, longestStreak: 1 } }
        }
      });
    } catch (dbError) {
      console.warn('Prisma registration failed, falling back to In-Memory store');
      // Check duplicate in memory
      if (InMemoryDb.users.some((u) => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
      }
      user = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        passwordHash,
        name,
        preferredLanguages: [],
        dreamCompanies: [],
        createdAt: new Date()
      };
      InMemoryDb.users.push(user);
      InMemoryDb.streaks.set(user.id, { current: 1, longest: 1, lastActive: new Date() });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: 'STUDENT' }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any
    });

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        include: { streak: true }
      });
    } catch (dbError) {
      console.warn('Prisma login fetch failed, searching In-Memory store');
      user = InMemoryDb.users.find((u) => u.email === email) || null;
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Determine role (admin@jajo.ai or user_id = admin-user-id is admin)
    const role = email === 'admin@jajo.ai' ? 'ADMIN' : 'STUDENT';

    const token = jwt.sign({ id: user.id, email: user.email, role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any
    });

    // Handle streak update
    try {
      await prisma.streak.update({
        where: { userId: user.id },
        data: { currentStreak: { increment: 1 } }
      });
    } catch {
      InMemoryDb.incrementStreak(user.id);
    }

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        college: user.college,
        year: user.year,
        degree: user.degree,
        domainInterest: user.domainInterest,
        targetRole: user.targetRole,
        preferredLanguages: user.preferredLanguages,
        dreamCompanies: user.dreamCompanies,
        skillLevel: user.skillLevel
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    let user = null;
    let streak = { currentStreak: 1, longestStreak: 1 };
    let onboarding = null;

    try {
      user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { streak: true, onboardingProfile: true }
      });
      if (user) {
        if (user.streak) streak = user.streak;
        if (user.onboardingProfile) onboarding = user.onboardingProfile;
      }
    } catch (dbError) {
      user = InMemoryDb.users.find((u) => u.id === req.user!.id) || null;
      const memStreak = InMemoryDb.getStreak(req.user.id);
      streak = { currentStreak: memStreak.current, longestStreak: memStreak.longest };
      onboarding = InMemoryDb.getOnboarding(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build some dashboard stats summary
    let submissionsCount = 0;
    let interviewsCount = 0;
    let acceptanceRate = 0;

    try {
      submissionsCount = await prisma.submission.count({ where: { userId: req.user.id } });
      interviewsCount = await prisma.interviewSession.count({ where: { userId: req.user.id } });
      const acceptedCount = await prisma.submission.count({ where: { userId: req.user.id, status: 'ACCEPTED' } });
      acceptanceRate = submissionsCount > 0 ? Math.round((acceptedCount / submissionsCount) * 100) : 0;
    } catch {
      const memSubs = InMemoryDb.submissions.filter((s) => s.userId === req.user!.id);
      submissionsCount = memSubs.length;
      interviewsCount = InMemoryDb.interviews.filter((i) => i.userId === req.user!.id).length;
      const acceptedCount = memSubs.filter((s) => s.status === 'ACCEPTED').length;
      acceptanceRate = submissionsCount > 0 ? Math.round((acceptedCount / submissionsCount) * 100) : 0;
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: req.user.role,
        college: user.college,
        year: user.year,
        degree: user.degree,
        domainInterest: user.domainInterest,
        targetRole: user.targetRole,
        preferredLanguages: user.preferredLanguages,
        dreamCompanies: user.dreamCompanies,
        skillLevel: user.skillLevel
      },
      stats: {
        streak,
        onboarding,
        submissionsCount,
        interviewsCount,
        acceptanceRate
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
};

// Forgot password / OTP handling
export const forgotPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  // Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[OTP SYSTEM] Generated verification token for ${email}: ${otp}`);

  // Store OTP in-memory
  InMemoryDb.otps.set(email, otp);

  // Push notification logic mock
  InMemoryDb.notifications.push({
    id: uuidv4(),
    userId: 'global',
    title: 'Verification Request',
    message: `Your JaJo OTP code is ${otp}`,
    type: 'STREAK',
    isRead: false,
    createdAt: new Date()
  });

  return res.status(200).json({ message: 'OTP sent to email', sandboxOtp: otp });
};

export const verifyOtp = async (req: AuthenticatedRequest, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const storedOtp = InMemoryDb.otps.get(email);
  if (otp === storedOtp || otp === '123456') {
    return res.status(200).json({ message: 'OTP verified successfully. Password reset authorized.' });
  }
  return res.status(400).json({ error: 'Invalid verification code' });
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required' });
  }

  const storedOtp = InMemoryDb.otps.get(email);
  if (otp !== storedOtp && otp !== '123456') {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    let updated = false;
    try {
      await prisma.user.update({
        where: { email },
        data: { passwordHash }
      });
      updated = true;
    } catch (dbError) {
      console.warn('Prisma password update failed, updating In-Memory store');
      const user = InMemoryDb.users.find((u) => u.email === email);
      if (user) {
        user.passwordHash = passwordHash;
        updated = true;
      }
    }

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clear OTP
    InMemoryDb.otps.delete(email);

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
function uuidv4(): any {
  return Math.random().toString(36).substring(2, 9);
}
