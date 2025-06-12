class PrismaClient {
  constructor() {
    this.article = {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    this.operation = {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    this.activity = {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    this.logement = {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    this.fiscalYear = {
      findUnique: jest.fn(),
    };
    this.immobilisation = {
      findMany: jest.fn(),
    };
    this.composant = {
      findMany: jest.fn(),
    };
    this.$disconnect = jest.fn();
  }
}
module.exports = { PrismaClient };
