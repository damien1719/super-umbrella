import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null } }),
      signOut: () => Promise.resolve(),
    },
  }),
}));
