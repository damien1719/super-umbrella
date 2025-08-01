'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSectionStore } from '../store/sections';
import type { Question } from '../types/question';
import { categories } from '../types/trame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ImportMagique from '@/components/ImportMagique';
import {
  ArrowLeft,
  Copy,
  Plus,
  Trash2,
  FileText,
  CheckSquare,
  BarChart3,
  Table,
} from 'lucide-react';

const typesQuestions = [
  {
    id: 'notes',
    title: 'Réponse (prise de notes)',
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
  {
    id: 'tableau',
    title: 'Tableaux de résultats',
    icon: Table,
    description: 'Liste de lignes avec notation',
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
  const [isPublic, setIsPublic] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [showImport, setShowImport] = useState(false);

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
      if (loaded.length > 0) {
        setSelectedQuestionId(loaded[0].id);
      }
    });
  }, [sectionId, fetchOne]);

  const ajouterQuestion = () => {
    const nouvelleQuestion = createDefaultNote();

    setQuestions((qs) => {
      if (!selectedQuestionId) return [...qs, nouvelleQuestion];

      const idx = qs.findIndex((q) => q.id === selectedQuestionId);
      if (idx === -1) return [...qs, nouvelleQuestion];

      return [...qs.slice(0, idx + 1), nouvelleQuestion, ...qs.slice(idx + 1)];
    });
    setSelectedQuestionId(nouvelleQuestion.id);
  };

  const dupliquerQuestion = (id: string) => {
    // On trouve d'abord l'index de la question à dupliquer
    const idx = questions.findIndex((q) => q.id === id);
    if (idx === -1) return;

    // On clone l'objet
    const original = questions[idx];
    const clone: Question = {
      ...JSON.parse(JSON.stringify(original)),
      id: Date.now().toString(),
      titre: 'Question sans titre',
    };

    // On reconstruit le tableau en insérant la copie juste après l'original
    const before = questions.slice(0, idx + 1);
    const after = questions.slice(idx + 1);
    const newList = [...before, clone, ...after];
    setQuestions(newList);
    setSelectedQuestionId(clone.id);
  };

  const supprimerQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const mettreAJourQuestion = (id: string, champ: string, valeur: unknown) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [champ]: valeur } : q)),
    );
  };

  const mettreAJourTableau = (
    id: string,
    valeurs: { lignes?: string[]; colonnes?: string[] },
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === id
          ? { ...q, tableau: { ...(q.tableau || {}), ...valeurs } }
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

  const supprimerLigne = (questionId: string, index: number) => {
    if (!questions) return;
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.tableau?.lignes
          ? {
              ...q,
              tableau: {
                ...q.tableau,
                lignes: q.tableau.lignes.filter((_, i) => i !== index),
              },
            }
          : q,
      ),
    );
  };

  const supprimerColonne = (questionId: string, index: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.tableau?.colonnes
          ? {
              ...q,
              tableau: {
                ...q.tableau,
                colonnes: q.tableau.colonnes.filter((_, i) => i !== index),
              },
            }
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
      isPublic,
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
          <Input
            value={nomTrame}
            onChange={(e) => setNomTrame(e.target.value)}
            placeholder="Titre de la trame"
            className="text-2xl font-bold text-gray-900 flex-1"
          />
          <div className="w-48 flex-shrink-0">
            <Select
              value={categorie}
              onValueChange={(v) => setCategorie(v)}
              className="w-48"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={sauvegarderTrame}
            className="ml-auto bg-blue-600 hover:bg-blue-700"
          >
            Sauvegarder la trame
          </Button>
          <Button variant="outline" onClick={() => setShowImport(true)}>
            Import Magique
          </Button>
        </div>

        <div className="space-y-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span className="text-md text-gray-700">
              Partager la trame aux autres utilisateurs de SoignezVotrePlume
            </span>
          </label>

          {/* Liste des questions */}
          {questions.map((question, index) => (
            <div key={question.id} className="relative w-full">
              <Card
                onClick={() => setSelectedQuestionId(question.id)}
                className={`w-[90%] mx-auto cursor-pointer transition-shadow ${
                  selectedQuestionId === question.id
                    ? 'border-blue-500 ring-1 ring-blue-500 shadow-md'
                    : ''
                }`}
              >
                <CardHeader>
                  {/* Titre de la question + sélecteur de type */}
                  <div className="flex items-center gap-4">
                    <Input
                      className="flex-1"
                      placeholder={`Question ${index + 1}`}
                      value={question.titre}
                      onChange={(e) =>
                        mettreAJourQuestion(
                          question.id,
                          'titre',
                          e.target.value,
                        )
                      }
                    />
                    {selectedQuestionId === question.id && (
                      <Select
                        value={question.type}
                        onValueChange={(v) =>
                          mettreAJourQuestion(question.id, 'type', v)
                        }
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue placeholder="Type de réponse" />
                        </SelectTrigger>
                        <SelectContent>
                          {typesQuestions.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {question.type === 'notes' && (
                    <div className="w-full rounded px-3 py-2 border-b border-dotted border-gray-200 text-gray-600">
                      Réponse (prise de notes)
                    </div>
                  )}

                  {question.type === 'choix-multiple' && (
                    <div>
                      <Label>Options de réponse</Label>
                      <div className="space-y-2">
                        {/* Existing options as editable inputs */}
                        {question.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center gap-2"
                          >
                            <Input
                              value={option}
                              onChange={(e) => {
                                const opts = [...(question.options || [])];
                                opts[optionIndex] = e.target.value;
                                mettreAJourQuestion(
                                  question.id,
                                  'options',
                                  opts,
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

                        {/* Modified: inline add field */}
                        <Input
                          placeholder="Ajouter une option"
                          onKeyDown={(e) => {
                            if (
                              e.key === 'Enter' &&
                              e.currentTarget.value.trim()
                            ) {
                              const nouvelleOpt = e.currentTarget.value.trim();
                              const opts = [
                                ...(question.options || []),
                                nouvelleOpt,
                              ];
                              mettreAJourQuestion(question.id, 'options', opts);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
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

                  {question.type === 'tableau' && (
                    <div className="overflow-auto">
                      <table className="border-collapse">
                        <thead>
                          <tr>
                            <th className="p-1"></th>
                            {question.tableau?.colonnes?.map((col, colIdx) => (
                              <th key={colIdx} className="p-1">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={col}
                                    onChange={(e) => {
                                      const colonnes = [
                                        ...(question.tableau?.colonnes || []),
                                      ];
                                      colonnes[colIdx] = e.target.value;
                                      mettreAJourTableau(question.id, {
                                        colonnes,
                                      });
                                    }}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      supprimerColonne(question.id, colIdx)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </th>
                            ))}
                            <th className="p-1">
                              <Input
                                placeholder="Ajouter une colonne"
                                onKeyDown={(e) => {
                                  if (
                                    e.key === 'Enter' &&
                                    e.currentTarget.value.trim()
                                  ) {
                                    const nouvelle =
                                      e.currentTarget.value.trim();
                                    const colonnes = [
                                      ...(question.tableau?.colonnes || []),
                                      nouvelle,
                                    ];
                                    mettreAJourTableau(question.id, {
                                      colonnes,
                                    });
                                    e.currentTarget.value = '';
                                  }
                                }}
                              />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {question.tableau?.lignes?.map((ligne, ligneIdx) => (
                            <tr key={ligneIdx}>
                              <th className="p-1">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={ligne}
                                    onChange={(e) => {
                                      const lignes = [
                                        ...(question.tableau?.lignes || []),
                                      ];
                                      lignes[ligneIdx] = e.target.value;
                                      mettreAJourTableau(question.id, {
                                        lignes,
                                      });
                                    }}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      supprimerLigne(question.id, ligneIdx)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </th>
                              {question.tableau?.colonnes?.map((_, colIdx) => (
                                <td key={colIdx} className="p-1">
                                  <Input
                                    disabled
                                    className="pointer-events-none"
                                  />
                                </td>
                              ))}
                              <td className="p-1"></td>
                            </tr>
                          ))}
                          <tr>
                            <th className="p-1">
                              <Input
                                placeholder="Ajouter une ligne"
                                onKeyDown={(e) => {
                                  if (
                                    e.key === 'Enter' &&
                                    e.currentTarget.value.trim()
                                  ) {
                                    const nouvelle =
                                      e.currentTarget.value.trim();
                                    const lignes = [
                                      ...(question.tableau?.lignes || []),
                                      nouvelle,
                                    ];
                                    mettreAJourTableau(question.id, { lignes });
                                    e.currentTarget.value = '';
                                  }
                                }}
                              />
                            </th>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Icônes Dupliquer / Supprimer en bas */}
                  {selectedQuestionId === question.id && (
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          dupliquerQuestion(question.id);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          supprimerQuestion(question.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedQuestionId === question.id && (
                <div className="absolute top-1/2 -translate-y-1/2 -right-4">
                  <Button
                    variant="primary"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      ajouterQuestion();
                    }}
                  >
                    <Plus className="h-6 w-6 text-white" />
                  </Button>
                </div>
              )}
            </div>
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
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent>
          <ImportMagique
            onDone={(qs) => setQuestions(qs)}
            onCancel={() => setShowImport(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
