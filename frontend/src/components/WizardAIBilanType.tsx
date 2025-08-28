import { useEffect, useMemo, useState } from 'react';
import WizardAIRightPanel, { type WizardAIRightPanelProps } from './WizardAIRightPanel';
import { Button } from '@/components/ui/button';

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
}

export default function WizardAIBilanType({
  mode = 'section',
  api,
  stepTextOverrides,
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

  // Track active test (section) name from inner panel to label the button
  const [activeTestTitle, setActiveTestTitle] = useState<string>('test sélectionné');
  useEffect(() => {
    const onActiveChanged = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string | null; title: string }>).detail;
      if (detail && detail.title) setActiveTestTitle(detail.title);
    };
    window.addEventListener('bilan-type:active-changed', onActiveChanged as EventListener);
    return () => window.removeEventListener('bilan-type:active-changed', onActiveChanged as EventListener);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <WizardAIRightPanel
          mode={mode}
          {...rest}
          selectedTrame={mode === 'bilanType' ? (selectedTrame as any) : rest.selectedTrame}
          onTrameChange={mode === 'bilanType' ? onTrameChange : rest.onTrameChange}
        />
      </div>
      {mode === 'bilanType' && (
        <div className="px-4 py-3 border-t bg-white sticky bottom-0 z-20">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const evt = new Event('bilan-type:generate-selected');
                window.dispatchEvent(evt);
              }}
              type="button"
            >
              Générer "{activeTestTitle}"
            </Button>
            <Button
              onClick={() => {
                const evt = new Event('bilan-type:generate-all');
                window.dispatchEvent(evt);
              }}
              type="button"
            >
              Générer tous les tests
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
