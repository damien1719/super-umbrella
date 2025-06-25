import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import MesBiens from './MesBiens';
import { useBienStore, type Bien } from '../store/biens';

vi.stubGlobal('fetch', vi.fn());

describe('MesBiens page', () => {
  it('shows property address', () => {
    const bien: Bien = { id: '1', typeBien: 'APT', adresse: 'a' } as Bien;
    useBienStore.setState({ items: [bien], fetchAll: async () => {} });
    (fetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    });
    render(
      <MemoryRouter>
        <MesBiens />
      </MemoryRouter>,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
  });
});
