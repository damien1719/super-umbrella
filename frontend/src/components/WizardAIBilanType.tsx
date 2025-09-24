import { useEffect, useMemo, useState } from 'react';
import WizardAIRightPanel, {
  type WizardAIRightPanelProps,
} from './WizardAIRightPanel';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface WizardAIBilanTypeProps extends WizardAIRightPanelProps {
  mode?: 'section' | 'bilanType';
  api?: {
    preloadLatest?: (...args: unknown[]) => Promise<unknown>;
    saveNotes?: (...args: unknown[]) => Promise<unknown>;
  };
  stepTextOverrides?: {
    header1?: string;
    header2?: string;
    stepTitles?: string[];
  };
  currentStep?: number;
}

export default function WizardAIBilanType({
  mode = 'section',
  api,
  stepTextOverrides,
  currentStep: externalCurrentStep = 1, // Valeur par défaut à 1
  ...rest
}: WizardAIBilanTypeProps) {
  // Currently, the additional props are not used but kept for future
  // extensions when handling different modes or custom wording.
  void mode;
  void api;
  void stepTextOverrides;

  // Allow internal selection when used for BilanType without external state
  const [localTrameId, setLocalTrameId] = useState<string | undefined>(
    (rest.selectedTrame as any)?.value,
  );

  const selectedTrame = useMemo(() => {
    const opts = (rest.trameOptions as any[]) || [];
    const id = localTrameId ?? (rest.selectedTrame as any)?.value;
    return opts.find((o) => o.value === id);
  }, [localTrameId, rest.trameOptions, rest.selectedTrame]);

  const onTrameChange = (value: string) => {
    if (mode === 'bilanType') setLocalTrameId(value);
    // fallback to external handler if provided
    rest.onTrameChange?.(value);
  };

  useEffect(() => {
    if (externalCurrentStep !== undefined) {
      setCurrentStep(externalCurrentStep);
    }
  }, [externalCurrentStep]);

  // Track active test (section) name from inner panel to label the button
  const [activeTestTitle, setActiveTestTitle] =
    useState<string>('test sélectionné');
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [isFooterGenerating, setIsFooterGenerating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  useEffect(() => {
    const onActiveChanged = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string | null; title: string }>)
        .detail;
      if (detail && detail.title) setActiveTestTitle(detail.title);
    };
    const onExcludedChanged = (e: Event) => {
      const detail = (e as CustomEvent<string[]>).detail;
      setExcludedIds(Array.isArray(detail) ? detail : []);
    };
    const onStepChanged = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === 'number') setCurrentStep(detail);
    };
    window.addEventListener(
      'bilan-type:active-changed',
      onActiveChanged as EventListener,
    );
    window.addEventListener(
      'bilan-type:excluded-changed',
      onExcludedChanged as EventListener,
    );
    window.addEventListener(
      'bilan-type:step-changed',
      onStepChanged as EventListener,
    );
    return () => {
      window.removeEventListener(
        'bilan-type:active-changed',
        onActiveChanged as EventListener,
      );
      window.removeEventListener(
        'bilan-type:excluded-changed',
        onExcludedChanged as EventListener,
      );
      window.removeEventListener(
        'bilan-type:step-changed',
        onStepChanged as EventListener,
      );
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <WizardAIRightPanel
          mode={mode}
          {...rest}
          selectedTrame={
            mode === 'bilanType' ? (selectedTrame as any) : rest.selectedTrame
          }
          onTrameChange={
            mode === 'bilanType' ? onTrameChange : rest.onTrameChange
          }
        />
      </div>
      {mode === 'bilanType' && currentStep === 2 && (
        <div className="px-4 py-3 border-t border-wood-200 shadow-sm bg-white sticky bottom-0 z-20">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const evt = new Event('bilan-type:prev');
                window.dispatchEvent(evt);
              }}
              type="button"
              disabled={isFooterGenerating}
            >
              Précédent
            </Button>

            <div className="flex items-center gap-2">
              {/* <Button
                variant="secondary"
                onClick={() => {
                  setIsFooterGenerating(true);
                  const evt = new Event('bilan-type:generate-selected');
                  window.dispatchEvent(evt);
                }}
                type="button"
                disabled={isFooterGenerating}
              >
                {isFooterGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>Générer "{activeTestTitle}"</>
                )}
              </Button> */}
              <Button
                onClick={() => {
                  setIsFooterGenerating(true);
                  // Save current section before bulk generation
                  const saveEvt = new Event('bilan-type:save-current');
                  window.dispatchEvent(saveEvt);
                  // Prefer direct callback if provided, else fallback to legacy event
                  if (rest.onGenerateAll && selectedTrame?.value) {
                    rest.onGenerateAll(selectedTrame.value, excludedIds);
                  } else {
                    const evt = new Event('bilan-type:generate-all');
                    window.dispatchEvent(evt);
                  }
                }}
                type="button"
                disabled={isFooterGenerating}
              >
                {isFooterGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>Générer tous les tests</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
