import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FileDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface Props {
  title: string;
  onBack: () => void;
  onSaveTitle: (newTitle: string) => Promise<void> | void;
  onExport: () => void | Promise<void>;
}

export default function TopBarEditeurBilan({
  title,
  onBack,
  onSaveTitle,
  onExport,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(title);
  }, [title]);

  useEffect(() => {
    if (editing) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [editing]);

  const commit = async () => {
    const next = draft.trim();
    setEditing(false);
    if (next && next !== title) {
      await onSaveTitle(next);
    }
  };

  const cancel = () => {
    setDraft(title);
    setEditing(false);
  };

  return (
    <div className="h-12 grid grid-cols-3 items-center bg-wood-50 border border-wood-300 px-2">
      <TooltipProvider delayDuration={150}>
        <div className="truncate">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={onBack}
                className="px-2 py-1"
                title="Retour"
                aria-label="Retour"
              >
                Retour
              </Button>
            </TooltipTrigger>
            <TooltipContent>Retour</TooltipContent>
          </Tooltip>
        </div>

      <div className="flex items-center justify-center">
        {editing ? (
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') cancel();
            }}
            className="max-w-[28rem] text-center"
            aria-label="Titre du bilan"
          />
        ) : (
          <h1
            className="text-center text-lg font-semibold truncate cursor-text"
            title="Cliquer pour renommer"
            onClick={() => setEditing(true)}
          >
            {title}
          </h1>
        )}
      </div>

        <div className="flex items-center justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onExport}
                variant="primary"
                size="sm"
                title="Exporter mon bilan"
                aria-label="Exporter mon bilan"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Exporter mon bilan
              </Button>
            </TooltipTrigger>
            <TooltipContent>Exporter mon bilan</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
