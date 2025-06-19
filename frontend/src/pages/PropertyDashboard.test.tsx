import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PropertyDashboard from './PropertyDashboard';
import { useAuth, type AuthState } from '../store/auth';
import {
  useUserProfileStore,
  type UserProfileState,
} from '../store/userProfile';

vi.stubGlobal('fetch', vi.fn());

describe('PropertyDashboard page', () => {
  it('renders property info', async () => {
    useAuth.setState((s) => ({ ...s, token: 'tok' }) as AuthState);
    useUserProfileStore.setState(
      (s) => ({ ...s, profileId: 'p1' }) as UserProfileState,
    );

    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1', typeBien: 'APT', adresse: 'a' }),
    });
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    });
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(
      <MemoryRouter initialEntries={['/biens/1/dashboard']}>
        <Routes>
          <Route path="/biens/:id/dashboard" element={<PropertyDashboard />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/Bien Immobilier/i)).toBeInTheDocument();
  });
});
