'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSectionStore } from '@/store/sections';
import { useEditorUi } from '@/store/editorUi';
import { useSectionExampleStore } from '@/store/sectionExamples';
import { SectionCard, SectionInfo } from './bilan/SectionCard';
import WizardAIRightPanel from './WizardAIRightPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { TrameOption, TrameExample } from './bilan/TrameSelector';
import type { Answers, Question } from '@/types/question';
import {
  FileText,
  Eye,
  Brain,
  Activity,
  Flag,
  PlusIcon,
  ArrowRight,
  ArrowRightCircle,
  Wand2,
} from 'lucide-react';
import { apiFetch } from '@/utils/api';
import { generateSection } from '@/services/generation';
import { useAuth } from '@/store/auth';

const kindMap: Record<string, string> = {
  anamnese: 'anamnese',
  'profil-sensoriel': 'profil_sensoriel',
  'observations-cliniques': 'observations',
  'tests-mabc': 'tests_standards',
  conclusion: 'conclusion',
};

const sections: SectionInfo[] = [
  {
    id: 'anamnese',
    title: 'Anamnèse',
    icon: FileText,
    description: 'Histoire personnelle et familiale',
  },
  {
    id: 'profil-sensoriel',
    title: 'Profil sensoriel',
    icon: Eye,
    description: 'Évaluation des capacités sensorielles',
  },
  {
    id: 'observations-cliniques',
    title: 'Observations',
    icon: Brain,
    description: 'Observations comportementales et motrices',
  },
  {
    id: 'tests-mabc',
    title: 'Tests',
    icon: Activity,
    description: 'Résultats des tests standardisés',
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    icon: Activity,
    description: 'Résultats des tests standardisés',
  },
];

const useTrames = () => {
  const { items, fetchAll } = useSectionStore();

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  return useMemo(() => {
    const res: Record<string, TrameOption[]> = {
      anamnese: [],
      'profil-sensoriel': [],
      'observations-cliniques': [],
      'tests-mabc': [],
      conclusion: [],
    };
    Object.entries(kindMap).forEach(([key, kind]) => {
      res[key] = items
        .filter((s) => s.kind === kind)
        .map((s) => ({
          value: s.id,
          label: s.title,
          description: s.description,
          schema: (s.schema || []) as Question[],
          isPublic: s.isPublic,
          authorId: s.authorId,
          author: s.author,
        }));
    });
    return res;
  }, [items]);
};

interface AiRightPanelProps {
  bilanId: string;
  onInsertText: (text: string) => void;
  onSetEditorStateJson?: (state: unknown) => void;
  initialWizardSection?: string;
  initialTrameId?: string;
}

