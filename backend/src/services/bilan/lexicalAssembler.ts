import { markdownToLexicalState, normalizeLexicalEditorState, lexicalStateToJSON } from '../../utils/lexicalEditorState';
import type { AnchorSpecification, TitlePresetAnchorSpec } from '../ai/anchor.service';
import type { Question, TitleFormatSpec } from '../../utils/answersMarkdown';
import { TableRenderer } from './tableRenderer';


export type LexicalAssemblerInput = {
  text: string;
  anchors: AnchorSpecification[];
  questions: Question[];
  answers: Record<string, unknown>;
  missingAnchorIds?: string[];
  astSnippets?: Record<string, unknown> | null;
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
  questionsById: Map<string, Question>;
  answers: Record<string, unknown>;
  astSnippets?: Record<string, unknown> | null;
};

const KNOWN_ANCHOR_TYPES = ['CR:TBL', 'CR:TITLE_PRESET'] as const;
type AnchorType = (typeof KNOWN_ANCHOR_TYPES)[number];
const KNOWN_ANCHOR_TYPE_SET = new Set<string>(KNOWN_ANCHOR_TYPES);
const KNOWN_ANCHOR_TYPE_PATTERN = KNOWN_ANCHOR_TYPES.map((type) => type.replace(':', '\\:')).join('|');
const ANCHOR_MARKER_CORE = '\\[\\[(' + KNOWN_ANCHOR_TYPE_PATTERN + ')\\|id=([^`\\]]+)\\]\\]';
const INLINE_ANCHOR_PATTERN = '`?' + ANCHOR_MARKER_CORE + '`?';
const BLOCK_ANCHOR_REGEX = new RegExp(`^${INLINE_ANCHOR_PATTERN}$`);

type NodeSegment = { kind: 'node'; node: LexicalNode };
type AnchorMatchSegment = {
  kind: 'anchor';
  anchorType: AnchorType;
  anchorId: string;
  marker: string;
  template: LexicalNode;
};
type AnchorSegment = NodeSegment | AnchorMatchSegment;

function createInlineAnchorRegExp(): RegExp {
  return new RegExp(INLINE_ANCHOR_PATTERN, 'g');
}

function isKnownAnchorType(value: string | undefined | null): value is AnchorType {
  if (!value) return false;
  return KNOWN_ANCHOR_TYPE_SET.has(value);
}

type ParsedAnchor = {
  anchorType: AnchorType;
  anchorId: string;
};

function normalizeAnchorId(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim() : '';
}

function parseInlineAnchorMatch(match: RegExpExecArray): ParsedAnchor | null {
  const rawType = match[1];
  const rawId = match[2];
  if (!isKnownAnchorType(rawType)) return null;
  const anchorId = normalizeAnchorId(rawId);
  if (!anchorId) return null;
  return { anchorType: rawType, anchorId };
}

function parseAnchorMarker(marker: string): ParsedAnchor | null {
  const match = marker.match(BLOCK_ANCHOR_REGEX);
  if (!match) return null;
  const rawType = match[1];
  const rawId = match[2];
  if (!isKnownAnchorType(rawType)) return null;
  const anchorId = normalizeAnchorId(rawId);
  if (!anchorId) return null;
  return { anchorType: rawType, anchorId };
}

