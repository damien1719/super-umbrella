jest.mock('../src/prisma', () => {
  const profile = { findUnique: jest.fn() };
  const section = { findFirst: jest.fn(), create: jest.fn() };
  const sectionTemplate = { create: jest.fn() };
  const $transaction = jest.fn((ops: any[]) => Promise.all(ops.map((op) => op)));
  return { prisma: { profile, section, sectionTemplate, $transaction } };
});

import { prisma } from '../src/prisma';
import { SectionService } from '../src/services/section.service';

const db: any = prisma;

describe('SectionService.duplicate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('duplicates a section and clones its template when present', async () => {
    db.profile.findUnique.mockResolvedValueOnce({ id: 'p1', email: 'demo@ex.com' });
    db.section.findFirst.mockResolvedValueOnce({
      id: 's1',
      title: 'Section A',
      kind: 'anamnese',
      job: [],
      description: 'desc',
      schema: { nodes: [] },
      defaultContent: null,
      templateOptions: { bulletStyle: 'dash' },
      isPublic: false,
      version: 1,
      templateRefId: 'tpl-1',
      templateRef: {
        id: 'tpl-1',
        label: 'Template A',
        version: 2,
        content: { foo: 'bar' },
        slotsSpec: [{ id: 'slot1', type: 'text' }],
        genPartsSpec: { a: 1 },
      },
    });

    db.sectionTemplate.create.mockImplementation(async ({ data }: any) => ({ ...data }));
    db.section.create.mockImplementation(async ({ data, include }: any) => ({ id: 's2', ...data, ...(include ? { templateRef: { id: data.templateRefId } } : {}) }));

    const created = await SectionService.duplicate('user1', 's1');

    expect(db.sectionTemplate.create).toHaveBeenCalledTimes(1);
    const createdTplArg = (db.sectionTemplate.create as jest.Mock).mock.calls[0][0].data;
    expect(createdTplArg.label).toBe('Template A - Copie');
    expect(createdTplArg.content).toEqual({ foo: 'bar' });
    expect(createdTplArg.slotsSpec).toEqual([{ id: 'slot1', type: 'text' }]);
    expect(createdTplArg.genPartsSpec).toEqual({ a: 1 });

    expect(db.section.create).toHaveBeenCalledTimes(1);
    const createdSectionArg = (db.section.create as jest.Mock).mock.calls[0][0].data;
    expect(createdSectionArg.title).toBe('Section A - Copie');
    expect(createdSectionArg.templateRefId).toBe(createdTplArg.id);

    expect(created.id).toBe('s2');
    expect(created.templateRefId).toBe(createdTplArg.id);
  });

  it('duplicates a section without cloning template when none is linked', async () => {
    db.profile.findUnique.mockResolvedValueOnce({ id: 'p1' });
    db.section.findFirst.mockResolvedValueOnce({
      id: 's10',
      title: 'Section B',
      kind: 'anamnese',
      job: [],
      description: null,
      schema: null,
      defaultContent: null,
      templateOptions: null,
      isPublic: false,
      version: 1,
      templateRefId: null,
      templateRef: null,
    });

    db.section.create.mockResolvedValueOnce({ id: 's11', templateRefId: null });

    const created = await SectionService.duplicate('user1', 's10');

    expect(db.sectionTemplate.create).not.toHaveBeenCalled();
    expect(db.section.create).toHaveBeenCalledTimes(1);
    const createdSectionArg = (db.section.create as jest.Mock).mock.calls[0][0].data;
    expect(createdSectionArg.title).toBe('Section B - Copie');
    expect(createdSectionArg.templateRefId).toBeNull();
    expect(created.templateRefId).toBeNull();
  });
});

