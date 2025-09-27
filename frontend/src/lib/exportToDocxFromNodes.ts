import {
  $getRoot,
  $isElementNode,
  $isLineBreakNode,
  $isParagraphNode,
  $isTextNode,
  type EditorState,
  type ElementNode,
  type LexicalNode,
  type TextNode,
} from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType,
  type IBordersOptions,
  type IParagraphOptions,
  type IRunOptions,
} from 'docx';
import { $isBorderBlockNode, type BorderWeight } from '@/nodes/BorderBlockNode';

function parseInlineStyle(style: string): Record<string, string> {
  if (!style) return {};
  const map: Record<string, string> = {};
  for (const declaration of style.split(';')) {
    if (!declaration) continue;
    const [prop, ...valueParts] = declaration.split(':');
    if (!prop || valueParts.length === 0) continue;
    const value = valueParts.join(':').trim();
    if (!value) continue;
    map[prop.trim().toLowerCase()] = value;
  }
  return map;
}

function parseFontSize(styleValue?: string): number | undefined {
  if (!styleValue) return undefined;
  const match = /([\d.]+)\s*(px|pt)?/i.exec(styleValue);
  if (!match) return undefined;
  const [, raw, unit] = match;
  const numeric = parseFloat(raw);
  if (Number.isNaN(numeric)) return undefined;
  const points = unit?.toLowerCase() === 'px' ? numeric * 0.75 : numeric;
  // docx expects half-points
  return Math.round(points * 2);
}

function parseColor(styleValue?: string): string | undefined {
  if (!styleValue) return undefined;
  const value = styleValue.trim();
  if (!value) return undefined;
  if (value.startsWith('#')) {
    const hex = value.slice(1);
    if (/^[0-9a-f]{3}$/i.test(hex)) {
      return hex
        .split('')
        .map((ch) => ch.repeat(2))
        .join('')
        .toUpperCase();
    }
    if (/^[0-9a-f]{6}$/i.test(hex)) {
      return hex.toUpperCase();
    }
    return undefined;
  }
  const rgbMatch = /^rgba?\(([^)]+)\)$/i.exec(value);
  if (rgbMatch) {
    const parts = rgbMatch[1]
      .split(',')
      .map((part) => parseFloat(part.trim()))
      .filter((num, index) => index < 3 && Number.isFinite(num));
    if (parts.length === 3) {
      return parts
        .map((num) => {
          const clamped = Math.max(0, Math.min(255, Math.round(num)));
          return clamped.toString(16).padStart(2, '0').toUpperCase();
        })
        .join('');
    }
  }
  return undefined;
}

function weightToBorders(
  weight: BorderWeight,
  color: string,
): IBordersOptions | undefined {
  if (!weight || weight === 'none') return undefined;
  const normalizedColor = parseColor(color) ?? '000000';
  const baseSize = (() => {
    switch (weight) {
      case 'thin':
        return 4;
      case 'medium':
        return 8;
      case 'thick':
        return 12;
      case 'dashed':
        return 4;
      default:
        return 4;
    }
  })();
  const style = weight === 'dashed' ? BorderStyle.DASHED : BorderStyle.SINGLE;
  const border = {
    style,
    color: normalizedColor,
    size: baseSize,
    space: 2,
  };
  return {
    top: border,
    right: border,
    bottom: border,
    left: border,
  };
}

type RunContext = {
  fallbackSize?: number;
  fallbackBold?: boolean;
};

function textNodeToRun(node: TextNode, context: RunContext): TextRun | null {
  const text = node.getTextContent();
  if (!text) return null;
  const style = parseInlineStyle(node.getStyle());
  const options: IRunOptions = { text };

  if (node.hasFormat('bold') || context.fallbackBold) {
    options.bold = true;
  }
  if (node.hasFormat('italic')) {
    options.italics = true;
  }
  if (node.hasFormat('strikethrough')) {
    options.strike = true;
  }
  if (node.hasFormat('superscript')) {
    options.superScript = true;
  }
  if (node.hasFormat('subscript')) {
    options.subScript = true;
  }
  if (node.hasFormat('underline')) {
    options.underline = { type: UnderlineType.SINGLE };
  }

  const color = parseColor(style['color']);
  if (color) options.color = color;

  const fontSize = parseFontSize(style['font-size']) ?? context.fallbackSize;
  if (fontSize) options.size = fontSize;

  const fontFamily = style['font-family'];
  if (fontFamily) options.font = fontFamily;

  return new TextRun(options);
}

function collectRunsFromElement(
  element: ElementNode,
  context: RunContext,
): TextRun[] {
  const runs: TextRun[] = [];
  for (const child of element.getChildren()) {
    if ($isTextNode(child)) {
      const run = textNodeToRun(child, context);
      if (run) runs.push(run);
      continue;
    }
    if ($isLineBreakNode(child)) {
      runs.push(new TextRun({ break: 1 }));
      continue;
    }
    if ($isElementNode(child)) {
      runs.push(...collectRunsFromElement(child, context));
    }
  }
  return runs;
}

function headingConfig(tag: string): {
  heading: HeadingLevel;
  size: number;
  bold: boolean;
} {
  switch (tag) {
    case 'h1':
      return { heading: HeadingLevel.HEADING_1, size: 32 * 2, bold: true };
    case 'h2':
      return { heading: HeadingLevel.HEADING_2, size: 26 * 2, bold: true };
    case 'h3':
      return { heading: HeadingLevel.HEADING_3, size: 22 * 2, bold: true };
    default:
      return { heading: HeadingLevel.HEADING_1, size: 32 * 2, bold: true };
  }
}

function nodeToParagraphs(
  node: LexicalNode,
  context?: RunContext,
  borders?: IBordersOptions,
): Paragraph[] {
  if ($isBorderBlockNode(node)) {
    const border = weightToBorders(node.getWeight(), node.getColor());
    const paragraphs: Paragraph[] = [];
    for (const child of node.getChildren()) {
      paragraphs.push(...nodeToParagraphs(child, context, border ?? borders));
    }
    return paragraphs;
  }

  if ($isHeadingNode(node)) {
    const tag = node.getTag();
    const cfg = headingConfig(tag);
    const runs = collectRunsFromElement(node, {
      fallbackSize: cfg.size,
      fallbackBold: cfg.bold,
    });
    const options: IParagraphOptions = {
      children: runs.length ? runs : [new TextRun('')],
      heading: cfg.heading,
      border: borders,
    };
    return [new Paragraph(options)];
  }

  if ($isParagraphNode(node)) {
    const runs = collectRunsFromElement(node, context ?? {});
    const options: IParagraphOptions = {
      children: runs.length ? runs : [new TextRun('')],
      border: borders,
    };
    return [new Paragraph(options)];
  }

  if ($isElementNode(node)) {
    const paragraphs: Paragraph[] = [];
    for (const child of node.getChildren()) {
      paragraphs.push(...nodeToParagraphs(child, context, borders));
    }
    return paragraphs;
  }

  return [];
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function exportToDocxFromNodes(
  editorState: EditorState,
  fileName: string = 'document.docx',
): Promise<Document> {
  const paragraphs = editorState.read(() => {
    const root = $getRoot();
    const blocks: Paragraph[] = [];
    for (const child of root.getChildren()) {
      blocks.push(...nodeToParagraphs(child));
    }
    return blocks;
  });

  const document = new Document({
    sections: [
      { children: paragraphs.length ? paragraphs : [new Paragraph('')] },
    ],
  });

  const blob = await Packer.toBlob(document);
  triggerDownload(blob, fileName);
  return document;
}
