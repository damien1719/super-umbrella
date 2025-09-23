import {
  ElementNode,
  type NodeKey,
  type DOMExportOutput,
  type LexicalNode,
  type RangeSelection,
  $createParagraphNode,
  $isParagraphNode,
  $isTextNode,
} from 'lexical';

export type SerializedQuestionTypeTitreNode = {
  type: 'question-type-titre';
  version: 1;
  questionId: string;
  groupId: string;
};

export class QuestionTypeTitreNode extends ElementNode {
  __questionId: string;
  __groupId: string;

  static getType(): string {
    return 'question-type-titre';
  }

  static clone(node: QuestionTypeTitreNode): QuestionTypeTitreNode {
    return new QuestionTypeTitreNode(node.__questionId, node.__groupId, node.__key);
  }

  constructor(questionId: string, groupId: string, key?: NodeKey) {
    super(key);
    this.__questionId = questionId;
    this.__groupId = groupId;
  }

  getQuestionId(): string {
    return this.__questionId;
  }

  setQuestionId(id: string): void {
    const writable = this.getWritable() as QuestionTypeTitreNode;
    writable.__questionId = id;
  }

  getGroupId(): string {
    return this.__groupId;
  }

  setGroupId(id: string): void {
    const writable = this.getWritable() as QuestionTypeTitreNode;
    writable.__groupId = id;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.setAttribute('data-question-type-titre', '');
    div.setAttribute('data-question-id', this.__questionId);
    div.setAttribute('data-group-id', this.__groupId);
    return div;
  }

  updateDOM(prevNode: QuestionTypeTitreNode, dom: HTMLElement): boolean {
    if (prevNode.__questionId !== this.__questionId) {
      dom.setAttribute('data-question-id', this.__questionId);
    }
    if (prevNode.__groupId !== this.__groupId) {
      dom.setAttribute('data-group-id', this.__groupId);
    }
    return false;
  }

  // Allow Enter to create a new paragraph after the title container
  insertNewAfter(
    _selection: RangeSelection | null | undefined,
    restoreSelection = true,
  ): null | LexicalNode {
    const paragraph = $createParagraphNode();
    const dir = this.getDirection();
    if (dir) paragraph.setDirection(dir);
    this.insertAfter(paragraph, restoreSelection);
    return paragraph;
  }

  // Keep a strict structure: only a single child (the visible title content)
  // lives under this container. Any additional nodes appended are placed
  // after the container instead of nested inside it.
  append(...nodesToAppend: LexicalNode[]): this {
    const writable = this.getWritable() as QuestionTypeTitreNode;
    const alreadyHasChild = writable.getChildrenSize() > 0;

    if (!nodesToAppend.length) return this;

    if (!alreadyHasChild) {
      // Accept only the first node as the inner content.
      const first = nodesToAppend[0];
      // Ensure the inner content is wrapped in a paragraph for consistency.
      if ($isParagraphNode(first)) {
        super.append(first);
      } else if ($isTextNode(first)) {
        const para = $createParagraphNode();
        para.append(first);
        super.append(para);
      } else {
        const para = $createParagraphNode();
        super.append(para);
        // Place the non-paragraph node after this container to avoid nesting.
        this.insertAfter(first, false);
      }

      // Any remaining nodes are inserted after the container.
      for (let i = 1; i < nodesToAppend.length; i += 1) {
        const node = nodesToAppend[i];
        this.insertAfter(node, false);
      }
      return this;
    }

    // If there is already a child, do not allow more nested children.
    // Insert any nodes after the container instead.
    let ref: LexicalNode = this;
    for (const node of nodesToAppend) {
      ref = ref.insertAfter(node, false);
    }
    return this;
  }

  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');
    div.setAttribute('data-question-type-titre', '');
    div.setAttribute('data-question-id', this.__questionId);
    div.setAttribute('data-group-id', this.__groupId);
    return { element: div };
  }

  static importJSON(json: SerializedQuestionTypeTitreNode): QuestionTypeTitreNode {
    return new QuestionTypeTitreNode(json.questionId, json.groupId);
  }

  exportJSON(): SerializedQuestionTypeTitreNode {
    return {
      type: 'question-type-titre',
      version: 1,
      questionId: this.__questionId,
      groupId: this.__groupId,
    };
  }
}

export function $createQuestionTypeTitreNode(
  questionId: string,
  groupId: string,
): QuestionTypeTitreNode {
  return new QuestionTypeTitreNode(questionId, groupId);
}

export function $isQuestionTypeTitreNode(
  node: LexicalNode | null | undefined,
): node is QuestionTypeTitreNode {
  return node instanceof QuestionTypeTitreNode;
}
