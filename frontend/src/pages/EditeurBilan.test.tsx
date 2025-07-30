import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Bilan from './EditeurBilan';
import { useAuth, type AuthState } from '../store/auth';
import { vi } from 'vitest';

vi.mock('../components/AiRightPanel', () => ({
  default: () => <div>Assistant IA</div>,
}));

vi.stubGlobal('fetch', vi.fn());

describe('Bilan page', () => {
  it('fetches and displays bilan', async () => {
    useAuth.setState({ token: 't' } as Partial<AuthState>);
    (fetch as unknown as vi.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', descriptionHtml: '<b>txt</b>' }),
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
        json: () => Promise.resolve({ id: '1', descriptionHtml: '<b>txt</b>' }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', descriptionHtml: '<b>txt</b>' }),
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
});
