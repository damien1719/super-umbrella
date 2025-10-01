import { type RefObject, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import LeftNavBilanType from '../bilan/LeftNavBilanType';
import InlineGroupChips from '../bilan/InlineGroupChips';
import { DataEntry, type DataEntryHandle } from '../bilan/DataEntry';
import ImportNotes from '../ImportNotes';
import type { Question, Answers } from '@/types/question';
import type { DraftIdentifier } from '@/store/draft';
import { PenIcon } from 'lucide-react';
import SectionEditionModal from '@/components/SectionEditionModal';
import { useUserProfileStore } from '@/store/userProfile';
import { useSectionStore } from '@/store/sections';

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
  dataEntryRef: RefObject<DataEntryHandle | null>;
  answers: Answers;
  onAnswersChange: (answers: Answers) => void;
  notesMode: 'manual' | 'import';
  onNotesModeChange: (mode: 'manual' | 'import') => void;
  onRawNotesChange: (value: string) => void;
  onImageChange: (value: string | undefined) => void;
  draftKey: DraftIdentifier;
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
  draftKey,
}: BilanTypeNotesEditorProps) {
  const [editOpen, setEditOpen] = useState(false);
  const profileId = useUserProfileStore((s) => s.profileId);
  const sectionMeta = useSectionStore((s) =>
    activeSectionId ? s.items.find((x) => x.id === activeSectionId) : undefined,
  );
  const isAuthor = !!profileId && sectionMeta?.authorId === profileId;
  const isOfficial = sectionMeta?.source === 'BILANPLUME';
  const isPublic = !!sectionMeta?.isPublic;
  const editDisabledByRights = !isAuthor && (isOfficial || isPublic);
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
        {/*         <Tabs
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
        /> */}

        <InlineGroupChips
          titles={groupTitles}
          right={
            <Button
              className="gap-2"
              variant="secondary"
              size="default"
              disabled={!activeSectionId || editDisabledByRights}
              tooltip={
                !activeSectionId
                  ? 'Sélectionnez une section'
                  : editDisabledByRights
                    ? isOfficial
                      ? 'Édition indisponible: section officielle BilanPlume'
                      : "Vous n'êtes pas l'auteur de cette section publique"
                    : undefined
              }
              onClick={() => setEditOpen(true)}
            >
              <PenIcon className="h-4 w-4" />
              Editer
            </Button>
          }
        />

        {activeSectionId && (
          <SectionEditionModal
            open={editOpen}
            onOpenChange={setEditOpen}
            sectionId={activeSectionId}
          />
        )}

        <DataEntry
          ref={dataEntryRef}
          questions={activeQuestions}
          draftKey={draftKey}
          answers={answers}
          onChange={onAnswersChange}
          inline
          showGroupNav={false}
          defaultGroupTitle={activeSection?.title}
        />
      </div>
    </div>
  );
}

export type { BilanTypeNotesEditorProps, NavItem };
