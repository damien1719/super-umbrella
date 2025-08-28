
"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Save, Eye } from "lucide-react"
import { BilanTypeConstructionCard } from "./BilanTypeConstructionCard"

interface SelectedElement {
  id: string
  type: "test" | "anamnese" | "conclusion"
  title: string
  description: string
  metier: "psychologue" | "orthophoniste" | "neuropsychologue" | "psychiatre" | "general"
  order: number
}

interface BilanTypeConstructionProps {
  bilanName: string
  setBilanName: (name: string) => void
  selectedElements: SelectedElement[]
  showPreview: boolean
  setShowPreview: (show: boolean) => void
  draggedIndex: number | null
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, dropIndex: number) => void
  onDragEnd: () => void
  onRemoveElement: (id: string) => void
  onSave: () => void
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

export function BilanTypeConstruction({
  bilanName,
  setBilanName,
  selectedElements,
  showPreview,
  setShowPreview,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemoveElement,
  onSave,
}: BilanTypeConstructionProps) {
  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Construction du Type de Bilan</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Masquer" : "Aperçu"}
              </Button>
              <Button size="sm" onClick={onSave} disabled={!bilanName || selectedElements.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
          <Input
            placeholder="Nom du type de bilan..."
            value={bilanName}
            onChange={(e) => setBilanName(e.target.value)}
            className="mt-4"
          />
        </CardHeader>
        <CardContent>
          {selectedElements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Cliquez sur les éléments de gauche pour commencer à construire votre bilan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedElements.map((element, index) => (
                <BilanTypeConstructionCard
                  key={element.id}
                  element={element}
                  index={index}
                  draggedIndex={draggedIndex}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  onRemove={onRemoveElement}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && selectedElements.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Aperçu du Type de Bilan: {bilanName || "Sans nom"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedElements.map((element, index) => (
                <div key={element.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={typeColors[element.type]} variant="outline">
                        {typeLabels[element.type]}
                      </Badge>
                      <h4 className="font-medium">{element.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{element.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
