'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ClipboardList, Eye, Brain } from "lucide-react"
import CreerTrameModal from "@/components/ui/creer-trame-modale"


export default function Bibliotheque() {
  const categories = [
    {
      id: "anamnese",
      title: "Anamnèse",
      icon: FileText,
      sections: [
        { id: 1, title: "Anamnèse développementale", description: "Histoire du développement psychomoteur" },
        { id: 2, title: "Anamnèse périnatale", description: "Conditions de naissance et premiers mois" },
        { id: 3, title: "Anamnèse familiale", description: "Contexte familial et environnemental" },
        { id: 4, title: "Anamnèse scolaire", description: "Parcours et difficultés scolaires" },
      ],
    },
    {
      id: "tests_standards",
      title: "Tests standards",
      icon: ClipboardList,
      sections: [
        { id: 5, title: "M-ABC-2 (3-6 ans)", description: "Batterie d'évaluation motrice" },
        { id: 6, title: "M-ABC-2 (7-16 ans)", description: "Batterie d'évaluation motrice" },
        { id: 7, title: "BHK", description: "Échelle d'évaluation de l'écriture" },
        { id: 8, title: "Figure de Rey", description: "Test de copie et reproduction" },
      ],
    },
    {
      id: "observations",
      title: "Observations",
      icon: Eye,
      sections: [
        { id: 9, title: "Observation libre", description: "Grille d'observation comportementale" },
        { id: 10, title: "Observation motricité fine", description: "Évaluation des gestes fins" },
        { id: 11, title: "Observation motricité globale", description: "Évaluation des mouvements généraux" },
        { id: 12, title: "Observation graphomotrice", description: "Analyse du geste d'écriture" },
        { id: 13, title: "Observation spatiale", description: "Repérage dans l'espace" },
      ],
    },
    {
      id: "profil_sensoriel",
      title: "Profil sensoriel",
      icon: Brain,
      sections: [
        { id: 14, title: "Profil sensoriel de Dunn", description: "Évaluation des réponses sensorielles" },
        { id: 15, title: "Profil tactile", description: "Sensibilité et discrimination tactile" },
        { id: 16, title: "Profil vestibulaire", description: "Équilibre et orientation spatiale" },
        { id: 17, title: "Profil proprioceptif", description: "Conscience corporelle et posturale" },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bibliothèque</h1>
              <p className="text-gray-600">Vos sections pour composer le bilan psychomoteur</p>
            </div>
            <CreerTrameModal />
        </div>
      </div>  

      <div className="space-y-8">
        {categories.map((category) => {
          const IconComponent = category.icon
          return (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IconComponent className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
                <span className="text-sm text-gray-500">({category.sections.length} sections)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.sections.map((trame) => (
                  <Card key={trame.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium text-gray-900">{trame.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{trame.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
    </div>
  )
}
