'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSectionStore } from '../store/sections';
import { useSectionExampleStore } from '../store/sectionExamples';
import type { Question } from '../types/question';

interface ImportResponse {
  result: Question[][];
}

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
import SaisieExempleTrame from '@/components/SaisieExempleTrame';
import { DataEntry } from '@/components/bilan/DataEntry';
import {
  ArrowLeft,
  Copy,
  Plus,
  Trash2,
  FileText,
  CheckSquare,
  BarChart3,
  Table,
  Heading3,
  GripVertical,
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
  {
    id: 'titre',
    title: 'Titre de section',
    icon: Heading3,
    description: 'Titre sans réponse',
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

  const dragIndex = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
  };

  const handleDrop = (index: number) => {
    if (dragIndex.current === null || dragIndex.current === index) {
      dragIndex.current = null;
      return;
    }
    setQuestions((qs) => {
      const updated = [...qs];
      const [moved] = updated.splice(dragIndex.current as number, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    dragIndex.current = null;
  };

  const mettreAJourQuestion = (id: string, champ: string, valeur: unknown) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [champ]: valeur } : q)),
    );
  };

  const mettreAJourTableau = (
    id: string,
    valeurs: {
      lignes?: string[];
      colonnes?: string[];
      valeurType?: 'texte' | 'score' | 'choix-multiple' | 'case-a-cocher';
      options?: string[];
      commentaire?: boolean;
    },
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

  const supprimerOptionTableau = (questionId: string, index: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.tableau?.options
          ? {
              ...q,
              tableau: {
                ...q.tableau,
                options: q.tableau.options.filter((_, i) => i !== index),
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

        <div className="border-b mb-4">
          <nav className="flex gap-4">
            <button
              className={`pb-2 px-1 border-b-2 ${
                tab === 'questions' ? 'border-blue-600' : 'border-transparent'
              }`}
              onClick={() => setTab('questions')}
            >
              Questions
            </button>
            <button
              className={`pb-2 px-1 border-b-2 ${
                tab === 'preview' ? 'border-blue-600' : 'border-transparent'
              }`}
              onClick={() => setTab('preview')}
            >
              Pré-visualisation
            </button>
            <button
              className={`pb-2 px-1 border-b-2 ${
                tab === 'examples' ? 'border-blue-600' : 'border-transparent'
              }`}
              onClick={() => setTab('examples')}
            >
              Exemples
            </button>
          </nav>
        </div>

        <div className="space-y-6">
          {tab === 'questions' && (
            <>
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
                <div
                  key={question.id}
                  className="relative w-full"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                >
                  <button
                    aria-label="Déplacer la question"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    className={`absolute top left-1/2 cursor-move p-1 rounded transition-opacity opacity-0 ${
                      selectedQuestionId === question.id
                        ? 'opacity-100'
                        : 'group-hover:opacity-100'
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-gray-400 rotate-90" />
                  </button>
                  <Card
                    onClick={() => setSelectedQuestionId(question.id)}
                    className={`group w-[90%] mx-auto cursor-pointer transition-shadow ${
                      selectedQuestionId === question.id
                        ? 'border-blue-500 ring-1 ring-blue-500 shadow-md'
                        : ''
                    }`}
                  >
                    <CardHeader>
                      {/* Titre de la question + sélecteur de type */}
                      <div className="flex items-center gap-4">
                        {question.type === 'titre' ? (
                          <div className="w-full">
                            <Input
                              className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 p-0"
                              placeholder="Titre de section"
                              value={question.titre}
                              onChange={(e) =>
                                mettreAJourQuestion(
                                  question.id,
                                  'titre',
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        ) : (
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
                        )}
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
                                  const nouvelleOpt =
                                    e.currentTarget.value.trim();
                                  const opts = [
                                    ...(question.options || []),
                                    nouvelleOpt,
                                  ];
                                  mettreAJourQuestion(
                                    question.id,
                                    'options',
                                    opts,
                                  );
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
                        <>
                          <div className="overflow-auto">
                            <table className="border-collapse">
                              <thead>
                                <tr>
                                  <th className="p-1"></th>
                                  {question.tableau?.colonnes?.map(
                                    (col, colIdx) => (
                                      <th key={colIdx} className="p-1">
                                        <div className="flex items-center gap-2">
                                          <Input
                                            value={col}
                                            onChange={(e) => {
                                              const colonnes = [
                                                ...(question.tableau
                                                  ?.colonnes || []),
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
                                              supprimerColonne(
                                                question.id,
                                                colIdx,
                                              )
                                            }
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </th>
                                    ),
                                  )}
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
                                            ...(question.tableau?.colonnes ||
                                              []),
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
                                {question.tableau?.lignes?.map(
                                  (ligne, ligneIdx) => (
                                    <tr key={ligneIdx}>
                                      <th className="p-1">
                                        <div className="flex items-center gap-2">
                                          <Input
                                            value={ligne}
                                            onChange={(e) => {
                                              const lignes = [
                                                ...(question.tableau?.lignes ||
                                                  []),
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
                                              supprimerLigne(
                                                question.id,
                                                ligneIdx,
                                              )
                                            }
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </th>
                                      {question.tableau?.colonnes?.map(
                                        (_, colIdx) => (
                                          <td key={colIdx} className="p-1">
                                            <Input
                                              disabled
                                              className="pointer-events-none"
                                            />
                                          </td>
                                        ),
                                      )}
                                      <td className="p-1"></td>
                                    </tr>
                                  ),
                                )}
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
                                          mettreAJourTableau(question.id, {
                                            lignes,
                                          });
                                          e.currentTarget.value = '';
                                        }
                                      }}
                                    />
                                  </th>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-2 space-y-2">
                            <Button
                              variant={
                                question.tableau?.commentaire
                                  ? 'secondary'
                                  : 'outline'
                              }
                              size="sm"
                              onClick={() =>
                                mettreAJourTableau(question.id, {
                                  commentaire: !question.tableau?.commentaire,
                                })
                              }
                            >
                              {question.tableau?.commentaire
                                ? 'Commentaire ajouté'
                                : '+ Ajout case commentaire'}
                            </Button>
                            <div className="flex items-center gap-2">
                              <Label>Type de valeur</Label>
                              <Select
                                value={question.tableau?.valeurType || 'texte'}
                                onValueChange={(v) =>
                                  mettreAJourTableau(question.id, {
                                    valeurType: v as
                                      | 'texte'
                                      | 'score'
                                      | 'choix-multiple'
                                      | 'case-a-cocher',
                                    options:
                                      v === 'choix-multiple'
                                        ? question.tableau?.options || []
                                        : undefined,
                                  })
                                }
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Texte" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="texte">Texte</SelectItem>
                                  <SelectItem value="score">Score</SelectItem>
                                  <SelectItem value="choix-multiple">
                                    Choix multiples
                                  </SelectItem>
                                  <SelectItem value="case-a-cocher">
                                    Case à cocher
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {question.tableau?.valeurType ===
                              'choix-multiple' && (
                              <div className="space-y-2">
                                {question.tableau?.options?.map((opt, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2"
                                  >
                                    <Input
                                      value={opt}
                                      onChange={(e) => {
                                        const options = [
                                          ...(question.tableau?.options || []),
                                        ];
                                        options[idx] = e.target.value;
                                        mettreAJourTableau(question.id, {
                                          options,
                                        });
                                      }}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        supprimerOptionTableau(question.id, idx)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Input
                                  placeholder="Ajouter une valeur"
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === 'Enter' &&
                                      e.currentTarget.value.trim()
                                    ) {
                                      const nouvelle =
                                        e.currentTarget.value.trim();
                                      const options = [
                                        ...(question.tableau?.options || []),
                                        nouvelle,
                                      ];
                                      mettreAJourTableau(question.id, {
                                        options,
                                      });
                                      e.currentTarget.value = '';
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </>
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
            </>
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
      </div>
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent>
          <ImportMagique
            onDone={(res: unknown) => {
              let newQuestions: Question[] = [];

              // Si c'est déjà un tableau, on l'utilise directement (rétrocompatibilité)
              if (Array.isArray(res)) {
                newQuestions = res;
              }
              // Sinon on extrait le premier niveau de result et on aplatit
              else if (res && typeof res === 'object' && 'result' in res) {
                const response = res as ImportResponse;
                newQuestions = response.result.flat();
              }

              // Ajoute les nouvelles questions à la fin des questions existantes
              if (newQuestions.length > 0) {
                setQuestions((prevQuestions) => [
                  ...prevQuestions,
                  ...newQuestions,
                ]);
              }
            }}
            onCancel={() => setShowImport(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
