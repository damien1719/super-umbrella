import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '@monorepo/shared';
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
  const [form, setForm] = useState<UserProfile>({
    nom: '',
    prenom: '',
    email: '',
    telephonePersoNum: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const save = async () => {
    if (!validateEmail(form.email)) {
      alert('Email invalide');
      return;
    }
    await updateProfile({
      ...form,
      telephonePersoNum: formatPhone(form.telephonePersoNum),
    });
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
        <Input
          name="email"
          value={form.email}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Email"
        />
        <Input
          name="telephonePersoNum"
          value={form.telephonePersoNum}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Téléphone"
        />
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
