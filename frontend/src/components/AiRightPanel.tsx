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
import { FileText, Eye, Brain, Activity } from 'lucide-react';
import { apiFetch } from '@/utils/api';
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
    title: 'Observations cliniques',
    icon: Brain,
    description: 'Observations comportementales et motrices',
  },
  {
    id: 'tests-mabc',
    title: 'Tests standards MABC',
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
        }));
    });
    return res;
  }, [items]);
};

interface AiRightPanelProps {
  bilanId: string;
  onInsertText: (text: string) => void;
  initialWizardSection?: string;
  initialTrameId?: string;
}

export default function AiRightPanel({
  bilanId,
  onInsertText,
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

  type TableAnswers = Record<string, unknown> & { commentaire?: string };

  function markdownifyTable(q: Question, ansTable: TableAnswers): string {
    if (!q.tableau?.columns) {
      return '';
    }

    const header =
      `**${q.titre}**\n\n` +
      `| ${['Ligne', ...q.tableau.columns.map((c) => c.label)].join(' | ')} |\n` +
      `| ${['---', ...q.tableau.columns.map(() => '---')].join(' | ')} |\n`;

    const body =
      q.tableau.rowsGroups
        ?.flatMap((rowGroup) =>
          rowGroup.rows.map((row) => {
            const rowData = ansTable[row.id] as
              | Record<string, unknown>
              | undefined;
            const cells =
              q.tableau?.columns?.map((col) => {
                const v = rowData?.[col.id];
                return typeof v === 'string' || typeof v === 'number'
                  ? String(v)
                  : '';
              }) || [];
            return `| ${[row.label, ...cells].join(' | ')} |`;
          }),
        )
        .join('\n') || '';

    const commentVal = ansTable.commentaire;
    const comment =
      typeof commentVal === 'string'
        ? `\n\n> **Commentaire** : ${commentVal}`
        : '';
      
    console.log("header", header)
    console.log("body", body)
    console.log("comment", comment)

    return header + body + comment;
  }

  function markdownifyField(q: Question, value: string): string {
    switch (q.type) {
      case 'notes':
        return `${q.titre}\n\n${value}`;
      case 'choix-multiple':
        return `${q.titre}\n\n${value}`;
      case 'echelle':
        return `${q.titre}\n\n${value}`;
      case 'titre':
        console.log("here");
        return `## ${q.titre}\n\n${value}`;
      default:
        return `${q.titre} : ${value}`;
    }
  }

  const handleGenerate = async (section: SectionInfo, newAnswers?: Answers) => {
    setIsGenerating(true);
    setSelectedSection(section.id);

    try {
      const trameId = selectedTrames[section.id];
      const trame = trames[section.id].find((t) => t.value === trameId);
      const questions: Question[] = (trame?.schema as Question[]) || [];
      const ans = newAnswers || answers[section.id] || {};

      const mdBlocks: string[] = [];

      // Titre principal
      // mdBlocks.push(`# ${section.title}\n`);

      for (const q of questions) {
        console.log("type", q.type);
        if (q.type === 'tableau') {
          const ansTable = (ans[q.id] as TableAnswers) || {};
          mdBlocks.push(markdownifyTable(q, ansTable));
        } else if (q.type === 'titre') {
          mdBlocks.push(markdownifyField(q, ''));
        } else {
          console.log("questions", q)
          const raw = String(ans[q.id] ?? '').trim();
          if (raw) {
            mdBlocks.push(markdownifyField(q, raw));
            console.log(mdBlocks)
          }
        }
      }

      // 5) Concatène tout avec deux retours à la ligne
      const promptMarkdown = mdBlocks.join('\n\n');

      const body = {
        section: kindMap[section.id],
        answers: promptMarkdown,
        examples: examples
          .filter((e) => e.sectionId === trameId)
          .map((e) => e.content),
      };

      console.log('body', body);

      const res = await apiFetch<{ text: string }>(
        `/api/v1/bilans/${bilanId}/generate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        },
      );

      const header = `## ${section.title}\n\n`;
      const textWithHeader = header + res.text;

      onInsertText(textWithHeader);
      setGenerated((g) => ({ ...g, [section.id]: true }));
      setRegenSection(section.id);
      setRegenPrompt('');
    } finally {
      setIsGenerating(false);
      setSelectedSection(null);
      setWizardSection(null);
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
          <span className="font-medium text-sm">Assistant IA</span>
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
                  variant="outline"
                  size="sm"
                  onClick={() => setRegenSection(null)}
                  disabled={isGenerating}
                >
                  Annuler
                </Button>
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
                  {isGenerating ? 'Génération...' : 'Re-générer'}
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
                        <DialogContent
                          showCloseButton={false}
                          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100vw] max-w-[100vw] sm:max-w-5xl h-[90vh] max-w-none max-h-none overflow-auto bg-wood-50 rounded-lg shadow-lg"
                        >
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
                            onGenerate={(latest) =>
                              handleGenerate(section, latest)
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
                      <Card key={section.id} className="">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-gray-100">
                              <section.icon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-sm mb-1">
                                {section.title}
                              </h3>
                              <p className="text-xs text-gray-500 mb-4">
                                {section.description}
                              </p>
                              <Button
                                size="sm"
                                variant="default"
                                className="w-full text-xs"
                                onClick={() => setWizardSection(section.id)}
                              >
                                Démarrer la génération
                              </Button>
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
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
