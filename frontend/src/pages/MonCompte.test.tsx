import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import MonCompte from './MonCompte';
import { useAuth, type AuthState } from '../store/auth';
import {
  useUserProfileStore,
  type UserProfileState,
} from '../store/userProfile';

// basic test to ensure profile is fetched and shown

describe('MonCompte page', () => {
  it('fetches and displays profile', async () => {
    const mockProfile = {
      id: 'id-42',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean@exemple.com',
      telephone: '0102030405',
      adresse: '1 rue ici',
    };
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([mockProfile]) }),
    );
    useAuth.setState((state) => ({ ...state, token: 'tok' }) as AuthState);
    useUserProfileStore.setState(
      (state) => ({ ...state, profileId: 'id-42' }) as UserProfileState,
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <MemoryRouter>
        <MonCompte />
      </MemoryRouter>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(await screen.findByDisplayValue('Dupont')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Jean')).toBeInTheDocument();
  });
});
