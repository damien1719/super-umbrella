"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Brain, FileText, Eye, Activity, Wand2, Plus, X, Edit2, Clock, BookOpen } from "lucide-react"

interface SensoryResult {
  category: string
  score: string
  notes?: string
}

interface ObservationNote {
  id: string
  text: string
  category: string
  timestamp: Date
  isEditing?: boolean
}

interface TestResult {
  id: string
  test: string
  score: string
  percentile?: string
  notes?: string
}

interface TrameExample {
  id: string
  title: string
  content: string
  category: string
}

// Trames disponibles pour chaque section
const trames = {
  anamnese: [
    { value: "enfant", label: "Enfant (3-12 ans)", description: "Trame adaptée aux enfants d'âge scolaire" },
    { value: "adolescent", label: "Adolescent (13-18 ans)", description: "Trame pour les adolescents" },
    { value: "adulte", label: "Adulte", description: "Trame pour les adultes" },
    { value: "petite-enfance", label: "Petite enfance (0-3 ans)", description: "Trame pour les tout-petits" },
  ],
  "profil-sensoriel": [
    { value: "standard", label: "Profil standard", description: "Évaluation complète des 13 domaines" },
    { value: "court", label: "Profil court", description: "Évaluation des domaines principaux" },
    { value: "specifique", label: "Profil spécifique", description: "Focus sur des domaines particuliers" },
  ],
  "observations-cliniques": [
    {
      value: "motricite-globale",
      label: "Motricité globale",
      description: "Focus sur les habiletés motrices globales",
    },
    { value: "motricite-fine", label: "Motricité fine", description: "Focus sur les habiletés motrices fines" },
    { value: "complet", label: "Évaluation complète", description: "Toutes les observations cliniques" },
  ],
  "tests-mabc": [
    { value: "mabc-2", label: "MABC-2 Standard", description: "Test complet MABC-2" },
    { value: "mabc-2-court", label: "MABC-2 Court", description: "Version courte du MABC-2" },
    { value: "autre", label: "Autre test", description: "Autre test standardisé" },
  ],
}

const sensoryCategories = [
  "Recherche",
  "Evitement",
  "Sensibilité",
  "Enregistrement",
  "Auditif",
  "Visuel",
  "Tactile",
  "Mouvement",
  "Position du corps",
  "Oral",
  "Conduite",
  "Socio-émotionnel",
  "Attentionnel",
]

const sensoryScale = [
  { value: "much-less", label: "Beaucoup Moins que les autres", color: "bg-red-100 text-red-800" },
  { value: "less", label: "Moins que les autres", color: "bg-orange-100 text-orange-800" },
  { value: "typical", label: "Comme la majorité des autres", color: "bg-green-100 text-green-800" },
  { value: "more", label: "Plus que les autres", color: "bg-blue-100 text-blue-800" },
  { value: "much-more", label: "Beaucoup plus que les autres", color: "bg-purple-100 text-purple-800" },
]

const noteCategories = [
  { value: "comportement", label: "Comportement", color: "bg-blue-100 text-blue-800" },
  { value: "motricite", label: "Motricité", color: "bg-green-100 text-green-800" },
  { value: "attention", label: "Attention", color: "bg-yellow-100 text-yellow-800" },
  { value: "social", label: "Social", color: "bg-purple-100 text-purple-800" },
  { value: "sensoriel", label: "Sensoriel", color: "bg-pink-100 text-pink-800" },
  { value: "autre", label: "Autre", color: "bg-gray-100 text-gray-800" },
]

const sections = [
  {
    id: "anamnese",
    title: "Anamnèse",
    icon: FileText,
    description: "Histoire personnelle et familiale",
    dataType: "notes" as const,
  },
  {
    id: "profil-sensoriel",
    title: "Profil sensoriel",
    icon: Eye,
    description: "Évaluation des capacités sensorielles",
    dataType: "sensory" as const,
  },
  {
    id: "observations-cliniques",
    title: "Observations cliniques",
    icon: Brain,
    description: "Observations comportementales et motrices",
    dataType: "notes" as const,
  },
  {
    id: "tests-mabc",
    title: "Tests standards MABC",
    icon: Activity,
    description: "Résultats des tests standardisés",
    dataType: "tests" as const,
  },
]

