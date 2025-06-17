import type { User } from '@supabase/supabase-js';

export function createAuthProvider() {
  const user: User = {
    id: 'demo-user',
    email: 'demo@local',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  console.log('here');
  console.log(user);

  return {
    getCurrentUser: async () => user,
    signIn: async () => user,
    signOut: async () => {},
  };
}
