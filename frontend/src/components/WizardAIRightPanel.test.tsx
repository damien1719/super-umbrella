/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, react/display-name */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import WizardAIRightPanel from './WizardAIRightPanel';
import { vi, beforeEach } from 'vitest';
import React from 'react';
import {
  BilanGenerationProvider,
  useBilanGenerationContext,
  type BilanGenerationControls,
} from './wizard-ai/useBilanGeneration';

const mockApiFetch = vi.fn();

function GenerationConsumer({
  onReady,
}: {
  onReady: (controls: BilanGenerationControls) => void;
}) {
  const controls = useBilanGenerationContext();
  React.useEffect(() => {
    onReady(controls);
  }, [controls, onReady]);
  return null;
}

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />,
}));
vi.mock('@/components/ui/dialog', () => ({
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('./TrameCard', () => ({ default: () => null }));
vi.mock('./ui/creer-trame-modale', () => ({ default: () => null }));
vi.mock('./ExitConfirmation', () => ({ default: () => null }));
vi.mock('@/utils/api', () => ({ apiFetch: mockApiFetch }));
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual<typeof import('lucide-react')>(
    'lucide-react',
  );
  return {
    ...actual,
    Loader2: () => null,
    Plus: () => null,
    Wand2: () => null,
    X: () => null,
    Eye: () => null,
    EyeOff: () => null,
  };
});
vi.mock('@/store/auth', () => ({ useAuth: () => ({ token: 't' }) }));
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ tabs, active, onChange }: any) => (
    <div data-testid="tabs-mock">
      {tabs
        .filter((tab: any) => !tab.hidden)
        .map((tab: any) => (
          <button
            key={tab.key}
            type="button"
            data-active={tab.key === active}
            onClick={() => onChange?.(tab.key)}
          >
            {tab.label}
          </button>
        ))}
    </div>
  ),
}));
vi.mock('@/store/userProfile', () => ({
  useUserProfileStore: () => ({ profile: null, fetchProfile: vi.fn() }),
}));
vi.mock('@/store/bilanTypes', () => ({
  useBilanTypeStore: () => ({
    items: [
      {
        id: 'bt1',
        name: 'Bilan type 1',
        layoutJson: null,
        sections: [
          { sectionId: 'sec1', sortOrder: 0 },
          { sectionId: 'sec2', sortOrder: 1 },
        ],
      },
    ],
    fetchAll: vi.fn(),
  }),
}));
vi.mock('@/store/sections', () => ({
  useSectionStore: () => ({
    items: [
      { id: 'sec1', title: 'Section 1', schema: [] },
      { id: 'sec2', title: 'Section 2', schema: [] },
    ],
    fetchAll: vi.fn(),
  }),
}));
vi.mock('../bilan/LeftNavBilanType', () => ({
  __esModule: true,
  default: ({ items, onSelect, onToggleDisabled }: any) => (
    <div>
      {items
        .filter((item: any) => item.kind !== 'separator')
        .map((item: any) => (
          <div key={item.id}>
            <button type="button" onClick={() => onSelect(item.id)}>
              select-{item.id}
            </button>
            <button type="button" onClick={() => onToggleDisabled(item.id)}>
              toggle-{item.id}
            </button>
          </div>
        ))}
    </div>
  ),
}));
vi.mock('../bilan/InlineGroupChips', () => ({
  __esModule: true,
  default: () => <div data-testid="inline-group-chips" />,
}));
vi.mock('./bilan/DataEntry', () => {
  const React = require('react');
  return {
    DataEntry: React.forwardRef((_props: any, ref: any) => {
      const answersRef = React.useRef(_props.answers || {});
      React.useEffect(() => {
        answersRef.current = _props.answers || {};
      }, [_props.answers]);

      React.useImperativeHandle(ref, () => ({
        save: () => answersRef.current,
        load: () => {},
        clear: () => {
          answersRef.current = {};
          _props.onChange?.({});
        },
        getAnswers: () => answersRef.current,
      }));
      return <div data-testid="data-entry" />;
    }),
  };
});
vi.mock('./ImportNotes', () => ({
  __esModule: true,
  default: ({ onChange, onImageChange }: any) => (
    <div
      data-testid="import-notes"
      onClick={() => {
        onChange?.('imported');
        onImageChange?.('img');
      }}
    />
  ),
}));

beforeEach(() => {
  mockApiFetch.mockReset();
});

