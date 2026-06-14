import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });
} catch (e) {
  console.error('Prisma connection initialization error, creating mock wrapper:', e);
  prisma = {} as PrismaClient; // Fallback to avoid breaking loads
}

export { prisma };
