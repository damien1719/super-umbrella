import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { AppSidebar } from './AppSidebar';
import {
  useUserProfileStore,
  type UserProfileState,
} from '../store/userProfile';
import { useAuth, type AuthState } from '../store/auth';

describe('AppSidebar', () => {
  it('displays active profile data', () => {
    useAuth.setState((s) => ({ ...s, signOut: vi.fn() }) as AuthState);
    useUserProfileStore.setState(
      (s) =>
        ({
          ...s,
          profile: {
            id: 'p1',
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'jean@example.com',
          },
          profileId: 'p1',
        }) as UserProfileState,
    );

    render(
      <MemoryRouter>
        <AppSidebar onNavigate={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Jean Dupont')[0]).toBeInTheDocument();
    expect(screen.getAllByText('jean@example.com')[0]).toBeInTheDocument();
  });
});
