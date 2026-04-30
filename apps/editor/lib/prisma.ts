import { PrismaClient } from '../prisma/generated-client'
import { softDeleteExtension } from './prisma-soft-delete'

const globalForPrisma = global as unknown as { prisma: ReturnType<typeof createPrismaClient> }

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends(softDeleteExtension)
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
