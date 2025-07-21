'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { apiFetch } from '../utils/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NewPatientModal } from '@/components/ui/new-patient-modal';
import { ExistingPatientModal } from '@/components/ui/existing-patient-modal';
import { FileText, Plus } from 'lucide-react';

export default function MesBilans() {
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isExistingPatientModalOpen, setIsExistingPatientModalOpen] =
    useState(false);
  const token = useAuth((s) => s.token);
  const navigate = useNavigate();

  const createBilan = async (patientId: string) => {
    const res = await apiFetch<{ id: string }>('/api/v1/bilans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ patientId }),
    });
    navigate(`/bilan/${res.id}`);
  };

  return (
    <main className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-10">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <CardTitle className="mt-4 text-2xl">
            Aucun bilan disponible
          </CardTitle>
          <CardDescription>
            Il semble que vous n&rsquo;ayez pas encore rédigé de bilan.
            Commencez par en créer un nouveau.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Rédiger un nouveau bilan
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => setIsNewPatientModalOpen(true)}>
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
    </main>
  );
}
