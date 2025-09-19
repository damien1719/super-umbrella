'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLibraryView from '@/components/section-library/SectionLibraryView';
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
import { useUserProfileStore } from '@/store/userProfile';
import type { TrameInfo } from '@/components/TrameCard';

export default function Bibliotheque() {
  const navigate = useNavigate();
  const { items, fetchAll, remove, duplicate } = useSectionStore();
  const { profile, fetchProfile } = useUserProfileStore();
  const [toDelete, setToDelete] = useState<Section | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([fetchAll(), fetchProfile()]).finally(() =>
      setIsLoading(false),
    );
  }, [fetchAll, fetchProfile]);

  const profileId = useMemo(() => profile?.id ?? null, [profile]);

  const myTrames = useMemo(
    () =>
      items.filter(
        (section) =>
          !!profileId &&
          (section.authorId === profileId ||
            (!section.isPublic && section.authorId !== profileId)),
      ),
    [items, profileId],
  );

  const officialTrames = useMemo(
    () => items.filter((section) => section.source === 'BILANPLUME'),
    [items],
  );

  const communityTrames = useMemo(
    () =>
      items.filter(
        (section) =>
          section.isPublic &&
          section.source !== 'BILANPLUME' &&
          (!profileId || section.authorId !== profileId),
      ),
    [items, profileId],
  );

  const tabs = useMemo(
    () => [
      {
        key: 'mine',
        label: 'Mes parties',
        sections: myTrames,
        hidden: myTrames.length === 0,
      },
      {
        key: 'official',
        label: 'Partagées Bilan Plume',
        sections: officialTrames,
        hidden: officialTrames.length === 0,
      },
      {
        key: 'community',
        label: 'Partagées par la communauté',
        sections: communityTrames,
        hidden: communityTrames.length === 0,
      },
    ],
    [myTrames, officialTrames, communityTrames],
  );

  const initialTab = useMemo(() => {
    if (myTrames.length > 0) return 'mine';
    if (officialTrames.length > 0) return 'official';
    if (communityTrames.length > 0) return 'community';
    return tabs[0]?.key ?? 'mine';
  }, [myTrames.length, officialTrames.length, communityTrames.length, tabs]);

  const mapSectionToCard = (section: Section): TrameInfo => ({
    id: section.id,
    title: section.title,
    description: section.description,
    coverUrl: section.coverUrl,
    job: section.job,
    sharedBy:
      profileId && section.authorId === profileId
        ? undefined
        : (section.author?.prenom ?? undefined),
  });

  const handleDuplicate = async (section: Section) => {
    await duplicate(section.id);
    await fetchAll().catch(() => {
      /* ignore */
    });
  };

  const handleDelete = (section: Section) => {
    setToDelete(section);
  };

  const confirmDelete = async () => {
    if (!toDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await remove(toDelete.id);
      setToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression. Veuillez réessayer.');
    } finally {
      setIsDeleting(false);
    }
  };

  const emptyState = (
    <EmptyState
      title="Créer votre première partie de bilan"
      cta={<CreerTrameModal />}
    />
  );

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
                L'ensemble des parties disponibles pour composer vos bilans
              </p>
            </div>
            <CreerTrameModal />
          </div>
        </div>

        <SectionLibraryView
          tabs={tabs}
          initialTab={initialTab}
          onSelectSection={(section) =>
            navigate(`/creation-trame/${section.id}`)
          }
          onDuplicateSection={handleDuplicate}
          onDeleteSection={handleDelete}
          canDuplicateSection={() => true}
          canDeleteSection={(section) =>
            !!profileId && section.authorId === profileId
          }
          mapSectionToCard={mapSectionToCard}
          isLoading={isLoading}
          emptyState={emptyState}
        />
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
              onClick={confirmDelete}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
