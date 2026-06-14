import { Response } from 'express';
import { prisma } from '../config/db';
import { InMemoryDb } from '../utils/inMemoryDb';
import { AIService } from '../services/ai.service';
import { AuthenticatedRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

// Start interview session
export const startInterview = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { type, mode } = req.body; // type: DSA, HR, SYSTEM_DESIGN etc. mode: TEXT, VOICE, VIDEO

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const openingQuestions: Record<string, string> = {
      DSA: "Hello! Let's begin the technical round. Please design a system or function that detects cycles in a directed graph. Explain your choice of representation and the time complexity.",
      HR: "Welcome! Tell me about yourself, your college degree, and a major engineering challenge you solved in a group project.",
      SYSTEM_DESIGN: "Hi! Let's work on a system design challenge. How would you design a real-time notification service (like Uber or Whatsapp) that guarantees low-latency deliveries?",
      SQL: "Welcome to the database round. Can you write a SQL query to find the second highest salary from an Employee table without using the LIMIT keyword?",
      AI_ML: "Welcome. How would you resolve data leakage issues when training a gradient boosted decision tree model on time-series records?"
    };

    const firstQuestion = openingQuestions[type] || "Welcome! Please describe your technical skillset and preferred programming language to get started.";

    const initialTranscript = [
      { role: 'interviewer', text: firstQuestion, timestamp: new Date().toISOString() }
    ];

    let session;
    try {
      session = await prisma.interviewSession.create({
        data: {
          userId,
          type,
          mode,
          status: 'IN_PROGRESS',
          transcript: JSON.stringify(initialTranscript)
        }
      });
    } catch (dbError) {
      console.warn('Prisma interview start failed, falling back to In-Memory store');
      session = {
        id: uuidv4(),
        userId,
        type,
        mode,
        status: 'IN_PROGRESS',
        transcript: JSON.stringify(initialTranscript),
        scoreConfidence: 0,
        scoreCommunication: 0,
        scoreLogic: 0,
        scoreOptimization: 0,
        feedback: '',
        mistakes: JSON.stringify([]),
        createdAt: new Date()
      };
      InMemoryDb.interviews.push(session);
    }

    return res.status(200).json({
      session,
      firstQuestion
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Send response / process follow-up
export const respondToInterview = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { message, speakingSpeed } = req.body; // speakingSpeed in WPM (from frontend voice processing)

  try {
    // 1. Fetch current session
    let session: any;
    try {
      session = await prisma.interviewSession.findUnique({ where: { id } });
    } catch {
      session = InMemoryDb.interviews.find((i) => i.id === id);
    }

    if (!session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    if (session.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Interview session already completed' });
    }

    // 2. Parse transcript history
    const transcript = JSON.parse(session.transcript || '[]');
    
    // Add user response
    transcript.push({
      role: 'user',
      text: message,
      timestamp: new Date().toISOString()
    });

    // 3. Analyze voice speed and fillers if voice speed is provided
    let voiceFeedbackText = '';
    if (speakingSpeed) {
      const voiceAnalysis = AIService.analyzeHRResponse(message, speakingSpeed);
      voiceFeedbackText = `\n[Speech Coach Feedback: Tone is ${voiceAnalysis.tone}. speaking speed is ${speakingSpeed} WPM: ${voiceAnalysis.speedFeedback} Filler words count: ${voiceAnalysis.fillerCount}]`;
    }

    // 4. Send to AI Evaluator
    const evaluation = await AIService.evaluateInterviewResponse(session.type, transcript, message);

    // Append interviewer's follow-up or closing question
    const nextQuestion = evaluation.isFinished 
      ? "Thank you for completing the interview! I am analyzing your performance metrics now." 
      : evaluation.nextQuestion;

    transcript.push({
      role: 'interviewer',
      text: nextQuestion + (voiceFeedbackText ? ` ${voiceFeedbackText}` : ''),
      timestamp: new Date().toISOString()
    });

    // Update session
    const status = evaluation.isFinished ? 'COMPLETED' : 'IN_PROGRESS';
    const finalFeedback = evaluation.feedback + (voiceFeedbackText ? `\n\nSpeech Coach Audit: ${voiceFeedbackText}` : '');

    let updatedSession;
    try {
      updatedSession = await prisma.interviewSession.update({
        where: { id },
        data: {
          transcript: JSON.stringify(transcript),
          status,
          scoreConfidence: evaluation.scoreConfidence,
          scoreCommunication: evaluation.scoreCommunication,
          scoreLogic: evaluation.scoreLogic,
          scoreOptimization: evaluation.scoreOptimization,
          feedback: finalFeedback,
          mistakes: JSON.stringify(evaluation.mistakes || [])
        }
      });
    } catch (dbError) {
      // In Memory update
      session.transcript = JSON.stringify(transcript);
      session.status = status;
      session.scoreConfidence = evaluation.scoreConfidence;
      session.scoreCommunication = evaluation.scoreCommunication;
      session.scoreLogic = evaluation.scoreLogic;
      session.scoreOptimization = evaluation.scoreOptimization;
      session.feedback = finalFeedback;
      session.mistakes = JSON.stringify(evaluation.mistakes || []);
      updatedSession = session;
    }

    return res.status(200).json({
      session: updatedSession,
      nextQuestion,
      isFinished: evaluation.isFinished,
      evaluation
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Retrieve user's interview history
export const getInterviewHistory = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    let history;
    try {
      history = await prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      if (history.length === 0) {
        history = InMemoryDb.interviews.filter((i) => i.userId === userId);
      }
    } catch {
      history = InMemoryDb.interviews.filter((i) => i.userId === userId);
    }

    return res.status(200).json(history);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Fetch specific interview details
export const getInterviewById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    let session;
    try {
      session = await prisma.interviewSession.findUnique({ where: { id } });
    } catch {
      session = InMemoryDb.interviews.find((i) => i.id === id);
    }

    if (!session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    return res.status(200).json(session);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
