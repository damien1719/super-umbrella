import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '../components/ui/button';
import { apiFetch } from '../utils/api';
import { useAuth } from '../store/auth';
import { useBilanDraft } from '../store/bilanDraft';

const RichTextEditor = lazy(() => import('../components/RichTextEditor'));

interface BilanData {
  id: string;
  descriptionHtml: string | null;
}

export default function Bilan() {
  const { bilanId } = useParams<{ bilanId: string }>();
  const navigate = useNavigate();
  const token = useAuth((s) => s.token);
  const [bilan, setBilan] = useState<BilanData | null>(null);
  const [editing, setEditing] = useState(false);
  const { descriptionHtml, setHtml, reset } = useBilanDraft();

  useEffect(() => {
    if (!bilanId) return;
    apiFetch<BilanData>(`/api/v1/bilans/${bilanId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(setBilan);
  }, [bilanId, token]);

  const save = async () => {
    if (!bilanId) return;
    const clean = DOMPurify.sanitize(descriptionHtml);
    const res = await apiFetch<BilanData>(`/api/v1/bilans/${bilanId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ descriptionHtml: clean }),
    });
    setBilan(res);
    reset();
    setEditing(false);
  };

  if (!bilan) return <div>Chargement...</div>;

  return (
    <div className="space-y-4">
      {editing ? (
        <Suspense fallback="Chargement...">
          <RichTextEditor initialHtml={descriptionHtml ?? ''} onChange={setHtml} />
        </Suspense>
      ) : (
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(bilan.descriptionHtml ?? ''),
          }}
        />
      )}
      {editing ? (
        <Button onClick={save}>Enregistrer</Button>
      ) : (
        <Button
          onClick={() => {
            setEditing(true);
            setHtml(bilan.descriptionHtml ?? '');
          }}
        >
          Modifier
        </Button>
      )}
      <Button variant="secondary" onClick={() => navigate('/bilans')}>
        Retour
      </Button>
    </div>
  );
}
