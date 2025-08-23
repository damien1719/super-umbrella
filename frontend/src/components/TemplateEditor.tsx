import * as React from 'react';
import RichTextEditor, { RichTextEditorHandle } from './RichTextEditor';
import SlotSidebar from './SlotSidebar';
import type { SectionTemplate } from '../types/template';

interface Props {
  template: SectionTemplate;
  onChange: (t: SectionTemplate) => void;
  onUpdateSlot?: (slotId: string, slotLabel: string) => void;
  onTransformToQuestions?: (content: string) => void;
}

export default function TemplateEditor({
  template,
  onChange,
  onUpdateSlot,
  onTransformToQuestions,
}: Props) {
  const editorRef = React.useRef<RichTextEditorHandle>(null);
  const [, forceUpdate] = React.useState(0);
  /* 
  // Force re-render when AST changes
  React.useEffect(() => {
    // Force a re-render to ensure RichTextEditor gets updated
    forceUpdate((prev) => prev + 1);
  }, [template.id, template.content, template.slotsSpec]);

 */

  return (
    <div className="flex w-full gap-4">
      <div className="basis-3/4 min-w-0">
        <RichTextEditor
          ref={editorRef}
          templateKey={`${template.id}:${template.updatedAt || ''}`}
          initialStateJson={template.content}
          onChangeStateJson={(ast) => {
            onChange({ ...template, content: ast });
          }}
        />
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Style prompt</label>
          <textarea
            className="w-full border rounded p-2"
            value={template.stylePrompt ?? ''}
            onChange={(e) =>
              onChange({ ...template, stylePrompt: e.target.value })
            }
          />
        </div>
      </div>
      <div className="basis-1/4 shrink-0">
        <SlotSidebar
          slots={template.slotsSpec}
          onChange={(slots) => onChange({ ...template, slotsSpec: slots })}
          onAddSlot={(slot) =>
            editorRef.current?.insertSlot?.(
              slot.id,
              slot.label || `Slot ${slot.id.split('.').pop()}`,
              slot.type,
            )
          }
          onUpdateSlot={(slotId, slotLabel) => {
            const active = document.activeElement as
              | HTMLInputElement
              | HTMLTextAreaElement
              | null;
            const selStart =
              (active as HTMLInputElement | HTMLTextAreaElement | null)
                ?.selectionStart ?? null;
            const selEnd =
              (active as HTMLInputElement | HTMLTextAreaElement | null)
                ?.selectionEnd ?? null;

            editorRef.current?.updateSlot?.(slotId, slotLabel);

            // Restore focus and selection to the previously focused input/textarea
            if (active && typeof active.focus === 'function') {
              // Use microtask to let Lexical finish its update cycle
              requestAnimationFrame(() => {
                active.focus({ preventScroll: true } as any);
                if (
                  selStart !== null &&
                  selEnd !== null &&
                  'setSelectionRange' in active
                ) {
                  try {
                    (
                      active as HTMLInputElement | HTMLTextAreaElement
                    ).setSelectionRange(selStart, selEnd);
                  } catch {}
                }
              });
            }
          }}
          onTransformToQuestions={() => {
            const state = editorRef.current?.getEditorStateJson?.();
            const extract = (node: any): string => {
              if (!node) return '';
              if (typeof node.text === 'string') return node.text;
              if (node.type === 'slot')
                return node.slotLabel || node.slotId || '';
              if (Array.isArray(node.children))
                return node.children.map(extract).join(' ');
              return '';
            };
            const content = extract(state);
            onTransformToQuestions?.(content);
          }}
        />
      </div>
    </div>
  );
}
