'use client';

import { useEffect, useState, useMemo } from 'react';
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
import CreerTrameModal from '@/components/ui/creer-trame-modale';
import EmptyState from '@/components/bilans/EmptyState';
import { useSectionStore, type Section } from '@/store/sections';
import { Loader2 } from 'lucide-react';
import { Tabs } from '@/components/ui/tabs';
import { useUserProfileStore } from '@/store/userProfile';
import { categories } from '@/types/trame';
import { jobOptions, Job } from '@/types/job';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Bibliotheque() {
  const navigate = useNavigate();
  const { items, fetchAll, remove, duplicate } = useSectionStore();
  const [toDelete, setToDelete] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { profile, fetchProfile } = useUserProfileStore();
  const [jobFilter, setJobFilter] = useState<Job | 'ALL'>('ALL');

  const profileId = useMemo(() => profile?.id ?? null, [profile]);

  const OFFICIAL_AUTHOR_ID = import.meta.env.VITE_OFFICIAL_AUTHOR_ID;

  useEffect(() => {
    // Charge en parallèle les sections + le profil
    Promise.allSettled([fetchAll(), fetchProfile()]).finally(() =>
      setIsLoading(false),
    );
  }, []);

  const myTrames = items.filter((s) => !!profileId && s.authorId === profileId);
  const officialTrames = items.filter(
    (s) =>
      !!OFFICIAL_AUTHOR_ID && s.isPublic && s.authorId === OFFICIAL_AUTHOR_ID,
  );
  const communityTrames = items.filter(
    (s) =>
      s.isPublic && (!OFFICIAL_AUTHOR_ID || s.authorId !== OFFICIAL_AUTHOR_ID),
  );

  const [activeTab, setActiveTab] = useState<'mine' | 'official' | 'community'>(
    myTrames.length > 0
      ? 'mine'
      : officialTrames.length > 0
        ? 'official'
        : 'community',
  );

  const matchesActiveFilter = (s: Section) => {
    if (activeTab === 'mine') return !!profileId && s.authorId === profileId;
    if (activeTab === 'official')
      return (
        !!OFFICIAL_AUTHOR_ID && s.isPublic && s.authorId === OFFICIAL_AUTHOR_ID
      );
    return (
      s.isPublic && (!OFFICIAL_AUTHOR_ID || s.authorId !== OFFICIAL_AUTHOR_ID)
    );
  };

  const matchesJobFilter = (s: Section) => {
    if (jobFilter === 'ALL') return true;
    // Vérifier que s.job existe et est un tableau, puis vérifier si le métier filtré est inclus
    return Array.isArray(s.job) && s.job.includes(jobFilter as Job);
  };

  // Debug: logger les informations sur le filtrage des métiers
  useEffect(() => {
    if (!isLoading && items.length > 0) {
      console.log('=== DEBUG FILTRAGE MÉTIERS ===');
      console.log('Job filter actuel:', jobFilter);
      console.log(
        'Toutes les sections:',
        items.map((s) => ({
          title: s.title,
          job: s.job,
          kind: s.kind,
        })),
      );

      if (jobFilter !== 'ALL') {
        const filteredItems = items
          .filter(matchesActiveFilter)
          .filter(matchesJobFilter);
        console.log(
          'Sections filtrées par métier:',
          filteredItems.map((s) => ({
            title: s.title,
            job: s.job,
          })),
        );
        console.log('Nombre total de sections filtrées:', filteredItems.length);
      }
      console.log('==============================');
    }
  }, [isLoading, items, jobFilter, matchesActiveFilter, matchesJobFilter]);

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
            onChange={(k) =>
              setActiveTab(k as 'mine' | 'official' | 'community')
            }
            tabs={[
              {
                key: 'mine',
                label: 'Mes trames',
                count: myTrames.length,
                hidden: myTrames.length === 0,
              },
              {
                key: 'official',
                label: 'Trames Bilan Plume',
                count: officialTrames.length,
              },
              {
                key: 'community',
                label: 'Trames de la communauté',
                count: communityTrames.length,
              },
            ]}
          />
          <div className="mt-2 mb-2 flex flex-wrap items-center gap-3">
            {/*             <div className="flex-1 min-w-[200px]">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une trame…"
                aria-label="Rechercher une trame"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-300"
              />
            </div> */}

            {/* Filtre métier */}
            <div className="w-48">
              <Select
                value={jobFilter}
                onValueChange={(v) => setJobFilter(v as Job | 'ALL')}
              >
                <SelectTrigger aria-label="Filtrer par job">
                  <SelectValue placeholder="Tous les métiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les métiers</SelectItem>
                  {jobOptions.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Indicateur du filtre actuel */}
            {jobFilter !== 'ALL' && (
              <div className="text-sm text-gray-600">
                Filtre actuel :{' '}
                {jobOptions.find((j) => j.id === jobFilter)?.label} (
                {
                  items.filter(matchesActiveFilter).filter(matchesJobFilter)
                    .length
                }{' '}
                trames)
              </div>
            )}
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Commencez par créer votre première trame"
            cta={<CreerTrameModal />}
          />
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const sections = items
                .filter((s) => s.kind === category.id)
                .filter(matchesActiveFilter)
                .filter(matchesJobFilter);
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
                        showDelete={true}
                        showDuplicate={true}
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
            <p className="text-sm text-gray-600 mt-2">
              Cette action est irréversible. La trame &ldquo;{toDelete?.title}
              &rdquo; sera définitivement supprimée.
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
              onClick={async () => {
                if (toDelete && !isDeleting) {
                  setIsDeleting(true);
                  try {
                    await remove(toDelete.id);
                    // La fonction remove() met déjà à jour l'état local,
                    // pas besoin de fetchAll()
                    setToDelete(null);
                  } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                    // Ici on pourrait afficher une notification d'erreur
                    alert('Erreur lors de la suppression. Veuillez réessayer.');
                  } finally {
                    setIsDeleting(false);
                  }
                }
              }}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
