'use client';
import { useState, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSectionStore } from '@/store/sections';
import { useSectionExampleStore } from '@/store/sectionExamples';
import { SectionCard, SectionInfo } from './bilan/SectionCard';
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
}

export default function AiRightPanel({
  bilanId,
  onInsertText,
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
    {},
  );
  const [answers, setAnswers] = useState<Record<string, Answers>>({});
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerate = async (section: SectionInfo) => {
    setIsGenerating(true);
    setSelectedSection(section.id);
    try {
      const body = {
        section: kindMap[section.id],
        answers: answers[section.id] || {},
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
    } finally {
      setIsGenerating(false);
      setSelectedSection(null);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="font-semibold">Assistant IA</span>
        </div>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-4">
            {sections.map((section) => {
              const trameOpts = trames[section.id];
              const selected = trameOpts.find(
                (t) => t.value === selectedTrames[section.id],
              );
              return (
                <SectionCard
                  key={section.id}
                  section={section}
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
                  onAnswersChange={(a) =>
                    setAnswers({ ...answers, [section.id]: a })
                  }
                  onGenerate={() => handleGenerate(section)}
                  isGenerating={isGenerating && selectedSection === section.id}
                  active={selectedSection === section.id}
                />
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
