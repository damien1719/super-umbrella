import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  GripVertical,
  Copy,
  Trash2,
  Plus,
  MoreHorizontal,
  Save,
  X,
  ClipboardCopy,
  ClipboardPaste,
} from 'lucide-react';
import type { Question } from '@/types/Typequestion';
import { EDITORS } from './Editors';
import ReadOnlyOverlay from './ReadOnlyOverlay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useClipboardStore } from '@/store/clipboard';

const typesQuestions = [
  { id: 'notes', title: 'Réponse (prise de notes)' },
  { id: 'choix-multiple', title: 'Choix multiples' },
  { id: 'choix-unique', title: 'Choix unique' },
  { id: 'echelle', title: 'Échelle chiffrée' },
  { id: 'tableau', title: 'Tableaux de résultats' },
  { id: 'titre', title: 'Titre' },
];

interface Props {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPatch: (id: string, partial: Partial<Question>) => void;
  onReorder: (from: number, to: number) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAddAfter: (id: string) => void;
  /** Insère le contenu du presse-papiers interne après la question cible */
  onPasteAfter?: (targetId: string, item: Question) => void;
  /** Active le mode lecture seule */
  isReadOnly?: boolean;
  tableAstHandlers?: {
    getSnippet: (id?: string | null) => string | null | undefined;
    saveSnippet: (content: string, previousId?: string | null) => string | null;
    deleteSnippet: (id: string) => void;
  };
  /** Si true, remplace le bouton copier par un bouton d'insertion directe */
  isInsertDirectly?: boolean;
  /** Callback d'insertion directe (utilisé si isInsertDirectly est true) */
  onInsertDirectly?: (item: Question) => void;
}

