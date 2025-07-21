import { useState } from 'react';
import { InputField } from './ui/input-field';
import { Button } from './ui/button';
import { usePatientStore, Patient, PatientInput } from '../store/patients';

interface PatientFormProps {
  patient?: Patient | null;
  onCancel: () => void;
}

export default function PatientForm({ patient, onCancel }: PatientFormProps) {
  const isEdit = Boolean(patient);
  const [firstName, setFirstName] = useState(patient?.firstName ?? '');
  const [lastName, setLastName] = useState(patient?.lastName ?? '');
  const [dob, setDob] = useState(patient?.dob ? patient.dob.slice(0, 10) : '');
  const [notes, setNotes] = useState(patient?.notes ?? '');
  const { create, update } = usePatientStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PatientInput = {
      firstName,
      lastName,
      dob: dob ? new Date(dob).toISOString() : undefined,
      notes: notes || undefined,
    };
    if (isEdit && patient) {
      await update(patient.id, payload);
    } else {
      await create(payload);
    }
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border p-4 rounded">
      <InputField
        label="Prénom"
        value={firstName}
        onChange={setFirstName}
        required
      />
      <InputField
        label="Nom"
        value={lastName}
        onChange={setLastName}
        required
      />
      <InputField
        label="Date de naissance"
        value={dob}
        onChange={setDob}
        type="date"
      />
      <InputField label="Notes" value={notes} onChange={setNotes} />
      <div className="space-x-2">
        <Button variant="primary" type="submit">
          Valider
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
