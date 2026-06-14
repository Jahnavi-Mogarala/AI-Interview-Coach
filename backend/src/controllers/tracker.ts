import { Response } from 'express';
import { prisma } from '../config/db';
import { InMemoryDb } from '../utils/inMemoryDb';
import { AuthenticatedRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const getApplications = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    let applications;
    try {
      applications = await prisma.placementApplication.findMany({
        where: { userId },
        orderBy: { lastUpdate: 'desc' }
      });
      if (applications.length === 0) {
        applications = InMemoryDb.applications.filter((a) => a.userId === userId);
      }
    } catch {
      applications = InMemoryDb.applications.filter((a) => a.userId === userId);
    }
    return res.status(200).json(applications);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createApplication = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { company, role, stage, salary, notes } = req.body;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!company || !role) return res.status(400).json({ error: 'Company and Role are required' });

  try {
    let application;
    try {
      application = await prisma.placementApplication.create({
        data: {
          userId,
          company,
          role,
          stage: stage || 'WISHLIST',
          salary: salary || 'TBD',
          notes: notes || ''
        }
      });
    } catch (dbError) {
      console.warn('Prisma create application failed, writing to In-Memory');
      application = {
        id: uuidv4(),
        userId,
        company,
        role,
        stage: stage || 'WISHLIST',
        dateApplied: new Date(),
        lastUpdate: new Date(),
        salary: salary || 'TBD',
        notes: notes || ''
      };
      InMemoryDb.applications.push(application);
    }

    return res.status(201).json(application);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateApplication = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { company, role, stage, salary, notes } = req.body;

  try {
    let application;
    try {
      application = await prisma.placementApplication.update({
        where: { id },
        data: {
          company,
          role,
          stage,
          salary,
          notes,
          lastUpdate: new Date()
        }
      });
    } catch (dbError) {
      console.warn('Prisma update application failed, changing in In-Memory');
      const idx = InMemoryDb.applications.findIndex((a) => a.id === id);
      if (idx !== -1) {
        InMemoryDb.applications[idx] = {
          ...InMemoryDb.applications[idx],
          company: company !== undefined ? company : InMemoryDb.applications[idx].company,
          role: role !== undefined ? role : InMemoryDb.applications[idx].role,
          stage: stage !== undefined ? stage : InMemoryDb.applications[idx].stage,
          salary: salary !== undefined ? salary : InMemoryDb.applications[idx].salary,
          notes: notes !== undefined ? notes : InMemoryDb.applications[idx].notes,
          lastUpdate: new Date()
        };
        application = InMemoryDb.applications[idx];
      }
    }

    if (!application) {
      return res.status(404).json({ error: 'Application record not found' });
    }

    return res.status(200).json(application);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteApplication = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    let deleted = false;
    try {
      await prisma.placementApplication.delete({ where: { id } });
      deleted = true;
    } catch {
      const idx = InMemoryDb.applications.findIndex((a) => a.id === id);
      if (idx !== -1) {
        InMemoryDb.applications.splice(idx, 1);
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ error: 'Application record not found' });
    }

    return res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
