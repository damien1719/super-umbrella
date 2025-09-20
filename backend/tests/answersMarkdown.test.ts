import { answersToMdBlocks } from '../src/utils/answersMarkdown';
import type { Question } from '../src/utils/answersMarkdown';

describe('answersToMdBlocks', () => {
  it('returns anchor when table question has anchor enabled', () => {
    const questions: Question[] = [
      {
        id: 'table-1',
        type: 'tableau',
        titre: 'Table ancrée',
        tableau: {
          columns: [],
          rowsGroups: [],
          crInsert: true,
          crTableId: 'T1',
        },
      },
    ];

    const blocks = answersToMdBlocks(questions, {});

    expect(blocks).toEqual(['`[[CR:TBL|id=T1]]`']);
  });

  it('falls back to markdown when table has no anchor', () => {
    const questions: Question[] = [
      {
        id: 'table-2',
        type: 'tableau',
        titre: 'Table sans ancre',
        tableau: {
          columns: [{ id: 'col1', label: 'Col 1', valueType: 'text' }],
          rowsGroups: [
            {
              id: 'group-1',
              title: 'Group',
              rows: [{ id: 'row-1', label: 'Row 1' }],
            },
          ],
        },
      },
    ];

    const answers = {
      'table-2': {
        'row-1': {
          col1: 'Valeur',
        },
      },
    } as const;

    const blocks = answersToMdBlocks(questions, answers);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toContain('**Table sans ancre**');
    expect(blocks[0]).toContain('Valeur');
  });
});
