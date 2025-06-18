import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import MesBiens from './MesBiens';
import { useBienStore, type Bien } from '../store/biens';

describe('MesBiens page', () => {
  it('shows "Nouvelle location" button', () => {
    const bien: Bien = { id: '1', typeBien: 'APT', adresse: 'a' } as Bien;
    useBienStore.setState({ items: [bien], fetchAll: async () => {} });
    render(
      <MemoryRouter>
        <MesBiens />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('link', { name: /nouvelle location/i }),
    ).toBeInTheDocument();
  });
});
