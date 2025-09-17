'use client';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSectionStore } from '../store/sections';
import { useSectionExampleStore } from '../store/sectionExamples';
import type { Question, TableQuestion } from '../types/Typequestion';
// Narrow the answers type to satisfy DataEntry
type Answers = Record<
  string,
  string | number | boolean | string[] | Record<string, unknown>
>;
import { categories, type CategoryId } from '../types/trame';
import TrameHeader from '@/components/TrameHeader';
import QuestionList from '@/components/QuestionList';
import { DataEntry } from '@/components/bilan/DataEntry';
import SaisieExempleTrame from '@/components/SaisieExempleTrame';
import ImportMagique from '@/components/ImportMagique';
import AdminImport from '@/components/AdminImport';
import ExitConfirmation from '@/components/ExitConfirmation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import TemplateEditor from '@/components/TemplateEditor';
import EmptyTemplateState from '@/components/EmptyTemplateState';
import Settings from '@/components/Settings';
import { useSectionTemplateStore } from '../store/sectionTemplates';
import type { SectionTemplate, SlotSpec } from '../types/template';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/store/auth';
import { useUserProfileStore } from '@/store/userProfile';
import { Job } from '../types/job';
import SharePanel from '@/components/SharePanel';
import ReadOnlyOverlay from '@/components/ReadOnlyOverlay';

interface ImportResponse {
  result: Question[][];
}

interface CreationTrameProps {
  readOnly?: boolean;
}

