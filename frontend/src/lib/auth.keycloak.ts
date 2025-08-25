// src/lib/auth.keycloak.ts
import type { Session } from '@supabase/supabase-js';
import kc, { initKeycloak } from './keycloak';
import { setAuthTokenGetter } from '../utils/authToken';

type KcSession = {
  user: Record<string, unknown> | null;
  access_token: string | null;
};

setAuthTokenGetter(() => kc.token || undefined);

function setPostLogin(path: string) {
  sessionStorage.setItem('postLogin', path);
}

async function ensureInit() {
  // check-sso va parser le callback après login et peupler kc.token/kc.tokenParsed
  await initKeycloak({
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    checkLoginIframe: false,
  });
  setAuthTokenGetter(() => kc.token || undefined);
}

export function consumePostLogin(): string | null {
  const v = sessionStorage.getItem('postLogin');
  if (v) sessionStorage.removeItem('postLogin');
  return v;
}

const currentSession = (): KcSession => ({
  user: kc.tokenParsed || null,
  access_token: kc.token || null,
});

let unsub: number | null = null;

export function createAuthProvider() {
  return {
    async getCurrentUser() {
      await ensureInit();
      return kc.tokenParsed || null;
    },

    async getSession(): Promise<{ data: { session: Session | null } }> {
      await ensureInit(); // 👈 essentiel après le redirect
      if (kc.authenticated) {
        try {
          await kc.updateToken(30);
        } catch {}
      }
      // @ts-expect-error adapter au type Session attendu par ton store
      return { data: { session: currentSession() as Session } };
    },

    onAuthStateChange(
      callback: (event: string, session: Session | null) => void,
    ) {
      if (unsub != null) clearInterval(unsub);
      unsub = window.setInterval(async () => {
        try {
          const refreshed = await kc.updateToken(60);
          if (refreshed) {
            setAuthTokenGetter(() => kc.token || undefined);
            callback('TOKEN_REFRESHED', currentSession() as unknown as Session);
          }
        } catch {
          callback('SIGNED_OUT', null);
        }
      }, 20_000);

      return {
        data: {
          subscription: { unsubscribe: () => unsub && clearInterval(unsub) },
        },
      };
    },

    async signIn() {
      // Toujours init avant de pouvoir appeler kc.login
      if (!kc.authenticated) {
        await initKeycloak({
          onLoad: 'login-required',
          pkceMethod: 'S256',
          checkLoginIframe: false,
        });
      }

      // Si après init on est toujours pas logué → lancer login
      if (!kc.authenticated) {
        setPostLogin('/bilans');
        await kc.login({
          redirectUri: `${window.location.origin}/`,
        });
        return null; // redirection → pas de code qui continue
      }

      // Si on est déjà logué
      setAuthTokenGetter(() => kc.token || undefined);
      return kc.tokenParsed || null;
    },

    async signOut() {
      await kc.logout();
      const redirectUri = `${window.location.origin}/login`; // ← ta page Login
      try {
        await kc.logout({ redirectUri });
      } finally {
        setAuthTokenGetter(() => undefined);
      }
    },

    async signInWithPassword() {
      await this.signIn();
      return {
        data: { session: currentSession() as unknown as Session },
        error: null,
      };
    },

    async signUp() {
      // 1. Init Keycloak silencieusement
      if (!kc.authenticated) {
        await initKeycloak({
          onLoad: 'check-sso',
          pkceMethod: 'S256',
          checkLoginIframe: false,
        });
      }

      // 2. Mémorise la route cible (où aller après inscription)
      setPostLogin('/bilans'); // à adapter si tu veux rediriger ailleurs

      // 3. Lance l’inscription
      await kc.register({
        redirectUri: `${window.location.origin}/`,
      });

      // 4. En théorie, on ne passe jamais ici (car redirection)
      setAuthTokenGetter(() => kc.token || undefined);
      return {
        data: {
          user: kc.tokenParsed || null,
          session: currentSession() as unknown as Session,
        },
        error: null,
      };
    },
  };
}