function extractAnchor(node: LexicalNode): ParsedAnchor | null {
  if (node?.type !== 'paragraph') return null;
  const children = Array.isArray(node.children) ? node.children : [];
  if (children.length !== 1) return null;
  const child = children[0];
  if (child?.type !== 'text') return null;
  const text = typeof child.text === 'string' ? child.text.trim() : '';
  if (!text) return null;
  return parseAnchorMarker(text);
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

type TitlePresetRegistry = Record<string, TitleFormatSpec>;

const DEFAULT_TITLE_PRESET_FORMAT: TitleFormatSpec = {
  kind: 'paragraph',
  fontSize: 12,
  bold: true,
};

const CUSTOM_PRESET_ID = '_custom';

const TITLE_PRESET_REGISTRY: TitlePresetRegistry = {
  't11-italic': {
    kind: 'paragraph',
    italic: true,
  },
  't12-underline': {
    kind: 'paragraph',
    underline: true,
  },
  't12-bold': {
    kind: 'paragraph',
    fontSize: 12,
    bold: true,
  },
  't12-italic': {
    kind: 'paragraph',
    fontSize: 12,
    italic: true,
  },
  't12-italic-underline': {
    kind: 'paragraph',
    fontSize: 12,
    italic: true,
    underline: true,
  },
  't12-bullet-bold': {
    kind: 'list-item',
    fontSize: 12,
    bold: true,
  },
  't12-bullet-underline': {
    kind: 'list-item',
    fontSize: 12,
    underline: true,
  },
  't14-bold-underline': {
    kind: 'paragraph',
    fontSize: 14,
    bold: true,
    underline: true,
  },
  't14-center-bold': {
    kind: 'paragraph',
    fontSize: 14,
    bold: true,
    align: 'center',
  },
  't14-center-uppercase': {
    kind: 'paragraph',
    fontSize: 14,
    align: 'center',
    case: 'uppercase',
  },
  't14-center-bordered': {
    kind: 'paragraph',
    fontSize: 14,
    align: 'center',
    case: 'uppercase',
    decor: {
      weight: 'thin',
      color: 'black',
    },
  },
  't14-bold-filled-green': {
    kind: 'paragraph',
    fontSize: 14,
    bold: true,
    align: 'center',
    decor: {
      weight: 'none',
      fill: { kind: 'token', token: 'green' }, // mappe à tes classes .bp-decor[data-bp-fill-token="green"]
    },
  },
};

function mapAlignment(align?: TitleFormatSpec['align']): string {
  if (!align || align === 'left') return '';
  return align;
}

type TextFormatFlags = { bold?: boolean; italic?: boolean; underline?: boolean };

function computeTextFormat({ bold, italic, underline }: TextFormatFlags): number {
  let format = 0;
  if (bold) format |= 1;
  if (italic) format |= 2;
  if (underline) format |= 8;
  return format;
}

function applyCaseTransform(text: string, desiredCase?: TitleFormatSpec['case']): string {
  if (!desiredCase || desiredCase === 'none') return text;
  switch (desiredCase) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return text.replace(/\b\p{L}[\p{L}\p{M}]*/gu, (segment) => {
        const [first, ...rest] = segment;
        return (first ?? '').toUpperCase() + rest.join('').toLowerCase();
      });
    default:
      return text;
  }
}

function computeTextStyle(
  fontSize?: TitleFormatSpec['fontSize'],
  fontColor?: string,
): string {
  const styles: string[] = [];
  if (typeof fontSize === 'number' && Number.isFinite(fontSize)) {
    styles.push(`font-size: ${fontSize}pt`);
  } else if (typeof fontSize === 'string') {
    const trimmed = fontSize.trim();
    if (trimmed) styles.push(`font-size: ${trimmed}`);
  }

  if (typeof fontColor === 'string') {
    const trimmed = fontColor.trim();
    if (trimmed) styles.push(`color: ${trimmed}`);
  }

  return styles.join('; ');
}

function wrapWithDecor(nodes: LexicalNode[], decor?: TitleFormatSpec['decor']): LexicalNode[] {
  if (!decor) return nodes;

  const weight = decor.weight ?? 'thin';
  const color = decor.color ?? 'black';
  const fillKind = decor.fill?.kind ?? 'none';
  const fillToken = fillKind === 'token' ? decor.fill?.token ?? null : null;
  const fillColor = fillKind === 'custom' ? decor.fill?.color ?? null : null;

  const blockNode: LexicalNode = {
    type: 'border-block',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 3,
    weight,
    color,
    fill: fillKind,
    fillToken,
    fillColor,
    children: nodes,
  };

  const spacerParagraph: LexicalNode = {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: [],
  };

  return [blockNode, spacerParagraph];
}

function createStyledTextNode(text: string, flags: TextFormatFlags, style?: string): LexicalNode {
  return {
    type: 'text',
    text,
    detail: 0,
    format: computeTextFormat(flags),
    style: style ? style.trim() : '',
    version: 1,
  };
}

