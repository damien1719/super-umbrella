import '@prisma/client';
jest.mock('@prisma/client');
jest.mock('../src/middlewares/requireAuth', () => ({
  requireAuth: (req: { user?: { id: string } }, _res: unknown, next: () => void) => {
    req.user = { id: 'demo-user' };
    next();
  },
}));
