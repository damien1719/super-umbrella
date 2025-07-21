import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { apiFetch } from '../utils/api';

export default function Home() {
  const navigate = useNavigate();

  const handleClick = async () => {
    const { id } = await apiFetch<{ id: string }>('/api/bilans', {
      method: 'POST',
    });
    navigate(`/bilan/${id}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button onClick={handleClick}>Rédiger un nouveau bilan</Button>
    </div>
  );
}