export default function AiRightPanel({
  bilanId,
  onInsertText,
  onSetEditorStateJson,
  initialWizardSection,
  initialTrameId,
}: AiRightPanelProps) {
  const trames = useTrames();
  const {
    items: examples,
    fetchAll,
    create,
    remove,
  } = useSectionExampleStore();
  const token = useAuth((s) => s.token);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedTrames, setSelectedTrames] = useState<Record<string, string>>(
    initialWizardSection && initialTrameId
      ? { [initialWizardSection]: initialTrameId }
      : {},
  );
  const mode = useEditorUi((s) => s.mode);
  const setMode = useEditorUi((s) => s.setMode);
  const selection = useEditorUi((s) => s.selection);
  const [answers, setAnswers] = useState<Record<string, Answers>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<Record<string, boolean>>({});
  const [wizardSection, setWizardSection] = useState<string | null>(
    initialWizardSection || null,
  );
  const [regenSection, setRegenSection] = useState<string | null>(null);
  const [regenPrompt, setRegenPrompt] = useState('');
  const [refinedText, setRefinedText] = useState('');
  useEditorUi((s) => s.selection);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (regenSection && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [regenSection]);

  useEffect(() => {
    const defaults: Record<string, string> = {};
    Object.entries(trames).forEach(([key, list]) => {
      if (list.length > 0 && !selectedTrames[key]) {
        defaults[key] = list[0].value;
      }
    });
    if (Object.keys(defaults).length > 0) {
      setSelectedTrames((prev) => ({ ...defaults, ...prev }));
    }
  }, [trames]);

  const getExamples = (_sectionId: string, trameId: string) => {
    const base = examples
      .filter((e) => e.sectionId === trameId)
      .map((e) => ({
        id: e.id,
        title: e.label || '',
        content: e.content,
        category: '',
      }));
    return base;
  };

  const addExample = (
    _sectionId: string,
    trameId: string,
    ex: Omit<TrameExample, 'id'>,
  ) => {
    create({
      sectionId: trameId,
      label: ex.title,
      content: ex.content,
    }).catch(() => {});
  };
  const removeExample = (_sectionId: string, _trameId: string, id: string) => {
    remove(id).catch(() => {});
  };

  // local markdown helpers moved to services/generation
  type TableAnswers = Record<string, unknown> & { commentaire?: string };

  const handleGenerate = async (
    section: SectionInfo,
    newAnswers?: Answers,
    rawNotes?: string,
  ) => {
    await generateSection({
      mode: 'direct',
      section,
      trames: trames as any,
      selectedTrames,
      answers,
      newAnswers,
      rawNotes,
      token: token || '',
      bilanId,
      kindMap,
      setIsGenerating,
      setSelectedSection,
      setWizardSection,
      setGenerated,
      setRegenSection,
      setRegenPrompt,
      onInsertText,
      onSetEditorStateJson,
      examples: examples as any,
    });
  };

  const handleGenerateFromTemplate = async (
    section: SectionInfo,
    newAnswers?: Answers,
    rawNotes?: string,
    instId?: string,
  ) => {
    console.log('[AiRightPanel] handleGenerateFromTemplate - STARTED', {
      sectionId: section.id,
      sectionTitle: section.title,
      instId,
      hasNewAnswers: !!newAnswers,
      hasRawNotes: !!rawNotes,
      rawNotesLength: rawNotes?.length || 0,
      newAnswersKeys: Object.keys(newAnswers || {}),
      selectedTramesForSection: selectedTrames[section.id],
      currentAnswersKeys: Object.keys(answers[section.id] || {}),
    });

    if (!instId) {
      console.error(
        '[AiRightPanel] handleGenerateFromTemplate - ERROR: No instanceId provided',
      );
      return;
    }

    try {
      console.log(
        '[AiRightPanel] handleGenerateFromTemplate - Preparing generation params...',
      );

      const generationParams = {
        mode: 'template' as const,
        section,
        trames: trames as any,
        selectedTrames,
        answers,
        newAnswers,
        rawNotes,
        instanceId: instId,
        token: token || '',
        bilanId,
        kindMap,
        setIsGenerating,
        setSelectedSection,
        setWizardSection,
        onInsertText,
        onSetEditorStateJson,
        examples: examples as any,
      };

      console.log(
        '[AiRightPanel] handleGenerateFromTemplate - Generation params prepared:',
        {
          mode: generationParams.mode,
          sectionId: generationParams.section.id,
          instanceId: generationParams.instanceId,
          hasToken: !!generationParams.token,
          hasBilanId: !!generationParams.bilanId,
          hasNewAnswers: !!generationParams.newAnswers,
          hasRawNotes: !!generationParams.rawNotes,
          hasOnSetEditorStateJson: !!generationParams.onSetEditorStateJson,
          hasOnInsertText: !!generationParams.onInsertText,
        },
      );

      console.log(
        '[AiRightPanel] handleGenerateFromTemplate - About to call generateSection...',
      );

      await generateSection(generationParams);

      console.log(
        '[AiRightPanel] handleGenerateFromTemplate - generateSection completed successfully',
      );
      console.log(
        '[AiRightPanel] handleGenerateFromTemplate - DONE - Template generation completed',
      );
    } catch (e) {
      console.error(
        '[AiRightPanel] handleGenerateFromTemplate - ERROR occurred:',
        e,
      );
      console.error(
        '[AiRightPanel] handleGenerateFromTemplate - Error details:',
        {
          error: e,
          errorMessage: e instanceof Error ? e.message : 'Unknown error',
          errorStack: e instanceof Error ? e.stack : 'No stack trace',
        },
      );
      throw e;
    }
  };

  const handleRefine = async () => {
    if (!selection) return;
    setIsGenerating(true);
    try {
      const body = {
        selectedText: selection.text,
        refineInstruction: regenPrompt,
      };
      const res = await apiFetch<{ text: string }>(
        `/api/v1/bilans/${bilanId}/refine`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        },
      );
      setRefinedText(res.text);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConclude = async () => {
    setIsGenerating(true);
    try {
      const res = await apiFetch<{ text: string }>(
        `/api/v1/bilans/${bilanId}/conclude`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      onInsertText(res.text);
    } finally {
      setIsGenerating(false);
    }
  };

  async function convertFileToHtml(file: File): Promise<string> {
    try {
      if (
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.convertToHtml({ arrayBuffer });
        return result.value;
      }
      if (
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.xlsx')
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        return XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);
      }
      if (typeof file.text === 'function') {
        return await file.text();
      }
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
    } catch {
      if (typeof file.text === 'function') {
        return await file.text();
      }
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
    }
  }

  const handleCommentTestResults = async () => {
    if (!commentFile) return;
    setIsGenerating(true);
    try {
      const html = await convertFileToHtml(commentFile);
      const body = {
        prompt: 'promptCommentTestResults',
        html,
      };
      const res = await apiFetch<{ text: string }>(
        `/api/v1/bilans/${bilanId}/comment-test-results`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        },
      );
      onInsertText(res.text);
      setCommentModalOpen(false);
      setCommentFile(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-wood-50 rounded-lg shadow-lg">
      <div className="flex flex-col h-full">
        {/*         {selection?.text && (
          <div className="bg-blue-50 text-blue-800 text-sm p-2 border-b border-blue-100">
            <div className="font-medium mb-1">Texte sélectionné :</div>
            <div className="italic truncate">&quot;{selection.text}&quot;</div>
          </div>
        )} */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-wood-50 border-b border-wood-200 px-4 py-2 h-14">
          <span className="font-medium text-sm">
            {mode === 'refine'
              ? 'Raffiner le texte'
              : wizardSection
                ? 'Génération de section'
                : regenSection
                  ? 'Modifier la section'
                  : commentModalOpen
                    ? 'Commenter des résultats'
                    : 'Assistant IA'}
          </span>
          {(regenSection || mode === 'refine') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => {
                if (regenSection) setRegenSection(null);
                if (mode === 'refine') {
                  setMode('idle');
                  setRefinedText('');
                  setRegenPrompt('');
                  selection?.clear();
                }
              }}
            >
              Retour
            </Button>
          )}
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {mode === 'refine' ? (
            <div className="space-y-4">
              {refinedText && (
                <div className="space-y-2">
                  <div className="p-2 border rounded bg-white whitespace-pre-wrap text-sm">
                    {refinedText}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (selection?.restore()) {
                          onInsertText(refinedText);
                          selection.clear();
                        }
                        setRefinedText('');
                        setRegenPrompt('');
                        setMode('idle');
                      }}
                    >
                      Insérer
                    </Button>
                  </div>
                </div>
              )}
              <h3 className="text-sm font-medium text-left">
                Si vous voulez ajuster le contenu sélectionné, précisez les
                modifications souhaitées
              </h3>
              <div className="w-full">
                <Textarea
                  ref={textareaRef}
                  value={regenPrompt}
                  onChange={(e) => setRegenPrompt(e.target.value)}
                  onContextMenu={(e) => e.stopPropagation()}
                  className="min-h-[40vh] w-full text-left"
                  placeholder="Décrivez les modifications souhaitées..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMode('idle');
                    setRefinedText('');
                    setRegenPrompt('');
                    selection?.clear();
                  }}
                  disabled={isGenerating}
                >
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleRefine}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Génération...' : 'Re-générer'}
                </Button>
              </div>
            </div>
          ) : regenSection ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-left">
                Si vous voulez ajuster le contenu généré, vous pouvez préciser
                ici les éléments que vous souhaitez re-générer
              </h3>
              <div className="w-full">
                <Textarea
                  ref={textareaRef}
                  value={regenPrompt}
                  onChange={(e) => setRegenPrompt(e.target.value)}
                  onContextMenu={(e) => e.stopPropagation()}
                  className="min-h-[60vh] w-full text-left"
                  placeholder="Décrivez les modifications souhaitées..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const section = sections.find(
                      (s) => s.id === regenSection,
                    )!;
                    handleGenerate(section);
                  }}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Génération...' : 'Reformuler ce texte'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRegenSection(null)}
                  disabled={isGenerating}
                >
                  Passer à la suite
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="space-y-4">
                {sections.map((section) => {
                  const trameOpts = trames[section.id];
                  const selected = trameOpts.find(
                    (t) => t.value === selectedTrames[section.id],
                  );

                  if (wizardSection === section.id) {
                    return (
                      <Dialog
                        key={section.id}
                        open={true}
                        onOpenChange={(open) => !open && setWizardSection(null)}
                      >
                        <DialogContent showCloseButton={false} fullscreen>
                          <WizardAIRightPanel
                            sectionInfo={section}
                            trameOptions={trameOpts}
                            selectedTrame={selected}
                            onTrameChange={(v) =>
                              setSelectedTrames({
                                ...selectedTrames,
                                [section.id]: v,
                              })
                            }
                            examples={getExamples(
                              section.id,
                              selectedTrames[section.id],
                            )}
                            onAddExample={(ex) =>
                              addExample(
                                section.id,
                                selectedTrames[section.id],
                                ex,
                              )
                            }
                            onRemoveExample={(id) =>
                              removeExample(
                                section.id,
                                selectedTrames[section.id],
                                id,
                              )
                            }
                            questions={(selected?.schema as Question[]) || []}
                            answers={answers[section.id] || {}}
                            onAnswersChange={(a) =>
                              setAnswers({ ...answers, [section.id]: a })
                            }
                            onGenerate={(latest, notes) =>
                              handleGenerate(section, latest, notes)
                            }
                            onGenerateFromTemplate={(latest, notes, id) =>
                              handleGenerateFromTemplate(
                                section,
                                latest,
                                notes,
                                id,
                              )
                            }
                            isGenerating={
                              isGenerating && selectedSection === section.id
                            }
                            onCancel={() => setWizardSection(null)}
                            bilanId={bilanId}
                          />
                        </DialogContent>
                      </Dialog>
                    );
                  }

                  if (!generated[section.id]) {
                    return (
                      <Card key={section.id} className="p-4">
                        <CardContent className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-muted/60">
                              <section.icon className="h-4 w-4 text-muted-foreground text-primary-500" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-base truncate">
                                  {section.title}
                                </h3>

                                <Button
                                  size="default"
                                  variant="default"
                                  className="ml-auto h-7 px-2 text-sm"
                                  onClick={() => setWizardSection(section.id)}
                                >
                                  Démarrer
                                  <ArrowRightCircle className="h-4 w-4 ml-1" />
                                </Button>
                              </div>

                              {/* Optionnel : afficher la description sans prendre de place */}
                              {/* Mettre showDesc à true/false selon ton besoin */}
                              {false && (
                                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                                  {section.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <SectionCard
                      key={section.id}
                      section={section}
                      trameOptions={trameOpts}
                      selectedTrame={selected}
                      onTrameChange={(v) =>
                        setSelectedTrames({
                          ...selectedTrames,
                          [section.id]: v,
                        })
                      }
                      examples={getExamples(
                        section.id,
                        selectedTrames[section.id],
                      )}
                      onAddExample={(ex) =>
                        addExample(section.id, selectedTrames[section.id], ex)
                      }
                      onRemoveExample={(id) =>
                        removeExample(
                          section.id,
                          selectedTrames[section.id],
                          id,
                        )
                      }
                      questions={(selected?.schema as Question[]) || []}
                      answers={answers[section.id] || {}}
                      onAnswersChange={(a) =>
                        setAnswers({ ...answers, [section.id]: a })
                      }
                      onGenerate={(latest) => handleGenerate(section, latest)}
                      isGenerating={
                        isGenerating && selectedSection === section.id
                      }
                      active={selectedSection === section.id}
                    />
                  );
                })}
                {/* <Button className="w-full"
                    size="default"
                    variant="default"
                    onClick={handleConclude}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '...' : 'Rédiger une synthèse du bilan'}
                </Button>
                <Button className="w-full"
                    size="default"
                    variant="default"
                    onClick={handleConclude}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '...' : 'Commenter des résultats de'}
                </Button>
 */}
                <div className="flex flex-col gap-4">
                  <Button
                    size="default"
                    variant="default"
                    className="h-8 px-2 text-base"
                    onClick={() => setCommentModalOpen(true)}
                    disabled={isGenerating}
                  >
                    Commenter des résultats de tests
                    <Wand2 className="h-4 w-4 ml-1" />
                  </Button>
                  <Button
                    size="default"
                    variant="default"
                    className="h-8 px-2 text-base"
                    onClick={handleConclude}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '...' : 'Rédiger la synthèse du bilan'}
                    <Wand2 className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
          <Dialog
            open={commentModalOpen}
            onOpenChange={(open) => {
              if (!open) {
                setCommentModalOpen(false);
                setCommentFile(null);
              }
            }}
          >
            <DialogContent showCloseButton={false}>
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-3 min-h-[200px]">
                  <input
                    ref={commentFileInputRef}
                    type="file"
                    accept=".xls,.xlsx,.doc,.docx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) =>
                      setCommentFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                    data-testid="comment-file-input"
                  />
                  {commentFile ? (
                    <input
                      type="text"
                      value={commentFile.name}
                      readOnly
                      className="border rounded px-3 py-2 bg-gray-50 text-gray-700 w-full max-w-xs"
                      style={{ cursor: 'default' }}
                    />
                  ) : (
                    <Button
                      type="button"
                      onClick={() => commentFileInputRef.current?.click()}
                      disabled={isGenerating}
                    >
                      +Choisir un fichier
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    Formats acceptés : .doc, .docx, .xls, .xlsx
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCommentModalOpen(false);
                      setCommentFile(null);
                    }}
                    disabled={isGenerating}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCommentTestResults}
                    disabled={!commentFile || isGenerating}
                  >
                    {isGenerating ? 'Génération...' : 'Valider'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
