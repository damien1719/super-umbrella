import { _test } from './genPartPlaceholder';

const {
  filterQuestionsByIds,
  extractAnswersSubset,
  hasMeaningfulAnswers,
  applyPlaceholderReplacements,
} = _test;

describe('genPartPlaceholder helpers', () => {
  it('keeps questions ordered by placeholder ids', () => {
    const questions = [
      { id: 'q1', type: 'notes', titre: 'Q1' },
      { id: 'q2', type: 'notes', titre: 'Q2' },
      { id: 'q3', type: 'notes', titre: 'Q3' },
    ];
    const result = filterQuestionsByIds(questions as any, ['q3', 'q1']);
    expect(result.map((q: any) => q.id)).toEqual(['q3', 'q1']);
  });

  it('extracts only relevant answers', () => {
    const notes = { q1: 'value1', q2: 'value2', leftover: 'ignore me' };
    const subset = extractAnswersSubset(['q2', 'missing'], notes);
    expect(subset).toEqual({ q2: 'value2' });
  });

  it('detects meaningful answers including nested structures', () => {
    const notes = {
      empty: '',
      nested: { child: '' },
      list: [{}, { inner: '  ' }],
      target: { child: '  something  ' },
    };
    expect(hasMeaningfulAnswers(['empty', 'nested'], notes)).toBe(false);
    expect(hasMeaningfulAnswers(['list', 'target'], notes)).toBe(true);
  });

  it('replaces placeholder nodes with generated nodes', () => {
    const ast = {
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [], version: 1 },
          {
            type: 'gen-part-placeholder',
            placeholderId: 'ph-1',
            scope: { type: 'questions-list' },
            questionIds: [],
            version: 1,
          },
        ],
      },
    };

    const generatedNodes = [
      {
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        children: [
          { type: 'text', text: 'generated', detail: 0, format: 0, style: '', version: 1 },
        ],
      },
    ];

    const replacements = new Map<string, any[]>([[
      'ph-1',
      generatedNodes,
    ]]);

    const result = applyPlaceholderReplacements(ast, replacements) as { root: { children: any[] } };
    const types = result.root.children.map((node) => node.type);
    expect(types).toContain('paragraph');
    expect(types).not.toContain('gen-part-placeholder');
    expect(result.root.children[result.root.children.length - 1].children[0].text).toBe('generated');
  });

  it('removes placeholder when replacement is empty array', () => {
    const ast = {
      root: {
        type: 'root',
        children: [
          {
            type: 'gen-part-placeholder',
            placeholderId: 'ph-2',
            scope: { type: 'questions-list' },
            questionIds: [],
            version: 1,
          },
        ],
      },
    };

    const replacements = new Map<string, any[]>([['ph-2', []]]);
    const result = applyPlaceholderReplacements(ast, replacements) as { root: { children: any[] } };
    expect(result.root.children).toHaveLength(0);
  });
});
