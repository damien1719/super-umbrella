// src/utils/api.ts
import { getAuthToken } from './authToken';

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ?? '';

export function buildUrl(path: string) {
  // on s’assure qu’il y a toujours un slash au début du path
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(buildUrl(path), {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}
