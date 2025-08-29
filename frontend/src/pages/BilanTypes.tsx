'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BilanTypeCard from '@/components/BilanTypeCard';
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
import { useBilanTypeStore, type BilanType } from '@/store/bilanTypes';

export default function BilanTypes() {
  const navigate = useNavigate();
  const { items, fetchAll, remove } = useBilanTypeStore();
  const [toDelete, setToDelete] = useState<BilanType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAll().finally(() => setIsLoading(false));
  }, [fetchAll]);

  return (
    <div className="min-h-screen bg-wood-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Trames de bilan complet
            </h1>
            <p className="text-gray-600">Vos bilans préconfigurés</p>
          </div>
          <Button onClick={() => navigate('/bilan-types/builder')}>
            Créer un Bilan Type
          </Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray-600">Aucun bilan type pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((bt) => (
              <BilanTypeCard
                key={bt.id}
                bilanType={{
                  id: bt.id,
                  name: bt.name,
                  description: bt.description,
                  authorPrenom:
                    bt.isPublic && bt.author?.prenom
                      ? bt.author.prenom
                      : undefined,
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