function buildTitleNodes(text: string, format: TitleFormatSpec): LexicalNode[] {
  const prefix = format.prefix ?? '';
  const suffix = format.suffix ?? '';
  const baseText = applyCaseTransform(text.trim(), format.case);
  const finalText = `${prefix}${baseText}${suffix}`;
  const textNode = createStyledTextNode(
    finalText,
    {
      bold: format.bold,
      italic: format.italic,
      underline: format.underline,
    },
    // support both new `fontColor` and legacy `textColor` if present
    computeTextStyle(format.fontSize, (format as any)?.fontColor ?? (format as any)?.textColor),
  );

  if (format.kind === 'heading') {
    const level = format.level && format.level >= 1 && format.level <= 6 ? format.level : 2;
    return wrapWithDecor([
      {
        type: 'heading',
        tag: `h${level}`,
        direction: 'ltr',
        format: mapAlignment(format.align),
        indent: 0,
        version: 1,
        children: finalText ? [textNode] : [],
      },
    ], format.decor);
  }

  if (format.kind === 'paragraph') {
    return wrapWithDecor([
      {
        type: 'paragraph',
        direction: 'ltr',
        format: mapAlignment(format.align),
        indent: 0,
        version: 1,
        children: finalText ? [textNode] : [],
      },
    ], format.decor);
  }

  if (format.kind === 'list-item') {
    const listItem: LexicalNode = {
      type: 'listitem',
      format: '',
      indent: 0,
      version: 1,
      value: 1,
      children: finalText ? [textNode] : [],
    };
    return wrapWithDecor([
      {
        type: 'list',
        tag: 'ul',
        listType: 'bullet',
        direction: 'ltr',
        format: mapAlignment(format.align),
        indent: 0,
        version: 1,
        children: [listItem],
      },
    ], format.decor);
  }

  return wrapWithDecor([
    {
      type: 'paragraph',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: finalText ? [textNode] : [],
    },
  ], format.decor);

}

function resolveTitleFormat(
  anchor: TitlePresetAnchorSpec,
  question: Question | undefined,
): TitleFormatSpec {
  const override = (question as any)?.titreFormatOverride as TitleFormatSpec | undefined;
  if (override) return override;

  const presetId = anchor.presetId || (question as any)?.titrePresetId;
  if (presetId === CUSTOM_PRESET_ID) {
    // Custom style sentinel without override set: fall back without warning
    return DEFAULT_TITLE_PRESET_FORMAT;
  }
  if (presetId && TITLE_PRESET_REGISTRY[presetId]) {
    return TITLE_PRESET_REGISTRY[presetId];
  }

  if (presetId && presetId !== CUSTOM_PRESET_ID) {
    console.warn('[ANCHOR] LexicalAssembler - unknown title preset, falling back', {
      presetId,
      anchorId: anchor.id,
    });
  }
  return DEFAULT_TITLE_PRESET_FORMAT;
}

function resolveTitleText(
  anchor: TitlePresetAnchorSpec,
  question: Question | undefined,
  answers: Record<string, unknown>,
): string {
  const answerValue = answers?.[anchor.questionId];
  if (typeof answerValue === 'string' && answerValue.trim()) {
    return answerValue.trim();
  }

  const questionTitle = typeof question?.titre === 'string' ? question.titre.trim() : '';
  if (questionTitle) return questionTitle;

  return anchor.questionId;
}

