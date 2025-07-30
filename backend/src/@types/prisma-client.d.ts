declare module '@prisma/client' {
  export class PrismaClient {
    constructor(options?: unknown);
    $disconnect(): Promise<void>;
    article: {
      create: (args: unknown) => unknown;
      findMany: () => unknown;
      findUnique: (args: unknown) => unknown;
      update: (args: unknown) => unknown;
      delete: (args: unknown) => unknown;
    };
    profile: {
      create: (args: unknown) => unknown;
      findMany: (args: unknown) => unknown;
      findFirst: (args: unknown) => unknown;
      findUnique: (args: unknown) => unknown;
      updateMany: (args: unknown) => { count: number };
      deleteMany: (args: unknown) => { count: number };
    };
    user: {
      upsert: (args: unknown) => unknown;
    };
  }
}
