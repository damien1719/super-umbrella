import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Bilan() {
  const { bilanId } = useParams<{ bilanId: string }>();
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <p className="text-gray-500">Bilan {bilanId}</p>
      <Button variant="secondary" onClick={() => navigate('/')}>
        Retour
      </Button>
    </div>
  );
}
