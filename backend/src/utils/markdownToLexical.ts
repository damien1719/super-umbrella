// Minimal Markdown -> Lexical children converter
// Scope: support AT LEAST headings (#{1..6}) and paragraphs.
// Keep node shapes consistent with existing code in bilan.controller.ts

export function markdownToLexicalChildren(markdown: string): unknown[] {
  if (typeof markdown !== 'string' || markdown.trim() === '') return [];

  const src = markdown.replace(/\r\n?/g, '\n');
  const lines = src.split('\n');

  const out: unknown[] = [];
  let paraBuf: string[] = [];

  const pushParagraph = () => {
    if (paraBuf.length === 0) return;
    const text = paraBuf.join(' ').replace(/\s+/g, ' ').trim();
    paraBuf = [];
    if (!text) return;
    out.push({
      type: 'paragraph',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: [
        { type: 'text', text, detail: 0, format: 0, style: '', version: 1 },
      ],
    });
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Heading: #..###### Title
    const m = line.match(/^\s*(#{1,6})\s+(.+?)\s*$/);
    if (m) {
      pushParagraph();
      const level = Math.min(m[1].length, 6);
      const title = m[2].trim();
      out.push({
        type: 'heading',
        tag: `h${level}`,
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [
          { type: 'text', text: title, detail: 0, format: 0, style: '', version: 1 },
        ],
      });
      continue;
    }

    // Blank line: paragraph separator
    if (line.trim() === '') {
      pushParagraph();
      continue;
    }

    // Accumulate into current paragraph
    paraBuf.push(line.trim());
  }

  pushParagraph();
  return out;
}

