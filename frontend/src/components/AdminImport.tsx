import { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSectionStore } from '@/store/sections';
import { useSectionTemplateStore } from '@/store/sectionTemplates';
import type { Question } from '@/types/Typequestion';
import type { SectionTemplate } from '@/types/template';

interface Props {
  sectionId: string;
  onClose: () => void;
  onSchemaImported?: (schema: Question[]) => void;
  onTemplateImported?: (tpl: SectionTemplate) => void;
}

export default function AdminImport({
  sectionId,
  onClose,
  onSchemaImported,
  onTemplateImported,
}: Props) {
  const [tab, setTab] = useState<'section' | 'template'>('section');
  const [schemaText, setSchemaText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [slotsText, setSlotsText] = useState('');
  const updateSection = useSectionStore((s) => s.update);
  const createTemplate = useSectionTemplateStore((s) => s.create);

  const handleSchema = async () => {
    try {
      const schema = JSON.parse(schemaText) as Question[];
      await updateSection(sectionId, { schema });
      onSchemaImported?.(schema);
      onClose();
    } catch (e) {
      alert('Sch\u00e9ma invalide');
    }
  };

  const handleTemplate = async () => {
    try {
      const content = JSON.parse(jsonText);
      const slots = JSON.parse(slotsText);
      const tpl = await createTemplate({
        id: Date.now().toString(),
        label: 'Template import\u00e9',
        version: 1,
        content,
        slotsSpec: slots,
        stylePrompt: '',
        isDeprecated: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await updateSection(sectionId, { templateRefId: tpl.id });
      onTemplateImported?.(tpl);
      onClose();
    } catch (e) {
      alert('Template invalide');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        tabs={[
          { key: 'section', label: 'Section' },
          { key: 'template', label: 'Template' },
        ]}
        active={tab}
        onChange={(k) => setTab(k as 'section' | 'template')}
      />

      {tab === 'section' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="admin-schema">Sch\u00e9ma</Label>
            <Textarea
              id="admin-schema"
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              placeholder="Collez le sch\u00e9ma JSON de la section"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSchema}>Enregistrer</Button>
          </div>
        </div>
      )}

      {tab === 'template' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="admin-json">JSON</Label>
            <Textarea
              id="admin-json"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Collez le template JSON"
            />
          </div>
          <div>
            <Label htmlFor="admin-slots">SlotSpecs</Label>
            <Textarea
              id="admin-slots"
              value={slotsText}
              onChange={(e) => setSlotsText(e.target.value)}
              placeholder="Collez les SlotSpecs"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleTemplate}>Enregistrer</Button>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
}
