import { markdownToLexicalChildren } from './markdownToLexical';

export type LexicalEditorState = {
  root: unknown;
  version: number;
};

function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val == null) return [] as T[];
  return [val as T];
}

function ensureTextDefaults(node: any): any {
  if (node?.type !== 'text') return node;
  return {
    ...node,
    detail: node.detail ?? 0,
    format: node.format ?? 0,
    style: node.style ?? '',
    version: node.version ?? 1,
  };
}

function ensureParagraphDefaults(node: any): any {
  if (node?.type !== 'paragraph') return node;
  return {
    ...node,
    direction: node.direction ?? 'ltr',
    format: node.format ?? '',
    indent: node.indent ?? 0,
    version: node.version ?? 1,
    children: toArray<any>(node.children).map(ensureTextDefaults),
  };
}

function wrapInParagraph(child: any): any {
  if (child?.type === 'paragraph') return ensureParagraphDefaults(child);
  if (child?.type === 'text') {
    return ensureParagraphDefaults({
      type: 'paragraph',
      children: [ensureTextDefaults(child)],
    });
  }
  return child;
}

function normalizeChildren(children: any): any[] {
  return toArray<any>(children).map((c) => wrapInParagraph(ensureTextDefaults(c)));
}

function buildLexicalRoot(input: any) {
  const maybeRoot = input?.root ?? input;
  const children = normalizeChildren(maybeRoot?.children ?? maybeRoot);
  return {
    type: 'root',
    direction: maybeRoot?.direction ?? 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children,
  };
}

export function normalizeLexicalEditorState(input: unknown): LexicalEditorState {
  return {
    root: buildLexicalRoot(input),
    version: 1,
  };
}

export function lexicalStateToJSON(state: LexicalEditorState): string {
  return JSON.stringify(state);
}

export function markdownToLexicalState(markdown: string): LexicalEditorState {
  const children = markdownToLexicalChildren(markdown);
  return normalizeLexicalEditorState({
    root: {
      children,
    },
  });
}

