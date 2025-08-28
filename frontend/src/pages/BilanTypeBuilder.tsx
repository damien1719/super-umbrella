"use client"

import type React from "react"

import { useState } from "react"
import { SectionDisponible } from "@/components/bilan-type-builder/section-disponible"
import { BilanTypeConstruction } from "@/components/bilan-type-builder/bilan-type-construction"

interface BilanElement {
  id: string
  type: "test" | "anamnese" | "conclusion"
  title: string
  description: string
  metier: "psychologue" | "orthophoniste" | "neuropsychologue" | "psychiatre" | "general"
}

interface SelectedElement extends BilanElement {
  order: number
}

const availableElements: BilanElement[] = [
  {
    id: "1",
    type: "test",
    title: "Test cognitif MMSE",
    description: "Évaluation des fonctions cognitives",
    metier: "neuropsychologue",
  },
  {
    id: "2",
    type: "test",
    title: "Test de mémoire",
    description: "Évaluation de la mémoire à court et long terme",
    metier: "neuropsychologue",
  },
  {
    id: "3",
    type: "test",
    title: "Test d'attention",
    description: "Mesure de la capacité d'attention et de concentration",
    metier: "neuropsychologue",
  },
  {
    id: "4",
    type: "test",
    title: "WISC-V",
    description: "Échelle d'intelligence de Wechsler pour enfants",
    metier: "psychologue",
  },
  {
    id: "5",
    type: "test",
    title: "WAIS-IV",
    description: "Échelle d'intelligence de Wechsler pour adultes",
    metier: "psychologue",
  },
  {
    id: "6",
    type: "test",
    title: "Test de fluence verbale",
    description: "Évaluation de la fluence phonémique et sémantique",
    metier: "orthophoniste",
  },
  {
    id: "7",
    type: "test",
    title: "Test de dénomination",
    description: "Évaluation de l'accès lexical",
    metier: "orthophoniste",
  },
  {
    id: "8",
    type: "test",
    title: "Échelle de dépression de Beck",
    description: "Évaluation de l'intensité dépressive",
    metier: "psychiatre",
  },
  {
    id: "9",
    type: "test",
    title: "Échelle d'anxiété de Hamilton",
    description: "Mesure de l'anxiété",
    metier: "psychiatre",
  },
  {
    id: "10",
    type: "test",
    title: "Test de Rorschach",
    description: "Test projectif de personnalité",
    metier: "psychologue",
  },
  {
    id: "11",
    type: "anamnese",
    title: "Anamnèse personnelle",
    description: "Histoire personnelle du patient",
    metier: "general",
  },
  { id: "12", type: "anamnese", title: "Anamnèse familiale", description: "Antécédents familiaux", metier: "general" },
  {
    id: "13",
    type: "anamnese",
    title: "Anamnèse médicale",
    description: "Historique médical et traitements",
    metier: "general",
  },
  {
    id: "14",
    type: "anamnese",
    title: "Anamnèse développementale",
    description: "Développement psychomoteur et langagier",
    metier: "orthophoniste",
  },
  {
    id: "15",
    type: "anamnese",
    title: "Anamnèse scolaire",
    description: "Parcours et difficultés scolaires",
    metier: "psychologue",
  },
  {
    id: "16",
    type: "anamnese",
    title: "Anamnèse psychiatrique",
    description: "Antécédents psychiatriques et traitements",
    metier: "psychiatre",
  },
  {
    id: "17",
    type: "conclusion",
    title: "Synthèse diagnostique",
    description: "Résumé des observations et diagnostic",
    metier: "general",
  },
  {
    id: "18",
    type: "conclusion",
    title: "Recommandations",
    description: "Conseils et orientations thérapeutiques",
    metier: "general",
  },
  {
    id: "19",
    type: "conclusion",
    title: "Plan de suivi",
    description: "Planification du suivi thérapeutique",
    metier: "general",
  },
  {
    id: "20",
    type: "conclusion",
    title: "Projet thérapeutique",
    description: "Objectifs et modalités de prise en charge",
    metier: "orthophoniste",
  },
  {
    id: "21",
    type: "test",
    title: "Test de compréhension",
    description: "Évaluation de la compréhension orale et écrite",
    metier: "orthophoniste",
  },
  {
    id: "22",
    type: "test",
    title: "Bilan phonologique",
    description: "Analyse des troubles phonologiques",
    metier: "orthophoniste",
  },
  {
    id: "23",
    type: "test",
    title: "Test de Trail Making",
    description: "Évaluation des fonctions exécutives",
    metier: "neuropsychologue",
  },
  {
    id: "24",
    type: "test",
    title: "Test de Stroop",
    description: "Mesure de l'inhibition cognitive",
    metier: "neuropsychologue",
  },
]

export default function BilanTypeBuilder() {
  const [bilanName, setBilanName] = useState("")
  const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const addElement = (element: BilanElement) => {
    const newElement: SelectedElement = {
      ...element,
      order: selectedElements.length,
    }
    setSelectedElements([...selectedElements, newElement])
  }

  const removeElement = (id: string) => {
    setSelectedElements(selectedElements.filter((el) => el.id !== id))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const items = Array.from(selectedElements)
    const draggedItem = items[draggedIndex]

    // Remove dragged item
    items.splice(draggedIndex, 1)

    // Insert at new position
    const newIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    items.splice(newIndex, 0, draggedItem)

    // Update order
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }))

    setSelectedElements(updatedItems)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const saveBilanType = () => {
    console.log("Saving bilan type:", { name: bilanName, elements: selectedElements })
    alert("Type de bilan sauvegardé avec succès!")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Constructeur de Type de Bilan</h1>
          <p className="text-muted-foreground">
            Créez votre type de bilan personnalisé en sélectionnant et organisant les éléments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Elements */}
          <SectionDisponible availableElements={availableElements} onAddElement={addElement} />

          {/* Builder Area */}
          <BilanTypeConstruction
            bilanName={bilanName}
            setBilanName={setBilanName}
            selectedElements={selectedElements}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            draggedIndex={draggedIndex}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onRemoveElement={removeElement}
            onSave={saveBilanType}
          />
        </div>
      </div>
    </div>
  )
}
