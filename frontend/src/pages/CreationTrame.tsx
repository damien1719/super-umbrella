'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSectionStore } from '../store/sections';
import type { Question } from '../types/question';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  CheckSquare,
  BarChart3,
} from 'lucide-react';

const typesQuestions = [
  {
    id: 'notes',
    title: 'Notes brutes',
    icon: FileText,
    description: 'Zone de texte libre',
  },
  {
    id: 'choix-multiple',
    title: 'Choix multiples',
    icon: CheckSquare,
    description: 'Question avec options prédéfinies',
  },
  {
    id: 'echelle',
    title: 'Échelle chiffrée',
    icon: BarChart3,
    description: 'Évaluation sur une échelle numérique',
  },
];

export default function CreationTrame() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state?: { returnTo?: string; wizardSection?: string; trameId?: string };
  };
  const fetchOne = useSectionStore((s) => s.fetchOne);
  const updateSection = useSectionStore((s) => s.update);
  const [nomTrame, setNomTrame] = useState('');
  const [categorie, setCategorie] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [typeQuestionSelectionnee, setTypeQuestionSelectionnee] = useState('');

  useEffect(() => {
    if (!sectionId) return;
    fetchOne(sectionId).then((section) => {
      setNomTrame(section.title);
      setCategorie(section.kind);
      if (Array.isArray(section.schema)) {
        setQuestions(section.schema as Question[]);
      }
    });
  }, [sectionId, fetchOne]);

  const ajouterQuestion = () => {
    if (!typeQuestionSelectionnee) return;

    const nouvelleQuestion: Question = {
      id: Date.now().toString(),
      type: typeQuestionSelectionnee as Question['type'],
      titre: '',
    };

    if (typeQuestionSelectionnee === 'choix-multiple') {
      nouvelleQuestion.options = ['Option 1', 'Option 2'];
    } else if (typeQuestionSelectionnee === 'echelle') {
      nouvelleQuestion.echelle = {
        min: 1,
        max: 5,
        labels: { min: 'Faible', max: 'Élevé' },
      };
    }

    setQuestions([...questions, nouvelleQuestion]);
    setTypeQuestionSelectionnee('');
  };

  const supprimerQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const mettreAJourQuestion = (id: string, champ: string, valeur: unknown) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [champ]: valeur } : q)),
    );
  };

  const ajouterOption = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.options
          ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
          : q,
      ),
    );
  };

  const supprimerOption = (questionId: string, index: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.options
          ? { ...q, options: q.options.filter((_, i) => i !== index) }
          : q,
      ),
    );
  };

  const sauvegarderTrame = async () => {
    if (!sectionId) return;
    await updateSection(sectionId, {
      title: nomTrame,
      kind: categorie,
      schema: questions,
    });
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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{nomTrame}</h1>
            <p className="text-gray-600 capitalize">
              {categorie?.replace('-', ' ')}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Ajouter une question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ajouter une question</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select
                  value={typeQuestionSelectionnee}
                  onValueChange={setTypeQuestionSelectionnee}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choisir le type de question" />
                  </SelectTrigger>
                  <SelectContent>
                    {typesQuestions.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.title}</div>
                              <div className="text-xs text-gray-500">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  onClick={ajouterQuestion}
                  disabled={!typeQuestionSelectionnee}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des questions */}
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Question {index + 1} -{' '}
                    {typesQuestions.find((t) => t.id === question.type)?.title}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => supprimerQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`titre-${question.id}`}>
                    Titre de la question
                  </Label>
                  <Input
                    id={`titre-${question.id}`}
                    value={question.titre}
                    onChange={(e) =>
                      mettreAJourQuestion(question.id, 'titre', e.target.value)
                    }
                    placeholder="Ex: Décrivez les difficultés observées..."
                  />
                </div>

                {question.type === 'notes' && (
                  <div>
                    <Label htmlFor={`contenu-${question.id}`}>
                      Instructions (optionnel)
                    </Label>
                    <Textarea
                      id={`contenu-${question.id}`}
                      value={question.contenu || ''}
                      onChange={(e) =>
                        mettreAJourQuestion(
                          question.id,
                          'contenu',
                          e.target.value,
                        )
                      }
                      placeholder="Instructions pour remplir cette section..."
                    />
                  </div>
                )}

                {question.type === 'choix-multiple' && (
                  <div>
                    <Label>Options de réponse</Label>
                    <div className="space-y-2">
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const nouvellesOptions = [
                                ...(question.options || []),
                              ];
                              nouvellesOptions[optionIndex] = e.target.value;
                              mettreAJourQuestion(
                                question.id,
                                'options',
                                nouvellesOptions,
                              );
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              supprimerOption(question.id, optionIndex)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => ajouterOption(question.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une option
                      </Button>
                    </div>
                  </div>
                )}

                {question.type === 'echelle' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`min-${question.id}`}>
                        Valeur minimum
                      </Label>
                      <Input
                        id={`min-${question.id}`}
                        type="number"
                        value={question.echelle?.min || 1}
                        onChange={(e) =>
                          mettreAJourQuestion(question.id, 'echelle', {
                            ...question.echelle,
                            min: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`max-${question.id}`}>
                        Valeur maximum
                      </Label>
                      <Input
                        id={`max-${question.id}`}
                        type="number"
                        value={question.echelle?.max || 5}
                        onChange={(e) =>
                          mettreAJourQuestion(question.id, 'echelle', {
                            ...question.echelle,
                            max: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button
              onClick={sauvegarderTrame}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sauvegarder la trame
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
