/* eslint-disable @typescript-eslint/no-explicit-any */
import '@prisma/client';

declare module '@prisma/client' {
  interface PrismaClient {
    operation: {
      create: (...args: any[]) => any;
      findMany: (...args: any[]) => any;
      findUnique: (...args: any[]) => any;
      update: (...args: any[]) => any;
      delete: (...args: any[]) => any;
    };
    profile: {
      create: (...args: any[]) => any;
      findMany: (...args: any[]) => any;
      findFirst: (...args: any[]) => any;
      findUnique: (...args: any[]) => any;
      updateMany: (...args: any[]) => { count: number };
      deleteMany: (...args: any[]) => { count: number };
    };
  }
}
