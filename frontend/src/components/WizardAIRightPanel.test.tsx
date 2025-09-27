/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, react/display-name */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import WizardAIRightPanel from './WizardAIRightPanel';
import { vi, beforeEach } from 'vitest';
import React from 'react';
import {
  BilanGenerationProvider,
  DEFAULT_GENERATION_CONTROLS,
  useBilanGenerationContext,
} from './wizard-ai/useBilanGeneration';

const mockLoadLatest = vi.fn();
const mockSave = vi.fn();
const mockMarkSaved = vi.fn();

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
vi.mock('./wizard-ai/useSectionInstance', () => ({
  useSectionInstance: () => ({
    instanceId: null,
    isLoading: false,
    isSaving: false,
    loadLatest: mockLoadLatest,
    save: mockSave,
    resetInstance: vi.fn(),
  }),
}));
vi.mock('./wizard-ai/useAutosave', () => ({
  useAutosave: () => ({ markSaved: mockMarkSaved }),
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
  mockLoadLatest.mockReset();
  mockSave.mockReset();
  mockMarkSaved.mockReset();
});

function renderWithProvider(props: Record<string, any>) {
  let controls = DEFAULT_GENERATION_CONTROLS;

  const Collector = () => {
    controls = useBilanGenerationContext();
    return null;
  };

  render(
    <BilanGenerationProvider>
      <WizardAIRightPanel {...props} />
      <Collector />
    </BilanGenerationProvider>,
  );

  return {
    getControls: () => controls,
  };
}

const sectionInfo = { id: 's1', title: 'Section 1' } as any;
const trame = { value: 't1', label: 'Trame 1' } as any;
const trameWithTemplate = {
  value: 't1',
  label: 'Trame 1',
  templateRefId: 'tpl1',
} as any;
const trameWithoutTemplate = { value: 't2', label: 'Trame 2' } as any;

test('fetches latest notes on entering step 2', async () => {
  mockLoadLatest.mockResolvedValueOnce({ id: 'i1', answers: { a: 1 } });

  renderWithProvider({
    sectionInfo,
    trameOptions: [trame],
    selectedTrame: trame,
    onTrameChange: () => {},
    questions: [],
    answers: {},
    onAnswersChange: () => {},
    onGenerate: () => {},
    onGenerateFromTemplate: () => {},
    isGenerating: false,
    bilanId: 'b1',
    onCancel: () => {},
  });

  fireEvent.click(screen.getByText('Étape suivante'));

  await waitFor(() => expect(mockLoadLatest).toHaveBeenCalledTimes(1));
  expect(mockMarkSaved).toHaveBeenCalledWith({ a: 1 });
});

test('saves notes when generating with template', async () => {
  mockLoadLatest.mockResolvedValueOnce(null);
  mockSave.mockResolvedValueOnce('inst1');

  const onGenerateFromTemplate = vi.fn();

  renderWithProvider({
    sectionInfo,
    trameOptions: [trameWithTemplate],
    selectedTrame: trameWithTemplate,
    onTrameChange: () => {},
    questions: [],
    answers: {},
    onAnswersChange: () => {},
    onGenerate: () => {},
    onGenerateFromTemplate,
    isGenerating: false,
    bilanId: 'b1',
    onCancel: () => {},
  });

  fireEvent.click(screen.getByText('Étape suivante'));
  await waitFor(() => expect(mockLoadLatest).toHaveBeenCalled());

  fireEvent.click(screen.getByText('Générer'));

  await waitFor(() => expect(mockSave).toHaveBeenCalled());
  expect(mockSave).toHaveBeenCalledWith({}, { sectionId: 't1' });
  expect(onGenerateFromTemplate).toHaveBeenCalledWith({}, '', 'inst1', undefined);
});

test('calls direct generate when no template', async () => {
  mockLoadLatest.mockResolvedValueOnce(null);
  mockSave.mockResolvedValueOnce('inst2');
  const onGenerate = vi.fn();
  renderWithProvider({
    sectionInfo,
    trameOptions: [trameWithoutTemplate],
    selectedTrame: trameWithoutTemplate,
    onTrameChange: () => {},
    questions: [],
    answers: {},
    onAnswersChange: () => {},
    onGenerate,
    onGenerateFromTemplate: () => {},
    isGenerating: false,
    bilanId: 'b1',
    onCancel: () => {},
  });

  fireEvent.click(screen.getByText('Étape suivante'));
  await waitFor(() => expect(mockLoadLatest).toHaveBeenCalled());

  fireEvent.click(screen.getByText('Générer'));

  await waitFor(() => expect(mockSave).toHaveBeenCalled());
  expect(onGenerate).toHaveBeenCalledWith({}, '', undefined);
});

test('supports controlled step transitions', async () => {
  mockLoadLatest.mockResolvedValueOnce({ id: 'inst-controlled', answers: {} });
  const onStepChange = vi.fn();

  renderWithProvider({
    sectionInfo,
    trameOptions: [trame],
    selectedTrame: trame,
    onTrameChange: () => {},
    questions: [],
    answers: {},
    onAnswersChange: () => {},
    onGenerate: () => {},
    onGenerateFromTemplate: () => {},
    isGenerating: false,
    bilanId: 'b1',
    onCancel: () => {},
    step: 1,
    onStepChange,
  });

  fireEvent.click(screen.getByText('Étape suivante'));
  expect(onStepChange).toHaveBeenCalledWith(2);

  renderWithProvider({
    sectionInfo,
    trameOptions: [trame],
    selectedTrame: trame,
    onTrameChange: () => {},
    questions: [],
    answers: {},
    onAnswersChange: () => {},
    onGenerate: () => {},
    onGenerateFromTemplate: () => {},
    isGenerating: false,
    bilanId: 'b1',
    onCancel: () => {},
    step: 2,
    onStepChange,
  });

  await waitFor(() => expect(mockLoadLatest).toHaveBeenCalledTimes(1));
});

test('notifies parent when excluded sections change', async () => {
  mockLoadLatest.mockResolvedValueOnce({ id: 'inst', answers: {} });
  const onExcludedSectionsChange = vi.fn();

  renderWithProvider({
    sectionInfo,
    trameOptions: [trame],
    selectedTrame: { value: 'bt1', label: 'BT1' } as any,
    onTrameChange: () => {},
    questions: [],
    answers: {},
    onAnswersChange: () => {},
    onGenerate: () => {},
    onGenerateFromTemplate: () => {},
    isGenerating: false,
    bilanId: 'b1',
    onCancel: () => {},
    mode: 'bilanType',
    initialStep: 2,
    onExcludedSectionsChange,
  });

  await waitFor(() => expect(mockLoadLatest).toHaveBeenCalled());

  fireEvent.click(screen.getByText('toggle-sec2'));

  await waitFor(() =>
    expect(onExcludedSectionsChange).toHaveBeenCalledWith(['sec2']),
  );
});

test('generateAllSections uses onGenerateAll with exclusions', async () => {
  mockLoadLatest.mockResolvedValue({ id: 'inst', answers: {} });
  mockSave.mockResolvedValue('inst-save');
  const onGenerateAll = vi.fn().mockResolvedValue(undefined);
  const { getControls } = renderWithProvider({
    sectionInfo,
    trameOptions: [trame],
    selectedTrame: { value: 'bt1', label: 'BT1' } as any,
    onTrameChange: () => {},
    questions: [],
    answers: {},
    onAnswersChange: () => {},
    onGenerate: () => {},
    onGenerateFromTemplate: () => {},
    onGenerateAll,
    isGenerating: false,
    bilanId: 'b1',
    onCancel: () => {},
    mode: 'bilanType',
    initialStep: 2,
  });

  await waitFor(() => expect(mockLoadLatest).toHaveBeenCalled());

  fireEvent.click(screen.getByText('toggle-sec2'));

  await waitFor(() => expect(getControls().canGenerateAll).toBe(true));

  await act(async () => {
    await getControls().generateAll();
  });

  expect(mockSave).toHaveBeenCalledWith({}, { sectionId: 'sec1' });
  expect(onGenerateAll).toHaveBeenCalledWith('bt1', ['sec2']);
});

test('can switch notes mode for bilan type', async () => {
  mockLoadLatest.mockResolvedValue({ id: 'inst', answers: {} });

  renderWithProvider({
    sectionInfo,
    trameOptions: [trame],
    selectedTrame: { value: 'bt1', label: 'BT1' } as any,
    onTrameChange: () => {},
    questions: [],
    answers: {},
    onAnswersChange: () => {},
    onGenerate: () => {},
    onGenerateFromTemplate: () => {},
    isGenerating: false,
    bilanId: 'b1',
    onCancel: () => {},
    mode: 'bilanType',
    initialStep: 2,
  });

  await waitFor(() => expect(mockLoadLatest).toHaveBeenCalled());

  fireEvent.click(screen.getByText('Import des notes'));
  expect(screen.getByTestId('import-notes')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Saisie manuelle'));
  expect(screen.getByTestId('data-entry')).toBeInTheDocument();
});
