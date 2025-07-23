'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, ClipboardList, Eye, Brain, Pen, Trash2 } from 'lucide-react';
import CreerTrameModal from '@/components/ui/creer-trame-modale';
import { useSectionStore, type Section } from '@/store/sections';

export default function Bibliotheque() {
  const navigate = useNavigate();
  const { items, fetchAll, remove } = useSectionStore();
  const [toDelete, setToDelete] = useState<Section | null>(null);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  const categories = [
    { id: 'anamnese', title: 'Anamnèse', icon: FileText },
    { id: 'tests_standards', title: 'Tests standards', icon: ClipboardList },
    { id: 'observations', title: 'Observations', icon: Eye },
    { id: 'profil_sensoriel', title: 'Profil sensoriel', icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bibliothèque
              </h1>
              <p className="text-gray-600">
                Vos sections pour composer le bilan psychomoteur
              </p>
            </div>
            <CreerTrameModal />
          </div>
        </div>

        <div className="space-y-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const sections = items.filter((s) => s.kind === category.id);
            return (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {category.title}
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({sections.length} sections)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sections.map((trame) => (
                    <Card
                      key={trame.id}
                      className="relative hover:shadow-md transition-shadow"
                    >
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            navigate(`/creation-trame/${trame.id}`)
                          }
                        >
                          <Pen className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => setToDelete(trame)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium text-gray-900">
                          {trame.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          {trame.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette trame ?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (toDelete) {
                  await remove(toDelete.id);
                  setToDelete(null);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}