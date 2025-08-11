import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AiRightPanel from './AiRightPanel';
import { apiFetch } from '@/utils/api';

vi.mock('@/utils/api');
vi.mock('@/store/sections', () => ({
  useSectionStore: () => ({
    items: [],
    fetchAll: vi.fn().mockResolvedValue(undefined),
  }),
}));
vi.mock('@/store/sectionExamples', () => ({
  useSectionExampleStore: () => ({
    items: [],
    fetchAll: vi.fn().mockResolvedValue(undefined),
    create: vi.fn(),
    remove: vi.fn(),
  }),
}));
const selectionMock = {
  text: '',
  clear: vi.fn(),
  restore: vi.fn().mockReturnValue(true),
};
vi.mock('@/store/editorUi', () => ({
  useEditorUi: (selector: (state: unknown) => unknown) =>
    selector({ mode: 'idle', setMode: vi.fn(), selection: selectionMock }),
}));
vi.mock('@/store/auth', () => ({
  useAuth: (selector: (state: { token: string }) => unknown) =>
    selector({ token: 'tok' }),
}));
vi.mock('./WizardAIRightPanel', () => ({ default: () => null }));
vi.mock('./bilan/SectionCard', () => ({ SectionCard: () => null }));

describe('AiRightPanel', () => {
  it('uploads file and calls api to comment test results', async () => {
    const onInsertText = vi.fn();
    render(<AiRightPanel bilanId="123" onInsertText={onInsertText} />);

    fireEvent.click(screen.getByRole('button', { name: 'Commenter' }));
    const fileInput = screen.getByTestId(
      'comment-file-input',
    ) as HTMLInputElement;
    const file = new File(['test'], 'result.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const mockedApi = apiFetch as unknown as vi.Mock;
    mockedApi.mockResolvedValueOnce({ text: 'Un commentaire' });

    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    await waitFor(() => expect(mockedApi).toHaveBeenCalled());
    expect(mockedApi).toHaveBeenCalledWith(
      '/api/v1/bilans/123/comment-test-results',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('promptCommentTestResults'),
        headers: expect.objectContaining({ Authorization: 'Bearer tok' }),
      }),
    );
    expect(onInsertText).toHaveBeenCalledWith('Un commentaire');
  });
});
