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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mes patients
              </h1>
              <p className="text-gray-600">
                Gérez votre liste de patients
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
            >
              Ajouter un patient
            </Button>
          </div>
        </div>
        {showForm && (
          <PatientForm
            patient={editing}
            onCancel={() => {
              setEditing(null);
              setShowForm(false);
            }}
          />
        )}
        <div className="space-y-4">
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
      </div>
    </div>
  );
}
