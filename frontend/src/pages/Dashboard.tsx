import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { apiFetch } from '../utils/api';
import { Button } from '../components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const token = useAuth((s) => s.token);
  const createBilan = async () => {
    const res = await apiFetch<{ id: string }>('/api/v1/bilans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    navigate(`/bilan/${res.id}`);
  };

  return (
    <div className="flex h-full items-center justify-center">
      <Button onClick={createBilan}>Rédiger un nouveau bilan</Button>
    </div>
  );
}
