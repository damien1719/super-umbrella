import { DecoratorNode, type NodeKey, type DOMExportOutput } from 'lexical';
import * as React from 'react';

export type SerializedAnchorNode = {
  type: 'anchor-node';
  version: 1;
  anchorType?: 'CR:TBL';
  anchorId: string;
  groupId?: string;
  questionId?: string;
};

export class AnchorNode extends DecoratorNode<JSX.Element> {
  __anchorId: string;
  __groupId: string | null;
  __questionId: string | null;

  static getType() {
    return 'anchor-node';
  }

  static clone(node: AnchorNode) {
    return new AnchorNode(
      node.__anchorId,
      node.__groupId ?? undefined,
      node.__questionId ?? undefined,
      node.__key,
    );
  }

  constructor(
    anchorId: string,
    groupId?: string,
    questionId?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__anchorId = anchorId;
    this.__groupId = groupId ?? null;
    this.__questionId = questionId ?? null;
  }

  static importJSON(json: SerializedAnchorNode) {
    return new AnchorNode(json.anchorId, json.groupId, json.questionId);
  }

  exportJSON(): SerializedAnchorNode {
    return {
      type: 'anchor-node',
      anchorType: 'CR:TBL',
      version: 1,
      anchorId: this.__anchorId,
      groupId: this.__groupId ?? undefined,
      questionId: this.__questionId ?? undefined,
    };
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.contentEditable = 'false';
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const code = document.createElement('code');
    code.setAttribute('data-anchor-id', this.__anchorId);
    code.textContent = `[[CR:TBL|id=${this.__anchorId}]]`;
    return { element: code };
  }

  decorate() {
    return (
      <span
        style={{
          padding: '2px 6px',
          borderRadius: 6,
          background: '#fff7ed', // orange-50
          border: '1px dashed #fdba74', // orange-300
          fontSize: 12,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          color: '#9a3412', // orange-800
        }}
        title={`Ancre tableau: ${this.__anchorId}`}
      >
        Le tableau rempli sera inséré à cet emplacement
      </span>
    );
  }
}

export function $createAnchorNode(
  anchorId: string,
  groupId?: string,
  questionId?: string,
): AnchorNode {
  return new AnchorNode(anchorId, groupId, questionId);
}

export function $isAnchorNode(node: unknown): node is AnchorNode {
  return node instanceof AnchorNode;
}

