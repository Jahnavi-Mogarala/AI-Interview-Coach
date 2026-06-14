import { Response } from 'express';
import { prisma } from '../config/db';
import { InMemoryDb } from '../utils/inMemoryDb';
import { AuthenticatedRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const getAptitudeTests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let tests;
    try {
      tests = await prisma.aptitudeTest.findMany();
      if (tests.length === 0) {
        tests = InMemoryDb.aptitudeTests;
      }
    } catch {
      tests = InMemoryDb.aptitudeTests;
    }
    return res.status(200).json(tests);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAptitudeTestById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    let test;
    try {
      test = await prisma.aptitudeTest.findUnique({ where: { id } });
      if (!test) {
        test = InMemoryDb.aptitudeTests.find((t) => t.id === id);
      }
    } catch {
      test = InMemoryDb.aptitudeTests.find((t) => t.id === id);
    }

    if (!test) return res.status(404).json({ error: 'Aptitude test not found' });
    return res.status(200).json(test);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const submitAptitudeAttempt = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: testId } = req.params;
  const { answers, timeSpent } = req.body; // answers: { [questionIndex]: "selectedAnswer" }

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    let test;
    try {
      test = await prisma.aptitudeTest.findUnique({ where: { id: testId } });
      if (!test) test = InMemoryDb.aptitudeTests.find((t) => t.id === testId);
    } catch {
      test = InMemoryDb.aptitudeTests.find((t) => t.id === testId);
    }

    if (!test) return res.status(404).json({ error: 'Aptitude test not found' });

    const questionsList = JSON.parse(test.questions || '[]');
    let correctAnswersCount = 0;

    questionsList.forEach((q: any, idx: number) => {
      if (answers && answers[idx] === q.answer) {
        correctAnswersCount++;
      }
    });

    const scorePercent = Math.round((correctAnswersCount / questionsList.length) * 100);

    let attempt;
    try {
      attempt = await prisma.aptitudeAttempt.create({
        data: {
          userId,
          testId,
          score: scorePercent,
          totalQuestions: questionsList.length,
          correctAnswers: correctAnswersCount,
          timeSpent: timeSpent || 0
        }
      });
    } catch {
      attempt = {
        id: uuidv4(),
        userId,
        testId,
        score: scorePercent,
        totalQuestions: questionsList.length,
        correctAnswers: correctAnswersCount,
        timeSpent: timeSpent || 0,
        createdAt: new Date()
      };
      InMemoryDb.aptitudeAttempts.push(attempt);
      InMemoryDb.incrementStreak(userId);
    }

    return res.status(200).json({
      attempt,
      correctCount: correctAnswersCount,
      totalCount: questionsList.length,
      percentage: scorePercent,
      questions: questionsList
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
