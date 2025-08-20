import { render, screen, fireEvent } from '@testing-library/react';
import WizardAIRightPanel from './WizardAIRightPanel';
import { vi } from 'vitest';

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
vi.mock('lucide-react', () => ({
  Loader2: () => null,
  Plus: () => null,
  Wand2: () => null,
  X: () => null,
}));
vi.mock('@/utils/api', () => ({ apiFetch: vi.fn() }));
vi.mock('@/store/auth', () => ({ useAuth: () => ({ token: 't' }) }));
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@/store/userProfile', () => ({
  useUserProfileStore: () => ({ profile: null, fetchProfile: vi.fn() }),
}));
vi.mock('./bilan/DataEntry', () => ({
  DataEntry: (props: any) => <div>{props.children}</div>,
}));
vi.mock('./ImportNotes', () => ({ default: () => <div /> }));

const sectionInfo = { id: 's1', title: 'Section 1' } as any;

function setup(cb?: any) {
  const onGenerateFromTemplate = vi.fn();
  render(
    <WizardAIRightPanel
      sectionInfo={sectionInfo}
      trameOptions={[]}
      selectedTrame={undefined}
      onTrameChange={() => {}}
      examples={[]}
      onAddExample={() => {}}
      onRemoveExample={() => {}}
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
  const btn = screen.getByText('Generate from template');
  fireEvent.click(btn);
  return onGenerateFromTemplate;
}

test('calls onGenerateFromTemplate when button clicked', () => {
  const fn = setup();
  expect(fn).toHaveBeenCalled();
});
