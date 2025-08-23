export type MarkdownChunk = {
  title?: string;
  content: string;
};

function splitByTitles(markdown: string): MarkdownChunk[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const chunks: MarkdownChunk[] = [];
  let currentTitle: string | undefined;
  let buffer: string[] = [];

  const flush = () => {
    const content = buffer.join('\n').trim();
    if (content.length > 0 || currentTitle !== undefined) {
      chunks.push({ title: currentTitle, content });
    }
    buffer = [];
  };

  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      // heading boundary
      flush();
      currentTitle = m[1].trim();
      continue;
    }
    buffer.push(line);
  }
  flush();
  return chunks;
}

function splitLargeContent(content: string, maxChars: number): string[] {
  const normalized = content.trim();
  if (normalized.length <= maxChars) return [normalized];

  const paragraphs = normalized.split(/\n\n+/);
  const result: string[] = [];
  let acc: string[] = [];
  let accLen = 0;

  const pushAcc = () => {
    const s = acc.join('\n\n').trim();
    if (s) result.push(s);
    acc = [];
    accLen = 0;
  };

  for (const p of paragraphs) {
    const pLen = p.length + (acc.length > 0 ? 2 : 0);
    if (accLen + pLen > maxChars && acc.length > 0) {
      pushAcc();
    }
    acc.push(p);
    accLen += pLen;
  }
  pushAcc();
  return result;
}

export function splitMarkdownIntoStringChunks(
  markdown: string,
  { maxChars = 1800 }: { maxChars?: number } = {},
): string[] {
  const blocks = splitByTitles(markdown);
  const out: string[] = [];
  for (const b of blocks) {
    if (!b.title && b.content.trim().length > maxChars) {
      // Large untitled block → hard split by paragraphs
      const parts = splitLargeContent(b.content, maxChars);
      out.push(...parts);
      continue;
    }
    const base = b.title ? `## ${b.title}\n\n` : '';
    const full = `${base}${b.content}`.trim();
    if (full.length <= maxChars) {
      if (full) out.push(full);
    } else {
      const parts = splitLargeContent(b.content, maxChars - base.length);
      for (const p of parts) {
        const s = `${base}${p}`.trim();
        if (s) out.push(s);
      }
    }
  }
  return out;
}

export function splitBlocksIntoStringChunks(
  blocks: string[],
  { maxChars = 1800 }: { maxChars?: number } = {},
): string[] {
  const chunks: string[] = [];
  let acc = '';

  const pushAcc = () => {
    const s = acc.trim();
    if (s) chunks.push(s);
    acc = '';
  };

  for (const block of blocks) {
    const b = (block || '').trim();
    if (!b) continue;

    if (b.length > maxChars) {
      // Force split this very large block by paragraphs, but keep others intact
      const parts = splitLargeContent(b, maxChars);
      for (const p of parts) {
        if (acc.length === 0) acc = p;
        else if (acc.length + 2 + p.length <= maxChars) acc += `\n\n${p}`;
        else {
          pushAcc();
          acc = p;
        }
      }
      continue;
    }

    if (acc.length === 0) acc = b;
    else if (acc.length + 2 + b.length <= maxChars) acc += `\n\n${b}`;
    else {
      pushAcc();
      acc = b;
    }
  }
  pushAcc();
  return chunks;
}
