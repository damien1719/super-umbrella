class PrismaClient {
  constructor() {
    this.article = {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    this.$disconnect = jest.fn();
  }
}
module.exports = { PrismaClient };
