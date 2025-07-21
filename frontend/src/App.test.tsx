import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import App from './App';
import { PageProvider } from './store/pageContext';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { useAuth } from './store/auth';
import {
  useUserProfileStore,
  type UserProfileState,
} from './store/userProfile';

// Tests simplifiés pour la navigation

describe('App navigation', () => {
  it('affiche le bouton nouveau bilan', async () => {
    useAuth.setState({ user: { id: '1' } as unknown as User, loading: false });
    useUserProfileStore.setState(
      (state) => ({ ...state, profileId: 'p1' }) as UserProfileState,
    );
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ id: '1' }) }),
    );
    render(
      <MemoryRouter>
        <PageProvider>
          <App />
        </PageProvider>
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole('button', { name: /rédiger un nouveau bilan/i }),
    ).toBeInTheDocument();
  });

  it('fetches profile after login', async () => {
    const fetchProfileMock = vi.fn(() => Promise.resolve());
    useAuth.setState({
      user: { id: '1' } as unknown as User,
      token: 'tok',
      loading: false,
    });
    useUserProfileStore.setState(
      (state) =>
        ({
          ...state,
          profileId: null,
          fetchProfile: fetchProfileMock,
        }) as UserProfileState,
    );
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) }),
    ) as unknown as typeof fetch;

    render(
      <BrowserRouter>
        <PageProvider>
          <App />
        </PageProvider>
      </BrowserRouter>,
    );

    await waitFor(() => expect(fetchProfileMock).toHaveBeenCalled());
    useUserProfileStore.setState(
      (state) => ({ ...state, profileId: 'p1' }) as UserProfileState,
    );
  });

  it('active le menu MesBiens après clic', async () => {
    useAuth.setState({ user: { id: '1' } as unknown as User, loading: false });
    useUserProfileStore.setState(
      (state) => ({ ...state, profileId: 'p1' }) as UserProfileState,
    );
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) }),
    ) as unknown as typeof fetch;
    render(
      <BrowserRouter>
        <PageProvider>
          <App />
        </PageProvider>
      </BrowserRouter>,
    );
    const btn = await screen.findByRole('button', { name: /mes\s?biens/i });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('data-active', 'true');
  });

  it('cache la sidebar sur la page bilan', async () => {
    useAuth.setState({ user: { id: '1' } as unknown as User, loading: false });
    useUserProfileStore.setState(
      (state) => ({ ...state, profileId: 'p1' }) as UserProfileState,
    );
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) }),
    ) as unknown as typeof fetch;
    render(
      <MemoryRouter initialEntries={['/bilan/123']}>
        <PageProvider>
          <App />
        </PageProvider>
      </MemoryRouter>,
    );
    expect(
      screen.queryByRole('button', { name: /mes\s?biens/i }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /retour/i }),
    ).toBeInTheDocument();
  });
});
