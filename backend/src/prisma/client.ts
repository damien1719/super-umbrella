class PrismaClient {
  article = {
    create: async (...args: unknown[]) => {
      void args;
      return {};
    },
    findMany: async () => [],
    findUnique: async (...args: unknown[]) => {
      void args;
      return null;
    },
    update: async (...args: unknown[]) => {
      void args;
      return {};
    },
    delete: async (...args: unknown[]) => {
      void args;
      return {};
    },
  };

  async $disconnect() {
    return Promise.resolve();
  }
}

export const prisma = new PrismaClient();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
