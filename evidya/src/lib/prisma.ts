import { PrismaClient } from '@prisma/client'

// Guard Prisma initialization: only construct PrismaClient when DATABASE_URL is present.
// This prevents server startup failures in demo/MVP mode when no DB is configured.
let client: any = undefined

if (process.env.DATABASE_URL) {
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
  client = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client
} else {
  // No DATABASE_URL: provide a throw-on-use proxy to avoid constructing PrismaClient.
  client = new Proxy({}, {
    get() {
      return () => {
        throw new Error('Prisma client is not initialized because DATABASE_URL is not set.')
      }
    }
  })
}

export const prisma: any = client