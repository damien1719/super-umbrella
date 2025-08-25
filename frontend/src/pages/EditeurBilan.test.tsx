import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Bilan from './EditeurBilan';
import { useAuth, type AuthState } from '../store/auth';
import { useBilanDraft } from '../store/bilanDraft';
import { vi } from 'vitest';

vi.mock('../components/AiRightPanel', () => ({
  default: () => <div>Assistant IA</div>,
}));
vi.mock('../components/RichTextEditor', () => ({
  default: ({
    onChange,
    onSave,
  }: {
    onChange: (v: string) => void;
    onSave: () => void;
  }) => (
    <div>
      <button onClick={onSave}>Save</button>
      <textarea onChange={(e) => onChange(e.target.value)} />
    </div>
  ),
}));

vi.stubGlobal('fetch', vi.fn());

describe('Bilan page', () => {
  it('fetches and displays bilan', async () => {
    useAuth.setState({ token: 't' } as Partial<AuthState>);
    (fetch as unknown as vi.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '1',
            descriptionJson: {
              root: { type: 'root', version: 1, children: [] },
            },
          }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    render(
      <MemoryRouter initialEntries={['/bilan/1']}>
        <Routes>
          <Route path="/bilan/:bilanId" element={<Bilan />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(await screen.findByText(/mon bilan/i)).toBeInTheDocument();
    expect(await screen.findByText(/assistant ia/i)).toBeInTheDocument();
  });

  it('saves the bilan when clicking save', async () => {
    useAuth.setState({ token: 't' } as Partial<AuthState>);
    const fetchMock = fetch as unknown as vi.Mock;
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '1',
            descriptionJson: {
              root: { type: 'root', version: 1, children: [] },
            },
          }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '1',
            descriptionJson: {
              root: { type: 'root', version: 1, children: [] },
            },
          }),
      });

    render(
      <MemoryRouter initialEntries={['/bilan/1']}>
        <Routes>
          <Route path="/bilan/:bilanId" element={<Bilan />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText(/mon bilan/i);
    const saveBtn = await screen.findByRole('button', { name: 'Save' });
    saveBtn.click();

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/v1/bilans/1',
        expect.objectContaining({ method: 'PUT' }),
      ),
    );
  });

  it('prompts to save when leaving with changes', async () => {
    useAuth.setState({ token: 't' } as Partial<AuthState>);
    const fetchMock = fetch as unknown as vi.Mock;
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '1',
            descriptionJson: {
              root: { type: 'root', version: 1, children: [] },
            },
          }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '1',
            descriptionJson: {
              root: { type: 'root', version: 1, children: [] },
            },
          }),
      });

    render(
      <MemoryRouter initialEntries={['/bilan/1']}>
        <Routes>
          <Route path="/bilan/:bilanId" element={<Bilan />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText(/mon bilan/i);
    act(() => {
      useBilanDraft.setState({
        descriptionJson: { root: { type: 'root', version: 1, children: [] } },
      });
    });

    fireEvent.click(screen.getByRole('button', { name: /Retour/i }));

    expect(
      await screen.findByText(
        /Souhaitez-vous conserver les modifications apportées/i,
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Oui' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/v1/bilans/1',
        expect.objectContaining({ method: 'PUT' }),
      ),
    );
  });
});
