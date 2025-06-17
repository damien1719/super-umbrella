export const createClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null } }),
    signOut: () => Promise.resolve(),
  },
});
