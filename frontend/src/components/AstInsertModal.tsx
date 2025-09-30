import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import RichTextEditor, { RichTextEditorHandle } from './RichTextEditor';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type TablePathOption = {
  path: string;
  label: string;
};

interface LeftBarAstInsertProps {
  options: TablePathOption[];
  onInsertPath: (option: TablePathOption) => void;
}

function LeftBarAstInsert({ options, onInsertPath }: LeftBarAstInsertProps) {
  const hasOptions = options.length > 0;

  return (
    <aside className="w-60 shrink-0 border-r border-wood-200 bg-gray-50">
      <div className="flex h-full flex-col gap-3 p-4">
        <div>
          <p className="text-sm font-medium text-gray-800">
            Champs disponibles
          </p>
          <p className="text-xs text-gray-500">
            Cliquez sur un champ pour insérer sa valeur dans le texte.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {hasOptions ? (
            <div className="space-y-2">
              {options.map((option) => (
                <Button
                  key={option.path}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex w-full flex-col items-start gap-1 px-3 py-2 text-left"
                  onClick={() => onInsertPath(option)}
                >
                  <span className="text-sm font-medium text-gray-800">
                    {option.label}
                  </span>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              Aucun champ de réponse n&apos;est encore disponible pour ce
              tableau.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

const EMPTY_AST_STRING = JSON.stringify({
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
});

interface AstInsertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAst?: string;
  templateKey: string;
  onSave: (serializedAst: string) => void;
  pathOptions?: TablePathOption[];
  onDelete?: () => void;
}

export default function AstInsertModal({
  open,
  onOpenChange,
  initialAst,
  templateKey,
  onSave,
  pathOptions = [],
  onDelete,
}: AstInsertModalProps) {
  const editorRef = React.useRef<RichTextEditorHandle>(null);
  const [draftAst, setDraftAst] = React.useState<string | null>(
    initialAst ?? null,
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setDraftAst(initialAst ?? null);
    }
  }, [open, initialAst]);

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSave = React.useCallback(() => {
    let serialized = draftAst ?? initialAst ?? EMPTY_AST_STRING;

    const editorJson = editorRef.current?.getEditorStateJson?.();
    if (editorJson) {
      try {
        serialized = JSON.stringify(editorJson);
      } catch (error) {
        console.error(
          '[AstInsertModal] Failed to serialize editor state:',
          error,
        );
      }
    }

    onSave(serialized);
    onOpenChange(false);
  }, [draftAst, initialAst, onSave, onOpenChange]);

  const handleDelete = React.useCallback(() => {
    if (!onDelete) return;
    onDelete();
    onOpenChange(false);
  }, [onDelete, onOpenChange]);

  const handleInsertPath = React.useCallback((option: TablePathOption) => {
    const trimmed = option.path.trim();
    if (!trimmed) return;

    const slotLabel = option.label.trim() || trimmed;
    const slotId = `table-path-slot-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    editorRef.current?.insertSlot?.(
      slotId,
      slotLabel,
      'text',
      false,
      '…',
      trimmed,
    );
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="screen-90" className="flex h-[90vh] flex-col gap-4">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>Customiser le format d&apos;insertion</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden rounded border border-wood-200 bg-white">
          <div className="flex h-full">
            <LeftBarAstInsert
              options={pathOptions}
              onInsertPath={handleInsertPath}
            />
            <div className="flex-1 overflow-hidden">
              <RichTextEditor
                ref={editorRef}
                templateKey={`${templateKey}:${open ? 'open' : 'closed'}`}
                initialStateJson={draftAst ?? undefined}
                onChangeStateJson={(state) => {
                  try {
                    setDraftAst(JSON.stringify(state));
                  } catch (error) {
                    console.warn(
                      '[AstInsertModal] Failed to stringify editor state',
                      error,
                    );
                  }
                }}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          {initialAst && onDelete ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              Supprimer
            </Button>
          ) : null}
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </DialogFooter>
      </DialogContent>
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Supprimer ce format personnalisé ?"
        confirmText="Supprimer"
        onConfirm={handleDelete}
      />
    </Dialog>
  );
}
