import { PrismaClient } from "@/lib/generated/prisma/client"

/**
 * Prisma client singleton for server runtime.
 *
 * Reuses the client in development to avoid exhaustively opening connections
 * during hot reloads.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

