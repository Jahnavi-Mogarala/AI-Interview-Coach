import { Router } from 'express';
import multer from 'multer';
import { register, login, getMe, logout, forgotPassword, verifyOtp } from '../controllers/auth';
import { saveOnboarding } from '../controllers/onboarding';
import { getProblems, getProblemById, runCode, submitSolution, getAIExplanation } from '../controllers/code';
import { startInterview, respondToInterview, getInterviewHistory, getInterviewById } from '../controllers/interview';
import { analyzeResume } from '../controllers/resume';
import { getApplications, createApplication, updateApplication, deleteApplication } from '../controllers/tracker';
import { getNotes, createNote, updateNote, deleteNote, getBookmarks, addBookmark, removeBookmark } from '../controllers/notes';
import { getAptitudeTests, getAptitudeTestById, submitAptitudeAttempt } from '../controllers/aptitude';
import { getAllUsers, uploadProblem, getAdminStats } from '../controllers/admin';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', authMiddleware, getMe);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/verify-otp', verifyOtp);

// --- Onboarding ---
router.post('/onboarding', authMiddleware, saveOnboarding);

// --- Code Platform ---
router.get('/code/problems', authMiddleware, getProblems);
router.get('/code/problems/:id', authMiddleware, getProblemById);
router.post('/code/run', authMiddleware, runCode);
router.post('/code/problems/:id/submit', authMiddleware, submitSolution);
router.post('/code/explain', authMiddleware, getAIExplanation);

// --- Mock Interview Platform ---
router.post('/interview/start', authMiddleware, startInterview);
router.post('/interview/:id/message', authMiddleware, respondToInterview);
router.get('/interview/history', authMiddleware, getInterviewHistory);
router.get('/interview/:id', authMiddleware, getInterviewById);

// --- Resume Analyzer ---
router.post('/resume/analyze', authMiddleware, upload.single('resume'), analyzeResume);

// --- Kanban Placement Tracker ---
router.get('/tracker', authMiddleware, getApplications);
router.post('/tracker', authMiddleware, createApplication);
router.put('/tracker/:id', authMiddleware, updateApplication);
router.delete('/tracker/:id', authMiddleware, deleteApplication);

// --- Revision Notes ---
router.get('/notes', authMiddleware, getNotes);
router.post('/notes', authMiddleware, createNote);
router.put('/notes/:id', authMiddleware, updateNote);
router.delete('/notes/:id', authMiddleware, deleteNote);

// --- Bookmarks ---
router.get('/bookmarks', authMiddleware, getBookmarks);
router.post('/bookmarks', authMiddleware, addBookmark);
router.delete('/bookmarks/:id', authMiddleware, removeBookmark);

// --- Aptitude Platform ---
router.get('/aptitude/tests', authMiddleware, getAptitudeTests);
router.get('/aptitude/tests/:id', authMiddleware, getAptitudeTestById);
router.post('/aptitude/tests/:id/submit', authMiddleware, submitAptitudeAttempt);

// --- Admin Panel ---
router.get('/admin/users', authMiddleware, adminMiddleware, getAllUsers);
router.post('/admin/problems', authMiddleware, adminMiddleware, uploadProblem);
router.get('/admin/stats', authMiddleware, adminMiddleware, getAdminStats);

export default router;