export default function QuestionList({
  questions,
  selectedId,
  onSelect,
  onPatch,
  onReorder,
  onDuplicate,
  onDelete,
  onAddAfter,
  onPasteAfter,
  isReadOnly = false,
  tableAstHandlers,
  isInsertDirectly = false,
  onInsertDirectly,
}: Props) {
  const dragIndex = useRef<number | null>(null);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [jsonContent, setJsonContent] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isEditingAllQuestions, setIsEditingAllQuestions] = useState(false);
  const clipboardItem = useClipboardStore((s) => s.item);
  const copyToClipboard = useClipboardStore((s) => s.copy);
  const clearClipboard = useClipboardStore((s) => s.clear);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };
  const handleDragEnd = () => {
    dragIndex.current = null;
  };
  const handleDrop = (index: number) => {
    if (isReadOnly) return;
    if (dragIndex.current === null || dragIndex.current === index) {
      dragIndex.current = null;
      return;
    }
    onReorder(dragIndex.current, index);
    dragIndex.current = null;
  };

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (selectedId) {
      const el = itemRefs.current[selectedId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedId]);

  const handleJsonEdit = (question: Question) => {
    setEditingQuestionId(question.id);
    setIsEditingAllQuestions(false);
    setJsonContent(JSON.stringify(question, null, 2));
    setJsonError(null);
    setJsonDialogOpen(true);
  };

  const handleJsonEditAllQuestions = () => {
    setEditingQuestionId(null);
    setIsEditingAllQuestions(true);
    setJsonContent(JSON.stringify(questions, null, 2));
    setJsonError(null);
    setJsonDialogOpen(true);
  };

  const handleJsonSave = () => {
    try {
      if (isEditingAllQuestions) {
        // Édition de toutes les questions
        const parsedQuestions = JSON.parse(jsonContent) as Question[];

        if (!Array.isArray(parsedQuestions)) {
          setJsonError('JSON invalide: un tableau de questions est attendu');
          return;
        }

        // Validation de chaque question
        const validTypes = [
          'notes',
          'choix-multiple',
          'choix-unique',
          'echelle',
          'tableau',
          'titre',
        ];
        for (let i = 0; i < parsedQuestions.length; i++) {
          const question = parsedQuestions[i];
          if (!question.id || !question.type || !question.titre) {
            setJsonError(
              `Question ${i + 1} invalide: id, type et titre sont requis`,
            );
            return;
          }
          if (!validTypes.includes(question.type)) {
            setJsonError(
              `Question ${i + 1}: Type invalide '${question.type}'. Types valides: ${validTypes.join(', ')}`,
            );
            return;
          }
        }

        // Mettre à jour toutes les questions
        parsedQuestions.forEach((question, index) => {
          onPatch(question.id, question);
        });

        setJsonDialogOpen(false);
        setIsEditingAllQuestions(false);
        setJsonContent('');
        setJsonError(null);
      } else {
        // Édition d'une seule question
        const parsedQuestion = JSON.parse(jsonContent) as Question;

        // Validation basique
        if (
          !parsedQuestion.id ||
          !parsedQuestion.type ||
          !parsedQuestion.titre
        ) {
          setJsonError('JSON invalide: id, type et titre sont requis');
          return;
        }

        // Vérifier que le type est valide
        const validTypes = [
          'notes',
          'choix-multiple',
          'choix-unique',
          'echelle',
          'tableau',
          'titre',
        ];
        if (!validTypes.includes(parsedQuestion.type)) {
          setJsonError(
            `Type invalide: ${parsedQuestion.type}. Types valides: ${validTypes.join(', ')}`,
          );
          return;
        }

        // Mettre à jour la question
        onPatch(editingQuestionId!, parsedQuestion);
        setJsonDialogOpen(false);
        setEditingQuestionId(null);
        setJsonContent('');
        setJsonError(null);
      }
    } catch (error) {
      setJsonError(
        `JSON malformé: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    }
  };

  const handleJsonCancel = () => {
    setJsonDialogOpen(false);
    setEditingQuestionId(null);
    setIsEditingAllQuestions(false);
    setJsonContent('');
    setJsonError(null);
  };

  const handleJsonCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      // Optionnel: afficher un message de confirmation
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const SHOW_EDIT_ALL_JSON =
    import.meta.env.VITE_DISPLAY_IMPORT_BUTTON === 'true';

  return (
    <div className="h-full">
      {/* Leave room for the right bar */}
      <div className="space-y-2 pr-0">
        {/*        {SHOW_EDIT_ALL_JSON && (
        <div className="absolute top-0 right-0 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleJsonEditAllQuestions}
            title="Éditer le JSON de toutes les questions"
            className="bg-white/90 backdrop-blur-sm"
          >
            <MoreHorizontal className="h-4 w-4 mr-2" />
          </Button>
        </div>
      )} */}
        {questions.map((question, index) => {
          const Editor = EDITORS[question.type];
          return (
            <div
              key={question.id}
              ref={(el) => {
                itemRefs.current[question.id] = el;
              }}
              className="relative w-full"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
            >
              <Button
                aria-label="Déplacer la question"
                variant="icon"
                size="icon"
                tooltip="Déplacer la question"
                draggable={!isReadOnly}
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                className={`absolute top left-1/2 cursor-move p-1 rounded transition-opacity opacity-100`}
                disabled={isReadOnly}
              >
                <GripVertical className="h-5 w-5 text-gray-400 rotate-90" />
              </Button>
              <Card
                onClick={() => onSelect(question.id)}
                className={`group w-[90%] mx-auto cursor-pointer transition-shadow ${
                  selectedId === question.id
                    ? 'border-primary-500 ring-1 ring-primary-500 shadow-md'
                    : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Input
                      className={
                        question.type === 'titre'
                          ? 'text-3xl font-bold border-none shadow-none focus-visible:ring-0 p-0 flex-1'
                          : 'flex-1'
                      }
                      placeholder={
                        question.type === 'titre'
                          ? 'Titre'
                          : `Question ${index + 1}`
                      }
                      value={question.titre}
                      onChange={(e) =>
                        onPatch(question.id, { titre: e.target.value })
                      }
                      disabled={isReadOnly}
                    />
                    {selectedId === question.id && (
                      <Select
                        value={question.type}
                        onValueChange={(v) =>
                          onPatch(question.id, { type: v as Question['type'] })
                        }
                      >
                        <SelectTrigger className="w-44" disabled={isReadOnly}>
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
                <CardContent className="space-y-2">
                  <ReadOnlyOverlay active={isReadOnly}>
                    <Editor
                      q={question}
                      onPatch={(p) => onPatch(question.id, p)}
                      isReadOnly={isReadOnly}
                      getAstSnippet={
                        question.type === 'tableau'
                          ? tableAstHandlers?.getSnippet
                          : undefined
                      }
                      saveAstSnippet={
                        question.type === 'tableau'
                          ? tableAstHandlers?.saveSnippet
                          : undefined
                      }
                      deleteAstSnippet={
                        question.type === 'tableau'
                          ? tableAstHandlers?.deleteSnippet
                          : undefined
                      }
                    />
                  </ReadOnlyOverlay>
                  <div
                    className={
                      `flex justify-end gap-2 pt-2 transition-opacity duration-200 ` +
                      (selectedId === question.id
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100')
                    }
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Coller une réutilisation (visible seulement si un élément est dans le presse-papiers) */}
                    {clipboardItem && onPasteAfter && !isReadOnly && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPasteAfter(question.id, clipboardItem);
                          // Vider le presse-papiers interne après collage
                          clearClipboard();
                        }}
                        disabled={isReadOnly}
                      >
                        <ClipboardPaste className="h-4 w-4 mr-2" />
                        Coller une réutilisation
                      </Button>
                    )}
                    {!isReadOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        tooltip="Ajouter une question"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddAfter(question.id);
                        }}
                        disabled={isReadOnly}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    )}
                    {!isReadOnly && (
                      <Button
                        variant="outline"
                        tooltip="Dupliquer la question"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(question.id);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    {/* Copier pour réutiliser ou insérer directement */}
                    {isInsertDirectly && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onInsertDirectly) {
                            onInsertDirectly(question);
                          }
                        }}
                      >
                        <ClipboardPaste className="h-4 w-4 mr-2" />
                        Insérer la question dans ma partie
                      </Button>
                    )}
                      <Button
                        className="gap-2"
                        variant={isReadOnly ? 'primary' : 'outline'}
                        size="sm"
                        tooltip="Copier pour réutiliser"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(question);
                        }}
                      >
                        <ClipboardCopy className="h-4 w-4" />
                        {isReadOnly && (
                          'Copier pour réutiliser'
                        )}
                      </Button>

                    {/*                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleJsonEdit(question)}
                      >
                        Éditer JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu> */}
                    {!isReadOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        tooltip="Supprimer la question"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(question.id);
                        }}
                        disabled={isReadOnly}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              {selectedId === question.id && (
                <div className="flex flex-col absolute top-1/2 -translate-y-1/2 space-y-2">
                  {!isReadOnly && (
                    <Button
                      variant="primary"
                      tooltip="Ajouter une question après"
                      tooltipSide="right"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddAfter(question.id);
                      }}
                      disabled={isReadOnly}
                    >
                      <Plus className="h-6 w-6 text-white" />
                    </Button>
                  )}
                  {!isReadOnly && (
                    <Button
                      variant="primary"
                      tooltip="Dupliquer la question"
                      tooltipSide="right"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(question.id);
                      }}
                      disabled={isReadOnly}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleJsonEdit(question)}>
                      Éditer JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}
                  {!isReadOnly && (
                    <Button
                      variant="primary"
                      tooltip="Supprimer la question"
                      tooltipSide="right"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(question.id);
                      }}
                      disabled={isReadOnly}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Dialog pour l'édition JSON */}
        <Dialog open={jsonDialogOpen} onOpenChange={setJsonDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                {isEditingAllQuestions
                  ? 'Éditer le JSON de toutes les questions'
                  : 'Éditer le JSON de la question'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-content">Contenu JSON</Label>
                <Textarea
                  id="json-content"
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  className="font-mono text-sm h-96 resize-none"
                  placeholder="Entrez le JSON de la question..."
                />
              </div>
              {jsonError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {jsonError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleJsonCopy}>
                  <ClipboardCopy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
                <Button variant="outline" onClick={handleJsonCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleJsonSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
