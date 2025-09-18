import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { InputField } from '../components/ui/input-field';
import { usePatientStore, Patient, PatientInput } from '../store/patients';
import { Loader2, ArrowLeft, Edit, Save, X, User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

export default function VuePatient() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { items, fetchAll, update } = usePatientStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);

  // États pour l'édition
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (patientId) {
      fetchAll()
        .then(() => {
          const foundPatient = items.find((p) => p.id === patientId);
          if (foundPatient) {
            setPatient(foundPatient);
            // Initialiser les champs seulement au premier chargement
            setFirstName(foundPatient.firstName || '');
            setLastName(foundPatient.lastName || '');
            setDob(foundPatient.dob ? foundPatient.dob.slice(0, 10) : '');
            setNotes(foundPatient.notes || '');
          }
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [patientId, fetchAll]); // Retirer items et isEditing des dépendances

  const handleSave = async () => {
    if (!patient || !patientId) return;

    try {
      const payload: Partial<PatientInput> = {
        firstName,
        lastName,
        dob: dob ? new Date(dob).toISOString() : undefined,
        notes: notes || undefined,
      };

      await update(patientId, payload);
      setIsEditing(false);

      // Mettre à jour le patient local
      setPatient({
        ...patient,
        ...payload,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleCancel = () => {
    if (patient) {
      setFirstName(patient.firstName || '');
      setLastName(patient.lastName || '');
      setDob(patient.dob ? patient.dob.slice(0, 10) : '');
      setNotes(patient.notes || '');
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-wood-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-wood-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Patient non trouvé
            </h1>
            <Button onClick={() => navigate('/patients')} variant="primary">
              Retour aux patients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wood-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/patients')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h1>
                <p className="text-gray-600">Informations du patient</p>
              </div>
            </div>
          </div>

          {!isEditing && (
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>

        {/* Contenu principal */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations anonymes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Prénom"
                  value={firstName}
                  onChange={setFirstName}
                  disabled={!isEditing}
                  required
                />
                {/* <InputField
                  label="Nom"
                  value={lastName}
                  onChange={setLastName}
                  disabled={!isEditing}
                  required
                /> */}
              </div>
            {/*   <InputField
                label="Date de naissance"
                value={dob}
                onChange={setDob}
                type="date"
                disabled={!isEditing}
              /> */}
              <InputField
                label="Notes"
                value={notes}
                onChange={setNotes}
                disabled={!isEditing}
                multiline
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions d'édition */}
          {isEditing && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button variant="primary" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
