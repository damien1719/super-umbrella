import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import PatientForm from '../components/PatientForm';
import { usePatientStore, Patient } from '../store/patients';
import GenericTable from '../components/bilans/GenericTable';
import { Loader2 } from 'lucide-react';

export default function Patients() {
  const { items, fetchAll, remove } = usePatientStore();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAll()
      .then(() => setIsLoading(false))
      .catch(() => {
        /* ignore */
      });
  }, [fetchAll]);

  return (
    <div className="bg-wood-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mes patients
              </h1>
              <p className="text-gray-600">Gérez votre liste de patients</p>
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
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <GenericTable
              variant="patient"
              items={items}
              onSelect={(id) => {
                navigate(`/patients/${id}`);
              }}
              onDelete={(item) => remove(item.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