const sectionInfo = { id: 's1', title: 'Section 1' } as any;
const trame = { value: 't1', label: 'Trame 1' } as any;
const trameWithTemplate = {
  value: 't1',
  label: 'Trame 1',
  templateRefId: 'tpl1',
} as any;
const trameWithoutTemplate = { value: 't2', label: 'Trame 2' } as any;

test('fetches latest notes on entering step 2', async () => {
  mockApiFetch.mockImplementation(async (url: string) => {
    if (url.includes('latest=true')) {
      return [{ id: 'i1', contentNotes: { a: 1 } }];
    }
    if (url.includes('upsert')) {
      return { id: 'upsert' };
    }
    return [];
  });

  render(
    <WizardAIRightPanel
      sectionInfo={sectionInfo}
      trameOptions={[trame]}
      selectedTrame={trame}
      onTrameChange={() => {}}
      questions={[]}
      answers={{}}
      onAnswersChange={() => {}}
      onGenerate={() => {}}
      onGenerateFromTemplate={() => {}}
      isGenerating={false}
      bilanId="b1"
      onCancel={() => {}}
    />,
  );

  fireEvent.click(screen.getByText('Étape suivante'));

  await waitFor(() =>
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('latest=true'),
      expect.objectContaining({ headers: expect.any(Object) }),
    ),
  );
});

test('saves notes when generating with template', async () => {
  mockApiFetch.mockImplementation(async (url: string, options: any) => {
    if (url.includes('latest=true')) {
      return [];
    }
    if (url.includes('upsert')) {
      expect(options?.body).toContain('"sectionId":"t1"');
      return { id: 'inst1' };
    }
    return [];
  });

  const onGenerateFromTemplate = vi.fn();

  render(
    <WizardAIRightPanel
      sectionInfo={sectionInfo}
      trameOptions={[trameWithTemplate]}
      selectedTrame={trameWithTemplate}
      onTrameChange={() => {}}
      questions={[]}
      answers={{}}
      onAnswersChange={() => {}}
      onGenerate={() => {}}
      onGenerateFromTemplate={onGenerateFromTemplate}
      isGenerating={false}
      bilanId="b1"
      onCancel={() => {}}
    />,
  );

  fireEvent.click(screen.getByText('Étape suivante'));
  await waitFor(() =>
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('latest=true'),
      expect.anything(),
    ),
  );

  fireEvent.click(screen.getByText('Générer'));

  await waitFor(() =>
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('upsert'),
      expect.objectContaining({ method: 'POST' }),
    ),
  );
  expect(onGenerateFromTemplate).toHaveBeenCalledWith({}, '', 'inst1', undefined);
});

test('calls direct generate when no template', async () => {
  mockApiFetch.mockImplementation(async (url: string) => {
    if (url.includes('latest=true')) {
      return [];
    }
    if (url.includes('upsert')) {
      return { id: 'inst2' };
    }
    return [];
  });
  const onGenerate = vi.fn();
  render(
    <WizardAIRightPanel
      sectionInfo={sectionInfo}
      trameOptions={[trameWithoutTemplate]}
      selectedTrame={trameWithoutTemplate}
      onTrameChange={() => {}}
      questions={[]}
      answers={{}}
      onAnswersChange={() => {}}
      onGenerate={onGenerate}
      onGenerateFromTemplate={() => {}}
      isGenerating={false}
      bilanId="b1"
      onCancel={() => {}}
    />,
  );

  fireEvent.click(screen.getByText('Étape suivante'));
  await waitFor(() =>
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('latest=true'),
      expect.anything(),
    ),
  );

  fireEvent.click(screen.getByText('Générer'));

  await waitFor(() =>
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('upsert'),
      expect.objectContaining({ method: 'POST' }),
    ),
  );
  expect(onGenerate).toHaveBeenCalledWith({}, '', undefined);
});

