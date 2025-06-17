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
      findMany: () => unknown;
      findUnique: (args: unknown) => unknown;
      update: (args: unknown) => unknown;
      delete: (args: unknown) => unknown;
    };
  }
}
