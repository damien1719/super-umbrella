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
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
  ShadingType,
  VerticalAlignTable,
  AlignmentType,
  type IBordersOptions,
  type IShadingAttributesProperties,
  type IParagraphOptions,
  type IRunOptions,
  type ITableCellOptions,
  type ITableRowOptions,
  type TableVerticalAlign,
} from 'docx';
import {
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  TableCellNode,
  type TableNode,
} from '@lexical/table';
import {
  $isBorderBlockNode,
  type BorderWeight,
  type DecorBlockNode,
  type DecorFillToken,
} from '@/nodes/BorderBlockNode';

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

function mergeFormatting(
  base: BlockFormatting | undefined,
  patch: BlockFormatting | undefined,
): BlockFormatting | undefined {
  if (!base && !patch) return undefined;
  if (!base) return patch;
  if (!patch) return base;
  return {
    border: patch.border ?? base.border,
    shading: patch.shading ?? base.shading,
  };
}

function decorNodeToShading(
  node: DecorBlockNode,
): IShadingAttributesProperties | undefined {
  const fillMode = node.getFill();
  if (fillMode === 'none') return undefined;

  if (fillMode === 'token') {
    const token = node.getFillToken();
    if (!token) return undefined;
    const hex = DECOR_FILL_TOKEN_HEX[token];
    if (!hex) return undefined;
    return {
      type: ShadingType.CLEAR,
      fill: hex,
      color: 'auto',
    };
  }

  if (fillMode === 'custom') {
    const color = node.getFillColor();
    const hex = parseColor(color ?? undefined);
    if (!hex) return undefined;
    return {
      type: ShadingType.CLEAR,
      fill: hex,
      color: 'auto',
    };
  }

  return undefined;
}

type RunContext = {
  fallbackSize?: number;
  fallbackBold?: boolean;
  fallbackUnderline?: boolean;
};

type DocxBlock = Paragraph | Table;

type BlockFormatting = {
  border?: IBordersOptions;
  shading?: IShadingAttributesProperties;
};

const DECOR_FILL_TOKEN_HEX: Record<DecorFillToken, string> = {
  red: 'FECACA',
  orange: 'FED7AA',
  yellow: 'FEF08A',
  green: 'BBF7D0',
  teal: '99F6E4',
  blue: 'BFDBFE',
  indigo: 'C7D2FE',
  purple: 'E9D5FF',
  pink: 'FBCFE8',
  gray: 'E5E7EB',
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
  if (node.hasFormat('underline') || context.fallbackUnderline) {
    options.underline = { type: UnderlineType.SINGLE };
  }

  const color = parseColor(style['color']);
  if (color) options.color = color;

  const fontSize = parseFontSize(style['font-size']) ?? context.fallbackSize;
  if (fontSize) options.size = fontSize;

  const fontFamily = style['font-family'];
  if (fontFamily) options.font = fontFamily;

  const background = parseColor(style['background-color']);
  if (background) {
    options.shading = {
      type: ShadingType.CLEAR,
      fill: background,
      color: 'auto',
    };
  }

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
  size: number;
  bold: boolean;
  underline: boolean;
} {
  switch (tag) {
    case 'h1':
      return {
        size: 14 * 2,
        bold: false,
        underline: false,
      };
    case 'h2':
      return {
        size: 12 * 2,
        bold: true,
        underline: true,
      };
    case 'h3':
      return {
        size: 11 * 2,
        bold: false,
        underline: true,
      };
    default:
      return {
        size: 14 * 2,
        bold: false,
        underline: false,
      };
  }
}

function mapVerticalAlign(
  value?: string | null,
): TableVerticalAlign | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  switch (normalized) {
    case 'top':
      return VerticalAlignTable.TOP;
    case 'bottom':
      return VerticalAlignTable.BOTTOM;
    case 'middle':
    case 'center':
      return VerticalAlignTable.CENTER;
    default:
      return undefined;
  }
}

function mapParagraphAlignment(
  node: ElementNode,
): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
  const format = typeof (node as ElementNode).getFormatType === 'function'
    ? node.getFormatType()
    : null;
  switch (format) {
    case 'left':
    case 'start':
      return AlignmentType.LEFT;
    case 'right':
    case 'end':
      return AlignmentType.RIGHT;
    case 'center':
      return AlignmentType.CENTER;
    case 'justify':
      return AlignmentType.JUSTIFIED;
    default:
      return undefined;
  }
}

function createCellChildren(
  cellNode: TableCellNode,
  context?: RunContext,
  formatting?: BlockFormatting,
): DocxBlock[] {
  const effectiveContext = cellNode.hasHeader()
    ? { ...context, fallbackBold: true }
    : context;
  const blocks: DocxBlock[] = [];
  for (const child of cellNode.getChildren()) {
    blocks.push(...nodeToDocxBlocks(child, effectiveContext, formatting));
  }
  return blocks.length ? blocks : [new Paragraph('')];
}

