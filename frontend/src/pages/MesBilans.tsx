'use client';

import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NewPatientModal } from '@/components/ui/new-patient-modal';
import { ExistingPatientModal } from '@/components/ui/existing-patient-modal';
import { useAuth } from '../store/auth';
import { apiFetch } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CreationBilan } from '@/components/ui/creation-bilan-modal';
import EmptyState from '@/components/bilans/EmptyState';
import GenericTable, { BilanItem } from '@/components/bilans/GenericTable';
import PaginationControls from '@/components/bilans/PaginationControls';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { usePatientStore } from '../store/patients';

export default function Component() {
  const [bilans, setBilans] = useState<BilanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isExistingPatientModalOpen, setIsExistingPatientModalOpen] =
    useState(false);
  const [toDelete, setToDelete] = useState<BilanItem | null>(null);
  const bilansPerPage = 8;
  const token = useAuth((s) => s.token);
  const navigate = useNavigate();
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [bilanTitle, setBilanTitle] = useState('');

  // --- Récupération patients ---
  const patients = usePatientStore((s) => s.items);
  const fetchPatients = usePatientStore((s) => s.fetchAll);

  useEffect(() => {
    if (token) {
      fetchPatients().catch(() => {});
    }
  }, [token, fetchPatients]);

  const hasPatients = patients.length > 0;

  useEffect(() => {
    if (!token) return;
    apiFetch<BilanItem[]>('/api/v1/bilans', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(setBilans)
      .then(() => setIsLoading(false))
      .catch(() => {
        /* ignore */
      });
  }, [token]);

  const createBilan = async (patientId: string, title?: string) => {
    const res = await apiFetch<{ id: string }>('/api/v1/bilans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ patientId, title }),
    });
    navigate(`/bilan/${res.id}`);
  };

  const removeBilan = async (id: string) => {
    await apiFetch(`/api/v1/bilans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setBilans((prev) => prev.filter((b) => b.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Calculs pour la pagination
  const totalPages = Math.ceil(bilans.length / bilansPerPage);
  const startIndex = (currentPage - 1) * bilansPerPage;
  const endIndex = startIndex + bilansPerPage;
  const currentBilansPage = bilans.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const hasBilans = bilans.length > 0;

  // État avec bilans existants
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mes rédactions
              </h1>
              <p className="text-gray-600">
                Consultez et gérez toutes vos rédactions
              </p>
            </div>
            {/* <Button
              className=""
              variant="primary"
              onClick={() => setIsCreationModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Rédiger un nouveau bilan
            </Button> */}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : hasBilans ? (
          <div className="space-y-6">
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Rédiger un nouveau bilan
                    </h3>
                    <p className="text-gray-600">
                      Commencez la rédaction d&rsquo;un nouveau bilan patient
                    </p>
                  </div>
                </div>
                <Button
                  className=""
                  variant="primary"
                  onClick={() => setIsCreationModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Rédiger un nouveau bilan
                </Button>
              </CardContent>
            </Card>

            <GenericTable
              variant="bilan"
              items={currentBilansPage}
              onSelect={(id) => navigate(`/bilan/${id}`)}
              onDelete={(b) => setToDelete(b)}
              formatDate={formatDate}
            />

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={bilans.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={goToPage}
            />
          </div>
        ) : (
          <EmptyState onCreate={() => setIsCreationModalOpen(true)} />
        )}
      </div>
      <CreationBilan
        isOpen={isCreationModalOpen}
        onClose={() => setIsCreationModalOpen(false)}
        onNewPatient={(title) => {
          setBilanTitle(title);
          setIsNewPatientModalOpen(true);
        }}
        onExistingPatient={(title) => {
          setBilanTitle(title);
          setIsExistingPatientModalOpen(true);
        }}
        hasPatients={hasPatients}
      />
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onPatientCreated={(id) => createBilan(id, bilanTitle)}
      />
      <ExistingPatientModal
        isOpen={isExistingPatientModalOpen}
        onClose={() => setIsExistingPatientModalOpen(false)}
        onPatientSelected={(id) => createBilan(id, bilanTitle)}
      />
      <ConfirmDialog
        open={!!toDelete}
        title="Supprimer ce bilan ?"
        onOpenChange={(open) => !open && setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) {
            await removeBilan(toDelete.id);
            setToDelete(null);
          }
        }}
      />
    </div>
  );
}
