import { type RefObject, useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { DataEntry, type DataEntryHandle } from '../bilan/DataEntry';
import ImportNotes from '../ImportNotes';
import type { Question, Answers } from '@/types/question';
import type { DraftIdentifier } from '@/store/draft';
import { Button } from '@/components/ui/button';
import SectionEditionModal from '@/components/SectionEditionModal';
import { useUserProfileStore } from '@/store/userProfile';
import { useSectionStore } from '@/store/sections';
import { PenIcon } from 'lucide-react';

interface SectionNotesEditorProps {
  sectionTitle: string;
  questions: Question[];
  answers: Answers;
  onAnswersChange: (answers: Answers) => void;
  dataEntryRef: RefObject<DataEntryHandle | null>;
  notesMode: 'manual' | 'import';
  onNotesModeChange: (mode: 'manual' | 'import') => void;
  onRawNotesChange: (value: string) => void;
  onImageChange: (value: string | undefined) => void;
  draftKey: DraftIdentifier;
  sectionIdToEdit?: string | null;
}

export function SectionNotesEditor({
  sectionTitle,
  questions,
  answers,
  onAnswersChange,
  dataEntryRef,
  notesMode,
  onNotesModeChange,
  onRawNotesChange,
  onImageChange,
  draftKey,
  sectionIdToEdit,
}: SectionNotesEditorProps) {
  const [editOpen, setEditOpen] = useState(false);
  const profileId = useUserProfileStore((s) => s.profileId);
  const sectionMeta = useSectionStore((s) =>
    sectionIdToEdit ? s.items.find((x) => x.id === sectionIdToEdit) : undefined,
  );
  const isAuthor = !!profileId && sectionMeta?.authorId === profileId;
  const isOfficial = sectionMeta?.source === 'BILANPLUME';
  const isPublic = !!sectionMeta?.isPublic;
  const editDisabledByRights = !isAuthor && (isOfficial || isPublic);
  return (
    <div className="flex flex-1 h-full overflow-y-hidden flex-col">
      <div className="flex items-center justify-between mb-4">
        <Tabs
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
            { key: 'manual', label: 'Saisie des notes' },
            /* { key: 'import', label: 'Import des notes' }, */
          ]}
        />
        <Button className="gap-2"
          variant="secondary"
          disabled={!sectionIdToEdit || editDisabledByRights}
          tooltip={!sectionIdToEdit
            ? 'Sélectionnez une section'
            : editDisabledByRights
              ? isOfficial
                ? 'Édition indisponible: section officielle BilanPlume'
                : "Vous n'êtes pas l'auteur de cette section publique"
              : undefined}
          onClick={() => setEditOpen(true)}
        >
        <PenIcon className="h-4 w-4" />
          Editer
        </Button>
      </div>
      {sectionIdToEdit && (
        <SectionEditionModal
          open={editOpen}
          onOpenChange={setEditOpen}
          sectionId={sectionIdToEdit}
        />
      )}

      {notesMode === 'manual' ? (
        <DataEntry
          ref={dataEntryRef}
          questions={questions}
          draftKey={draftKey}
          answers={answers}
          onChange={onAnswersChange}
          inline
          defaultGroupTitle={sectionTitle}
        />
      ) : (
        <ImportNotes
          onChange={onRawNotesChange}
          onImageChange={onImageChange}
        />
      )}
    </div>
  );
}

export type { SectionNotesEditorProps };
