import { DecoratorNode, type DOMExportOutput, type NodeKey } from 'lexical';
import * as React from 'react';

export type SerializedGroupHeadingMarker = {
  type: 'group-heading';
  version: 1;
  headingId?: string | null;
  groupId?: string | null;
};

// Invisible marker node used to carry headingId/groupId metadata even when
// the visible heading is reformatted (e.g., turned into a list item).
export class GroupHeadingMarkerNode extends DecoratorNode<null> {
  __headingId: string | null;
  __groupId: string | null;

  static getType(): string {
    return 'group-heading';
  }

  static clone(node: GroupHeadingMarkerNode): GroupHeadingMarkerNode {
    return new GroupHeadingMarkerNode(
      node.__headingId ?? null,
      node.__groupId ?? null,
      node.__key,
    );
  }

  constructor(headingId?: string | null, groupId?: string | null, key?: NodeKey) {
    super(key);
    this.__headingId = headingId ?? null;
    this.__groupId = groupId ?? null;
  }

  static importJSON(json: SerializedGroupHeadingMarker): GroupHeadingMarkerNode {
    return new GroupHeadingMarkerNode(
      json.headingId ?? null,
      json.groupId ?? null,
    );
  }

  exportJSON(): SerializedGroupHeadingMarker {
    return {
      type: 'group-heading',
      version: 1,
      headingId: this.__headingId ?? null,
      groupId: this.__groupId ?? null,
    };
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.style.display = 'none';
    span.setAttribute('aria-hidden', 'true');
    span.setAttribute('data-group-heading', '');
    if (this.__groupId) span.setAttribute('data-group-id', this.__groupId);
    if (this.__headingId) span.setAttribute('data-heading-id', this.__headingId);
    // Keep it non-editable to avoid caret placement
    span.contentEditable = 'false';
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(): DOMExportOutput {
    // Export an invisible span; DOMPurify will strip data-* in exports, which is fine.
    const span = document.createElement('span');
    span.style.display = 'none';
    span.setAttribute('aria-hidden', 'true');
    return { element: span };
  }

  decorate(): null {
    return null;
  }
}

export function $createGroupHeadingMarkerNode(
  headingId?: string | null,
  groupId?: string | null,
) {
  return new GroupHeadingMarkerNode(headingId ?? null, groupId ?? null);
}

export function $isGroupHeadingMarkerNode(
  node: unknown,
): node is GroupHeadingMarkerNode {
  return node instanceof GroupHeadingMarkerNode;
}

