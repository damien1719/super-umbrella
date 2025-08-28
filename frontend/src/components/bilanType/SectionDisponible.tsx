"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter } from "lucide-react"
import { SectionCardSmall } from "./section-card-small"

interface BilanElement {
  id: string
  type: "test" | "anamnese" | "conclusion"
  title: string
  description: string
  metier: "psychologue" | "orthophoniste" | "neuropsychologue" | "psychiatre" | "general"
}

interface SectionDisponibleProps {
  availableElements: BilanElement[]
  onAddElement: (element: BilanElement) => void
}

export function SectionDisponible({ availableElements, onAddElement }: SectionDisponibleProps) {
  const [searchText, setSearchText] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterMetier, setFilterMetier] = useState<string>("all")
  const [displayLimit, setDisplayLimit] = useState(8)

  const filteredElements = useMemo(() => {
    const filtered = availableElements.filter((element) => {
      const matchesSearch =
        searchText === "" ||
        element.title.toLowerCase().includes(searchText.toLowerCase()) ||
        element.description.toLowerCase().includes(searchText.toLowerCase())

      const matchesType = filterType === "all" || element.type === filterType
      const matchesMetier = filterMetier === "all" || element.metier === filterMetier

      return matchesSearch && matchesType && matchesMetier
    })

    return filtered.slice(0, displayLimit)
  }, [searchText, filterType, filterMetier, displayLimit, availableElements])

  const hasMoreResults = useMemo(() => {
    const totalFiltered = availableElements.filter((element) => {
      const matchesSearch =
        searchText === "" ||
        element.title.toLowerCase().includes(searchText.toLowerCase()) ||
        element.description.toLowerCase().includes(searchText.toLowerCase())

      const matchesType = filterType === "all" || element.type === filterType
      const matchesMetier = filterMetier === "all" || element.metier === filterMetier

      return matchesSearch && matchesType && matchesMetier
    }).length

    return totalFiltered > displayLimit
  }, [searchText, filterType, filterMetier, displayLimit, availableElements])

  const loadMoreResults = () => {
    setDisplayLimit((prev) => prev + 8)
  }

  const resetFilters = () => {
    setSearchText("")
    setFilterType("all")
    setFilterMetier("all")
    setDisplayLimit(8)
  }

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Éléments disponibles
        </CardTitle>
        <div className="space-y-3 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un test, anamnèse..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type d'élément" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="test">Tests</SelectItem>
                <SelectItem value="anamnese">Anamnèses</SelectItem>
                <SelectItem value="conclusion">Conclusions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMetier} onValueChange={setFilterMetier}>
              <SelectTrigger>
                <SelectValue placeholder="Métier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les métiers</SelectItem>
                <SelectItem value="psychologue">Psychologue</SelectItem>
                <SelectItem value="orthophoniste">Orthophoniste</SelectItem>
                <SelectItem value="neuropsychologue">Neuropsychologue</SelectItem>
                <SelectItem value="psychiatre">Psychiatre</SelectItem>
                <SelectItem value="general">Général</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchText || filterType !== "all" || filterMetier !== "all") && (
            <Button variant="outline" size="sm" onClick={resetFilters} className="w-full bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredElements.map((element) => (
          <SectionCardSmall key={element.id} element={element} onAdd={onAddElement} />
        ))}

        {hasMoreResults && (
          <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={loadMoreResults}>
            Afficher plus de résultats
          </Button>
        )}

        {filteredElements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun élément trouvé</p>
            <p className="text-xs">Essayez de modifier vos filtres</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
