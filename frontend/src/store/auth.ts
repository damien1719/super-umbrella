import { create } from 'zustand'
import { auth } from '../lib/auth'

interface AuthState {
  user: { id: string; email: string } | null
  loading: boolean
  signIn: (e: string, p: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: auth.getCurrentUser(),
  loading: false,
  signIn: async (email, password) => {
    set({ loading: true })
    const user = await auth.signIn(email, password)
    set({ user, loading: false })
  },
  signOut: async () => {
    await auth.signOut()
    set({ user: null })
  }
}))
