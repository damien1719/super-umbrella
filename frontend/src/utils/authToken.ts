// src/utils/authToken.ts
let getter: (() => string | undefined) | null = null;

export function setAuthTokenGetter(fn: () => string | undefined) {
  getter = fn;
}

export function getAuthToken() {
  return getter ? getter() : undefined;
}
