'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import BilanTypeCard from '@/components/BilanTypeCard';
import { Button } from '@/components/ui/button';
import CreateWithJobsModal from '@/components/ui/create-with-jobs-modal';
import EmptyState from '@/components/bilans/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBilanTypeStore, type BilanType } from '@/store/bilanTypes';

export default function BilanTypes() {
  const navigate = useNavigate();
  const { items, fetchAll, remove, create } = useBilanTypeStore();
  const [toDelete, setToDelete] = useState<BilanType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  // no local dialog state anymore; handled by the shared modal

  useEffect(() => {
    fetchAll().finally(() => setIsLoading(false));
  }, [fetchAll]);

  return (
    <div className="bg-wood-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Trames de bilans
            </h1>
            <p className="text-gray-600">
              Composez vos trames personnalisées en sélectionnant des parties
              dans la Bibliothèque
            </p>
          </div>
          <CreateWithJobsModal
            dialogTitle="Créer une trame bilan complet"
            nameLabel="Nom"
            confirmLabel="Valider"
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Composer une trame de bilan
              </Button>
            }
            open={createOpen}
            onOpenChange={setCreateOpen}
            onSubmit={async ({ name, jobs }) => {
              if (isCreating) return;
              setIsCreating(true);
              try {
                const payload = {
                  name,
                  job: jobs,
                };
                const created = await create(payload);
                const params = new URLSearchParams();
                if (created?.id) {
                  params.set('id', created.id);
                }
                const resolvedName = created?.name ?? name;
                if (resolvedName) params.set('name', resolvedName);
                const resolvedJobs = created?.job ?? jobs ?? [];
                if (resolvedJobs.length) {
                  params.set('jobs', resolvedJobs.join(','));
                }
                const search = params.toString();
                navigate(
                  search
                    ? `/bilan-types/builder?${search}`
                    : '/bilan-types/builder',
                );
              } catch (error) {
                console.error(
                  'Erreur lors de la création du bilan type',
                  error,
                );
                setCreateOpen(true);
              } finally {
                setIsCreating(false);
              }
            }}
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Composer votre première trame de bilan"
            ctaLabel="Composer trame"
            onCreate={() => setCreateOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((bt) => (
              <BilanTypeCard
                key={bt.id}
                bilanType={{
                  id: bt.id,
                  name: bt.name,
                  description: bt.description,
                  isPublic: bt.isPublic ?? false,
                  authorPrenom:
                    bt.isPublic && bt.author?.prenom
                      ? bt.author.prenom
                      : undefined,
                  testsCount: bt.sections?.length ?? 0,
                  job: bt.job,
                }}
                onOpen={() => navigate(`/bilan-types/${bt.id}`)}
                onDelete={() => setToDelete(bt)}
              />
            ))}
          </div>
        )}
      </div>
      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce bilan type ?</AlertDialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Cette action est irréversible. Le bilan type &ldquo;
              {toDelete?.name}&rdquo; sera définitivement supprimé.
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
                  } finally {
                    setIsDeleting(false);
                    setToDelete(null);
                  }
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
