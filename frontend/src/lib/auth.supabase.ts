import { createClient } from '@supabase/supabase-js';

export function createAuthProvider() {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
  );

  return {
    getCurrentUser: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    signIn: (email: string, password: string) =>
      supabase.auth
        .signInWithPassword({ email, password })
        .then(({ data, error }) => {
          if (error) throw error;
          return data.user;
        }),
    signOut: () => supabase.auth.signOut(),
  };
}
