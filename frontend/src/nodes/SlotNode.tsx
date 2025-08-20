import { DecoratorNode, type LexicalNode, type NodeKey } from 'lexical';
import type { SlotType } from '../types/template';
import React from 'react';

export type SerializedSlotNode = {
  type: 'slot';
  slotId: string;
  slotLabel?: string;
  slotType: SlotType;
  optional: boolean;
  placeholder: string;
  version: 1;
};

export class SlotNode extends DecoratorNode<JSX.Element> {
  __slotId: string;
  __slotLabel: string;
  __slotType: SlotType;
  __optional: boolean;
  __placeholder: string;

  constructor(
    slotId: string,
    slotLabel: string,
    slotType: SlotType,
    optional: boolean,
    placeholder: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__slotId = slotId;
    this.__slotLabel = slotLabel ?? slotId;
    this.__slotType = slotType;
    this.__optional = optional;
    this.__placeholder = placeholder;
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
      node.__key,
    );
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'bg-yellow-200 text-yellow-800 px-1 rounded';
    span.textContent = this.__slotLabel;
    span.contentEditable = 'false';
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(json: SerializedSlotNode): SlotNode {
    return new SlotNode(
      json.slotId,
      json.slotLabel ?? json.slotId,
      json.slotType,
      json.optional,
      json.placeholder,
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
      version: 1,
    };
  }

  decorate(): JSX.Element {
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
): SlotNode {
  return new SlotNode(slotId, slotLabel, slotType, optional, placeholder);
}

export function $isSlotNode(
  node: LexicalNode | null | undefined,
): node is SlotNode {
  return node instanceof SlotNode;
}
