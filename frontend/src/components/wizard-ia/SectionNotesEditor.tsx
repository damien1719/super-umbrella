import { type RefObject } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { DataEntry, type DataEntryHandle } from '../bilan/DataEntry';
import ImportNotes from '../ImportNotes';
import type { Question, Answers } from '@/types/question';
import type { DraftIdentifier } from '@/store/draft';

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
}: SectionNotesEditorProps) {
  return (
    <div className="flex flex-1 h-full overflow-y-hidden flex-col">
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
          /* { key: 'import', label: 'Import des notes' }, */
        ]}
      />

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