test('supports controlled step transitions', async () => {
  mockApiFetch.mockResolvedValue([]);
  const onStepChange = vi.fn();

  const { rerender } = render(
    <WizardAIRightPanel
      sectionInfo={sectionInfo}
      trameOptions={[trame]}
      selectedTrame={trame}
      onTrameChange={() => {}}
      questions={[]}
      answers={{}}
      onAnswersChange={() => {}}
      onGenerate={() => {}}
      onGenerateFromTemplate={() => {}}
      isGenerating={false}
      bilanId="b1"
      onCancel={() => {}}
      step={1}
      onStepChange={onStepChange}
    />,
  );

  fireEvent.click(screen.getByText('Étape suivante'));
  expect(onStepChange).toHaveBeenCalledWith(2);

  rerender(
    <WizardAIRightPanel
      sectionInfo={sectionInfo}
      trameOptions={[trame]}
      selectedTrame={trame}
      onTrameChange={() => {}}
      questions={[]}
      answers={{}}
      onAnswersChange={() => {}}
      onGenerate={() => {}}
      onGenerateFromTemplate={() => {}}
      isGenerating={false}
      bilanId="b1"
      onCancel={() => {}}
      step={2}
      onStepChange={onStepChange}
    />,
  );

  await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(1));
  expect(mockApiFetch.mock.calls[0][0]).toContain('latest=true');
});

test('notifies parent when excluded sections change', async () => {
  mockApiFetch.mockResolvedValue([]);
  const onExcludedSectionsChange = vi.fn();

  render(
    <WizardAIRightPanel
      sectionInfo={sectionInfo}
      trameOptions={[trame]}
      selectedTrame={{ value: 'bt1', label: 'BT1' } as any}
      onTrameChange={() => {}}
      questions={[]}
      answers={{}}
      onAnswersChange={() => {}}
      onGenerate={() => {}}
      onGenerateFromTemplate={() => {}}
      isGenerating={false}
      bilanId="b1"
      onCancel={() => {}}
      mode="bilanType"
      initialStep={2}
      onExcludedSectionsChange={onExcludedSectionsChange}
    />,
  );

  fireEvent.click(screen.getByText('toggle-sec2'));

  await waitFor(() =>
    expect(onExcludedSectionsChange).toHaveBeenCalledWith(['sec2']),
  );
});

test('generateAll uses onGenerateAll with exclusions', async () => {
  mockApiFetch.mockImplementation(async (url: string, options: any) => {
    if (url.includes('latest=true')) {
      return [];
    }
    if (url.includes('upsert')) {
      expect(options?.body).toContain('"sectionId":"sec1"');
      return { id: 'inst-save' };
    }
    return [];
  });
  const onGenerateAll = vi.fn().mockResolvedValue(undefined);
  const handleReady = vi.fn();

  render(
    <BilanGenerationProvider>
      <WizardAIRightPanel
        sectionInfo={sectionInfo}
        trameOptions={[trame]}
        selectedTrame={{ value: 'bt1', label: 'BT1' } as any}
        onTrameChange={() => {}}
        questions={[]}
        answers={{}}
        onAnswersChange={() => {}}
        onGenerate={() => {}}
        onGenerateFromTemplate={() => {}}
        onGenerateAll={onGenerateAll}
        isGenerating={false}
        bilanId="b1"
        onCancel={() => {}}
        mode="bilanType"
        initialStep={2}
      />
      <GenerationConsumer onReady={handleReady} />
    </BilanGenerationProvider>,
  );

  await waitFor(() => expect(handleReady).toHaveBeenCalled());
  fireEvent.click(screen.getByText('toggle-sec2'));

  const controls = handleReady.mock.calls.at(-1)?.[0];
  if (!controls) throw new Error('generation controls not registered');
  await act(async () => {
    await controls.generateAll();
  });

  expect(onGenerateAll).toHaveBeenCalledWith('bt1', ['sec2']);
  expect(
    mockApiFetch.mock.calls.some(
      ([url, options]) =>
        url.includes('upsert') && options?.body?.includes('"sectionId":"sec1"'),
    ),
  ).toBe(true);
});

test('can switch notes mode for bilan type', async () => {
  mockApiFetch.mockResolvedValue([]);

  render(
    <WizardAIRightPanel
      sectionInfo={sectionInfo}
      trameOptions={[trame]}
      selectedTrame={{ value: 'bt1', label: 'BT1' } as any}
      onTrameChange={() => {}}
      questions={[]}
      answers={{}}
      onAnswersChange={() => {}}
      onGenerate={() => {}}
      onGenerateFromTemplate={() => {}}
      isGenerating={false}
      bilanId="b1"
      onCancel={() => {}}
      mode="bilanType"
      initialStep={2}
    />,
  );

  await waitFor(() =>
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('latest=true'),
      expect.anything(),
    ),
  );

  fireEvent.click(screen.getByText('Import des notes'));
  expect(screen.getByTestId('import-notes')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Saisie manuelle'));
  expect(screen.getByTestId('data-entry')).toBeInTheDocument();
});
