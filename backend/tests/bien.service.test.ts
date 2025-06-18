import { BienService, ForbiddenError } from '../src/services/bien.service';
import { NotFoundError } from '../src/services/profile.service';
import type { NewBien, EditBien } from '@monorepo/shared';

jest.mock('../src/prisma', () => ({
  prisma: {
    profile: { findFirst: jest.fn() },
    bien: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from '../src/prisma';
const mockedPrisma = prisma as unknown as {
  profile: { findFirst: jest.Mock };
  bien: {
    create: jest.Mock;
    findMany: jest.Mock;
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe('BienService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a bien with profileId', async () => {
    mockedPrisma.profile.findFirst.mockResolvedValueOnce({ id: 'p1' });
    mockedPrisma.bien.create.mockResolvedValueOnce({ id: 'b1', profileId: 'p1' });
    await BienService.create('u1', 'p1', { typeBien: 'APT', adresse: 'a' } as NewBien);
    expect(mockedPrisma.bien.create).toHaveBeenCalledWith({ data: { typeBien: 'APT', adresse: 'a', profileId: 'p1' } });
  });

  it('lists biens for profile', async () => {
    mockedPrisma.profile.findFirst.mockResolvedValueOnce({ id: 'p1' });
    mockedPrisma.bien.findMany.mockResolvedValueOnce([]);
    await BienService.list('u1', 'p1');
    expect(mockedPrisma.bien.findMany).toHaveBeenCalledWith({ where: { profileId: 'p1' } });
  });

  it('throws ForbiddenError on update of other profile', async () => {
    mockedPrisma.bien.findFirst.mockResolvedValueOnce(null);
    mockedPrisma.bien.findUnique.mockResolvedValueOnce({ id: 'b1' });
    await expect(
      BienService.update('u1', 'p1', 'b1', { adresse: 'b' } as EditBien),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('throws NotFoundError on update of missing bien', async () => {
    mockedPrisma.bien.findFirst.mockResolvedValueOnce(null);
    mockedPrisma.bien.findUnique.mockResolvedValueOnce(null);
    await expect(
      BienService.update('u1', 'p1', 'b1', { adresse: 'b' } as EditBien),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
