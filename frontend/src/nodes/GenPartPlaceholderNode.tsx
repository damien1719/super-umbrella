import { DecoratorNode, type NodeKey, type DOMExportOutput } from 'lexical';
import * as React from 'react';
import type { GenPartPlaceholderNodeJSON } from '../types/editor/genPartPlaceholder';

export class GenPartPlaceholderNode extends DecoratorNode<React.ReactNode> {
  __placeholderId: string;
  __questionIds: string[];
  __groupId: string | null;

  constructor(
    placeholderId: string,
    questionIds: string[],
    groupId?: string | null,
    key?: NodeKey,
  ) {
    super(key);
    this.__placeholderId = placeholderId;
    this.__questionIds = questionIds || [];
    this.__groupId = groupId ?? null;
  }

  static getType(): string {
    return 'gen-part-placeholder';
  }

  static clone(node: GenPartPlaceholderNode): GenPartPlaceholderNode {
    return new GenPartPlaceholderNode(
      node.__placeholderId,
      [...node.__questionIds],
      node.__groupId,
      node.__key,
    );
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className =
      'my-2 p-2 border-2 border-dashed border-blue-300 bg-blue-50 rounded';
    div.contentEditable = 'false';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');
    div.setAttribute('data-gen-part', this.__placeholderId);
    div.textContent = `⧉ Groupe (${this.__questionIds.length})`;
    return { element: div };
  }

  exportJSON(): GenPartPlaceholderNodeJSON {
    return {
      type: 'gen-part-placeholder',
      placeholderId: this.__placeholderId,
      groupId: this.__groupId ?? undefined,
      scope: { type: 'questions-list' },
      questionIds: [...this.__questionIds],
      recipeId: null,
      policyIfEmpty: null,
      version: 1,
    };
  }

  static importJSON(json: GenPartPlaceholderNodeJSON): GenPartPlaceholderNode {
    return new GenPartPlaceholderNode(
      json.placeholderId,
      json.questionIds,
      typeof json.groupId === 'string' ? json.groupId : null,
    );
  }

  getPlaceholderId(): string {
    return this.__placeholderId;
  }

  getQuestionIds(): string[] {
    return [...this.__questionIds];
  }

  setQuestionIds(ids: string[]): void {
    const writable = this.getWritable() as GenPartPlaceholderNode;
    writable.__questionIds = [...ids];
  }

  getGroupId(): string | null {
    return this.__groupId;
  }

  setGroupId(groupId: string | null): void {
    const writable = this.getWritable() as GenPartPlaceholderNode;
    writable.__groupId = groupId ?? null;
  }

  decorate(): React.ReactNode {
    return (
      <div className="text-blue-700 text-sm select-none">
        <div className="font-base">
          Bilan Plume écrira ici des phrases simples sur la base de la réponses
          à vos questions
        </div>
        <div className="opacity-80">{this.__questionIds.length} questions</div>
      </div>
    );
  }
}

export function $createGenPartPlaceholderNode(
  placeholderId: string,
  questionIds: string[],
  groupId?: string | null,
): GenPartPlaceholderNode {
  return new GenPartPlaceholderNode(placeholderId, questionIds, groupId ?? null);
}

export function $isGenPartPlaceholderNode(
  node: unknown,
): node is GenPartPlaceholderNode {
  return node instanceof GenPartPlaceholderNode;
}
