// DecorBlockPlugin.tsx
'use client';
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $isElementNode,
  $isTextNode,
  $getRoot,
  $createParagraphNode,
  TextNode,
  ParagraphNode,
  type ElementNode,
} from 'lexical';
import { DecorBlockNode } from '../nodes/DecorBlockNode';

// -------- helpers --------
function isElementVisuallyEmpty(el: ElementNode): boolean {
  if (el.getChildrenSize() === 0) return true;
  for (const child of el.getChildren()) {
    if ($isElementNode(child)) {
      if (!isElementVisuallyEmpty(child)) return false;
    } else if ($isTextNode(child)) {
      if (child.getTextContent().trim().length > 0) return false;
    } else {
      // autre type (ex: decorator inline) => considère non vide
      return false;
    }
  }
  return true;
}

function isDecorVisuallyEmpty(node: DecorBlockNode): boolean {
  const n = node.getChildrenSize();
  if (n === 0) return true;
  if (n === 1) {
    const only = node.getFirstChild();
    if ($isElementNode(only)) return isElementVisuallyEmpty(only);
  }
  return false;
}

function unwrapNode(node: DecorBlockNode) {
  let child = node.getFirstChild();
  while (child) {
    node.insertBefore(child);
    child = node.getFirstChild();
  }
  unwrapNode(node);  
}

function ensureTrailingParagraphAfter(node: DecorBlockNode) {
  const next = node.getNextSibling();
  if (!next || next.getType() !== 'paragraph') {
    node.insertAfter($createParagraphNode());
  }
}

// -------- plugin --------
export default function DecorBlockPlugin() {
  const [editor] = useLexicalComposerContext();

/*   useEffect(() => {
    // 1) Transform sur DecorBlockNode (création / remplacements)
    const unDecor = editor.registerNodeTransform(DecorBlockNode, (node) => {
      const hasBorder = node.getWeight?.() !== 'none';
      const hasFill = node.getFill?.() !== 'none';

      if (!hasBorder && !hasFill) {
        unwrapNode(node);
        return;
      }
      if (isDecorVisuallyEmpty(node)) {
        // soit on supprime, soit on garde et on ajoute un paragraphe en dessous
        unwrapNode(node);  
        // ensureTrailingParagraphAfter(node);
      }
    }); */

    // 2) Transform sur TextNode : édition interne -> remonter et nettoyer
/*     const unText = editor.registerNodeTransform(TextNode, (t) => {
      const top = t.getTopLevelElement();
      if (top && top instanceof DecorBlockNode) {
        const hasBorder = top.getWeight?.() !== 'none';
        const hasFill = top.getFill?.() !== 'none';
        if (!hasBorder && !hasFill) {
          unwrapNode(top);
          return;
        }
        if (isDecorVisuallyEmpty(top)) {
          unwrapNode(top);  
          // ensureTrailingParagraphAfter(top);
        }
      }
    }); */

    // 3) Transform sur ParagraphNode (structure)
/*     const unPara = editor.registerNodeTransform(ParagraphNode, (p) => {
      const top = p.getTopLevelElement();
      if (top && top instanceof DecorBlockNode) {
        const hasBorder = top.getWeight?.() !== 'none';
        const hasFill = top.getFill?.() !== 'none';
        if (!hasBorder && !hasFill) {
          unwrapNode(top);
          return;
        }
        if (isDecorVisuallyEmpty(top)) {
          unwrapNode(top);  
          // ensureTrailingParagraphAfter(top);
        }
      }
    }); */

    // 4) 🔑 Mutation listener : capte la suppression du DERNIER paragraphe
/*     const unParaMut = editor.registerMutationListener(
      ParagraphNode,
      (mutations) => {
        // Si au moins un paragraphe est destroyed, on normalise
        for (const [, type] of mutations) {
          if (type === 'destroyed') {
            // Laisser finir le cycle courant avant de normaliser
            queueMicrotask(() => {
              editor.update(() => {
                const root = $getRoot();
                const stack = [...root.getChildren()];
                while (stack.length) {
                  const n = stack.pop()!;
                  if (n instanceof DecorBlockNode) {
                    const hasBorder = n.getWeight?.() !== 'none';
                    const hasFill = n.getFill?.() !== 'none';
                    if (!hasBorder && !hasFill) {
                      unwrapNode(n);
                      continue;
                    }
                    if (isDecorVisuallyEmpty(n)) {
                      unwrapNode(n);  
                      continue;
                    }
                  }
                  if ($isElementNode(n)) stack.push(...n.getChildren());
                }
              });
            });
            break;
          }
        }
      },
    ); */

    // 5) Normalisation one-shot à l’ouverture (pour le JSON initial)
/*     editor.update(() => {
      const root = $getRoot();
      const stack: Array<any> = [...root.getChildren()];
      while (stack.length) {
        const n = stack.pop()!;
        if (n instanceof DecorBlockNode) {
          const hasBorder = n.getWeight?.() !== 'none';
          const hasFill = n.getFill?.() !== 'none';
          if (!hasBorder && !hasFill) {
            unwrapNode(n);
          } else if (isDecorVisuallyEmpty(n)) {
            unwrapNode(n);  
          }
          continue;
        }
        if ($isElementNode(n)) stack.push(...n.getChildren());
      }
    }); */

/*     return () => {
      unDecor();
      unText();
      unPara();
      unParaMut();
    };
  }, [editor]);
 */
  return null;
}
