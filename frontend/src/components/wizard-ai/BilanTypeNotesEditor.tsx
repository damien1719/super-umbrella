import { type RefObject, useMemo } from 'react';
import { Tabs } from '@/components/ui/tabs';
import LeftNavBilanType from '../bilan/LeftNavBilanType';
import InlineGroupChips from '../bilan/InlineGroupChips';
import { DataEntry, type DataEntryHandle } from '../bilan/DataEntry';
import ImportNotes from '../ImportNotes';
import type { Question, Answers } from '@/types/question';

interface NavItem {
  id: string;
  title: string;
  kind?: 'section' | 'separator';
  index?: number;
  schema?: Question[];
}

interface BilanTypeNotesEditorProps {
  navItems: NavItem[];
  activeSectionId: string | null;
  onSelectSection: (id: string) => void;
  excludedSectionIds: string[];
  onToggleExcluded: (id: string) => void;
  dataEntryRef: RefObject<DataEntryHandle>;
  answers: Answers;
  onAnswersChange: (answers: Answers) => void;
  notesMode: 'manual' | 'import';
  onNotesModeChange: (mode: 'manual' | 'import') => void;
  onRawNotesChange: (value: string) => void;
  onImageChange: (value: string | undefined) => void;
}

export function BilanTypeNotesEditor({
  navItems,
  activeSectionId,
  onSelectSection,
  excludedSectionIds,
  onToggleExcluded,
  dataEntryRef,
  answers,
  onAnswersChange,
  notesMode,
  onNotesModeChange,
  onRawNotesChange,
  onImageChange,
}: BilanTypeNotesEditorProps) {
  const activeSection = useMemo(
    () =>
      navItems.find(
        (item) => item.id === activeSectionId && item.kind !== 'separator',
      ) ?? null,
    [navItems, activeSectionId],
  );

  const activeQuestions = activeSection?.schema ?? [];

  const groupTitles = useMemo(() => {
    const titles: string[] = [];
    let hasGeneral = false;
    const isTitreQuestion = (
      value: Question,
    ): value is Question & { type: string; titre?: string } =>
      typeof (value as { type?: unknown }).type === 'string' &&
      (value as { type?: string }).type === 'titre';

    for (const question of activeQuestions) {
      if (isTitreQuestion(question)) {
        titles.push(question.titre || 'Groupe de question');
      } else if (titles.length === 0 && !hasGeneral) {
        hasGeneral = true;
      }
    }
    const sectionTitle = activeSection?.title || 'Général';
    if (hasGeneral) titles.unshift(sectionTitle);
    if (!hasGeneral && titles.length === 0) titles.push(sectionTitle);
    return titles;
  }, [activeQuestions, activeSection?.title]);

  return (
    <div className="flex flex-1 h-full overflow-y-hidden">
      <LeftNavBilanType
        items={navItems.map((item) =>
          item.kind === 'separator'
            ? { id: item.id, title: item.title, kind: 'separator' as const }
            : {
                id: item.id,
                title: item.title,
                kind: 'section' as const,
                index: item.index,
                disabled: excludedSectionIds.includes(item.id),
              },
        )}
        activeId={activeSectionId}
        onSelect={onSelectSection}
        onToggleDisabled={onToggleExcluded}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <Tabs
          className="mb-4"
          active={notesMode}
          onChange={(key) => {
            const mode = key as 'manual' | 'import';
            onNotesModeChange(mode);
            if (mode === 'manual') {
              onRawNotesChange('');
              onImageChange(undefined);
            }
          }}
          tabs={[
            { key: 'manual', label: 'Saisie manuelle' },
            { key: 'import', label: 'Import des notes' },
          ]}
        />

        {notesMode === 'manual' && <InlineGroupChips titles={groupTitles} />}

        {notesMode === 'manual' ? (
          <DataEntry
            ref={dataEntryRef}
            questions={activeQuestions}
            answers={answers}
            onChange={onAnswersChange}
            inline
            showGroupNav={false}
            defaultGroupTitle={activeSection?.title}
          />
        ) : (
          <ImportNotes
            onChange={onRawNotesChange}
            onImageChange={onImageChange}
          />
        )}
      </div>
    </div>
  );
}

export type { BilanTypeNotesEditorProps, NavItem };
