import { useRef } from 'react';
import { GripVertical, ClipboardCopy, Copy } from 'lucide-react';
import type { Question } from '@/types/Typequestion';
import { Button } from '@/components/ui/button';
import { useClipboardStore } from '@/store/clipboard';

type Props = {
  items: Question[];
  selected: string | null;
  onPick: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (id: string) => void;
  readOnly?: boolean;
};

export default function RightBarEdition({
  items,
  selected,
  onPick,
  onMove,
  onDuplicate,
  readOnly = false,
}: Props) {
  const dragIndex = useRef<number | null>(null);
  const copyToClipboard = useClipboardStore((s) => s.copy);

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
    onMove(dragIndex.current, index);
    dragIndex.current = null;
  };

  return (
    <aside
      className={`hidden lg:block sticky top-0 z-20 float-right h-full shadow-sm w-80 border border-wood-200 bg-white/80 backdrop-blur-sm overflow-y-auto ${readOnly ? 'opacity-100' : ''}`}
      aria-disabled={readOnly}
    >
      <div className="p-3">
        <div
          className={`sticky top-0 z-10 bg-white/80 backdrop-blur-sm text-base font-medium text-gray-500 mb-2 ${readOnly ? 'opacity-60' : ''}`}
        >
          Plan des questions
        </div>
        <ul className="">
          {items.map((q, idx) => (
            <li
              key={q.id}
              className={`group flex items-center rounded px-2 py-2 cursor-pointer select-none transition ${
                selected === q.id
                  ? 'bg-primary-200 text-primary-700'
                  : 'hover:bg-gray-50'
              }`}
              draggable={!readOnly}
              onDragStart={!readOnly ? () => handleDragStart(idx) : undefined}
              onDragEnd={!readOnly ? handleDragEnd : undefined}
              onDragOver={!readOnly ? (e) => e.preventDefault() : undefined}
              onDrop={!readOnly ? () => handleDrop(idx) : undefined}
              onClick={(e) => {
                if (readOnly) return;
                e.stopPropagation();
                onPick(q.id);
              }}
              title={q.titre}
            >
              <Button
                variant="ghost"
                size="sm"
                tooltip="Déplacer"
                className="ml-auto"
                disabled={readOnly}
                aria-disabled={readOnly}
              >
                <GripVertical
                  className={`h-4 w-4 text-gray-400 ${readOnly ? 'opacity-60' : ''}`}
                />
              </Button>
              <span
                className={`pl-2 truncate flex-1 ${q.type === 'titre' ? 'font-semibold' : ''} ${readOnly ? 'opacity-60' : ''}`}
              >
                {idx + 1}. {q.titre || '(Sans titre)'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                tooltip="Dupliquer"
                className="ml-auto"
                disabled={readOnly}
                aria-disabled={readOnly}
                onClick={(e) => {
                  if (readOnly) return;
                  e.stopPropagation();
                  onDuplicate(q.id);
                }}
              >
                <Copy className={`h-4 w-4 ${readOnly ? 'opacity-60' : ''}`} />
              </Button>
              <Button
                variant={readOnly ? 'primary' : 'ghost'}
                size="sm"
                tooltip="Copier pour réutiliser"
                className="z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(q);
                }}
              >
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
