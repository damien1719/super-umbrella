jest.mock('../src/prisma', () => {
  const profile = { findUnique: jest.fn() };
  const bilanType = { create: jest.fn() };
  const bilanTypeSection = { create: jest.fn() };
  return { prisma: { profile, bilanType, bilanTypeSection } };
});

import { prisma } from '../src/prisma';
import { BilanTypeService } from '../src/services/bilanType.service';

const db: any = prisma;

describe('BilanTypeService.create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates bilan type and related sections', async () => {
    db.profile.findUnique.mockResolvedValueOnce({ id: 'p1' });
    db.bilanType.create.mockResolvedValueOnce({ id: 'bt1', name: 'BT' });

    const sections = [
      { sectionId: 's1', sortOrder: 0 },
      { sectionId: 's2', sortOrder: 1 },
    ];

    await BilanTypeService.create('user1', { name: 'BT', sections });

    expect(db.bilanType.create).toHaveBeenCalled();
    expect(db.bilanTypeSection.create).toHaveBeenCalledTimes(2);
    expect(db.bilanTypeSection.create).toHaveBeenCalledWith({
      data: { bilanTypeId: 'bt1', sectionId: 's1', sortOrder: 0 },
    });
  });
});
