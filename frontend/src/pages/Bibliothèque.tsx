'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrameCard from '@/components/TrameCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, ClipboardList, Eye, Brain } from 'lucide-react';
import CreerTrameModal from '@/components/ui/creer-trame-modale';
import { useSectionStore, type Section } from '@/store/sections';
import { Loader2 } from 'lucide-react';
import { Tabs } from '@/components/ui/tabs';
import { useAuth } from '@/store/auth';


export default function Bibliotheque() {
  const navigate = useNavigate();
  const { items, fetchAll, remove, duplicate } = useSectionStore();
  const [toDelete, setToDelete] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const OFFICIAL_AUTHOR_ID = (import.meta as any).env
    .VITE_OFFICIAL_AUTHOR_ID as string | undefined;


  useEffect(() => {
    fetchAll()
      .then(() => setIsLoading(false))
      .catch(() => {});
  }, [fetchAll]);


  const myTrames = items.filter((s) => !!userId && s.author?.id === userId);
  const officialTrames = items.filter(
    (s) => !!OFFICIAL_AUTHOR_ID && s.isPublic && s.author?.id === OFFICIAL_AUTHOR_ID,
  );
  const communityTrames = items.filter(
    (s) => s.isPublic && (!OFFICIAL_AUTHOR_ID || s.author?.id !== OFFICIAL_AUTHOR_ID),
  );

  const [activeTab, setActiveTab] = useState<'mine' | 'official' | 'community'>('community');

  const matchesActiveFilter = (s: Section) => {
    if (activeTab === 'mine') return !!userId && s.author?.id === userId;
    if (activeTab === 'official')
      return !!OFFICIAL_AUTHOR_ID && s.isPublic && s.author?.id === OFFICIAL_AUTHOR_ID;
    return s.isPublic && (!OFFICIAL_AUTHOR_ID || s.author?.id !== OFFICIAL_AUTHOR_ID);
  };

  const categories = [
    { id: 'anamnese', title: 'Anamnèse', icon: FileText },
    { id: 'tests_standards', title: 'Tests standards', icon: ClipboardList },
    { id: 'observations', title: 'Observations', icon: Eye },
    { id: 'profil_sensoriel', title: 'Profil sensoriel', icon: Brain },
    { id: 'conclusion', title: 'Conclusion', icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-wood-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bibliothèque
              </h1>
              <p className="text-gray-600">
                Vos trames pour composer le bilan psychomoteur
              </p>
            </div>
            <CreerTrameModal />
          </div>
        </div>
        <div className="mt-4">
            <Tabs
              active={activeTab}
              onChange={(k) => setActiveTab(k as 'mine' | 'official' | 'community')}
              tabs={[
                { key: 'mine', label: 'Mes trames', count: myTrames.length, hidden: myTrames.length === 0 },
                { key: 'official', label: 'Trames Bilan Plume', count: officialTrames.length },
                { key: 'community', label: 'Trames de la communauté', count: communityTrames.length },
              ]}
            />
          </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const sections = items
                .filter((s) => s.kind === category.id)
                .filter(matchesActiveFilter);
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary-600" />
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
                      <TrameCard
                        key={trame.id}
                        trame={{
                          id: trame.id,
                          title: trame.title,
                          description: trame.description,
                          sharedBy:
                            trame.isPublic && trame.author?.prenom
                              ? trame.author.prenom
                              : undefined,
                        }}
                        onSelect={() => navigate(`/creation-trame/${trame.id}`)}
                        onDuplicate={async () => {
                          await duplicate(trame.id);
                          await fetchAll().catch(() => {});
                        }}
                        onDelete={() => setToDelete(trame)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                  await fetchAll().catch(() => {});
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
