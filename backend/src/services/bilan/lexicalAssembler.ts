import { markdownToLexicalState, normalizeLexicalEditorState, lexicalStateToJSON } from '../../utils/lexicalEditorState';
import type { AnchorSpecification } from '../ai/anchor.service';
import type { Question } from '../../utils/answersMarkdown';
import { TableRenderer } from './tableRenderer';

export type LexicalAssemblerInput = {
  text: string;
  anchors: AnchorSpecification[];
  questions: Question[];
  answers: Record<string, unknown>;
  missingAnchorIds?: string[];
};

export type LexicalAssemblerResult = {
  assembledState: string;
  autoInserted: string[];
};

type LexicalNode = Record<string, unknown> & { children?: LexicalNode[] };

type AnchorContext = {
  anchorsById: Map<string, AnchorSpecification>;
  used: Set<string>;
  questions: Question[];
  answers: Record<string, unknown>;
};

const ANCHOR_LINE_REGEX = /^`\[\[CR:TBL\|id=([^`]+)\]\]`$/;
const INLINE_ANCHOR_PATTERN = '`?\\[\\[CR:TBL\\|id=([^`\\]]+)\\]\\]`?';

type NodeSegment = { kind: 'node'; node: LexicalNode };
type AnchorMatchSegment = { kind: 'anchor'; anchorId: string; marker: string; template: LexicalNode };
type AnchorSegment = NodeSegment | AnchorMatchSegment;

function createInlineAnchorRegExp(): RegExp {
  return new RegExp(INLINE_ANCHOR_PATTERN, 'g');
}

function extractAnchorId(node: LexicalNode): string | null {
  if (node?.type !== 'paragraph') return null;
  const children = Array.isArray(node.children) ? node.children : [];
  if (children.length !== 1) return null;
  const child = children[0];
  if (child?.type !== 'text') return null;
  const text = typeof child.text === 'string' ? child.text.trim() : '';
  const match = text.match(ANCHOR_LINE_REGEX);
  return match ? match[1] : null;
}

function isParagraphNode(node: LexicalNode): boolean {
  return node?.type === 'paragraph';
}

function isHeadingNode(node: LexicalNode): boolean {
  return node?.type === 'heading';
}

function cloneTextNode(template: LexicalNode, text: string): LexicalNode {
  const { children: _children, text: _oldText, ...rest } = template;
  return {
    ...rest,
    text,
  };
}

function cloneBlockNode(template: LexicalNode, children: LexicalNode[]): LexicalNode {
  const { children: _children, ...rest } = template;
  return {
    ...rest,
    children,
  };
}

function trimEdgeWhitespace(nodes: LexicalNode[]): LexicalNode[] {
  if (nodes.length === 0) return nodes;

  const trimmed = nodes.slice();
  let start = 0;
  let end = trimmed.length - 1;

  while (start <= end) {
    const candidate = trimmed[start];
    if (candidate?.type !== 'text' || typeof candidate.text !== 'string') break;
    const newText = candidate.text.replace(/^\s+/, '');
    if (newText.length === 0) {
      start += 1;
      continue;
    }
    if (newText !== candidate.text) {
      trimmed[start] = { ...candidate, text: newText };
    }
    break;
  }

  while (end >= start) {
    const candidate = trimmed[end];
    if (candidate?.type !== 'text' || typeof candidate.text !== 'string') break;
    const newText = candidate.text.replace(/\s+$/, '');
    if (newText.length === 0) {
      end -= 1;
      continue;
    }
    if (newText !== candidate.text) {
      trimmed[end] = { ...candidate, text: newText };
    }
    break;
  }

  return trimmed.slice(start, end + 1);
}

function normalizeHeadingChildren(children: LexicalNode[]): LexicalNode[] {
  if (children.length === 0) {
    return children;
  }
  const textNodes = children.filter(
    (node): node is LexicalNode & { text: string } => node?.type === 'text' && typeof node.text === 'string',
  );
  if (textNodes.length !== children.length || textNodes.length === 0) {
    return children;
  }
  const combined = textNodes
    .map((node) => node.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!combined) {
    return [];
  }
  return [cloneTextNode(textNodes[0], combined)];
}

function splitTextNodeByAnchors(node: LexicalNode): AnchorSegment[] {
  const text = typeof node.text === 'string' ? node.text : '';
  if (!text) {
    return [{ kind: 'node', node }];
  }

  const regex = createInlineAnchorRegExp();
  const segments: AnchorSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = typeof match.index === 'number' ? match.index : 0;
    const marker = match[0];
    if (matchIndex > lastIndex) {
      const prefix = text.slice(lastIndex, matchIndex);
      if (prefix.length > 0) {
        segments.push({ kind: 'node', node: cloneTextNode(node, prefix) });
      }
    }
    const anchorId = match[1];
    if (anchorId) {
      segments.push({ kind: 'anchor', anchorId, marker, template: node });
    }
    lastIndex = matchIndex + marker.length;
  }

  if (lastIndex < text.length) {
    const suffix = text.slice(lastIndex);
    if (suffix.length > 0) {
      segments.push({ kind: 'node', node: cloneTextNode(node, suffix) });
    }
  }

  if (segments.length === 0) {
    return [{ kind: 'node', node }];
  }

  return segments;
}

function collectSegments(children: LexicalNode[] | undefined, ctx: AnchorContext): AnchorSegment[] {
  if (!Array.isArray(children) || children.length === 0) {
    return [];
  }

  const segments: AnchorSegment[] = [];
  for (const child of children) {
    if (!child) continue;
    if (child.type === 'text') {
      segments.push(...splitTextNodeByAnchors(child));
      continue;
    }

    if (Array.isArray(child.children) && child.children.length > 0) {
      const replacedChildren = replaceAnchors(child.children, ctx);
      segments.push({ kind: 'node', node: { ...child, children: replacedChildren } });
      continue;
    }

    segments.push({ kind: 'node', node: child });
  }

  return segments;
}

function buildAnchorReplacement(segment: AnchorMatchSegment, ctx: AnchorContext): {
  inserted: LexicalNode[];
  fallback: LexicalNode | null;
} {
  const anchor = ctx.anchorsById.get(segment.anchorId);
  if (!anchor) {
    return {
      inserted: [],
      fallback: cloneTextNode(segment.template, segment.marker),
    };
  }

  ctx.used.add(segment.anchorId);
  const rendered = TableRenderer.renderLexical({
    anchor,
    questions: ctx.questions,
    answers: ctx.answers,
  });

  if (rendered.length > 0) {
    return {
      inserted: rendered,
      fallback: null,
    };
  }

  return {
    inserted: [],
    fallback: cloneTextNode(segment.template, segment.marker),
  };
}

function processParagraphNode(node: LexicalNode, ctx: AnchorContext): LexicalNode[] {
  const segments = collectSegments(node.children, ctx);
  if (!segments.some((segment) => segment.kind === 'anchor')) {
    const childNodes = segments
      .filter((segment): segment is NodeSegment => segment.kind === 'node')
      .map((segment) => segment.node);
    const normalizedChildren = trimEdgeWhitespace(childNodes);
    return normalizedChildren.length > 0 ? [cloneBlockNode(node, normalizedChildren)] : [];
  }

  const result: LexicalNode[] = [];
  let currentChildren: LexicalNode[] = [];
  let hasInsertedContent = false;

  const pushCurrent = (shouldTrim: boolean) => {
    if (currentChildren.length === 0) return;
    const children = shouldTrim ? trimEdgeWhitespace(currentChildren) : currentChildren.slice();
    if (children.length > 0) {
      result.push(cloneBlockNode(node, children));
    }
    currentChildren = [];
  };

  for (const segment of segments) {
    if (segment.kind === 'node') {
      currentChildren.push(segment.node);
      continue;
    }

    const replacement = buildAnchorReplacement(segment, ctx);
    if (replacement.inserted.length > 0) {
      pushCurrent(true);
      hasInsertedContent = true;
      result.push(...replacement.inserted);
    }
    if (replacement.fallback) {
      currentChildren.push(replacement.fallback);
    }
  }

  pushCurrent(hasInsertedContent);
  return result;
}

function processHeadingNode(node: LexicalNode, ctx: AnchorContext): LexicalNode[] {
  const segments = collectSegments(node.children, ctx);
  if (!segments.some((segment) => segment.kind === 'anchor')) {
    const childNodes = segments
      .filter((segment): segment is NodeSegment => segment.kind === 'node')
      .map((segment) => segment.node);
    const normalizedChildren = normalizeHeadingChildren(childNodes);
    return [cloneBlockNode(node, normalizedChildren)];
  }

  const sanitizedChildren: LexicalNode[] = [];
  const insertions: LexicalNode[] = [];

  for (const segment of segments) {
    if (segment.kind === 'node') {
      sanitizedChildren.push(segment.node);
      continue;
    }

    const replacement = buildAnchorReplacement(segment, ctx);
    if (replacement.inserted.length > 0) {
      insertions.push(...replacement.inserted);
    }
    if (replacement.fallback) {
      sanitizedChildren.push(replacement.fallback);
    }
  }

  const normalizedChildren = normalizeHeadingChildren(sanitizedChildren);
  const headingNode = cloneBlockNode(node, normalizedChildren);
  return insertions.length > 0 ? [headingNode, ...insertions] : [headingNode];
}

function processNode(node: LexicalNode, ctx: AnchorContext): LexicalNode[] {
  if (!node) return [];

  const anchorId = extractAnchorId(node);
  if (anchorId) {
    const anchor = ctx.anchorsById.get(anchorId);
    if (!anchor) {
      return [node];
    }

    ctx.used.add(anchorId);
    const rendered = TableRenderer.renderLexical({
      anchor,
      questions: ctx.questions,
      answers: ctx.answers,
    });
    if (rendered.length > 0) {
      return rendered;
    }
    return [node];
  }

  if (isHeadingNode(node)) {
    return processHeadingNode(node, ctx);
  }

  if (isParagraphNode(node)) {
    return processParagraphNode(node, ctx);
  }

  if (Array.isArray(node.children) && node.children.length > 0) {
    const replacedChildren = replaceAnchors(node.children, ctx);
    return [{ ...node, children: replacedChildren }];
  }

  return [node];
}

function replaceAnchors(nodes: LexicalNode[], ctx: AnchorContext): LexicalNode[] {
  const out: LexicalNode[] = [];
  for (const node of nodes) {
    out.push(...processNode(node, ctx));
  }
  return out;
}

function createParagraph(text: string): LexicalNode {
  return {
    type: 'paragraph',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: text
      ? [
          {
            type: 'text',
            text,
            detail: 0,
            format: 0,
            style: '',
            version: 1,
          },
        ]
      : [],
  };
}

export const LexicalAssembler = {
  assemble({ text, anchors, questions, answers, missingAnchorIds = [] }: LexicalAssemblerInput): LexicalAssemblerResult {
    console.log('[ANCHOR] LexicalAssembler.assemble - start', {
      anchors: anchors.map((a) => a.id),
      missingAnchorIds,
      textLength: text.length,
    });
    const editorState = markdownToLexicalState(text);
    const root = editorState.root as LexicalNode;
    const children = Array.isArray(root.children) ? root.children : [];
    const anchorsById = new Map(anchors.map((anchor) => [anchor.id, anchor]));
    const ctx: AnchorContext = { anchorsById, used: new Set<string>(), questions, answers };

    root.children = replaceAnchors(children, ctx);
    console.log('[ANCHOR] LexicalAssembler.assemble - anchors replaced', {
      usedAnchors: Array.from(ctx.used),
    });

    const autoInserted: string[] = [];
    for (const missingId of missingAnchorIds) {
      if (ctx.used.has(missingId)) continue;
      const anchor = anchorsById.get(missingId);
      if (!anchor) continue;
      const rendered = TableRenderer.renderLexical({ anchor, questions, answers });
      if (rendered.length === 0) {
        console.log('[ANCHOR] LexicalAssembler.assemble - auto insert fallback paragraph', {
          anchorId: missingId,
        });
        root.children.push(createParagraph(`Tableau ${missingId} introuvable dans la génération.`));
        continue;
      }
      root.children.push(
        createParagraph(`Tableau ${missingId} inséré automatiquement (ancre manquante).`),
        ...rendered,
      );
      ctx.used.add(missingId);
      autoInserted.push(missingId);
      console.log('[ANCHOR] LexicalAssembler.assemble - auto inserted table', {
        anchorId: missingId,
      });
    }

    const normalized = normalizeLexicalEditorState(editorState);
    console.log('[ANCHOR] LexicalAssembler.assemble - done', {
      autoInserted,
    });
    return {
      assembledState: lexicalStateToJSON(normalized),
      autoInserted,
    };
  },
};
