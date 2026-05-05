import { PrismaPostgresAdapter } from '@prisma/adapter-ppg'
import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient() {
  const connectionString = getRuntimeConnectionString()

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL or PRISMA_DIRECT_TCP_URL is required to connect to Postgres with Prisma.',
    )
  }

  const adapter = new PrismaPostgresAdapter({ connectionString })

  return new PrismaClient({ adapter })
}

function getRuntimeConnectionString() {
  return (
    process.env.PRISMA_DIRECT_TCP_URL ??
    process.env.DIRECT_URL ??
    process.env.DATABASE_URL
  )
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
