// src/lib/keycloak.ts
import Keycloak from 'keycloak-js';

// 🔒 HMR-safe : réutilise l'instance si Vite recharge le module
const globalAny = window as any;
if (!globalAny.__kc_instance) {
  globalAny.__kc_instance = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_BASE_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  });
}
const kc: Keycloak = globalAny.__kc_instance;

kc.onReady = (auth: boolean) => console.log('[KC] onReady auth=', auth);
kc.onAuthSuccess = () => console.log('[KC] onAuthSuccess');
kc.onAuthError = () => console.log('[KC] onAuthError');
kc.onAuthRefreshSuccess = () => console.log('[KC] onAuthRefreshSuccess');
kc.onAuthLogout = () => console.log('[KC] onAuthLogout');

let initialized = false;
let initPromise: Promise<Keycloak> | null = null;

export async function initKeycloak(
  options?: Keycloak.KeycloakInitOptions,
): Promise<Keycloak> {
  if (initialized) return kc;
  if (initPromise) return initPromise;

  // valeurs sûres pour SSO silencieux
  const defaultOptions: Keycloak.KeycloakInitOptions = {
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    checkLoginIframe: false,
    silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
  };

  initPromise = kc
    .init({ ...defaultOptions, ...options })
    .then(() => {
      initialized = true;
      return kc;
    })
    .finally(() => {
      // évite de rester bloqué si init échoue
      initPromise = null;
    });

  return initPromise;
}

export default kc;