function renderTitleAnchor(anchor: TitlePresetAnchorSpec, ctx: AnchorContext): LexicalNode[] {
  const question = ctx.questionsById.get(anchor.questionId);
  const format = resolveTitleFormat(anchor, question);
  const text = resolveTitleText(anchor, question, ctx.answers);
  if (!text) {
    console.warn('[ANCHOR] LexicalAssembler - empty title text', {
      anchorId: anchor.id,
      questionId: anchor.questionId,
    });
    return [];
  }

  return buildTitleNodes(text, format);
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
    const parsed = parseInlineAnchorMatch(match);
    if (parsed) {
      segments.push({
        kind: 'anchor',
        anchorType: parsed.anchorType,
        anchorId: parsed.anchorId,
        marker,
        template: node,
      });
    } else {
      segments.push({ kind: 'node', node: cloneTextNode(node, marker) });
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

function createEmptyParagraph(): LexicalNode {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: [],  // 👈 aucun texte, donc invisible
  };
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
  if (anchor.type === 'CR:TBL') {
    const rendered = TableRenderer.renderLexical({
      anchor,
      questions: ctx.questions,
      answers: ctx.answers,
      astSnippets: ctx.astSnippets,
    });

    if (rendered.length > 0) {
      return {
        inserted: rendered,
        fallback: null,
      };
    }

    return {
      inserted: [],
      fallback: createEmptyParagraph(),
    };
  }

  if (anchor.type === 'CR:TITLE_PRESET') {
    const titleNodes = renderTitleAnchor(anchor as TitlePresetAnchorSpec, ctx);
    if (titleNodes.length > 0) {
      return {
        inserted: titleNodes,
        fallback: null,
      };
    }

    return {
      inserted: [],
      fallback: cloneTextNode(segment.template, segment.marker),
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

  const parsedAnchor = extractAnchor(node);
  if (parsedAnchor) {
    const anchor = ctx.anchorsById.get(parsedAnchor.anchorId);
    if (!anchor || anchor.type !== parsedAnchor.anchorType) {
      return [node];
    }

    ctx.used.add(parsedAnchor.anchorId);

    if (anchor.type === 'CR:TBL') {
      const rendered = TableRenderer.renderLexical({
        anchor,
        questions: ctx.questions,
        answers: ctx.answers,
        astSnippets: ctx.astSnippets,
      });
      if (rendered.length > 0) {
        return rendered;
      }
      return [node];
    }

    if (anchor.type === 'CR:TITLE_PRESET') {
      const titleNodes = renderTitleAnchor(anchor as TitlePresetAnchorSpec, ctx);
      if (titleNodes.length > 0) {
        return titleNodes;
      }
      return [node];
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
  assemble({
    text,
    anchors,
    questions,
    answers,
    missingAnchorIds = [],
    astSnippets,
  }: LexicalAssemblerInput): LexicalAssemblerResult {
    console.log('[ANCHOR] LexicalAssembler.assemble - start', {
      anchors: anchors.map((a) => a.id),
      missingAnchorIds,
      textLength: text.length,
    });
    const editorState = markdownToLexicalState(text);
    const root = editorState.root as LexicalNode;
    const children = Array.isArray(root.children) ? root.children : [];
    const anchorsById = new Map(anchors.map((anchor) => [anchor.id, anchor]));
    const questionsById = new Map(questions.map((question) => [question.id, question]));
    const ctx: AnchorContext = {
      anchorsById,
      used: new Set<string>(),
      questions,
      questionsById,
      answers,
      astSnippets,
    };

    root.children = replaceAnchors(children, ctx);
    console.log('[ANCHOR] LexicalAssembler.assemble - anchors replaced', {
      usedAnchors: Array.from(ctx.used),
    });

    const autoInserted: string[] = [];
    for (const missingId of missingAnchorIds) {
      if (ctx.used.has(missingId)) continue;
      const anchor = anchorsById.get(missingId);
      if (!anchor) continue;
      if (anchor.type === 'CR:TBL') {
        const rendered = TableRenderer.renderLexical({
          anchor,
          questions,
          answers,
          astSnippets,
        });
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
        continue;
      }

      if (anchor.type === 'CR:TITLE_PRESET') {
        const titleNodes = renderTitleAnchor(anchor as TitlePresetAnchorSpec, ctx);
        if (titleNodes.length === 0) {
          console.log('[ANCHOR] LexicalAssembler.assemble - auto insert missing title fallback', {
            anchorId: missingId,
          });
          root.children.push(createParagraph(`Titre ${missingId} introuvable dans la génération.`));
          continue;
        }
        root.children.push(...titleNodes);
        ctx.used.add(missingId);
        autoInserted.push(missingId);
        console.log('[ANCHOR] LexicalAssembler.assemble - auto inserted title', {
          anchorId: missingId,
        });
        continue;
      }
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
