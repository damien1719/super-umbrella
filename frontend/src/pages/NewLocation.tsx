import { useParams, useNavigate } from 'react-router-dom';
import LocationForm from '../components/LocationForm';

export default function NewLocation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <div>Bien introuvable</div>;
  return (
    <div className="space-y-4">
      <h1>Nouvelle location</h1>
      <LocationForm bienId={id} onCancel={() => navigate('/biens')} />
    </div>
  );
}
