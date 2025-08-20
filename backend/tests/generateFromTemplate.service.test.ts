import { generateFromTemplate } from '../src/services/ai/generateFromTemplate.service';
import { SectionTemplateService } from '../src/services/sectionTemplate.service';
import { prisma } from '../src/prisma';

jest.mock('../src/services/sectionTemplate.service');
jest.mock('../src/services/ai/providers/openai.provider', () => ({
  openaiProvider: { chat: jest.fn().mockResolvedValue('{"llmSlot":"from-llm"}') },
}));
jest.mock('../src/prisma', () => ({
  prisma: { bilanSectionInstance: { update: jest.fn(), findUnique: jest.fn() } },
}));

describe('generateFromTemplate', () => {
  test('computes computed slots and persists', async () => {
    (SectionTemplateService.get as jest.Mock).mockResolvedValue({
      id: 'tpl1',
      version: 1,
      content: [
        { type: 'text', value: 'Hello ' },
        { type: 'slot', id: 'computedSlot' },
        { type: 'slot', id: 'llmSlot' },
      ],
      slotsSpec: {
        computedSlot: { mode: 'computed', type: 'text', pattern: '{first} {last}', deps: ['first', 'last'] },
        llmSlot: { mode: 'llm', type: 'text' },
      },
    });

    await generateFromTemplate('tpl1', { first: 'John', last: 'Doe' }, { instanceId: 'inst1' });

    const update = ((prisma as any).bilanSectionInstance.update as jest.Mock).mock.calls[0][0];
    expect(update.where).toEqual({ id: 'inst1' });
    expect(update.data.generatedContent.slots).toMatchObject({
      computedSlot: 'John Doe',
      llmSlot: 'from-llm',
    });
  });
});
