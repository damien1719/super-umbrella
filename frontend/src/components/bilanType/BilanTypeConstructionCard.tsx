"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GripVertical, X } from "lucide-react"

interface SelectedElement {
  id: string
  type: "test" | "anamnese" | "conclusion"
  title: string
  description: string
  metier: "psychologue" | "orthophoniste" | "neuropsychologue" | "psychiatre" | "general"
  order: number
}

interface BilanTypeConstructionCardProps {
  element: SelectedElement
  index: number
  draggedIndex: number | null
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, dropIndex: number) => void
  onDragEnd: () => void
  onRemove: (id: string) => void
}

const typeColors = {
  test: "bg-blue-100 text-blue-800 border-blue-200",
  anamnese: "bg-green-100 text-green-800 border-green-200",
  conclusion: "bg-purple-100 text-purple-800 border-purple-200",
}

const typeLabels = {
  test: "Test",
  anamnese: "Anamnèse",
  conclusion: "Conclusion",
}

export function BilanTypeConstructionCard({
  element,
  index,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
}: BilanTypeConstructionCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`p-4 border rounded-lg bg-card cursor-move transition-all ${
        draggedIndex === index ? "opacity-50 scale-95" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground hover:text-foreground cursor-grab">
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <Badge className={typeColors[element.type]}>{typeLabels[element.type]}</Badge>
            <span className="text-xs text-muted-foreground">Position {index + 1}</span>
          </div>
          <h4 className="font-medium mb-1">{element.title}</h4>
          <p className="text-sm text-muted-foreground">{element.description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(element.id)}
          className="text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
