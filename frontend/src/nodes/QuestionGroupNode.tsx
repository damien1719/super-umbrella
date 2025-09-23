import { ElementNode, type NodeKey, type DOMExportOutput, type LexicalNode } from 'lexical';

export type SerializedQuestionGroupNode = {
  type: 'question-group';
  version: 1;
  questionId: string;
  groupId: string;
};

export class QuestionGroupNode extends ElementNode {
  __questionId: string;
  __groupId: string;

  static getType(): string {
    return 'question-group';
  }

  static clone(node: QuestionGroupNode): QuestionGroupNode {
    return new QuestionGroupNode(node.__questionId, node.__groupId, node.__key);
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
    const writable = this.getWritable() as QuestionGroupNode;
    writable.__questionId = id;
  }

  getGroupId(): string {
    return this.__groupId;
  }

  setGroupId(id: string): void {
    const writable = this.getWritable() as QuestionGroupNode;
    writable.__groupId = id;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.setAttribute('data-question-group', '');
    div.setAttribute('data-question-id', this.__questionId);
    div.setAttribute('data-group-id', this.__groupId);
    return div;
  }

  updateDOM(prevNode: QuestionGroupNode, dom: HTMLElement): boolean {
    if (prevNode.__questionId !== this.__questionId) {
      dom.setAttribute('data-question-id', this.__questionId);
    }
    if (prevNode.__groupId !== this.__groupId) {
      dom.setAttribute('data-group-id', this.__groupId);
    }
    return false;
  }

  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');
    div.setAttribute('data-question-group', '');
    div.setAttribute('data-question-id', this.__questionId);
    div.setAttribute('data-group-id', this.__groupId);
    return { element: div };
  }

  static importJSON(json: SerializedQuestionGroupNode): QuestionGroupNode {
    return new QuestionGroupNode(json.questionId, json.groupId);
  }

  exportJSON(): SerializedQuestionGroupNode {
    return {
      type: 'question-group',
      version: 1,
      questionId: this.__questionId,
      groupId: this.__groupId,
    };
  }
}

export function $createQuestionGroupNode(
  questionId: string,
  groupId: string,
): QuestionGroupNode {
  return new QuestionGroupNode(questionId, groupId);
}

export function $isQuestionGroupNode(
  node: LexicalNode | null | undefined,
): node is QuestionGroupNode {
  return node instanceof QuestionGroupNode;
}

