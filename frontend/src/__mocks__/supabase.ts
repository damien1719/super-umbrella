export const createClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null } }),
    signUp: () => Promise.resolve({ data: { user: null, session: null } }),
    signOut: () => Promise.resolve(),
  },
});
