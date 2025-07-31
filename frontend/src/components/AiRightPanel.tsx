'use client';
import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSectionStore } from '@/store/sections';
import { useSectionExampleStore } from '@/store/sectionExamples';
import { SectionCard, SectionInfo } from './bilan/SectionCard';
import WizardAIRightPanel from './WizardAIRightPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';
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
  conclusions: 'conclusions',
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
    id: 'conclusions',
    title: 'Conclusions',
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
  onWizardChange?: (node: ReactNode | null) => void;
}

export default function AiRightPanel({
  bilanId,
  onInsertText,
  initialWizardSection,
  initialTrameId,
  onWizardChange,
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
  const [answers, setAnswers] = useState<Record<string, Answers>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<Record<string, boolean>>({});
  const [wizardSection, setWizardSection] = useState<string | null>(
    initialWizardSection || null,
  );
  const [regenSection, setRegenSection] = useState<string | null>(null);
  const [regenPrompt, setRegenPrompt] = useState('');

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

  const handleGenerate = async (section: SectionInfo, newAnswers?: Answers) => {
    setIsGenerating(true);
    setSelectedSection(section.id);
    try {
      const body = {
        section: kindMap[section.id],
        answers: newAnswers || answers[section.id] || {},
        examples: examples
          .filter((e) => e.sectionId === selectedTrames[section.id])
          .map((e) => e.content),
      };
      const res = await apiFetch<{ text: string }>(
        `/api/v1/bilans/${bilanId}/generate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        },
      );
      onInsertText(res.text);
      setGenerated((g) => ({ ...g, [section.id]: true }));
      setRegenSection(section.id);
      setRegenPrompt('');
    } finally {
      setIsGenerating(false);
      setSelectedSection(null);
      setWizardSection(null);
    }
  };

  useEffect(() => {
    if (!onWizardChange) return;
    if (!wizardSection) {
      onWizardChange(null);
      return;
    }
    const section = sections.find((s) => s.id === wizardSection);
    if (!section) return;
    const trameOpts = trames[section.id];
    const selected = trameOpts.find(
      (t) => t.value === selectedTrames[section.id],
    );
    const element = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={() => setWizardSection(null)}
      >
        <div
          className="w-[100vw] h-[80vh] max-w-none max-h-none overflow-auto bg-white rounded-lg shadow-lg relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute top-2 right-2 text-gray-500"
            onClick={() => setWizardSection(null)}
          >
            ×
          </button>
          <WizardAIRightPanel
            sectionInfo={section}
            trameOptions={trameOpts}
            selectedTrame={selected}
            onTrameChange={(v) =>
              setSelectedTrames({ ...selectedTrames, [section.id]: v })
            }
            examples={getExamples(section.id, selectedTrames[section.id])}
            onAddExample={(ex) =>
              addExample(section.id, selectedTrames[section.id], ex)
            }
            onRemoveExample={(id) =>
              removeExample(section.id, selectedTrames[section.id], id)
            }
            questions={(selected?.schema as Question[]) || []}
            answers={answers[section.id] || {}}
            onAnswersChange={(a) => setAnswers({ ...answers, [section.id]: a })}
            onGenerate={(latest) => handleGenerate(section, latest)}
            isGenerating={isGenerating && selectedSection === section.id}
            bilanId={bilanId}
          />
        </div>
      </div>
    );
    onWizardChange(element);
  }, [
    wizardSection,
    trames,
    selectedTrames,
    answers,
    isGenerating,
    selectedSection,
    onWizardChange,
  ]);

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
      <div className="flex flex-col h-full">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2 h-14">
          <span className="font-medium text-sm">Assistant IA</span>
          {regenSection && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setRegenSection(null)}
            >
              Retour
            </Button>
          )}
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {regenSection ? (
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
                    return null;
                  }

                  if (!generated[section.id]) {
                    return (
                      <Card key={section.id} className="hover:shadow-md">
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
                                variant="black"
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
