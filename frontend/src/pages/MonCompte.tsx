import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '../../../shared/src/types/UserProfile';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useUserProfileStore } from '../store/userProfile';
import { formatPhone } from '../utils/formatPhone';
import { validateEmail } from '../utils/validateEmail';

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
  const [form, setForm] = useState<Pick<UserProfile, 'nom' | 'prenom'> & { job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' }>(
    {
      nom: '',
      prenom: '',
      job: undefined,
    },
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile)
      setForm({ nom: profile.nom ?? '', prenom: profile.prenom ?? '', job: profile.job as any });
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      <h1 className="text-2xl font-bold">Mon compte</h1>
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
          <label className="block text-sm mb-1">Profil</label>
          <select
            name="job"
            value={form.job ?? ''}
            onChange={handleChange}
            disabled={!editing}
            className="border rounded px-3 py-2 w-full text-sm"
            required
          >
            <option value="" disabled>
              Sélectionnez votre profil
            </option>
            <option value="PSYCHOMOTRICIEN">Psychomotricien</option>
            <option value="ERGOTHERAPEUTE">Ergothérapeute</option>
            <option value="NEUROPSYCHOLOGUE">Neuropsychologue</option>
          </select>
        </div>
        {editing ? (
          <Button type="submit" disabled={loading} className="w-full">
            Enregistrer
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => setEditing(true)}
            variant="outline"
            className="w-full"
          >
            Modifier
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
