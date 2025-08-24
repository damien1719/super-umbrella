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
  const [isTransforming, setIsTransforming] = React.useState(false);
  /* 
  // Force re-render when AST changes
  React.useEffect(() => {
    // Force a re-render to ensure RichTextEditor gets updated
    forceUpdate((prev) => prev + 1);
  }, [template.id, template.content, template.slotsSpec]);

 */

  return (
    <div className="flex w-full h-screen gap-4 overflow-hidden">
      <div className="basis-3/4 min-w-0 min-h-0">
        <div className="h-full overflow-auto overscroll-contain">
          <RichTextEditor
            ref={editorRef}
            templateKey={`${template.id}:${template.updatedAt || ''}`}
            initialStateJson={template.content}
            onChangeStateJson={(ast) => {
              onChange({ ...template, content: ast });
            }}
          />
          {/*         <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Style prompt</label>
            <textarea
              className="w-full border rounded p-2"
              value={template.stylePrompt ?? ''}
              onChange={(e) =>
                onChange({ ...template, stylePrompt: e.target.value })
              }
            />
          </div> */}
        </div>
      </div>
      <div className="basis-1/4 shrink-0 min-h-0">
        <div className="h-full overflow-auto overscroll-contain">
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
              onUpdateSlot?.(slotId, slotLabel);

              // Restore focus and selection to the previously focused input/textarea
              if (active && typeof active.focus === 'function') {
                // Use microtask to let Lexical finish its update cycle
                requestAnimationFrame(() => {
                  active.focus({ preventScroll: true });
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
              const handleTransform = async () => {
                const text = editorRef.current?.getPlainText?.() ?? '';
                if (!text.trim()) {
                  console.warn('[Transform] contenu vide');
                  return;
                }

                setIsTransforming(true);
                try {
                  // Optionnel: log court pour debug
                  console.debug(
                    '[Transform] len=',
                    text.length,
                    'preview=',
                    text.slice(0, 120),
                  );

                  await onTransformToQuestions?.(text);
                } finally {
                  setIsTransforming(false);
                }
              };

              handleTransform();
            }}
            onMagicTemplating={() => {
              editorRef.current?.scanAndInsertSlots?.();
            }}
            isTransforming={isTransforming}
          />
        </div>
      </div>
    </div>
  );
}