export default function CreationTrame({ readOnly = false }: CreationTrameProps) {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state?: { returnTo?: string; wizardSection?: string; trameId?: string };
  };
  const fetchOne = useSectionStore((s) => s.fetchOne);
  const duplicateSection = useSectionStore((s) => s.duplicate);
  const updateSection = useSectionStore((s) => s.update);
  const createExample = useSectionExampleStore((s) => s.create);

  const [tab, setTab] = useState<
    'preview' | 'questions' | 'examples' | 'template' | 'settings'
  >('preview');
  const [previewAnswers, setPreviewAnswers] = useState<Answers>({});
  const [newExamples, setNewExamples] = useState<string[]>([]);
  const [nomTrame, setNomTrame] = useState('');
  const [categorie, setCategorie] = useState<CategoryId | undefined>(undefined);
  const [isPublic, setIsPublic] = useState(false);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showAdminImport, setShowAdminImport] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [job, setJob] = useState<Job[]>([Job.PSYCHOMOTRICIEN]);
  const createTemplate = useSectionTemplateStore((s) => s.create);
  const getTemplate = useSectionTemplateStore((s) => s.get);
  const updateTemplate = useSectionTemplateStore((s) => s.update);
  const [templateRefId, setTemplateRefId] = useState<string | null>(null);
  const [template, setTemplate] = useState<SectionTemplate>({
    id: Date.now().toString(),
    label: '',
    version: 1,
    content: null,
    slotsSpec: [],
    stylePrompt: '',
    isDeprecated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const token = useAuth((s) => s.token);
  const initialized = useAuth((s) => s.initialized);
  const user = useAuth((s) => s.user);
  const profileId = useUserProfileStore((s) => s.profileId);
  const fetchProfile = useUserProfileStore((s) => s.fetchProfile);
  
  // Log pour le débogage du mode lecture seule
  console.log('[DEBUG] Mode lecture seule (readOnly):', readOnly);

  const transformTemplateToQuestions = async (content: string) => {
    try {
      console.log(
        '[DEBUG] transformTemplateToQuestions - Received content:',
        content,
      );
      console.log(
        '[DEBUG] transformTemplateToQuestions - Content length:',
        content.length,
      );
      console.log(
        '[DEBUG] transformTemplateToQuestions - Content type:',
        typeof content,
      );

      const res = await apiFetch<{ result: Question[] }>(
        '/api/v1/import/transform',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        },
      );
      console.log('[DEBUG] transformTemplateToQuestions - API response:', res);
      console.log(
        '[DEBUG] transformTemplateToQuestions - res.result:',
        res.result,
      );
      console.log(
        '[DEBUG] transformTemplateToQuestions - res.result.length:',
        res.result?.length,
      );
      console.log(
        '[DEBUG] transformTemplateToQuestions - res.result type:',
        typeof res.result,
      );
      console.log(
        '[DEBUG] transformTemplateToQuestions - res.result[0]:',
        res.result?.[0],
      );

      const questionsArray = res.result;

      if (
        questionsArray &&
        Array.isArray(questionsArray) &&
        questionsArray.length > 0
      ) {
        console.log(
          '[DEBUG] transformTemplateToQuestions - Setting questions:',
          questionsArray,
        );
        console.log(
          '[DEBUG] transformTemplateToQuestions - Current questions before update:',
          questions,
        );

        setQuestions(questionsArray);
        setSelectedId(questionsArray[0].id);
        setTab('preview');

        console.log(
          '[DEBUG] transformTemplateToQuestions - Should switch to preview tab',
        );
      } else {
        console.warn(
          '[DEBUG] transformTemplateToQuestions - No valid result received',
        );
        console.warn(
          '[DEBUG] transformTemplateToQuestions - questionsArray is:',
          questionsArray,
        );
        console.warn(
          '[DEBUG] transformTemplateToQuestions - res.result is:',
          res.result,
        );
      }
    } catch (e) {
      console.error('Failed to transform template', e);
    }
  };

  const SHOW_ADMIN_IMPORT =
    import.meta.env.VITE_DISPLAY_IMPORT_BUTTON === 'true';

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
      setAuthorId(section.authorId ?? null);
      setCoverUrl((section as any)?.coverUrl ?? '');
      setJob(section.job || [Job.PSYCHOMOTRICIEN]);
      setTemplateRefId(section.templateRefId ?? null);
      if (section.templateRefId) {
        getTemplate(section.templateRefId).then((tpl) => setTemplate(tpl));
      } else {
        setTemplate({
          id: Date.now().toString(),
          label: section.title,
          version: 1,
          content: null,
          slotsSpec: [],
          stylePrompt: '',
          isDeprecated: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      const loaded: Question[] =
        Array.isArray(section.schema) && section.schema.length > 0
          ? (section.schema as Question[])
          : [createDefaultNote()];
      setQuestions(loaded);
      if (loaded.length > 0) setSelectedId(loaded[0].id);
    });
  }, [sectionId, fetchOne, getTemplate]);

  // Ensure profile is loaded when on BilanLayout routes
  useEffect(() => {
    if (initialized && user && !profileId) {
      fetchProfile().catch(() => {/* silent */});
    }
  }, [initialized, user, profileId, fetchProfile]);

  // Debug useEffect to log questions state changes
  useEffect(() => {
    console.log('[DEBUG] Questions state changed:', questions);
    console.log('[DEBUG] Questions count:', questions.length);
    console.log('[DEBUG] Current tab:', tab);
    console.log('[DEBUG] Selected ID:', selectedId);
  }, [questions, tab, selectedId]);

  const onPatch = (id: string, partial: Partial<Question>) => {
    setQuestions((qs: Question[]) =>
      qs.map((q: Question) => {
        if (q.id !== id) return q;
        let merged = { ...q, ...partial } as Question;

        // Handle tableau property specifically for TableQuestion type
        if (
          q.type === 'tableau' &&
          partial.type === 'tableau' &&
          partial.tableau
        ) {
          const tableQ = q as TableQuestion;
          const partialTable = partial as Partial<TableQuestion>;
          if (partialTable.tableau) {
            merged = {
              ...merged,
              tableau: {
                ...tableQ.tableau,
                ...partialTable.tableau,
              },
            } as Question;
          }
        }

        return merged;
      }),
    );
  };

  const onReorder = (from: number, to: number) => {
    setQuestions((qs: Question[]) => {
      const updated: Question[] = [...qs];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  const onDuplicate = (id: string) => {
    const idx = questions.findIndex((q) => q.id === id);
    if (idx === -1) return;
    const original = questions[idx];
    const clone = {
      ...(JSON.parse(JSON.stringify(original)) as Question),
      id: Date.now().toString(),
      titre: 'Question sans titre',
    } as Question;
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

  const onAddAfter = (targetId: string) => {
    const newQ = createDefaultNote();
    setQuestions((qs) => {
      if (!targetId) return [...qs, newQ];
      const idx = qs.findIndex((q) => q.id === targetId);
      if (idx === -1) return [...qs, newQ];
      return [...qs.slice(0, idx + 1), newQ, ...qs.slice(idx + 1)];
    });
    setSelectedId(newQ.id);
  };

  const onPasteAfter = (targetId: string, item: Question) => {
    // Cloner en profondeur pour éviter les références partagées et générer un nouvel ID
    const clone: Question = {
      ...(JSON.parse(JSON.stringify(item)) as Question),
      id: Date.now().toString(),
    } as Question;

    setQuestions((qs) => {
      if (!targetId) return [...qs, clone];
      const idx = qs.findIndex((q) => q.id === targetId);
      if (idx === -1) return [...qs, clone];
      return [...qs.slice(0, idx + 1), clone, ...qs.slice(idx + 1)];
    });
    setSelectedId(clone.id);
  };

  const save = async () => {
    if (!sectionId) return;
    if (templateRefId) {
      await updateTemplate(templateRefId, { ...template, label: nomTrame });
    }

    // Préparer les données de mise à jour en excluant les champs null
    const updateData: {
      title: string;
      kind: CategoryId | undefined;
      job: Job[];
      schema: Question[];
      isPublic: boolean;
      templateRefId?: string;
      coverUrl?: string | null;
    } = {
      title: nomTrame,
      kind: categorie,
      job,
      schema: questions,
      isPublic,
    };

    // N'ajouter templateRefId que s'il n'est pas null
    if (templateRefId) {
      updateData.templateRefId = templateRefId;
    }

    // Normaliser coverUrl: vide -> null pour effacer
    const normalizedCover =
      coverUrl && coverUrl.trim().length > 0 ? coverUrl.trim() : null;
    await updateSection(sectionId, {
      ...updateData,
      coverUrl: normalizedCover,
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

  const isReadOnly = Boolean(
    isPublic && authorId && profileId && profileId !== authorId,
  );

  console.log('[CreationTrame] isReadOnly', isReadOnly);
  console.log('[CreationTrame] authorId', authorId);
  console.log('[CreationTrame] profileId', profileId);
  console.log('[CreationTrame] isPublic', isPublic);
  if (authorId && profileId) {
    console.log('[CreationTrame] profileId !== authorId', profileId !== authorId);
  }

  const handleDuplicate = async () => {
    if (!sectionId) return;
    try {
      const created = await duplicateSection(sectionId);
      navigate(`/creation-trame/${created.id}`);
    } catch (e) {
      console.error('Failed to duplicate section', e);
    }
  };

  return (
    <div className="flex h-dvh w-full flex-col bg-gray-50">
      {/* Header + actions - Fixed */}
      <div className="shrink-0 px-6 pt-6 bg-gray-50">
        <div className="w-full mx-auto">
          <TrameHeader
            title={nomTrame}
            isPublic={isPublic}
            onTitleChange={setNomTrame}
            onPublicChange={setIsPublic}
            onSave={save}
            onImport={() => setShowImport(true)}
            onBack={() => (isReadOnly ? navigate(-1) : setShowConfirm(true))}
            onAdminImport={() => setShowAdminImport(true)}
            showAdminImport={SHOW_ADMIN_IMPORT}
            readOnly={isReadOnly}
            onDuplicate={handleDuplicate}
          />

          <div className="border-b border-wood-400 mb-4">
            <nav className="flex gap-4">
              <button
                className={`pb-2 px-1 border-b-2 ${
                  tab === 'preview'
                    ? 'border-primary-600'
                    : 'border-transparent'
                }`}
                onClick={() => setTab('preview')}
              >
                Aperçu
              </button>
              <button
                className={`pb-2 px-1 border-b-2 ${
                  tab === 'questions'
                    ? 'border-primary-600'
                    : 'border-transparent'
                } ${isReadOnly ? 'text-gray-400' : ''}`}
                onClick={() => setTab('questions')}
              >
                Edition
              </button>
              <button
                className={`pb-2 px-1 border-b-2 ${
                  tab === 'template'
                    ? 'border-primary-600'
                    : 'border-transparent'
                } ${isReadOnly ? 'text-gray-400' : ''}`}
                onClick={() => setTab('template')}
              >
                Modèle Word
              </button>
              <button
                className={`pb-2 px-1 border-b-2 ${
                  tab === 'examples'
                    ? 'border-primary-600'
                    : 'border-transparent'
                } ${isReadOnly ? 'text-gray-400' : ''}`}
                onClick={() => setTab('examples')}
              >
                Exemples
              </button>
              <button
                className={`pb-2 px-1 border-b-2 ${
                  tab === 'settings'
                    ? 'border-primary-600'
                    : 'border-transparent'
                } ${isReadOnly ? 'text-gray-400' : ''}`}
                onClick={() => setTab('settings')}
              >
                Réglages
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Zone des onglets avec scroll personnalisé selon le tab */}
      <div className="flex-1 min-h-0 px-6 pb-6">
        {tab === 'questions' && (
          // Questions: Scroll vertical simple avec auto-scroll vers la question sélectionnée
          <ReadOnlyOverlay active={isReadOnly} onCta={handleDuplicate}>
            <div className="h-full overflow-y-auto">
              <QuestionList
                questions={questions}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onPatch={onPatch}
                onReorder={onReorder}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onAddAfter={onAddAfter}
                onPasteAfter={onPasteAfter}
              />
            </div>
          </ReadOnlyOverlay>
        )}

        {tab === 'preview' && (
          // Pré-visualisation: Scroll avec navigation latérale fixe
          <div className="h-full flex gap-6">
            {/* Contenu principal scrollable */}
            <div className="flex-1 overflow-y-auto">
              <DataEntry
                inline
                questions={questions}
                answers={previewAnswers}
                onChange={setPreviewAnswers}
              />
            </div>
          </div>
        )}

        {tab === 'examples' && (
          // Exemples: Scroll simple
          <ReadOnlyOverlay active={isReadOnly} onCta={handleDuplicate}>
            <div className="h-full overflow-y-auto">
              <SaisieExempleTrame
                examples={newExamples}
                onAdd={(c) => setNewExamples((p) => [...p, c])}
              />
            </div>
          </ReadOnlyOverlay>
        )}

        {tab === 'template' && (
          // Template: Layout spécial avec sidebar fixe et éditeur scrollable
          <ReadOnlyOverlay active={isReadOnly} onCta={handleDuplicate}>
            <div className="h-full">
            {loadingTemplate && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800">
                    Chargement du template...
                  </span>
                </div>
              </div>
            )}
            {templateRefId ? (
              <div className="h-full">
                <TemplateEditor
                  template={template}
                  onChange={setTemplate}
                  onTransformToQuestions={transformTemplateToQuestions}
                  onDeleteTemplate={async () => {
                    if (templateRefId && sectionId) {
                      try {
                        // Supprimer le template de la base de données
                        const deleteTemplate =
                          useSectionTemplateStore.getState().delete;
                        await deleteTemplate(templateRefId);

                        // Supprimer la référence du template de la section
                        await updateSection(sectionId, {
                          title: nomTrame,
                          kind: categorie,
                          schema: questions,
                          isPublic,
                          // Ne pas inclure templateRefId pour le supprimer
                        });

                        // Réinitialiser l'état local
                        setTemplateRefId(null);
                        setTemplate({
                          id: Date.now().toString(),
                          label: nomTrame,
                          version: 1,
                          content: null,
                          slotsSpec: [],
                          stylePrompt: '',
                          isDeprecated: false,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        });
                        setTab('questions'); // Retourner à l'onglet questions
                      } catch (error) {
                        console.error('Failed to delete template:', error);
                        // Optionnel: afficher un message d'erreur à l'utilisateur
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <EmptyTemplateState
                  onAdd={async () => {
                    if (!sectionId) return;

                    // Créer un template par défaut non vide
                    const defaultTemplate = {
                      ...template,
                      label: nomTrame,
                      content: {
                        root: {
                          type: 'root',
                          children: [
                            {
                              type: 'paragraph',
                              children: [
                                {
                                  type: 'text',
                                  text: '## Introduction\n\n',
                                  format: 0,
                                  style: '',
                                  version: 1,
                                },
                              ],
                              direction: 'ltr',
                              format: '',
                              indent: 0,
                              version: 1,
                            },
                            {
                              type: 'paragraph',
                              children: [
                                {
                                  type: 'text',
                                  text: 'Contexte de la demande.',
                                  format: 0,
                                  style: '',
                                  version: 1,
                                },
                              ],
                              direction: 'ltr',
                              format: '',
                              indent: 0,
                              version: 1,
                            },
                          ],
                          direction: 'ltr',
                          format: '',
                          indent: 0,
                          version: 1,
                        },
                      },
                      slotsSpec: [
                        {
                          kind: 'field' as const,
                          id: 'Contexte de la demande',
                          type: 'text' as const,
                          label: 'Description',
                          prompt:
                            'Description factuelle du contexte de la demande',
                          mode: 'llm' as const,
                        },
                      ],
                      stylePrompt:
                        'Style professionnel et descriptif, sans jargon excessif.',
                      mode: 'questionnaire',
                    };

                    const created = await createTemplate(defaultTemplate);
                    setTemplate(created);
                    setTemplateRefId(created.id);
                    await updateSection(sectionId, {
                      title: nomTrame,
                      kind: categorie,
                      schema: questions,
                      isPublic,
                      templateRefId: created.id,
                    });
                  }}
                />
              </div>
            )}
            </div>
          </ReadOnlyOverlay>
        )}

        {tab === 'settings' && (
          <ReadOnlyOverlay active={isReadOnly} onCta={handleDuplicate}>
            <div className="h-full overflow-y-auto space-y-6">
              <Settings
                category={categorie}
                jobs={job}
                categories={categories}
                onCategoryChange={(v: string) => setCategorie(v as CategoryId)}
                onJobsChange={setJob}
                coverUrl={coverUrl}
                onCoverUrlChange={setCoverUrl}
              />
              {!isReadOnly && (
                <SharePanel resourceType="section" resourceId={sectionId} />
              )}
            </div>
          </ReadOnlyOverlay>
        )}
      </div>

      {/* Dialogs (portail) */}
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
                setSelectedId(newQuestions[0].id);
                setShowImport(false);
              }
            }}
            onCancel={() => setShowImport(false)}
            sectionId={sectionId}
            onTemplateCreated={async (id) => {
              console.log(
                '[DEBUG] CreationTrame - onTemplateCreated called with ID:',
                id,
              );
              console.log('[DEBUG] CreationTrame - ID type:', typeof id);
              console.log(
                '[DEBUG] CreationTrame - ID is empty?',
                !id || id.trim() === '',
              );

              setShowImport(false);
              setLoadingTemplate(true);

              if (id && id.trim() !== '') {
                try {
                  console.log(
                    '[DEBUG] CreationTrame - Loading template from DB with ID:',
                    id,
                  );
                  console.log(
                    '[DEBUG] CreationTrame - getTemplate function available:',
                    !!getTemplate,
                  );

                  const tpl = await getTemplate(id);
                  console.log(
                    '[DEBUG] CreationTrame - Template loaded from DB:',
                    {
                      id: tpl.id,
                      label: tpl.label,
                      hasContent: !!tpl.content,
                      contentType: typeof tpl.content,
                      slotsCount: tpl.slotsSpec?.length || 0,
                      slotsType: typeof tpl.slotsSpec,
                      stylePrompt: tpl.stylePrompt,
                      fullTemplate: JSON.stringify(tpl, null, 2),
                    },
                  );

                  console.log(
                    '[DEBUG] CreationTrame - Setting template state...',
                  );
                  setTemplate(tpl);
                  setTemplateRefId(id);

                  // Only switch to template tab after template is loaded
                  console.log(
                    '[DEBUG] CreationTrame - Switching to template tab',
                  );
                  setTab('template');

                  console.log(
                    '[DEBUG] CreationTrame - Template setup completed successfully',
                  );
                } catch (error) {
                  console.error(
                    '[DEBUG] CreationTrame - Error loading template:',
                    error,
                  );
                  console.error('[DEBUG] CreationTrame - Error details:', {
                    error: error,
                    message:
                      error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : 'No stack',
                  });
                } finally {
                  setLoadingTemplate(false);
                }
              } else {
                console.error(
                  '[DEBUG] CreationTrame - Invalid or empty template ID:',
                  id,
                );
                setLoadingTemplate(false);
              }
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={showAdminImport} onOpenChange={setShowAdminImport}>
        <DialogContent>
          <AdminImport
            sectionId={sectionId ?? ''}
            onClose={() => setShowAdminImport(false)}
            onSchemaImported={(schema) => {
              setQuestions(schema);
              setSelectedId(schema[0]?.id ?? null);
            }}
            onTemplateImported={(tpl) => {
              setTemplate(tpl);
              setTemplateRefId(tpl.id);
            }}
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
