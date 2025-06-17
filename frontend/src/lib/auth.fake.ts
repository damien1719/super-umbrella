export function createAuthProvider() {
    const user = { id: 'demo-user', email: 'demo@local' }
    return {
      getCurrentUser: () => user,
      signIn: async () => user,
      signOut: async () => {}
    }
  }
  