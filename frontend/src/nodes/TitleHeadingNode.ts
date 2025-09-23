import {
  ElementNode,
  type DOMExportOutput,
  type LexicalNode,
  type NodeKey,
} from 'lexical';

export type TitleLevel = 1 | 2 | 3;

export type SerializedTitleHeadingNode = {
  type: 'title-heading';
  version: 1;
  questionId: string;
  level?: TitleLevel;
};

export class TitleHeadingNode extends ElementNode {
  __questionId: string;
  __level: TitleLevel;

  static getType(): string {
    return 'title-heading';
  }

  static clone(node: TitleHeadingNode): TitleHeadingNode {
    return new TitleHeadingNode(node.__questionId, node.__level, node.__key);
  }

  constructor(questionId: string, level: TitleLevel = 3, key?: NodeKey) {
    super(key);
    this.__questionId = questionId;
    this.__level = (level ?? 3) as TitleLevel;
    if (this.__level !== 1 && this.__level !== 2 && this.__level !== 3) {
      this.__level = 3;
    }
  }

  getTag(): 'h1' | 'h2' | 'h3' {
    return this.__level === 1 ? 'h1' : this.__level === 2 ? 'h2' : 'h3';
  }

  getQuestionId(): string {
    return this.__questionId;
  }

  setQuestionId(id: string) {
    const writable = this.getWritable() as TitleHeadingNode;
    writable.__questionId = id;
  }

  getLevel(): TitleLevel {
    return this.__level;
  }

  setLevel(level: TitleLevel) {
    const writable = this.getWritable() as TitleHeadingNode;
    writable.__level = (level ?? 3) as TitleLevel;
  }

  private applyStyle(el: HTMLElement) {
    // Mirror the app's theme: H2 bold+underline, H3 underline
    const tag = this.getTag();
    const cls =
      tag === 'h1'
        ? 'text-[14pt] mb-3'
        : tag === 'h2'
          ? 'text-[12pt] font-bold underline mb-2'
          : 'text-[11pt] underline mb-2';
    el.className = cls;
    el.setAttribute('data-question-id', this.__questionId);
  }

  createDOM(): HTMLElement {
    const tag = this.getTag();
    const el = document.createElement(tag);
    this.applyStyle(el);
    return el;
  }

  updateDOM(prevNode: TitleHeadingNode, dom: HTMLElement): boolean {
    // If level changes, re-create element (tag differs)
    if (prevNode.__level !== this.__level) {
      return true;
    }
    // Otherwise, just ensure attributes/classes are correct
    this.applyStyle(dom);
    return false;
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement(this.getTag());
    this.applyStyle(el);
    return { element: el };
  }

  static importJSON(json: SerializedTitleHeadingNode): TitleHeadingNode {
    const level = (json.level ?? 3) as TitleLevel;
    return new TitleHeadingNode(json.questionId, level);
  }

  exportJSON(): SerializedTitleHeadingNode {
    return {
      type: 'title-heading',
      version: 1,
      questionId: this.__questionId,
      level: this.__level,
    };
  }
}

export function $createTitleHeadingNode(
  questionId: string,
  level: TitleLevel = 3,
): TitleHeadingNode {
  return new TitleHeadingNode(questionId, level);
}

export function $isTitleHeadingNode(
  node: LexicalNode | null | undefined,
): node is TitleHeadingNode {
  return node instanceof TitleHeadingNode;
}

