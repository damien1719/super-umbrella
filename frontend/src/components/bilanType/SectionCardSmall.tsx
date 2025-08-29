'use client';

import { Badge } from '@/components/ui/badge';

interface BilanElement {
  id: string;
  type: string;
  title: string;
  description: string;
  metier?: string;
}

interface SectionCardSmallProps {
  element: BilanElement;
  onAdd: (element: BilanElement) => void;
}

export function SectionCardSmall({ element, onAdd }: SectionCardSmallProps) {
  return (
    <div
      className="p-3 border border-wood-200 rounded-lg hover:bg-accent cursor-pointer transition-colors"
      onClick={() => onAdd(element)}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          Section
        </Badge>
      </div>
      <h4 className="font-medium text-sm mb-1">{element.title}</h4>
      <p className="text-xs text-muted-foreground">{element.description}</p>
    </div>
  );
}
