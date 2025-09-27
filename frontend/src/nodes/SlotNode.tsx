import {
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type LexicalEditor,
  type DOMExportOutput,
} from 'lexical';
import type { SlotType } from '../types/template';
import * as React from 'react';

export type SerializedSlotNode = {
  type: 'slot';
  slotId: string;
  slotLabel?: string;
  slotType: SlotType;
  optional: boolean;
  placeholder: string;
  pathOption?: string;
  version: 1;
};

export class SlotNode extends DecoratorNode<React.ReactNode> {
  __slotId: string;
  __slotLabel: string;
  __slotType: SlotType;
  __optional: boolean;
  __placeholder: string;
  __pathOption?: string;

  constructor(
    slotId: string,
    slotLabel: string,
    slotType: SlotType,
    optional: boolean,
    placeholder: string,
    pathOption?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__slotId = slotId;
    this.__slotLabel = slotLabel ?? slotId;
    this.__slotType = slotType;
    this.__optional = optional;
    this.__placeholder = placeholder;
    this.__pathOption = pathOption;
  }

  static getType(): string {
    return 'slot';
  }

  static clone(node: SlotNode): SlotNode {
    return new SlotNode(
      node.__slotId,
      node.__slotLabel,
      node.__slotType,
      node.__optional,
      node.__placeholder,
      node.__pathOption,
      node.__key,
    );
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'bg-yellow-200 text-yellow-800 px-1 rounded';
    span.contentEditable = 'false';
    // Ne pas mettre textContent ici - le rendu est géré par decorate()

    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  // Ensure custom node is exported to HTML when using $generateHtmlFromNodes
  exportDOM(): DOMExportOutput {
    const span = document.createElement('span');
    span.textContent = this.__slotLabel;
    span.setAttribute('data-slot-id', this.__slotId);
    span.setAttribute('data-slot-type', String(this.__slotType || ''));
    span.setAttribute('data-optional', String(!!this.__optional));
    if (this.__pathOption) {
      span.setAttribute('data-path-option', this.__pathOption);
    }
    span.style.backgroundColor = '#FEF08A'; // tailwind yellow-200
    span.style.color = '#854D0E'; // tailwind yellow-800
    span.style.padding = '0 2px';
    span.style.borderRadius = '2px';
    span.style.whiteSpace = 'nowrap';
    return { element: span };
  }

  static importJSON(json: SerializedSlotNode): SlotNode {
    return new SlotNode(
      json.slotId,
      json.slotLabel ?? json.slotId,
      json.slotType,
      json.optional,
      json.placeholder,
      json.pathOption,
    );
  }

  exportJSON(): SerializedSlotNode {
    return {
      type: 'slot',
      slotId: this.__slotId,
      slotLabel: this.__slotLabel,
      slotType: this.__slotType,
      optional: this.__optional,
      placeholder: this.__placeholder,
      pathOption: this.__pathOption,
      version: 1,
    };
  }

  // Public helpers for external updates inside editor.update()
  getSlotId(): string {
    return this.__slotId;
  }

  getLabel(): string {
    return this.__slotLabel;
  }

  setLabel(newLabel: string): void {
    // Use Lexical's immutable pattern: get writable clone before mutation
    const writable = this.getWritable() as SlotNode;
    writable.__slotLabel = newLabel;
  }

  getPathOption(): string | undefined {
    return this.__pathOption;
  }

  // Export slot as readable text format for LLM processing
  exportText(): string {
    return `[[slot:${this.__slotId}|${this.__slotLabel}]]`;
  }

  decorate(): React.ReactNode {
    return (
      <span
        className="bg-yellow-200 text-yellow-800 px-1 rounded"
        contentEditable={false}
      >
        {this.__slotLabel}
      </span>
    );
  }
}

export function $createSlotNode(
  slotId: string,
  slotLabel: string,
  slotType: SlotType,
  optional = false,
  placeholder = '…',
  pathOption?: string,
): SlotNode {
  return new SlotNode(
    slotId,
    slotLabel,
    slotType,
    optional,
    placeholder,
    pathOption,
  );
}

export function $isSlotNode(
  node: LexicalNode | null | undefined,
): node is SlotNode {
  return node instanceof SlotNode;
}
