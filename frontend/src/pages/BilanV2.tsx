"use client"

import { FileText, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"

// Données d'exemple des bilans (plus de 5 pour tester la pagination)
const bilansData = [
  {
    id: 1,
    date: "2025-01-15",
    nomPatient: "Martin Dubois",
    nomBilan: "Bilan orthophonique initial",
  },
  {
    id: 2,
    date: "2025-01-12",
    nomPatient: "Sophie Laurent",
    nomBilan: "Bilan de déglutition",
  },
  {
    id: 3,
    date: "2025-01-10",
    nomPatient: "Pierre Moreau",
    nomBilan: "Bilan vocal",
  },
  {
    id: 4,
    date: "2025-01-08",
    nomPatient: "Marie Leroy",
    nomBilan: "Bilan langage oral",
  },
  {
    id: 5,
    date: "2025-01-05",
    nomPatient: "Jean Dupont",
    nomBilan: "Bilan neurologique",
  },
  {
    id: 6,
    date: "2025-01-03",
    nomPatient: "Claire Martin",
    nomBilan: "Bilan dyslexie",
  },
  {
    id: 7,
    date: "2025-01-01",
    nomPatient: "Paul Bernard",
    nomBilan: "Bilan bégaiement",
  },
  {
    id: 8,
    date: "2024-12-28",
    nomPatient: "Anne Petit",
    nomBilan: "Bilan aphasie",
  },
]

// Pour tester l'état vide, changez cette valeur à []
const currentBilans = bilansData

export default function Component() {
  const [currentPage, setCurrentPage] = useState(1)
  const bilansPerPage = 5

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Calculs pour la pagination
  const totalPages = Math.ceil(currentBilans.length / bilansPerPage)
  const startIndex = (currentPage - 1) * bilansPerPage
  const endIndex = startIndex + bilansPerPage
  const currentBilansPage = currentBilans.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // État vide - aucun bilan
  if (currentBilans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucun bilan disponible</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                Il semble que vous n'ayez pas encore rédigé de bilan. Commencez par en créer un nouveau.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Rédiger un nouveau bilan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // État avec bilans existants
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Encart pour créer un nouveau bilan */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Créer un nouveau bilan</h3>
                <p className="text-gray-600">Commencez la rédaction d'un nouveau bilan patient</p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Rédiger un nouveau bilan
            </Button>
          </CardContent>
        </Card>

        {/* Tableau des bilans */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Historique des bilans</h3>
              <span className="text-sm text-gray-500">
                {currentBilans.length} bilan{currentBilans.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Date</TableHead>
                    <TableHead>Nom Patient</TableHead>
                    <TableHead>Nom bilan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBilansPage.map((bilan) => (
                    <TableRow key={bilan.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{formatDate(bilan.date)}</TableCell>
                      <TableCell>{bilan.nomPatient}</TableCell>
                      <TableCell>{bilan.nomBilan}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, currentBilans.length)} sur {currentBilans.length}{" "}
                  bilans
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
