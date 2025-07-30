import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy, useRef } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { apiFetch } from '../utils/api';
import { useAuth } from '../store/auth';
import { useBilanDraft } from '../store/bilanDraft';

const RichTextEditor = lazy(() => import('../components/RichTextEditor'));
const AiRightPanel = lazy(() => import('../components/AiRightPanel'));

interface BilanData {
  id: string;
  descriptionHtml: string | null;
}

import type { RichTextEditorHandle } from '../components/RichTextEditor';

export default function Bilan() {
  const { bilanId } = useParams<{ bilanId: string }>();
  const navigate = useNavigate();
  const token = useAuth((s) => s.token);
  const [bilan, setBilan] = useState<BilanData | null>(null);
  const { descriptionHtml, setHtml, reset } = useBilanDraft();
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasChanges = bilan?.descriptionHtml !== descriptionHtml;

  const handleBack = () => {
    if (hasChanges) {
      setShowConfirm(true);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    if (!bilanId) return;
    apiFetch<BilanData>(`/api/v1/bilans/${bilanId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((data) => {
      setBilan(data);
      setHtml(data.descriptionHtml ?? '');
    });
  }, [bilanId, token, setHtml]);

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
  };

  if (!bilan) return <div>Chargement...</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex items-center bg-white border border-gray-300 p-4">
        <Button variant="ghost" onClick={handleBack} className="px-2 py-1">
          Retour
        </Button>
        <h1 className="flex-1 text-center text-lg font-semibold">Mon Bilan</h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          <div className="flex-1">
            <Suspense fallback="Chargement...">
              <RichTextEditor
                ref={editorRef}
                initialHtml={descriptionHtml ?? ''}
                onChange={setHtml}
                onSave={save}
              />
            </Suspense>
          </div>
          <div className="block w-104 border-l border-gray-300 overflow-auto shadow-sm ">
            <Suspense fallback="Chargement...">
              {bilanId && (
                <AiRightPanel
                  bilanId={bilanId}
                  onInsertText={(text) => editorRef.current?.insertHtml(text)}
                />
              )}
            </Suspense>
          </div>
        </div>
      </div>
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Souhaitez-vous conserver les modifications apportées ?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => navigate('/')}>
              Non
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await save();
                navigate('/');
              }}
            >
              Oui
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
