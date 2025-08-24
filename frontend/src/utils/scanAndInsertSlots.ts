import {
  $getRoot,
  $isParagraphNode,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { $createSlotNode, $isSlotNode } from '../nodes/SlotNode';
import { isHeadingCandidate } from './headingHeuristics';

export function scanAndInsertSlots(editor: LexicalEditor): void {
  editor.update(() => {
    const root = $getRoot();

    const visit = (parent: LexicalNode): void => {
      const element = parent as unknown as {
        getChildren?: () => LexicalNode[];
      };
      const children = element.getChildren ? element.getChildren() : [];
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        const text = node.getTextContent();
        const isHeadingNode = $isHeadingNode(node);
        const next = children[i + 1];
        const nextIsEmptyParagraph =
          !!next && $isParagraphNode(next) && !next.getTextContent().trim();

        if (isHeadingCandidate({ text, isHeadingNode, nextIsEmptyParagraph })) {
          if (next && $isSlotNode(next)) {
            // Already followed by a SlotNode, skip
          } else {
            const label = text.replace(/[:\s]*$/, '').trim();
            const slug = label
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_+|_+$/g, '');
            const slotId = slug || `slot_${Date.now()}`;
            const slot = $createSlotNode(slotId, label || slotId, 'text');
            node.insertAfter(slot);
          }
        }

        visit(node);
      }
    };

    visit(root);
  });
}
