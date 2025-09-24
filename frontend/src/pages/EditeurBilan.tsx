import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy, useRef } from 'react';
import TopBarEditeurBilan from '../components/TopBarEditeurBilan';
import ExitConfirmation from '../components/ExitConfirmation';
import { apiFetch } from '../utils/api';
import { useAuth } from '../store/auth';
import { useBilanDraft } from '../store/bilanDraft';
import SelectionOverlay from '../components/SelectionOverlay';
import { useEditorUi } from '../store/editorUi';
import { downloadDocx } from '@/lib/docxExport';

const RichTextEditor = lazy(() => import('../components/RichTextEditor'));
const AiRightPanel = lazy(() => import('../components/AiRightPanel'));

interface BilanData {
  id: string;
  title: string;
  descriptionJson: unknown | null;
}

import type { RichTextEditorHandle } from '../components/RichTextEditor';

export default function Bilan() {
  const { bilanId } = useParams<{ bilanId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state?: {
      wizardSection?: string;
      trameId?: string;
      wizardBilanType?: boolean;
      bilanTypeId?: string;
      bilanTypeStep?: number;
      mode?: 'section' | 'bilanType';
    };
  };
  const token = useAuth((s) => s.token);
  const [bilan, setBilan] = useState<BilanData | null>(null);
  const { descriptionJson, setStateJson, reset } = useBilanDraft();
  const editorRef = useRef<RichTextEditorHandle>(null);
  const fetchKeyRef = useRef<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const setMode = useEditorUi((s) => s.setMode);
  const setSelection = useEditorUi((s) => s.setSelection);

  const hasChanges =
    JSON.stringify(bilan?.descriptionJson ?? null) !==
    JSON.stringify(descriptionJson ?? null);

  const handleBack = async () => {
    if (hasChanges) {
      setShowConfirm(true);
    } else {
      await save();
      reset();
      navigate(-1);
    }
  };

  useEffect(() => {
    if (!bilanId || !token) return;
    const key = `${bilanId}:${token}`;
    if (fetchKeyRef.current === key) return;
    fetchKeyRef.current = key;
    apiFetch<BilanData>(`/api/v1/bilans/${bilanId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        setBilan(data);
        setStateJson(data.descriptionJson ?? null);
      })
      .catch((e) => {
        console.error('[EditeurBilan] fetch bilan failed', e);
        // Allow retry on next render in case of error
        fetchKeyRef.current = null;
      });
  }, [bilanId, token, setStateJson]);

  useEffect(() => {
    return () => {
      setMode('idle');
      setSelection(null);
    };
  }, [setMode, setSelection]);

  const save = async (opts?: { title?: string }) => {
    if (!bilanId || !bilan) return;
    const res = await apiFetch<BilanData>(`/api/v1/bilans/${bilanId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: opts?.title ?? bilan.title,
        descriptionJson,
      }),
    });
    setBilan(res);
  };

  if (!bilan) return <div>Chargement...</div>;

  const handleSaveTitle = async (newTitle: string) => {
    if (!bilan) return;
    setBilan({ ...bilan, title: newTitle });
    await save({ title: newTitle });
  };

  const handleExport = async () => {
    try {
      const fullHtml = editorRef.current?.getHtmlForExport?.();
      if (!fullHtml) return;
      await downloadDocx(fullHtml, `${bilan.title || 'Bilan'}.docx`);
    } catch (e) {
      // Silently ignore for now; could add toast
      console.error('Export DOCX failed', e);
    }
  };

  console.log("initialWizardSection", state?.wizardSection);
  console.log("initialTrameId", state?.trameId);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBarEditeurBilan
        title={bilan.title}
        onBack={handleBack}
        onSaveTitle={handleSaveTitle}
        onExport={handleExport}
      />

      <div className="flex-1 overflow-hidden">
        <div className="flex h-full overflow-hidden">
          <div className="flex-1 min-w-0">
            <Suspense fallback="Chargement...">
              <RichTextEditor
                ref={editorRef}
                initialStateJson={descriptionJson ?? null}
                onChangeStateJson={setStateJson}
                onSave={save}
                exportFileName={bilan.title || 'Bilan'}
              />
            </Suspense>
            <SelectionOverlay />
          </div>
          <div className="block w-[26rem] min-w-[26rem] flex-shrink-0 border-l border-wood-300 overflow-auto shadow-sm ">
            <Suspense fallback="Chargement...">
              {bilanId && (
                <AiRightPanel
                  bilanId={bilanId}
                  onInsertText={(text) => editorRef.current?.insertHtml(text)}
                  onSetEditorStateJson={(st) => {
                    console.log(
                      '[EditeurBilan] onSetEditorStateJson called with:',
                      st,
                    );
                    editorRef.current?.setEditorStateJson(st);
                  }}
                  onSave={save}
                  initialWizardSection={state?.wizardSection}
                  initialTrameId={state?.trameId}
                  openWizardBilanType={state?.wizardBilanType}
                  initialBilanTypeId={state?.bilanTypeId}
                  initialBilanTypeStep={state?.bilanTypeStep}
                  mode={state?.mode}
                  currentStep={state?.bilanTypeStep}
                />
              )}
            </Suspense>
          </div>
        </div>
      </div>
      <ExitConfirmation
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={async () => {
          await save();
          navigate('/');
        }}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}
