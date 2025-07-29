import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import BilanV2 from './MesBilans';
import { useAuth, type AuthState } from '../store/auth';

vi.stubGlobal('fetch', vi.fn());

describe('BilanV2 page', () => {
  it('fetches and lists bilans', async () => {
    useAuth.setState({ token: 'tok' } as Partial<AuthState>);
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: '1',
            date: '2024-01-01',
            patient: { firstName: 'John', lastName: 'Doe' },
            bilanType: { name: 'Initial' },
          },
        ]),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<BilanV2 />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(await screen.findByText(/John Doe/)).toBeInTheDocument();
  });

  it('deletes bilan after confirmation', async () => {
    useAuth.setState({ token: 'tok' } as Partial<AuthState>);
    const fetchMock = fetch as unknown as vi.Mock;
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: '1',
              date: '2024-01-01',
              patient: { firstName: 'John', lastName: 'Doe' },
              bilanType: { name: 'Initial' },
            },
          ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
        status: 204,
      });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<BilanV2 />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText(/John Doe/);

    const deleteBtn = screen.getByLabelText(/supprimer le bilan/i);
    fireEvent.click(deleteBtn);
    const confirm = await screen.findByRole('button', { name: /supprimer/i });
    fireEvent.click(confirm);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/bilans/1',
        expect.objectContaining({ method: 'DELETE' }),
      ),
    );
    await waitFor(() =>
      expect(screen.queryByText(/John Doe/)).not.toBeInTheDocument(),
    );
  });
});
