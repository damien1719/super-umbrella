import { useEffect, useMemo, useRef, useState } from 'react';
import WizardAIRightPanel, {
  type WizardAIRightPanelHandle,
  type WizardAIRightPanelProps,
} from './WizardAIRightPanel';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface WizardAIBilanTypeProps
  extends Omit<
    WizardAIRightPanelProps,
    | 'step'
    | 'onStepChange'
    | 'onActiveSectionChange'
    | 'onExcludedSectionsChange'
  > {
  mode?: 'section' | 'bilanType';
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onActiveSectionChange?: (info: { id: string | null; title: string }) => void;
  onExcludedSectionsChange?: (ids: string[]) => void;
}

export default function WizardAIBilanType({
  mode = 'section',
  currentStep: externalCurrentStep,
  onStepChange: onStepChangeProp,
  onActiveSectionChange: onActiveSectionChangeProp,
  onExcludedSectionsChange: onExcludedSectionsChangeProp,
  ...rest
}: WizardAIBilanTypeProps) {
  const panelRef = useRef<WizardAIRightPanelHandle | null>(null);

  const [localTrameId, setLocalTrameId] = useState<string | undefined>(
    rest.selectedTrame?.value,
  );

  const selectedTrame = useMemo(() => {
    const options = rest.trameOptions || [];
    const id = localTrameId ?? rest.selectedTrame?.value;
    return options.find((option) => option.value === id);
  }, [localTrameId, rest.trameOptions, rest.selectedTrame]);

  const handleTrameChange = (value: string) => {
    if (mode === 'bilanType') setLocalTrameId(value);
    rest.onTrameChange?.(value);
  };

  useEffect(() => {
    if (mode !== 'bilanType') return;
    const externalValue = rest.selectedTrame?.value;
    if (externalValue && externalValue !== localTrameId) {
      setLocalTrameId(externalValue);
    }
  }, [mode, rest.selectedTrame, localTrameId]);

  const initialStep = rest.initialStep ?? 1;
  const [localStep, setLocalStep] = useState<number>(
    externalCurrentStep ?? initialStep,
  );
  const isStepControlled = externalCurrentStep !== undefined;
  const currentStep = isStepControlled
    ? (externalCurrentStep as number)
    : localStep;

  useEffect(() => {
    if (!isStepControlled) {
      setLocalStep(initialStep);
    }
  }, [initialStep, isStepControlled]);

  useEffect(() => {
    if (externalCurrentStep !== undefined) {
      setLocalStep(externalCurrentStep);
    }
  }, [externalCurrentStep]);

  const handleStepChange = (next: number) => {
    if (!isStepControlled) {
      setLocalStep(next);
    }
    onStepChangeProp?.(next);
  };

  const [isFooterGenerating, setIsFooterGenerating] = useState(false);

  const handleActiveSectionChange = (info: {
    id: string | null;
    title: string;
  }) => {
    onActiveSectionChangeProp?.(info);
  };

  const handleExcludedSectionsChange = (ids: string[]) => {
    onExcludedSectionsChangeProp?.(ids);
  };

  const handlePrev = () => {
    if (currentStep <= 1) return;
    handleStepChange(currentStep - 1);
  };

  const handleGenerateAll = async () => {
    if (!panelRef.current) return;
    setIsFooterGenerating(true);
    try {
      await panelRef.current.generateAllSections();
    } finally {
      setIsFooterGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <WizardAIRightPanel
          ref={panelRef}
          mode={mode}
          {...rest}
          step={currentStep}
          onStepChange={handleStepChange}
          onActiveSectionChange={handleActiveSectionChange}
          onExcludedSectionsChange={handleExcludedSectionsChange}
          selectedTrame={
            mode === 'bilanType' ? selectedTrame : rest.selectedTrame
          }
          onTrameChange={
            mode === 'bilanType' ? handleTrameChange : rest.onTrameChange
          }
        />
      </div>

      {mode === 'bilanType' && currentStep === 2 && (
        <div className="px-4 py-3 border-t border-wood-200 shadow-sm bg-white sticky bottom-0 z-20">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="secondary"
              onClick={handlePrev}
              type="button"
              disabled={isFooterGenerating}
            >
              Précédent
            </Button>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleGenerateAll}
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
