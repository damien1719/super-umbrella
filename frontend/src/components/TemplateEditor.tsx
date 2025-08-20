import { useRef } from 'react';
import RichTextEditor, { RichTextEditorHandle } from './RichTextEditor';
import SlotSidebar from './SlotSidebar';
import type { SectionTemplate } from '../types/template';

interface Props {
  template: SectionTemplate;
  onChange: (t: SectionTemplate) => void;
}

export default function TemplateEditor({ template, onChange }: Props) {
  const editorRef = useRef<RichTextEditorHandle>(null);
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <RichTextEditor
          ref={editorRef}
          initialStateJson={template.ast}
          onChange={(ast) => onChange({ ...template, ast })}
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
      <SlotSidebar
        slots={template.slots}
        onChange={(slots) => onChange({ ...template, slots })}
        onAddSlot={(slot) =>
          editorRef.current?.insertSlot(
            slot.id,
            slot.label ?? slot.id,
            slot.type,
          )
        }
      />
    </div>
  );
}
