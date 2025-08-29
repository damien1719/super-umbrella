import { DecoratorNode, type NodeKey, type LexicalNode } from 'lexical';
import * as React from 'react';

export type SerializedSectionPlaceholder = {
  type: 'section-placeholder';
  version: 1;
  sectionId: string;
  label: string;
};

export class SectionPlaceholderNode extends DecoratorNode<JSX.Element> {
  __sectionId: string;
  __label: string;

  static getType() {
    return 'section-placeholder';
  }

  static clone(node: SectionPlaceholderNode) {
    return new SectionPlaceholderNode(
      node.__sectionId,
      node.__label,
      node.__key,
    );
  }

  constructor(sectionId: string, label: string, key?: NodeKey) {
    super(key);
    this.__sectionId = sectionId;
    this.__label = label;
  }

  static importJSON(json: SerializedSectionPlaceholder) {
    return new SectionPlaceholderNode(json.sectionId, json.label);
  }

  exportJSON(): SerializedSectionPlaceholder {
    return {
      type: 'section-placeholder',
      version: 1,
      sectionId: this.__sectionId,
      label: this.__label,
    };
  }

  /** Render container element for the decorator */
  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.contentEditable = 'false';
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate() {
    return (
      <span
        style={{
          padding: '2px 6px',
          borderRadius: 6,
          background: '#eef2ff',
          border: '1px solid #c7d2fe',
          fontSize: 12,
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
        title={`Section: ${this.__label}`}
      >
        [SECTION] {this.__label}
      </span>
    );
  }
}

export function $createSectionPlaceholderNode(
  sectionId: string,
  label: string,
) {
  return new SectionPlaceholderNode(sectionId, label);
}

export function $isSectionPlaceholderNode(
  node: LexicalNode | null | undefined,
): node is SectionPlaceholderNode {
  return node instanceof SectionPlaceholderNode;
}
