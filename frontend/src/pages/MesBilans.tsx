'use client';

import {
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

  // État vide - aucun bilan
  if (bilans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Aucun bilan disponible
              </h2>
              <p className="text-gray-600 mb-6 max-w-md">
                Il semble que vous n&rsquo;ayez pas encore rédigé de bilan.
                Commencez par en créer un nouveau.
              </p>
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
        </div>
      </div>
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Historique des bilans
                </h3>
                <span className="text-sm text-gray-500">
                  {bilans.length} bilan{bilans.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Date</TableHead>
                      <TableHead>Nom Patient</TableHead>
                      <TableHead>Nom bilan</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBilansPage.map((bilan) => (
                      <TableRow
                        key={bilan.id}
                        onClick={() => navigate(`/bilan/${bilan.id}`)}
                        className="hover:bg-gray-200 cursor-pointer"
                      >
                        <TableCell className="font-medium">
                          {formatDate(bilan.date)}
                        </TableCell>
                        <TableCell>
                          {bilan.patient
                            ? `${bilan.patient.firstName} ${bilan.patient.lastName}`
                            : ''}
                        </TableCell>
                        <TableCell>{bilan.bilanType?.name ?? ''}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-600"
                            aria-label="Supprimer le bilan"
                            onClick={() => setToDelete(bilan)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Affichage de {startIndex + 1} à{' '}
                    {Math.min(endIndex, bilans.length)} sur {bilans.length}{' '}
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ),
                      )}
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
      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce bilan ?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (toDelete) {
                  await removeBilan(toDelete.id);
                  setToDelete(null);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
