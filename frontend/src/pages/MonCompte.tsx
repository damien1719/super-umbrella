import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '@monorepo/shared';
import { useUserProfileStore } from '../store/userProfile';
import { formatPhone } from '../utils/formatPhone';
import { validateEmail } from '../utils/validateEmail';

export default function MonCompte() {
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
    telephone: '',
    adresse: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // met à jour le formulaire quand le profil est chargé
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
    await updateProfile({ ...form, telephone: formatPhone(form.telephone) });
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
    <div>
      <h1>Mon compte</h1>
      {error && <div role="alert">{error}</div>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-2"
      >
        <input
          name="nom"
          value={form.nom}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Nom"
        />
        <input
          name="prenom"
          value={form.prenom}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Prénom"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Email"
        />
        <input
          name="telephone"
          value={form.telephone}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Téléphone"
        />
        <input
          name="adresse"
          value={form.adresse}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Adresse"
        />
        {editing ? (
          <button type="submit" disabled={loading}>
            Enregistrer
          </button>
        ) : (
          <button type="button" onClick={() => setEditing(true)}>
            Modifier
          </button>
        )}
      </form>
      <button onClick={remove} disabled={loading}>
        Supprimer mon profil
      </button>
    </div>
  );
}
