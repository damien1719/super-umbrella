// src/prisma.ts
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient({
  datasourceUrl: process.env.NODE_ENV === 'production'
      ? process.env.DATABASE_URL_POOL
      : process.env.DATABASE_URL
})
