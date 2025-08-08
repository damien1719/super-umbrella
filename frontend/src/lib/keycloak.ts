import Keycloak from 'keycloak-js';

const kc = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_BASE_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

let initialized = false;

export async function initKeycloak(options?: Keycloak.KeycloakInitOptions) {
  if (initialized) return;
  await kc.init(options);
  initialized = true;
}

export default kc;
