'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import EmptyState from '@/components/bilans/EmptyState';
import BilansTable from '@/components/bilans/BilansTable';
import PaginationControls from '@/components/bilans/PaginationControls';
import DeleteDialog from '@/components/bilans/DeleteDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NewPatientModal } from '@/components/ui/new-patient-modal';
import { ExistingPatientModal } from '@/components/ui/existing-patient-modal';
import { useAuth } from '../store/auth';
import { apiFetch } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface BilanItem {
  id: string;
  date: string;
  patient?: { firstName: string; lastName: string };
  bilanType?: { name: string };
}

export default function Component() {
  const [bilans, setBilans] = useState<BilanItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isExistingPatientModalOpen, setIsExistingPatientModalOpen] =
    useState(false);
  const [toDelete, setToDelete] = useState<BilanItem | null>(null);
  const bilansPerPage = 8;
  const token = useAuth((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    apiFetch<BilanItem[]>('/api/v1/bilans', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(setBilans)
      .catch(() => {
        /* ignore */
      });
  }, [token]);

  const createBilan = async (patientId: string) => {
    const res = await apiFetch<{ id: string }>('/api/v1/bilans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ patientId }),
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

  // Calculs pour la pagination
  const totalPages = Math.ceil(bilans.length / bilansPerPage);
  const startIndex = (currentPage - 1) * bilansPerPage;
  const endIndex = startIndex + bilansPerPage;
  const currentBilansPage = bilans.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // État vide - aucun bilan
  if (bilans.length === 0) {
    return (
      <EmptyState
        onNewPatient={() => setIsNewPatientModalOpen(true)}
        onExistingPatient={() => setIsExistingPatientModalOpen(true)}
      />
    );
  }

  // État avec bilans existants
  return (
    <>
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Créer un nouveau bilan
                  </h3>
                  <p className="text-gray-600">
                    Commencez la rédaction d&rsquo;un nouveau bilan patient
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Rédiger un nouveau bilan
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem
                    onClick={() => setIsNewPatientModalOpen(true)}
                  >
                    Nouveau patient
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsExistingPatientModalOpen(true)}
                  >
                    Patient existant
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          {/* Tableau des bilans */}
          <Card>
            <CardContent className="p-6">
              <BilansTable
                bilans={currentBilansPage}
                totalCount={bilans.length}
                onRowClick={(id) => navigate(`/bilan/${id}`)}
                onDelete={(b) => setToDelete(b)}
              />
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalCount={bilans.length}
                onPageChange={goToPage}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onPatientCreated={createBilan}
      />
      <ExistingPatientModal
        isOpen={isExistingPatientModalOpen}
        onClose={() => setIsExistingPatientModalOpen(false)}
        onPatientSelected={createBilan}
      />
      <DeleteDialog
        open={!!toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) {
            await removeBilan(toDelete.id);
            setToDelete(null);
          }
        }}
      />
    </>
  );
}
