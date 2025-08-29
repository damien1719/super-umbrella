'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSectionStore } from '@/store/sections';
import { useEditorUi } from '@/store/editorUi';
import { useSectionExampleStore } from '@/store/sectionExamples';
import { SectionInfo } from './bilan/SectionCard';
import WizardAIRightPanel from './WizardAIRightPanel';
import WizardAIBilanType from './WizardAIBilanType';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import GeneratingModal from '@/components/ui/generating-modal';
import type { TrameOption, TrameExample } from './bilan/TrameSelector';
import type { Answers, Question } from '@/types/question';
import { sections, kindMap } from '@/types/trame';
import {
  FileText,
  Eye,
  Brain,
  Activity,
  ArrowRightCircle,
  Wand2,
} from 'lucide-react';
import { apiFetch } from '@/utils/api';
import { generateSection } from '@/services/generation';
import { useAuth } from '@/store/auth';
import { useBilanTypeStore } from '@/store/bilanTypes';

const useTrames = () => {
  const { items, fetchAll } = useSectionStore();

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  return useMemo(() => {
    const res: Record<string, TrameOption[]> = {
      anamnese: [],
      'tests-standards': [],
      observations: [],
      'profil-sensoriel': [],
      'bilan-complet': [],
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
          templateRefId: s.templateRefId,
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
  onSave?: () => Promise<void>; // Ajout de la prop onSave
}

export default function AiRightPanel({
  bilanId,
  onInsertText,
  onSetEditorStateJson,
  initialWizardSection,
  initialTrameId,
  onSave,
}: AiRightPanelProps) {
  const trames = useTrames();
  const {
    items: examples,
    fetchAll,
    create,
    remove,
  } = useSectionExampleStore();
  const token = useAuth((s) => s.token);
  const {
    items: bilanTypes,
    fetchAll: fetchBilanTypes,
  } = useBilanTypeStore();

  useEffect(() => {
    fetchAll().catch(() => {});
    fetchBilanTypes().catch(() => {});
  }, [fetchAll, fetchBilanTypes]);

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
  const [wizardBilanType, setWizardBilanType] = useState(false);
  const [lastGeneratedSection, setLastGeneratedSection] = useState<string | null>(null);
  const [wizardStartStep, setWizardStartStep] = useState<number>(1);
  const [regenSection, setRegenSection] = useState<string | null>(null);
  const [regenPrompt, setRegenPrompt] = useState('');
  const [refinedText, setRefinedText] = useState('');
  useEditorUi((s) => s.selection);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Bulk generation handler (backend orchestrator)
  const generateFullBilanType = async (bilanTypeId: string, excludeSectionIds?: string[]) => {
    setIsGenerating(true);
    try {
      const res = await apiFetch<{ assembledState: unknown }>(
        `/api/v1/bilans/${bilanId}/generate-bilan-type`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ bilanTypeId, excludeSectionIds }),
        },
      );
      if (onSetEditorStateJson) {
        onSetEditorStateJson(res.assembledState);
      } else {
        // Fallback: dispatch custom event for editor
        const evt = new CustomEvent('lexical:set-json', { detail: res.assembledState });
        window.dispatchEvent(evt);
      }
      setWizardBilanType(false);
    } catch (e) {
      console.error('[AiRightPanel] generateFullBilanType failed', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const bilanTypeOptions = useMemo(() =>
    bilanTypes.map((b) => ({
      value: b.id,
      label: b.name,
      description: b.description || '',
      schema: [],
      isPublic: b.isPublic ?? false,
      authorId: b.authorId || '',
      author: b.author?.prenom || '',
      templateRefId: undefined,
    })) as TrameOption[],
  [bilanTypes]);

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

  const handleGenerate = async (
    section: SectionInfo,
    newAnswers?: Answers,
    rawNotes?: string,
    imageBase64?: string,
  ) => {
    setLastGeneratedSection(section.id);
    await generateSection({
      mode: 'direct',
      section,
      trames: trames as Record<
        string,
        Array<{ value: string; schema: Question[] }>
      >,
      selectedTrames,
      answers,
      newAnswers,
      rawNotes,
      imageBase64,
      token: token || '',
      bilanId,
      kindMap,
      setIsGenerating,
      setSelectedSection,
      setWizardSection,
      setGenerated,
      setRegenPrompt,
      onInsertText,
      onSetEditorStateJson,
      examples: examples as Array<{ sectionId: string; stylePrompt?: string }>,
    });
  };

  const handleGenerateFromTemplate = async (
    section: SectionInfo,
    newAnswers?: Answers,
    rawNotes?: string,
    instId?: string,
    imageBase64?: string,
  ) => {
    console.log(
      '[DEBUG] AiRightPanel - handleGenerateFromTemplate called with:',
      {
        sectionId: section.id,
        hasNewAnswers: !!newAnswers,
        hasRawNotes: !!rawNotes,
        instId,
        hasImageBase64: !!imageBase64,
        imageBase64Length: imageBase64?.length || 0,
      },
    );

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
        trames: trames as Record<
          string,
          Array<{ value: string; schema: Question[] }>
        >,
        selectedTrames,
        answers,
        newAnswers,
        rawNotes,
        imageBase64,
        instanceId: instId,
        token: token || '',
        bilanId,
        kindMap,
        setIsGenerating,
        setSelectedSection,
        setWizardSection,
        onInsertText,
        onSetEditorStateJson,
        examples: examples as Array<{
          sectionId: string;
          stylePrompt?: string;
        }>,
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

      setLastGeneratedSection(section.id);
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
      if (onSave) {
        await onSave();
      }

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

  return (
    <div className="w-full max-w-md bg-wood-50 rounded-lg shadow-lg">
      <GeneratingModal open={isGenerating} logoSrc="/logo.png"  />
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
                  : 'Assistant IA'}
          </span>
          <div className="flex items-center gap-2">
            {!wizardSection && !regenSection && mode !== 'refine' && lastGeneratedSection && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => {
                  setWizardStartStep(2);
                  setWizardSection(lastGeneratedSection);
                }}
              >
                Voir mes dernières réponses
              </Button>
            )}
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
                {wizardBilanType && (
                  <Dialog
                    open={true}
                    onOpenChange={(open) => !open && setWizardBilanType(false)}
                  >
                    <DialogContent showCloseButton={false} fullscreen>
                      <WizardAIBilanType
                        mode="bilanType"
                        sectionInfo={{
                          id: 'bilanType',
                          title: 'Bilan type',
                          icon: Brain,
                          description: '',
                        }}
                        trameOptions={bilanTypeOptions}
                        selectedTrame={undefined}
                        onTrameChange={() => {}}
                        examples={[]}
                        onAddExample={() => {}}
                        onRemoveExample={() => {}}
                        questions={[]}
                        answers={{}}
                        onAnswersChange={() => {}}
                        onGenerate={async () => {}}
                        onGenerateAll={(bilanTypeId, exclude) => generateFullBilanType(bilanTypeId, exclude)}
                        isGenerating={false}
                        bilanId={bilanId}
                        onCancel={() => setWizardBilanType(false)}
                      />
                    </DialogContent>
                  </Dialog>
                )}

                <Card key="bilan-type" className="p-4">
                  <CardContent className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-muted/60">
                        <Brain className="h-4 w-4 text-muted-foreground text-primary-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-base truncate">
                            Bilan type
                          </h3>
                          <Button
                            size="default"
                            variant="default"
                            className="ml-auto h-7 px-2 text-sm"
                            onClick={() => setWizardBilanType(true)}
                          >
                            Démarrer
                            <ArrowRightCircle className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {wizardSection === 'reponses' ? (
                  <Dialog
                    open={true}
                    onOpenChange={(open) => !open && setWizardSection(null)}
                  >
                    <DialogContent showCloseButton={false} fullscreen>
                      <WizardAIRightPanel
                        sectionInfo={{
                          id: 'reponses',
                          title: 'Mes dernières réponses',
                          icon: FileText,
                          description: 'Consultez et modifiez vos réponses précédentes'
                        }}
                        trameOptions={[]}
                        selectedTrame={undefined}
                        onTrameChange={() => {}}
                        examples={[]}
                        onAddExample={() => {}}
                        onRemoveExample={() => {}}
                        questions={[]}
                        answers={{}}
                        onAnswersChange={() => {}}
                        onGenerate={async () => {}}
                        onGenerateFromTemplate={async () => {}}
                        isGenerating={false}
                        bilanId={bilanId}
                        onCancel={() => setWizardSection(null)}
                      />
                    </DialogContent>
                  </Dialog>
                ) : (
                  sections.map((section) => {
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
                            onGenerate={async (latest, notes, imageBase64) =>
                              await handleGenerate(
                                section,
                                latest,
                                notes,
                                imageBase64,
                              )
                            }
                            onGenerateFromTemplate={async (
                              latest,
                              notes,
                              id,
                              imageBase64,
                            ) =>
                              await handleGenerateFromTemplate(
                                section,
                                latest,
                                notes,
                                id,
                                imageBase64,
                              )
                            }
                            isGenerating={
                              isGenerating && selectedSection === section.id
                            }
                            onCancel={() => setWizardSection(null)}
                            bilanId={bilanId}
                            initialStep={wizardStartStep}
                          />
                          </DialogContent>
                        </Dialog>
                      );
                    }

                    // Toujours afficher la carte simple, jamais SectionCard
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
                                  onClick={() => {
                                    setWizardStartStep(1);
                                    setWizardSection(section.id);
                                  }}
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
                  })
                )}
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
                    onClick={handleConclude}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '...' : 'Conclure le bilan'}
                    <Wand2 className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
