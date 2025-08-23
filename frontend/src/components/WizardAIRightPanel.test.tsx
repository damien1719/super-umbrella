/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, react/display-name */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WizardAIRightPanel from './WizardAIRightPanel';
import { vi } from 'vitest';
import React from 'react';
import { apiFetch } from '@/utils/api';

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
vi.mock('./bilan/DataEntry', () => {
  const React = require('react');
  return {
    DataEntry: React.forwardRef((_props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        save: () => ({}),
        load: () => {},
        clear: () => {},
        getAnswers: () => ({}),
      }));
      return <div />;
    }),
  };
});
vi.mock('./ImportNotes', () => ({ default: () => <div /> }));

const mockedApiFetch = apiFetch as unknown as vi.Mock;

const sectionInfo = { id: 's1', title: 'Section 1' } as any;
const trame = { value: 't1', label: 'Trame 1' } as any;

test('fetches latest notes on entering step 2', async () => {
  mockedApiFetch.mockResolvedValueOnce([{ id: 'i1', contentNotes: { a: 1 } }]);

  render(
    <WizardAIRightPanel
      sectionInfo={sectionInfo}
      trameOptions={[trame]}
      selectedTrame={trame}
      onTrameChange={() => {}}
      examples={[]}
      onAddExample={() => {}}
      onRemoveExample={() => {}}
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
    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/api/v1/bilan-section-instances?bilanId=b1&sectionId=t1&latest=true',
      expect.any(Object),
    ),
  );
});

test('saves notes when generating from template', async () => {
  mockedApiFetch.mockResolvedValueOnce([]); // initial fetch

  const onGenerateFromTemplate = vi.fn();

  render(
    <WizardAIRightPanel
      sectionInfo={sectionInfo}
      trameOptions={[trame]}
      selectedTrame={trame}
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
  await waitFor(() => expect(mockedApiFetch).toHaveBeenCalled());

  mockedApiFetch.mockClear();
  mockedApiFetch.mockResolvedValueOnce({ id: 'inst1' });

  fireEvent.click(screen.getByText('Generate from template'));

  await waitFor(() => expect(mockedApiFetch).toHaveBeenCalled());
  expect(mockedApiFetch).toHaveBeenCalledWith(
    '/api/v1/bilan-section-instances/upsert',
    expect.objectContaining({ method: 'POST' }),
  );
  expect(onGenerateFromTemplate).toHaveBeenCalled();
});
