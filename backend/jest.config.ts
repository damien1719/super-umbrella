import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/__mocks__/@prisma/client.js',
  },
};

export default config;
