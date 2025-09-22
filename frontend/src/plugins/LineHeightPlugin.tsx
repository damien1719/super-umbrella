import { useEffect } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isElementNode,
  ElementNode,
  TextNode,
  createCommand,
  COMMAND_PRIORITY_NORMAL,
  type LexicalEditor,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isBorderBlockNode } from '../nodes/BorderBlockNode';

export type LineHeightValue = string | null;

export const SET_LINE_HEIGHT_COMMAND = createCommand<LineHeightValue>();

function parseStyle(style: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!style) return result;
  const declarations = style.split(';');
  for (const declaration of declarations) {
    if (!declaration) continue;
    const [prop, ...valueParts] = declaration.split(':');
    if (!prop || valueParts.length === 0) continue;
    const value = valueParts.join(':').trim();
    if (!value) continue;
    result[prop.trim()] = value;
  }
  return result;
}

function stringifyStyle(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([prop, value]) => `${prop}: ${value}`)
    .join('; ');
}

function setStyleProperty(
  node: ElementNode,
  property: string,
  value: string | null,
) {
  const current = parseStyle(node.getStyle());
  if (value == null || value === '') delete current[property];
  else current[property] = value;
  const serialized = stringifyStyle(current);
  node.setStyle(serialized);
}

function getTargetElement(
  node: ElementNode | TextNode | null,
): ElementNode | null {
  if (!node) return null;
  const topLevel = (node as TextNode).getTopLevelElement?.() ?? node;
  if (!topLevel || !$isElementNode(topLevel)) return null;
  if ($isRootOrShadowRoot(topLevel)) return null;
  if ($isBorderBlockNode(topLevel)) {
    const inner = topLevel.getFirstChild();
    return $isElementNode(inner) ? inner : null;
  }
  return topLevel;
}

function applyLineHeight(editor: LexicalEditor, value: string | null): boolean {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const normalized = value && value.trim() !== '' ? value : null;
    const targets = new Map<string, ElementNode>();

    for (const node of selection.getNodes()) {
      const element = getTargetElement(node);
      if (element) targets.set(element.getKey(), element);
    }

    if (targets.size === 0) {
      const anchorElement = getTargetElement(selection.anchor.getNode());
      if (anchorElement) targets.set(anchorElement.getKey(), anchorElement);
    }

    for (const node of targets.values()) {
      setStyleProperty(
        node,
        'line-height',
        normalized === '1' ? null : normalized,
      );
    }
  });
  return true;
}

export function LineHeightPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand(
        SET_LINE_HEIGHT_COMMAND,
        (value) => applyLineHeight(editor, value ?? null),
        COMMAND_PRIORITY_NORMAL,
      ),
    [editor],
  );

  return null;
}
