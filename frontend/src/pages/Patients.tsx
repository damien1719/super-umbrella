import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import PatientForm from '../components/PatientForm';
import { usePatientStore, Patient } from '../store/patients';

export default function Patients() {
  const { items, fetchAll, remove } = usePatientStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);

  useEffect(() => {
    fetchAll().catch(() => {
      /* ignore */
    });
  }, [fetchAll]);

  return (
    <div className="space-y-4">
      {showForm && (
        <PatientForm
          patient={editing}
          onCancel={() => {
            setEditing(null);
            setShowForm(false);
          }}
        />
      )}
      <div className="flex justify-between items-center">
        <h1>Mes patients</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          Nouveau patient
        </Button>
      </div>
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id} className="border p-2 rounded flex justify-between">
            <span>
              {p.firstName} {p.lastName}
            </span>
            <span className="space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditing(p);
                  setShowForm(true);
                }}
              >
                Modifier
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => remove(p.id)}
              >
                Supprimer
              </Button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
