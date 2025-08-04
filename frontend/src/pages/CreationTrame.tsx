'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSectionStore } from '../store/sections';
import { useSectionExampleStore } from '../store/sectionExamples';
import type { Question } from '../types/Typequestion';
import { categories } from '../types/trame';
import TrameHeader from '@/components/TrameHeader';
import QuestionList from '@/components/QuestionList';
import { DataEntry } from '@/components/bilan/DataEntry';
import SaisieExempleTrame from '@/components/SaisieExempleTrame';
import ImportMagique from '@/components/ImportMagique';
import ExitConfirmation from '@/components/ExitConfirmation';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImportResponse {
  result: Question[][];
}

export default function CreationTrame() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state?: { returnTo?: string; wizardSection?: string; trameId?: string };
  };
  const fetchOne = useSectionStore((s) => s.fetchOne);
  const updateSection = useSectionStore((s) => s.update);
  const createExample = useSectionExampleStore((s) => s.create);

  const [tab, setTab] = useState<'questions' | 'preview' | 'examples'>(
    'questions',
  );
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>(
    {},
  );
  const [newExamples, setNewExamples] = useState<string[]>([]);
  const [nomTrame, setNomTrame] = useState('');
  const [categorie, setCategorie] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const createDefaultNote = (): Question => ({
    id: Date.now().toString(),
    type: 'notes',
    titre: 'Question sans titre',
    contenu: '',
  });

  useEffect(() => {
    if (!sectionId) return;
    fetchOne(sectionId).then((section) => {
      setNomTrame(section.title);
      setCategorie(section.kind);
      setIsPublic(section.isPublic ?? false);
      const loaded: Question[] =
        Array.isArray(section.schema) && section.schema.length > 0
          ? (section.schema as Question[])
          : [createDefaultNote()];
      setQuestions(loaded);
      if (loaded.length > 0) setSelectedId(loaded[0].id);
    });
  }, [sectionId, fetchOne]);

  const onPatch = (id: string, partial: Partial<Question>) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id
          ? {
              ...q,
              ...partial,
              tableau: partial.tableau
                ? {
                    ...('tableau' in q && q.tableau ? q.tableau : {}),
                    ...partial.tableau,
                  }
                : 'tableau' in q
                  ? q.tableau
                  : undefined,
            }
          : q,
      ),
    );
  };

  const onReorder = (from: number, to: number) => {
    setQuestions((qs) => {
      const updated = [...qs];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  const onDuplicate = (id: string) => {
    const idx = questions.findIndex((q) => q.id === id);
    if (idx === -1) return;
    const original = questions[idx];
    const clone: Question = {
      ...(JSON.parse(JSON.stringify(original)) as Question),
      id: Date.now().toString(),
      titre: 'Question sans titre',
    };
    setQuestions((qs) => {
      const before = qs.slice(0, idx + 1);
      const after = qs.slice(idx + 1);
      return [...before, clone, ...after];
    });
    setSelectedId(clone.id);
  };

  const onDelete = (id: string) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  };

  const onAddAfter = () => {
    const newQ = createDefaultNote();
    setQuestions((qs) => {
      if (!selectedId) return [...qs, newQ];
      const idx = qs.findIndex((q) => q.id === selectedId);
      if (idx === -1) return [...qs, newQ];
      return [...qs.slice(0, idx + 1), newQ, ...qs.slice(idx + 1)];
    });
    setSelectedId(newQ.id);
  };

  const save = async () => {
    if (!sectionId) return;
    await updateSection(sectionId, {
      title: nomTrame,
      kind: categorie,
      schema: questions,
      isPublic,
    });
    for (const content of newExamples) {
      await createExample({ sectionId, content });
    }
    setNewExamples([]);
    if (state?.returnTo) {
      navigate(state.returnTo, {
        state: { wizardSection: state.wizardSection, trameId: sectionId },
      });
    } else {
      navigate('/bibliotheque');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <TrameHeader
          title={nomTrame}
          category={categorie}
          isPublic={isPublic}
          categories={categories}
          onTitleChange={setNomTrame}
          onCategoryChange={setCategorie}
          onPublicChange={setIsPublic}
          onSave={save}
          onImport={() => setShowImport(true)}
          onBack={() => setShowConfirm(true)}
        />

        <div className="border-b mb-4">
          <nav className="flex gap-4">
            <button
              className={`pb-2 px-1 border-b-2 ${
                tab === 'questions'
                  ? 'border-primary-600'
                  : 'border-transparent'
              }`}
              onClick={() => setTab('questions')}
            >
              Questions
            </button>
            <button
              className={`pb-2 px-1 border-b-2 ${
                tab === 'preview' ? 'border-primary-600' : 'border-transparent'
              }`}
              onClick={() => setTab('preview')}
            >
              Pré-visualisation
            </button>
            <button
              className={`pb-2 px-1 border-b-2 ${
                tab === 'examples' ? 'border-primary-600' : 'border-transparent'
              }`}
              onClick={() => setTab('examples')}
            >
              Exemples
            </button>
          </nav>
        </div>

        {tab === 'questions' && (
          <QuestionList
            questions={questions}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onPatch={onPatch}
            onReorder={onReorder}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onAddAfter={onAddAfter}
          />
        )}

        {tab === 'preview' && (
          <DataEntry
            inline
            questions={questions}
            answers={previewAnswers}
            onChange={setPreviewAnswers}
          />
        )}

        {tab === 'examples' && (
          <SaisieExempleTrame
            examples={newExamples}
            onAdd={(c) => setNewExamples((p) => [...p, c])}
          />
        )}
      </div>
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent>
          <ImportMagique
            onDone={(res: unknown) => {
              let newQuestions: Question[] = [];
              if (Array.isArray(res)) {
                newQuestions = res as Question[];
              } else if (res && typeof res === 'object' && 'result' in res) {
                const response = res as ImportResponse;
                newQuestions = response.result.flat();
              }
              if (newQuestions.length > 0) {
                setQuestions((prev) => [...prev, ...newQuestions]);
              }
            }}
            onCancel={() => setShowImport(false)}
          />
        </DialogContent>
      </Dialog>
      <ExitConfirmation
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={save}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
