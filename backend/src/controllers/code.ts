import { Response } from 'express';
import { prisma } from '../config/db';
import { InMemoryDb } from '../utils/inMemoryDb';
import { CompilerService } from '../services/compiler.service';
import { AIService } from '../services/ai.service';
import { AuthenticatedRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

// List all problems
export const getProblems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let problems;
    try {
      problems = await prisma.codingProblem.findMany();
      if (problems.length === 0) {
        problems = InMemoryDb.codingProblems;
      }
    } catch {
      problems = InMemoryDb.codingProblems;
    }
    return res.status(200).json(problems);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get single problem by ID
export const getProblemById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    let problem;
    try {
      problem = await prisma.codingProblem.findUnique({ where: { id } });
      if (!problem) {
        problem = InMemoryDb.codingProblems.find((p) => p.id === id);
      }
    } catch {
      problem = InMemoryDb.codingProblems.find((p) => p.id === id);
    }

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    return res.status(200).json(problem);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Run custom input code execution
export const runCode = async (req: AuthenticatedRequest, res: Response) => {
  const { language, code, customInput } = req.body;
  if (!language || !code) {
    return res.status(400).json({ error: 'Language and code are required' });
  }

  try {
    const runResult = await CompilerService.runCode(language, code, customInput);
    return res.status(200).json(runResult);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Submit code solution
export const submitSolution = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: problemId } = req.params;
  const { language, code } = req.body;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!language || !code) return res.status(400).json({ error: 'Language and code are required' });

  try {
    // 1. Fetch problem
    let problem;
    try {
      problem = await prisma.codingProblem.findUnique({ where: { id: problemId } });
      if (!problem) problem = InMemoryDb.codingProblems.find((p) => p.id === problemId);
    } catch {
      problem = InMemoryDb.codingProblems.find((p) => p.id === problemId);
    }

    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // 2. Validate test cases
    const tests = JSON.parse(problem.testCases || '[]');
    let allPassed = true;
    let failedTestIndex = -1;
    let compilerOutput = '';
    let compilerError = '';
    let runtimeSum = 0;
    let memorySum = 0;

    // Run tests
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const result = await CompilerService.runCode(language, code, test.input);
      runtimeSum += result.runtime;
      memorySum += result.memory;

      // Basic assertion (ignores whitespace and brackets format)
      const cleanActual = result.stdout.trim().replace(/\s+/g, '');
      const cleanExpected = test.output.trim().replace(/\s+/g, '');

      if (result.status !== 'ACCEPTED' || cleanActual !== cleanExpected) {
        allPassed = false;
        failedTestIndex = i;
        compilerOutput = result.stdout;
        compilerError = result.stderr || 'Output mismatch';
        break;
      }
    }

    const avgRuntime = runtimeSum / tests.length;
    const avgMemory = memorySum / tests.length;
    const status = allPassed ? 'ACCEPTED' : (compilerError.includes('Time') ? 'TIME_LIMIT_EXCEEDED' : 'WRONG_ANSWER');

    // 3. Trigger AI code evaluation for complexity and breakdown
    const aiAnalysis = await AIService.analyzeCode(
      problem.title,
      problem.description,
      code,
      language
    );

    // 4. Save to db
    const score = allPassed ? (problem.difficulty === 'HARD' ? 100 : problem.difficulty === 'MEDIUM' ? 70 : 40) : 10;
    
    let submission;
    try {
      submission = await prisma.submission.create({
        data: {
          userId,
          problemId,
          language,
          code,
          status: status as any,
          runtime: avgRuntime,
          memory: avgMemory,
          complexityAnalysis: JSON.stringify({
            timeComplexity: aiAnalysis.timeComplexity,
            spaceComplexity: aiAnalysis.spaceComplexity
          }),
          explanation: aiAnalysis.explanation,
          score
        }
      });
    } catch (dbError) {
      console.warn('Prisma solution saving failed, writing to In-Memory');
      submission = {
        id: uuidv4(),
        userId,
        problemId,
        language,
        code,
        status,
        runtime: avgRuntime,
        memory: avgMemory,
        complexityAnalysis: JSON.stringify({
          timeComplexity: aiAnalysis.timeComplexity,
          spaceComplexity: aiAnalysis.spaceComplexity
        }),
        explanation: aiAnalysis.explanation,
        score,
        createdAt: new Date()
      };
      InMemoryDb.submissions.push(submission);
      InMemoryDb.incrementStreak(userId);
    }

    // 5. Build response packet
    return res.status(200).json({
      submission,
      testCasesTotal: tests.length,
      allPassed,
      failedTestIndex,
      compilerOutput,
      compilerError,
      aiAnalysis
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Help & Explanations API
export const getAIExplanation = async (req: AuthenticatedRequest, res: Response) => {
  const { code, language, problemTitle, problemDesc } = req.body;
  try {
    const analysis = await AIService.analyzeCode(
      problemTitle || 'Coding Practice',
      problemDesc || '',
      code,
      language
    );
    return res.status(200).json(analysis);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
