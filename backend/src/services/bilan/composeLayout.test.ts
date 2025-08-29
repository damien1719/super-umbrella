import { hydrateLayout } from './composeLayout';

describe('hydrateLayout', () => {
  it('replaces section-placeholder with provided section children', () => {
    const layout = {
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Intro', version: 1, detail: 0, format: 0, style: '' }], version: 1, direction: 'ltr', format: '', indent: 0 },
          { type: 'section-placeholder', version: 1, sectionId: 'A', label: 'Section A' },
          { type: 'paragraph', children: [], version: 1, direction: 'ltr', format: '', indent: 0 },
        ],
      },
    } as unknown as { root: any };

    const sections = {
      A: {
        root: {
          type: 'root',
          children: [
            { type: 'paragraph', children: [{ type: 'text', text: 'Hello', version: 1, detail: 0, format: 0, style: '' }], version: 1, direction: 'ltr', format: '', indent: 0 },
          ],
        },
      },
    } as Record<string, { root: any }>;

    const out = hydrateLayout(layout, sections);
    const texts = JSON.stringify(out);
    expect(texts).toContain('Intro');
    expect(texts).toContain('Hello');
    expect(texts).not.toContain('section-placeholder');
  });

  it('keeps a marker when section is missing', () => {
    const layout = {
      root: {
        type: 'root',
        children: [
          { type: 'section-placeholder', version: 1, sectionId: 'X', label: 'Missing' },
        ],
      },
    } as unknown as { root: any };
    const out = hydrateLayout(layout, {});
    const texts = JSON.stringify(out);
    expect(texts).toContain('introuvable');
  });
});