function createDocxTableCell(
  cellNode: TableCellNode,
  context?: RunContext,
  formatting?: BlockFormatting,
): TableCell {
  const cellChildren = createCellChildren(cellNode, context, formatting);
  const options: ITableCellOptions = { children: cellChildren };

  const colSpan = cellNode.getColSpan();
  if (typeof colSpan === 'number' && colSpan > 1) {
    options.columnSpan = colSpan;
  }

  const rowSpan = cellNode.getRowSpan();
  if (typeof rowSpan === 'number' && rowSpan > 1) {
    options.rowSpan = rowSpan;
  }

  const verticalAlign = mapVerticalAlign(cellNode.getVerticalAlign());
  if (verticalAlign) {
    options.verticalAlign = verticalAlign;
  }

  const backgroundColor = cellNode.getBackgroundColor();
  const fill = parseColor(
    typeof backgroundColor === 'string' ? backgroundColor : undefined,
  );
  if (fill) {
    options.shading = {
      type: ShadingType.CLEAR,
      fill,
    };
  }

  return new TableCell(options);
}

function createDocxTable(
  tableNode: TableNode,
  context?: RunContext,
  formatting?: BlockFormatting,
): Table | null {
  const rows: TableRow[] = [];
  for (const rowNode of tableNode.getChildren()) {
    if (!$isTableRowNode(rowNode)) continue;
    const cells: TableCell[] = [];
    const lexicalCells: TableCellNode[] = [];
    for (const cellNode of rowNode.getChildren()) {
      if (!$isTableCellNode(cellNode)) continue;
      lexicalCells.push(cellNode);
      cells.push(createDocxTableCell(cellNode, context, formatting));
    }
    if (!cells.length) continue;
    const rowOptions: ITableRowOptions = { children: cells };
    if (lexicalCells.some((cell) => cell.hasHeader())) {
      rowOptions.tableHeader = true;
    }
    rows.push(new TableRow(rowOptions));
  }

  if (!rows.length) return null;

  const tableOptions = {
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  };

  return new Table(tableOptions);
}

function nodeToParagraphs(
  node: LexicalNode,
  context?: RunContext,
  formatting?: BlockFormatting,
): Paragraph[] {
  if ($isTableNode(node)) {
    return [];
  }

  if ($isBorderBlockNode(node)) {
    const border = weightToBorders(node.getWeight(), node.getColor());
    const shading = decorNodeToShading(node);
    const patch = border || shading ? { border, shading } : undefined;
    const nextFormatting = mergeFormatting(formatting, patch);
    const paragraphs: Paragraph[] = [];
    for (const child of node.getChildren()) {
      paragraphs.push(...nodeToParagraphs(child, context, nextFormatting));
    }
    return paragraphs;
  }

  if ($isHeadingNode(node)) {
    const tag = node.getTag();
    const cfg = headingConfig(tag);
    const runs = collectRunsFromElement(node, {
      fallbackSize: cfg.size,
      fallbackBold: cfg.bold,
      fallbackUnderline: cfg.underline,
    });
    const options: IParagraphOptions = {
      children: runs.length ? runs : [new TextRun('')],
      border: formatting?.border,
    };
    const alignment = mapParagraphAlignment(node);
    if (alignment) {
      options.alignment = alignment;
    }
    if (formatting?.shading) {
      options.shading = formatting.shading;
    }
    return [new Paragraph(options)];
  }

  if ($isParagraphNode(node)) {
    const runs = collectRunsFromElement(node, context ?? {});
    const options: IParagraphOptions = {
      children: runs.length ? runs : [new TextRun('')],
      border: formatting?.border,
    };
    const alignment = mapParagraphAlignment(node);
    if (alignment) {
      options.alignment = alignment;
    }
    if (formatting?.shading) {
      options.shading = formatting.shading;
    }
    return [new Paragraph(options)];
  }

  if ($isElementNode(node)) {
    const paragraphs: Paragraph[] = [];
    for (const child of node.getChildren()) {
      paragraphs.push(...nodeToParagraphs(child, context, formatting));
    }
    return paragraphs;
  }

  return [];
}

function nodeToDocxBlocks(
  node: LexicalNode,
  context?: RunContext,
  formatting?: BlockFormatting,
): DocxBlock[] {
  if ($isBorderBlockNode(node)) {
    const border = weightToBorders(node.getWeight(), node.getColor());
    const shading = decorNodeToShading(node);
    const patch = border || shading ? { border, shading } : undefined;
    const nextFormatting = mergeFormatting(formatting, patch);
    const blocks: DocxBlock[] = [];
    for (const child of node.getChildren()) {
      blocks.push(...nodeToDocxBlocks(child, context, nextFormatting));
    }
    return blocks;
  }

  if ($isTableNode(node)) {
    const table = createDocxTable(node, context, formatting);
    return table ? [table] : [];
  }

  if ($isHeadingNode(node) || $isParagraphNode(node)) {
    return nodeToParagraphs(node, context, formatting);
  }

  if ($isElementNode(node)) {
    const blocks: DocxBlock[] = [];
    for (const child of node.getChildren()) {
      blocks.push(...nodeToDocxBlocks(child, context, formatting));
    }
    return blocks;
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
  const blocks = editorState.read(() => {
    const root = $getRoot();
    const children: DocxBlock[] = [];
    for (const child of root.getChildren()) {
      children.push(...nodeToDocxBlocks(child));
    }
    return children;
  });

  const document = new Document({
    sections: [{ children: blocks.length ? blocks : [new Paragraph('')] }],
  });

  const blob = await Packer.toBlob(document);
  triggerDownload(blob, fileName);
  return document;
}
