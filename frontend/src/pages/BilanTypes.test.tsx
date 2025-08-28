import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import BilanTypes from './BilanTypes';
import { useBilanTypeStore } from '../store/bilanTypes';
import { useAuth, type AuthState } from '../store/auth';

describe('BilanTypes page', () => {
  it('renders and lists bilan types', async () => {
    useAuth.setState((s) => ({ ...s, token: 'tok' }) as AuthState);
    const fetchAll = vi.fn().mockResolvedValue(undefined);
    useBilanTypeStore.setState({
      items: [{ id: '1', name: 'BT' }],
      fetchAll,
    } as Partial<ReturnType<typeof useBilanTypeStore.getState>>);

    render(
      <MemoryRouter initialEntries={['/bilan-types']}>
        <Routes>
          <Route path="/bilan-types" element={<BilanTypes />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(fetchAll).toHaveBeenCalled();
    expect(await screen.findByText('BT')).toBeInTheDocument();
    expect(screen.getByText('Créer un Bilan Type')).toBeInTheDocument();
  });
});