export default function BilanB70Page() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // États pour les trames sélectionnées
  const [selectedTrames, setSelectedTrames] = useState<Record<string, string>>({
    anamnese: "enfant",
    "profil-sensoriel": "standard",
    "observations-cliniques": "complet",
    "tests-mabc": "mabc-2",
  })

  // États pour les exemples de trames
  const [trameExamples, setTrameExamples] = useState<Record<string, TrameExample[]>>({
    "anamnese-enfant": [
      {
        id: "1",
        title: "Développement moteur",
        content: "Questions sur l'acquisition de la marche, de la course, des habiletés motrices...",
        category: "motricite",
      },
    ],
    "anamnese-adolescent": [],
    "profil-sensoriel-standard": [
      {
        id: "2",
        title: "Évaluation tactile",
        content: "Exemples de situations pour évaluer la sensibilité tactile...",
        category: "sensoriel",
      },
    ],
    // Autres trames sans exemples pour l'instant
  })

  // États pour les données
  const [observationNotes, setObservationNotes] = useState<Record<string, ObservationNote[]>>({
    anamnese: [],
    "observations-cliniques": [],
  })

  const [sensoryResults, setSensoryResults] = useState<SensoryResult[]>(
    sensoryCategories.map((category) => ({ category, score: "", notes: "" })),
  )

  const [testResults, setTestResults] = useState<TestResult[]>([])

  // États pour les modales
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [openExamplesModal, setOpenExamplesModal] = useState<string | null>(null)
  const [newNote, setNewNote] = useState("")
  const [newNoteCategory, setNewNoteCategory] = useState("comportement")

  const updateTrame = (sectionId: string, trameValue: string) => {
    setSelectedTrames((prev) => ({ ...prev, [sectionId]: trameValue }))
  }

  const getDataCount = (sectionId: string, dataType: string) => {
    switch (dataType) {
      case "notes":
        return observationNotes[sectionId]?.length || 0
      case "sensory":
        return sensoryResults.filter((r) => r.score).length
      case "tests":
        return testResults.length
      default:
        return 0
    }
  }

  const getTrameExamplesKey = (sectionId: string, trameValue: string) => {
    return `${sectionId}-${trameValue}`
  }

  const getTrameExamplesCount = (sectionId: string, trameValue: string) => {
    const key = getTrameExamplesKey(sectionId, trameValue)
    return trameExamples[key]?.length || 0
  }

  const handleGenerateSection = async (section: (typeof sections)[0]) => {
    setIsGenerating(true)
    setSelectedSection(section.id)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    let generatedContent = `\n\n## ${section.title}\n\n`
    generatedContent += `**Trame utilisée:** ${trames[section.id as keyof typeof trames].find((t) => t.value === selectedTrames[section.id])?.label}\n\n`

    // Ajouter les exemples de la trame si disponibles
    const examplesKey = getTrameExamplesKey(section.id, selectedTrames[section.id])
    const examples = trameExamples[examplesKey] || []
    if (examples.length > 0) {
      generatedContent += `**Exemples de la trame:**\n`
      examples.forEach((example) => {
        generatedContent += `- ${example.title}: ${example.content}\n`
      })
      generatedContent += `\n`
    }

    // Ajouter les données spécifiques selon le type
    if (section.dataType === "notes" && observationNotes[section.id]?.length > 0) {
      generatedContent += `### Notes d'observations:\n\n`
      const notesByCategory = observationNotes[section.id].reduce(
        (acc, note) => {
          if (!acc[note.category]) acc[note.category] = []
          acc[note.category].push(note)
          return acc
        },
        {} as Record<string, ObservationNote[]>,
      )

      Object.entries(notesByCategory).forEach(([category, notes]) => {
        const categoryInfo = noteCategories.find((cat) => cat.value === category)
        generatedContent += `**${categoryInfo?.label || category}:**\n`
        notes.forEach((note) => {
          generatedContent += `- ${note.text}\n`
        })
        generatedContent += `\n`
      })
    }

    if (section.dataType === "sensory" && sensoryResults.some((r) => r.score)) {
      generatedContent += `### Résultats du profil sensoriel:\n\n`
      sensoryResults.forEach((result) => {
        if (result.score) {
          const scaleInfo = sensoryScale.find((s) => s.value === result.score)
          generatedContent += `**${result.category}:** ${scaleInfo?.label || result.score}\n`
          if (result.notes) {
            generatedContent += `  - Notes: ${result.notes}\n`
          }
        }
      })
    }

    if (section.dataType === "tests" && testResults.length > 0) {
      generatedContent += `### Résultats des tests:\n\n`
      testResults.forEach((result) => {
        generatedContent += `**${result.test}:** ${result.score}`
        if (result.percentile) {
          generatedContent += ` (${result.percentile}e percentile)`
        }
        generatedContent += `\n`
        if (result.notes) {
          generatedContent += `  - Notes: ${result.notes}\n`
        }
      })
    }

    generatedContent += `\n### Analyse:\n[Contenu généré par IA pour ${section.title.toLowerCase()}]\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n`

    // In a real application, you would likely send this generatedContent to a parent component or save it.
    // For this simplified view, we'll just log it.
    console.log("Generated Content:", generatedContent)
    setIsGenerating(false)
    setSelectedSection(null)
  }

  const addNote = (sectionId: string) => {
    if (newNote.trim()) {
      const note: ObservationNote = {
        id: Date.now().toString(),
        text: newNote.trim(),
        category: newNoteCategory,
        timestamp: new Date(),
      }
      setObservationNotes((prev) => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] || []), note],
      }))
      setNewNote("")
      setOpenModal(null)
    }
  }

  const removeNote = (sectionId: string, noteId: string) => {
    setObservationNotes((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId]?.filter((note) => note.id !== noteId) || [],
    }))
  }

  const addTrameExample = (sectionId: string, trameValue: string, example: Omit<TrameExample, "id">) => {
    const key = getTrameExamplesKey(sectionId, trameValue)
    const newExample: TrameExample = {
      ...example,
      id: Date.now().toString(),
    }
    setTrameExamples((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newExample],
    }))
  }

  const removeTrameExample = (sectionId: string, trameValue: string, exampleId: string) => {
    const key = getTrameExamplesKey(sectionId, trameValue)
    setTrameExamples((prev) => ({
      ...prev,
      [key]: prev[key]?.filter((ex) => ex.id !== exampleId) || [],
    }))
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Wand2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Assistant IA</h2>
          </div>

          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="space-y-4">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = selectedSection === section.id
                const dataCount = getDataCount(section.id, section.dataType)
                const selectedTrame = trames[section.id as keyof typeof trames].find(
                  (t) => t.value === selectedTrames[section.id],
                )

                return (
                  <Card
                    key={section.id}
                    className={`transition-all hover:shadow-md ${isActive ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? "bg-blue-100" : "bg-gray-100"}`}>
                          <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-gray-600"}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-1">{section.title}</h3>
                          <p className="text-xs text-gray-500 mb-4">{section.description}</p>

                          {/* Trame choisie */}
                          <div className="mb-4">
                            <Label className="text-xs font-medium text-gray-700 mb-2 block">Trame choisie :</Label>
                            <div className="flex items-center gap-2">
                              <Select
                                value={selectedTrames[section.id]}
                                onValueChange={(value) => updateTrame(section.id, value)}
                              >
                                <SelectTrigger className="h-8 text-xs flex-1">
                                  <SelectValue>{selectedTrame?.label}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {trames[section.id as keyof typeof trames].map((trame) => (
                                    <SelectItem key={trame.value} value={trame.value}>
                                      <div className="flex items-center justify-between w-full">
                                        <div>
                                          <div className="font-medium">{trame.label}</div>
                                          <div className="text-xs text-gray-500">{trame.description}</div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {/* Bouton pour gérer les exemples */}
                              <Dialog
                                open={openExamplesModal === section.id}
                                onOpenChange={(open) => setOpenExamplesModal(open ? section.id : null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                  >
                                    <BookOpen className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <BookOpen className="h-5 w-5" />
                                      Exemples pour la trame : {selectedTrame?.label}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Gérez les exemples et modèles pour cette trame spécifique
                                    </DialogDescription>
                                  </DialogHeader>
                                  <TrameExamplesModal
                                    sectionId={section.id}
                                    trameValue={selectedTrames[section.id]}
                                    examples={
                                      trameExamples[getTrameExamplesKey(section.id, selectedTrames[section.id])] || []
                                    }
                                    onAddExample={(example) =>
                                      addTrameExample(section.id, selectedTrames[section.id], example)
                                    }
                                    onRemoveExample={(exampleId) =>
                                      removeTrameExample(section.id, selectedTrames[section.id], exampleId)
                                    }
                                  />
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>

                          {/* Notes/Observations/Résultats */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-xs font-medium text-gray-700">
                                {section.dataType === "notes" && "Notes/Observations"}
                                {section.dataType === "sensory" && "Résultats sensoriels"}
                                {section.dataType === "tests" && "Résultats des tests"}
                              </Label>
                              {dataCount > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {dataCount} {section.dataType === "sensory" ? "/13" : ""}
                                </Badge>
                              )}
                            </div>

                            {dataCount === 0 ? (
                              <Dialog
                                open={openModal === section.id}
                                onOpenChange={(open) => setOpenModal(open ? section.id : null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 bg-transparent"
                                  >
                                    <Plus className="h-3 w-3 mr-2" />
                                    Ajouter
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Icon className="h-5 w-5" />
                                      {section.title} - Saisie des données
                                    </DialogTitle>
                                    <DialogDescription>
                                      Trame sélectionnée : <strong>{selectedTrame?.label}</strong>
                                    </DialogDescription>
                                  </DialogHeader>

                                  {/* Contenu de la modale selon le type */}
                                  {section.dataType === "notes" && (
                                    <NotesModal
                                      sectionId={section.id}
                                      notes={observationNotes[section.id] || []}
                                      newNote={newNote}
                                      setNewNote={setNewNote}
                                      newNoteCategory={newNoteCategory}
                                      setNewNoteCategory={setNewNoteCategory}
                                      onAddNote={() => addNote(section.id)}
                                      onRemoveNote={(noteId) => removeNote(section.id, noteId)}
                                    />
                                  )}

                                  {section.dataType === "sensory" && (
                                    <SensoryModal
                                      results={sensoryResults}
                                      onUpdateResult={(category, field, value) => {
                                        setSensoryResults((prev) =>
                                          prev.map((result) =>
                                            result.category === category ? { ...result, [field]: value } : result,
                                          ),
                                        )
                                      }}
                                    />
                                  )}

                                  {section.dataType === "tests" && (
                                    <TestsModal results={testResults} onUpdateResults={setTestResults} />
                                  )}
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <div className="space-y-2">
                                <div className="p-3 bg-gray-50 rounded-lg border">
                                  <div className="text-xs text-gray-600 mb-2">Données saisies :</div>
                                  {section.dataType === "notes" && (
                                    <div className="space-y-1">
                                      {observationNotes[section.id]?.slice(0, 2).map((note) => (
                                        <div key={note.id} className="text-xs text-gray-700 truncate">
                                          • {note.text}
                                        </div>
                                      ))}
                                      {(observationNotes[section.id]?.length || 0) > 2 && (
                                        <div className="text-xs text-gray-500">
                                          +{(observationNotes[section.id]?.length || 0) - 2} autres...
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {section.dataType === "sensory" && (
                                    <div className="text-xs text-gray-700">{dataCount} domaines évalués sur 13</div>
                                  )}
                                  {section.dataType === "tests" && (
                                    <div className="space-y-1">
                                      {testResults.slice(0, 2).map((result) => (
                                        <div key={result.id} className="text-xs text-gray-700">
                                          • {result.test}: {result.score}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <Dialog
                                  open={openModal === section.id}
                                  onOpenChange={(open) => setOpenModal(open ? section.id : null)}
                                >
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="w-full text-xs bg-transparent">
                                      <Edit2 className="h-3 w-3 mr-2" />
                                      Modifier
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Icon className="h-5 w-5" />
                                        {section.title} - Modification des données
                                      </DialogTitle>
                                      <DialogDescription>
                                        Trame sélectionnée : <strong>{selectedTrame?.label}</strong>
                                      </DialogDescription>
                                    </DialogHeader>

                                    {/* Même contenu que pour l'ajout */}
                                    {section.dataType === "notes" && (
                                      <NotesModal
                                        sectionId={section.id}
                                        notes={observationNotes[section.id] || []}
                                        newNote={newNote}
                                        setNewNote={setNewNote}
                                        newNoteCategory={newNoteCategory}
                                        setNewNoteCategory={setNewNoteCategory}
                                        onAddNote={() => addNote(section.id)}
                                        onRemoveNote={(noteId) => removeNote(section.id, noteId)}
                                      />
                                    )}

                                    {section.dataType === "sensory" && (
                                      <SensoryModal
                                        results={sensoryResults}
                                        onUpdateResult={(category, field, value) => {
                                          setSensoryResults((prev) =>
                                            prev.map((result) =>
                                              result.category === category ? { ...result, [field]: value } : result,
                                            ),
                                          )
                                        }}
                                      />
                                    )}

                                    {section.dataType === "tests" && (
                                      <TestsModal results={testResults} onUpdateResults={setTestResults} />
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </div>

                          {/* Bouton générer */}
                          <Button
                            size="sm"
                            variant={isActive ? "default" : "outline"}
                            onClick={() => handleGenerateSection(section)}
                            disabled={isGenerating}
                            className="w-full text-xs"
                          >
                            {isGenerating && isActive ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                                Génération...
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-3 w-3 mr-2" />
                                Générer
                                {dataCount > 0 && ` (${dataCount} éléments)`}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

// Composant pour la modale de gestion des exemples de trame
function TrameExamplesModal({
  sectionId,
  trameValue,
  examples,
  onAddExample,
  onRemoveExample,
}: {
  sectionId: string
  trameValue: string
  examples: TrameExample[]
  onAddExample: (example: Omit<TrameExample, "id">) => void
  onRemoveExample: (exampleId: string) => void
}) {
  const [newExample, setNewExample] = useState({ title: "", content: "", category: "general" })

  const addExample = () => {
    if (newExample.title && newExample.content) {
      onAddExample(newExample)
      setNewExample({ title: "", content: "", category: "general" })
    }
  }

  return (
    <div className="space-y-4">
      {/* Exemples existants */}
      {examples.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Exemples existants :</Label>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {examples.map((example) => (
              <div key={example.id} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-medium text-sm">{example.title}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveExample(example.id)}
                    className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-gray-700">{example.content}</p>
                <Badge variant="outline" className="text-xs mt-2">
                  {example.category}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ajout de nouvel exemple */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Ajouter un nouvel exemple :</Label>
        <div>
          <Label className="text-xs">Titre de l'exemple</Label>
          <Textarea
            value={newExample.title}
            onChange={(e) => setNewExample({ ...newExample, title: e.target.value })}
            placeholder="Ex: Questions sur le développement moteur"
            className="h-8"
          />
        </div>
        <div>
          <Label className="text-xs">Contenu de l'exemple</Label>
          <Textarea
            value={newExample.content}
            onChange={(e) => setNewExample({ ...newExample, content: e.target.value })}
            placeholder="Décrivez l'exemple, les questions types, les observations à faire..."
            className="min-h-20"
          />
        </div>
        <div>
          <Label className="text-xs">Catégorie</Label>
          <Select
            value={newExample.category}
            onValueChange={(value) => setNewExample({ ...newExample, category: value })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Général</SelectItem>
              <SelectItem value="motricite">Motricité</SelectItem>
              <SelectItem value="cognitif">Cognitif</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="sensoriel">Sensoriel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addExample} disabled={!newExample.title || !newExample.content} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter l'exemple
        </Button>
      </div>
    </div>
  )
}

// Composant pour la modale des notes
function NotesModal({
  sectionId,
  notes,
  newNote,
  setNewNote,
  newNoteCategory,
  setNewNoteCategory,
  onAddNote,
  onRemoveNote,
}: {
  sectionId: string
  notes: ObservationNote[]
  newNote: string
  setNewNote: (note: string) => void
  newNoteCategory: string
  setNewNoteCategory: (category: string) => void
  onAddNote: () => void
  onRemoveNote: (noteId: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Liste des notes existantes */}
      {notes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Notes existantes :</Label>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {notes.map((note) => {
              const categoryInfo = noteCategories.find((cat) => cat.value === note.category)
              return (
                <div key={note.id} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={`text-xs ${categoryInfo?.color} border-0`}>{categoryInfo?.label}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveNote(note.id)}
                      className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700">{note.text}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3" />
                    {note.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Ajout de nouvelle note */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Ajouter une nouvelle note :</Label>
        <Select value={newNoteCategory} onValueChange={setNewNoteCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {noteCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cat.color.split(" ")[0]}`} />
                  {cat.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Décrivez votre observation..."
          className="min-h-24"
        />
        <Button onClick={onAddNote} disabled={!newNote.trim()} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter la note
        </Button>
      </div>
    </div>
  )
}

// Composant pour la modale sensorielle
function SensoryModal({
  results,
  onUpdateResult,
}: {
  results: SensoryResult[]
  onUpdateResult: (category: string, field: "score" | "notes", value: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">Évaluez chaque domaine sensoriel sur une échelle de 1 à 5 :</div>

      {/* Légende */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-5 gap-2 text-xs">
          {sensoryScale.map((scale, index) => (
            <div key={scale.value} className="text-center">
              <div className={`w-full h-6 rounded flex items-center justify-center ${scale.color} mb-1`}>
                {index + 1}
              </div>
              <div className="text-xs">{scale.label.split(" ")[0]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grille des résultats */}
      <ScrollArea className="max-h-96">
        <div className="space-y-3">
          {results.map((result) => {
            const selectedScale = sensoryScale.find((s) => s.value === result.score)
            return (
              <div key={result.category} className="p-3 border rounded-lg">
                <Label className="text-sm font-medium mb-2 block">{result.category}</Label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {sensoryScale.map((scale, index) => (
                    <button
                      key={scale.value}
                      type="button"
                      onClick={() => onUpdateResult(result.category, "score", scale.value)}
                      className={`h-8 rounded text-xs font-medium transition-all ${
                        result.score === scale.value
                          ? `${scale.color} ring-2 ring-blue-400`
                          : `${scale.color.replace("text-", "text-").replace("bg-", "bg-").split(" ")[0]} opacity-60 hover:opacity-100`
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                {result.score && (
                  <Textarea
                    value={result.notes || ""}
                    onChange={(e) => onUpdateResult(result.category, "notes", e.target.value)}
                    placeholder="Notes complémentaires..."
                    className="text-xs h-16 resize-none"
                  />
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

// Composant pour la modale des tests
function TestsModal({
  results,
  onUpdateResults,
}: {
  results: TestResult[]
  onUpdateResults: (results: TestResult[]) => void
}) {
  const [newTest, setNewTest] = useState({ test: "", score: "", percentile: "", notes: "" })

  const addTest = () => {
    if (newTest.test && newTest.score) {
      const test: TestResult = {
        id: Date.now().toString(),
        ...newTest,
      }
      onUpdateResults([...results, test])
      setNewTest({ test: "", score: "", percentile: "", notes: "" })
    }
  }

  const removeTest = (testId: string) => {
    onUpdateResults(results.filter((test) => test.id !== testId))
  }

  return (
    <div className="space-y-4">
      {/* Tests existants */}
      {results.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tests saisis :</Label>
          <div className="space-y-2">
            {results.map((result) => (
              <div key={result.id} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-medium text-sm">{result.test}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTest(result.id)}
                    className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-sm text-gray-700">
                  Score: {result.score}
                  {result.percentile && ` (${result.percentile}e percentile)`}
                </div>
                {result.notes && <div className="text-xs text-gray-600 mt-1">{result.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ajout de nouveau test */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Ajouter un test :</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Nom du test</Label>
            <Textarea
              value={newTest.test}
              onChange={(e) => setNewTest({ ...newTest, test: e.target.value })}
              placeholder="Ex: MABC-2 Dextérité manuelle"
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Score</Label>
            <Textarea
              value={newTest.score}
              onChange={(e) => setNewTest({ ...newTest, score: e.target.value })}
              placeholder="Ex: 8/15"
              className="h-8"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Percentile (optionnel)</Label>
            <Textarea
              value={newTest.percentile}
              onChange={(e) => setNewTest({ ...newTest, percentile: e.target.value })}
              placeholder="Ex: 25"
              className="h-8"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Notes (optionnel)</Label>
          <Textarea
            value={newTest.notes}
            onChange={(e) => setNewTest({ ...newTest, notes: e.target.value })}
            placeholder="Observations complémentaires..."
            className="h-16"
          />
        </div>
        <Button onClick={addTest} disabled={!newTest.test || !newTest.score} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter le test
        </Button>
      </div>
    </div>
  )
}
