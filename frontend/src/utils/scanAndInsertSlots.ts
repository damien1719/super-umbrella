import {
  $getRoot,
  $isParagraphNode,
  $isTextNode,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { $createSlotNode, $isSlotNode } from '../nodes/SlotNode';
import { isHeadingCandidate } from './headingHeuristics';
import type { FieldSpec } from '../types/template';
import { normalize } from './textNormalization';

/**
 * Check if a node is part of a table structure
 */
function isTableNode(node: LexicalNode): boolean {
  const type = node.getType();
  return type === 'table' || type === 'tablerow' || type === 'tablecell';
}

/**
 * Check if a node is inside a table structure by traversing up the tree
 */
function isInsideTable(node: LexicalNode): boolean {
  let current: LexicalNode | null = node;
  while (current) {
    if (isTableNode(current)) {
      return true;
    }
    // @ts-ignore: ElementNode has getParent
    current = (current as any).getParent ? (current as any).getParent() : null;
  }
  return false;
}

/**
 * Find a safe insertion point after the current node, ensuring we don't break table structure
 */
function findSafeInsertionPoint(node: LexicalNode): LexicalNode | null {
  // If we're inside a table, we need to find a safe place outside
  if (isInsideTable(node)) {
    let current: LexicalNode | null = node;

    // Traverse up until we find the table node
    while (current && !isTableNode(current)) {
      // @ts-ignore: ElementNode has getParent
      current = (current as any).getParent
        ? (current as any).getParent()
        : null;
    }

    // If we found a table, try to insert after it
    if (current) {
      // @ts-ignore: ElementNode has getNextSibling
      const nextSibling = (current as any).getNextSibling
        ? (current as any).getNextSibling()
        : null;
      if (nextSibling) {
        return nextSibling;
      }
      // If no next sibling, try to insert after the parent of the table
      // @ts-ignore: ElementNode has getParent
      const tableParent = (current as any).getParent
        ? (current as any).getParent()
        : null;
      if (tableParent) {
        return tableParent;
      }
    }

    // If we can't find a safe place, return null
    return null;
  }

  // If we're not in a table, we can insert after the current node
  return node;
}

/**
 * Compute format flags for a node by recursively scanning its text children
 */
function computeFormatFlags(node: LexicalNode): {
  hasBold: boolean;
  hasUnderline: boolean;
} {
  let hasBold = false;
  let hasUnderline = false;

  // On parcourt récursivement tous les enfants
  const stack: LexicalNode[] = [node];
  while (stack.length) {
    const current = stack.pop()!;
    // @ts-ignore: ElementNode has getChildren
    if (typeof (current as any).getChildren === 'function') {
      // @ts-ignore
      stack.push(...(current as any).getChildren());
    }
    if ($isTextNode(current)) {
      if (current.hasFormat('bold')) hasBold = true;
      if (current.hasFormat('underline')) hasUnderline = true;
      if (hasBold && hasUnderline) break; // Optimisation: on peut arrêter si on a les deux
    }
  }
  return { hasBold, hasUnderline };
}

export function scanAndInsertSlots(
  editor: LexicalEditor,
  onSlotCreated?: (slot: FieldSpec) => void,
): void {
  console.log('[DEBUG] scanAndInsertSlots called');

  // Normaliser le texte de l'éditeur avant traitement
  const plainText = editor.getEditorState().read(() => {
    const root = $getRoot();
    return root.getTextContent();
  });

  const normalizedText = normalize(plainText);
  console.log('[DEBUG] Original text length:', plainText.length);
  console.log('[DEBUG] Normalized text length:', normalizedText.length);
  console.log('[DEBUG] Normalized text preview:', normalizedText.slice(0, 200));

  editor.update(() => {
    console.log('[DEBUG] Inside editor.update');
    const root = $getRoot();
    console.log('[DEBUG] Root node:', root);

    const visit = (parent: LexicalNode): void => {
      const element = parent as unknown as {
        getChildren?: () => LexicalNode[];
      };
      const children = element.getChildren ? element.getChildren() : [];
      console.log('[DEBUG] Visiting node with', children.length, 'children');

      for (let i = 0; i < children.length; i++) {
        const node = children[i];

        // Skip table nodes entirely - don't process them
        if (isTableNode(node)) {
          console.log('[DEBUG] Skipping table node:', node.getType());
          continue;
        }

        if ($isTextNode(node)) {
          continue;
        }

        const text = node.getTextContent();
        const isHeadingNode = $isHeadingNode(node);
        const next = children[i + 1];
        const nextIsEmptyParagraph =
          !!next && $isParagraphNode(next) && !next.getTextContent().trim();

        // Calculer les flags de format pour ce nœud
        const { hasBold, hasUnderline } = computeFormatFlags(node);

        console.log('[DEBUG] Node:', {
          type: node.getType(),
          text: text.slice(0, 50),
          isHeadingNode,
          nextIsEmptyParagraph,
          hasBold,
          hasUnderline,
        });

        if (
          isHeadingCandidate({
            text,
            isHeadingNode,
            nextIsEmptyParagraph,
            hasBold,
            hasUnderline,
          })
        ) {
          console.log('[DEBUG] Heading candidate found:', text);
          if (next && $isSlotNode(next)) {
            console.log('[DEBUG] Already followed by a SlotNode, skipping');
            // Already followed by a SlotNode, skip
          } else {
            const label = text.replace(/[:\s]*$/, '').trim();

            // Validation supplémentaire: Ne pas créer de slot si le label est vide ou uniquement des espaces
            if (!label || label.length === 0 || /^\s*$/.test(label)) {
              console.log(
                '[DEBUG] Skipping slot creation - empty or whitespace-only label:',
                JSON.stringify(label),
              );
              continue;
            }

            const slug = label
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_+|_+$/g, '');
            const slotId = slug || `slot_${Date.now()}`;
            console.log('[DEBUG] Creating slot:', { slotId, label });

            // Find a safe insertion point that won't break table structure
            const safeInsertionPoint = findSafeInsertionPoint(node);
            if (!safeInsertionPoint) {
              console.log(
                '[DEBUG] Could not find safe insertion point, skipping slot creation',
              );
              continue;
            }

            // Créer le slot visuellement dans l'éditeur
            const slot = $createSlotNode(slotId, label || slotId, 'text');
            safeInsertionPoint.insertAfter(slot);
            console.log('[DEBUG] Slot inserted after safe insertion point');

            // Créer le slot dans le slotsSpec si le callback est fourni
            if (onSlotCreated) {
              const fieldSpec: FieldSpec = {
                kind: 'field',
                id: slotId,
                type: 'text',
                mode: 'llm',
                label: label || slotId,
                prompt:
                  'Description factuelle en phrases complètes, ton descriptif et professionnel, pas de listes',
                pattern: '',
                deps: [],
                preset: 'description',
                optional: false,
              };
              console.log('[DEBUG] Adding slot to slotsSpec:', fieldSpec);
              onSlotCreated(fieldSpec);
            }
          }
        }

        // Only visit children if this node is not a table node
        if (!isTableNode(node)) {
          visit(node);
        }
      }
    };

    visit(root);
    console.log('[DEBUG] scanAndInsertSlots completed');
  });
}
