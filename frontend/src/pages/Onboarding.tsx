import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Job, jobLabels, jobOptions } from '../types/job';
import { useUserProfileStore } from '../store/userProfile';

const ONBOARDING_VERSION = '1';

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, updateProfile, loading, error } = useUserProfileStore();
  const [form, setForm] = useState<{ nom: string; prenom: string; job?: Job }>({
    nom: '',
    prenom: '',
    job: undefined,
  });

  useEffect(() => {
    if (profile) {
      if (profile.onboardingDone) {
        navigate('/', { replace: true });
        return;
      }
      setForm({
        nom: profile.nom ?? '',
        prenom: profile.prenom ?? '',
        job: (profile.job as Job | undefined) ?? undefined,
      });
    }
  }, [profile, navigate]);

  const save = async () => {
    if (!form.nom || !form.prenom || !form.job) return;
    await updateProfile({
      nom: form.nom,
      prenom: form.prenom,
      job: form.job,
      onboardingDone: true,
      onboardingVersion: ONBOARDING_VERSION,
    });
    navigate('/bilan-types', { replace: true });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="p-8 md:p-12 bg-white">
        <h1 className="text-2xl font-bold mb-6">Bienvenue</h1>
        {error && (
          <div role="alert" className="text-red-600 mb-4">
            {error}
          </div>
        )}
        <div className="space-y-4 max-w-md">
          <Input
            name="prenom"
            value={form.prenom}
            onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
            placeholder="Prénom"
          />
          <Input
            name="nom"
            value={form.nom}
            onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            placeholder="Nom"
          />
          <div>
            <label className="block text-sm mb-1">Métier</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {form.job ? jobLabels[form.job] : 'Sélectionnez votre métier'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {jobOptions.map(({ id, label }) => (
                  <DropdownMenuItem
                    key={id}
                    onClick={() => setForm((f) => ({ ...f, job: id }))}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            onClick={save}
            disabled={loading || !form.nom || !form.prenom || !form.job}
            className="w-full"
          >
            Commencer
          </Button>
        </div>
      </div>
      <div className="p-8 md:p-12 bg-wood-50 flex items-center justify-center">
        <div className="max-w-md">
          <h2 className="text-xl font-semibold mb-2">
            Bienvenue sur Bilan Plume
          </h2>
          <p className="text-gray-600">
            Pour personnaliser votre expérience et générer des contenus adaptés
            à votre pratique, complétez vos informations de profil.
          </p>
        </div>
      </div>
    </div>
  );
}
