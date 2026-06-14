import { Response } from 'express';
import { prisma } from '../config/db';
import { InMemoryDb } from '../utils/inMemoryDb';
import { AIService } from '../services/ai.service';
import { AuthenticatedRequest } from '../middleware/auth';

export const saveOnboarding = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Not authorized' });
  }

  const {
    name,
    college,
    year,
    degree,
    domainInterest,
    targetRole,
    preferredLanguages,
    dreamCompanies,
    skillLevel
  } = req.body;

  try {
    // Generate AI placement roadmap
    const aiResult = await AIService.generateRoadmap({
      name,
      college,
      year,
      degree,
      domainInterest,
      targetRole,
      preferredLanguages,
      dreamCompanies,
      skillLevel
    });

    let profile;
    try {
      // Update basic user profile
      await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          college,
          year,
          degree,
          domainInterest,
          targetRole,
          preferredLanguages,
          dreamCompanies,
          skillLevel
        }
      });

      // Save Onboarding details
      profile = await prisma.onboardingProfile.upsert({
        where: { userId },
        update: {
          roadmap: JSON.stringify(aiResult.steps),
          weeklyGoals: JSON.stringify(aiResult.weeklyGoals),
          studyPlanner: JSON.stringify(aiResult.studyPlanner)
        },
        create: {
          userId,
          roadmap: JSON.stringify(aiResult.steps),
          weeklyGoals: JSON.stringify(aiResult.weeklyGoals),
          studyPlanner: JSON.stringify(aiResult.studyPlanner)
        }
      });
    } catch (dbError) {
      console.warn('Prisma Onboarding saving failed, falling back to In-Memory store');

      // Update user details in memory
      const user = InMemoryDb.users.find((u) => u.id === userId);
      if (user) {
        user.name = name;
        user.college = college;
        user.year = year;
        user.degree = degree;
        user.domainInterest = domainInterest;
        user.targetRole = targetRole;
        user.preferredLanguages = preferredLanguages;
        user.dreamCompanies = dreamCompanies;
        user.skillLevel = skillLevel;
      }

      profile = {
        userId,
        roadmap: JSON.stringify(aiResult.steps),
        weeklyGoals: JSON.stringify(aiResult.weeklyGoals),
        studyPlanner: JSON.stringify(aiResult.studyPlanner),
        createdAt: new Date()
      };
      InMemoryDb.saveOnboarding(userId, profile);
    }

    return res.status(200).json({
      message: 'Onboarding completed and AI Roadmap created successfully',
      roadmap: aiResult.steps,
      weeklyGoals: aiResult.weeklyGoals,
      studyPlanner: aiResult.studyPlanner
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
