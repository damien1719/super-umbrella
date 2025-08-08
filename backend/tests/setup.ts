import '@prisma/client';
jest.mock('@prisma/client');

jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn(),
  jwtVerify: jest.fn(),
}), { virtual: true });

jest.mock(
  'openai',
  () => ({
    __esModule: true,
    default: class {},
  }),
  { virtual: true }
);
