import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { User } from '@supabase/supabase-js';
import App from './App';
import { PageProvider } from './store/pageContext';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './store/auth';
import {
  useUserProfileStore,
  type UserProfileState,
} from './store/userProfile';

// Tests simplifiés pour la navigation

describe('App navigation', () => {
  it('affiche le dashboard par défaut', async () => {
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
    expect(
      await screen.findByRole('heading', { name: /dashboard/i }),
    ).toBeInTheDocument();
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
});
