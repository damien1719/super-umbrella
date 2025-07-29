import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import Bilan from './Bilan';
import { useAuth, type AuthState } from '../store/auth';

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
});
