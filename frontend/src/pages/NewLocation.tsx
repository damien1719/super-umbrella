import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LocationForm1 from '../components/LocationForm1';
import LocationForm2 from '../components/LocationForm2';
import LocataireForm from '../components/LocataireForm';
import { WizardProgress } from '../components/WizardProgress';
import { Button } from '../components/ui/button';
import { useLocationStore } from '../store/locations';
import { useLocataireStore } from '../store/locataires';
import { useUserProfileStore } from '../store/userProfile';
import { useAuth } from '../store/auth';
import { buildUrl } from '../utils/api';
import type { NewLocation, NewLocataire } from '@monorepo/shared';

export default function NewLocation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { returnTo?: string } };
  const createLocation = useLocationStore((s) => s.createForBien);
  const createLocataire = useLocataireStore((s) => s.create);
  const profile = useUserProfileStore((s) => s.profile);
  const token = useAuth((s) => s.token);
  const [step, setStep] = useState(1);
  const [locationData, setLocationData] = useState<Partial<NewLocation>>({});
  const [clauseData, setClauseData] = useState<Partial<NewLocation>>({});
  const [locataireData, setLocataireData] = useState<Partial<NewLocataire>>({});

  if (!id) return <div>Bien introuvable</div>;

  const next = () => setStep((s) => Math.min(3, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    const location = await createLocation(id, {
      ...locationData,
      ...clauseData,
    } as NewLocation);
    await createLocataire({
      ...locataireData,
      bienId: id,
      locationId: location.id,
    } as NewLocataire);
    if (state?.returnTo === 'dashboard' && id) {
      navigate(`/biens/${id}/dashboard`);
    } else {
      navigate('/biens');
    }
  };

  const submitAndGenerate = async () => {
    await submit();
    if (!profile || !token) return;
    const res = await fetch(
      buildUrl(
        `/api/v1/bails/location-meublee?bailleurNom=${encodeURIComponent(profile.nom)}&bailleurPrenom=${encodeURIComponent(profile.prenom)}`,
      ),
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bail.docx';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  let content = null;
  if (step === 1) {
    content = <LocationForm1 data={locationData} onChange={setLocationData} />;
  } else if (step === 2) {
    content = <LocationForm2 data={clauseData} onChange={setClauseData} />;
  } else {
    content = (
      <LocataireForm data={locataireData} onChange={setLocataireData} />
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1>Nouvelle location</h1>
      <WizardProgress step={step} total={3} />
      {content}
      <div className="flex justify-between pt-4">
        {step > 1 && (
          <Button variant="secondary" onClick={prev} type="button">
            Précédent
          </Button>
        )}
        {step < 3 ? (
          <Button variant="primary" onClick={next} type="button">
            Suivant
          </Button>
        ) : (
          <div className="space-x-2">
            <Button variant="primary" onClick={submit} type="button">
              Valider
            </Button>
            <Button
              variant="secondary"
              onClick={submitAndGenerate}
              type="button"
            >
              Valider et générer le bail pré-rempli
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
