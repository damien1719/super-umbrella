import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Home from './Home';

vi.stubGlobal('fetch', vi.fn());

describe('Home page', () => {
  it('creates a bilan and redirects', async () => {
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '42' }),
    });
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bilan/:id" element={<div>bilan page</div>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /rédiger un nouveau bilan/i }),
    );
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith('/api/bilans', expect.any(Object));
    expect(await screen.findByText(/bilan page/i)).toBeInTheDocument();
  });
});
