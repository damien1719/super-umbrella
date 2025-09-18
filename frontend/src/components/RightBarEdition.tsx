import { useRef } from 'react';
import { GripVertical } from 'lucide-react';
import type { Question } from '@/types/Typequestion';

type Props = {
  items: Question[];
  selected: string | null;
  onPick: (id: string) => void;
  onMove: (from: number, to: number) => void;
};

export default function RightBarEdition({ items, selected, onPick, onMove }: Props) {
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
    onMove(dragIndex.current, index);
    dragIndex.current = null;
  };

  return (
    <aside className="hidden xl:block sticky top-0 float-right h-full shadow-sm w-64 border border-wood-200 bg-white/80 backdrop-blur-sm overflow-y-auto">
      <div className="p-3">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm text-base font-medium text-gray-500 mb-2">Plan des questions</div>
        <ul className="">
          {items.map((q, idx) => (
            <li
              key={q.id}
              className={`group flex items-center gap-2 rounded px-2 py-2 cursor-pointer select-none transition ${
                selected === q.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
              }`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
              onClick={(e) => {
                e.stopPropagation();
                onPick(q.id);
              }}
              title={q.titre}
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
              <span className={`truncate flex-1 ${q.type === 'titre' ? 'font-semibold' : ''}`}>
                {idx + 1}. {q.titre || '(Sans titre)'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
