import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '../../../shared/src/types/UserProfile';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useUserProfileStore } from '../store/userProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Job, jobOptions, jobLabels } from '../types/job';
import { Pencil } from 'lucide-react';

export default function MonCompteV2() {
  const navigate = useNavigate();
  const {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    deleteProfile,
  } = useUserProfileStore();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<
    Pick<UserProfile, 'nom' | 'prenom'> & { job?: Job }
  >({
    nom: '',
    prenom: '',
    job: undefined,
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile)
      setForm({
        nom: profile.nom ?? '',
        prenom: profile.prenom ?? '',
        job: profile.job as Job | undefined,
      });
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const save = async () => {
    if (!form.nom || !form.prenom || !form.job) {
      alert('Veuillez renseigner Nom, Prénom et Profil');
      return;
    }
    await updateProfile({ nom: form.nom, prenom: form.prenom, job: form.job });
    setEditing(false);
  };

  const remove = async () => {
    if (
      window.confirm(
        'Attention : cette opération est irréversible.\nSouhaitez-vous vraiment supprimer votre compte ?',
      )
    ) {
      await deleteProfile();
      navigate('/');
    }
  };

  if (loading && !editing) return <div>Chargement...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon compte</h1>
        {!editing && (
          <Button
            type="button"
            variant="icon"
            size="icon"
            aria-label="Modifier le profil"
            onClick={() => setEditing(true)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </div>
      {error && (
        <div role="alert" className="text-red-600">
          {error}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-4"
      >
        <Input
          name="nom"
          value={form.nom}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Nom"
        />
        <Input
          name="prenom"
          value={form.prenom}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Prénom"
        />
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={!editing}>
              <Button variant="outline" className="w-full justify-between">
                {form.job ? jobLabels[form.job] : 'Sélectionnez votre profil'}
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
        {editing && (
          <Button type="submit" disabled={loading} className="w-full">
            Enregistrer
          </Button>
        )}
      </form>
      <Button
        onClick={remove}
        disabled={loading}
        variant="destructive"
        className="w-full"
      >
        Supprimer mon profil
      </Button>
    </div>
  );
}
