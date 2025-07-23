+22
-0

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Bibliotheque from './Bibliothèque';
import { useSectionStore } from '../store/sections';
import { useAuth, type AuthState } from '../store/auth';

describe('Bibliothèque page', () => {
  it('renders the header', () => {
    render(
      <MemoryRouter initialEntries={['/bibliotheque']}>
        <Routes>
          <Route path="/bibliotheque" element={<Bibliotheque />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /biblioth[eè]que/i }),
    ).toBeInTheDocument();
  });

  it('lists sections grouped by category', async () => {
    useAuth.setState((s) => ({ ...s, token: 'tok' }) as AuthState);
    const fetchAll = vi.fn().mockResolvedValue(undefined);
    useSectionStore.setState({
      items: [{ id: '1', title: 'Sec', kind: 'anamnese' }],
      fetchAll,
    } as Partial<ReturnType<typeof useSectionStore.getState>>);

    render(
      <MemoryRouter initialEntries={['/bibliotheque']}>
        <Routes>
          <Route path="/bibliotheque" element={<Bibliotheque />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(fetchAll).toHaveBeenCalled();
    expect(await screen.findByText('Sec')).toBeInTheDocument();
  });
});