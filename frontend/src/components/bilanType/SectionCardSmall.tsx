"use client"

import { Badge } from "@/components/ui/badge"

interface BilanElement {
  id: string
  type: "test" | "anamnese" | "conclusion"
  title: string
  description: string
  metier: "psychologue" | "orthophoniste" | "neuropsychologue" | "psychiatre" | "general"
}

interface SectionCardSmallProps {
  element: BilanElement
  onAdd: (element: BilanElement) => void
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

const metierLabels = {
  psychologue: "Psychologue",
  orthophoniste: "Orthophoniste",
  neuropsychologue: "Neuropsychologue",
  psychiatre: "Psychiatre",
  general: "Général",
}

export function SectionCardSmall({ element, onAdd }: SectionCardSmallProps) {
  return (
    <div
      className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
      onClick={() => onAdd(element)}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge className={typeColors[element.type]}>{typeLabels[element.type]}</Badge>
        <Badge variant="outline" className="text-xs">
          {metierLabels[element.metier]}
        </Badge>
      </div>
      <h4 className="font-medium text-sm mb-1">{element.title}</h4>
      <p className="text-xs text-muted-foreground">{element.description}</p>
    </div>
  )
}
