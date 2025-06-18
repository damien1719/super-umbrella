// src/utils/api.ts
//  - on retire le slash éventuel à la fin pour éviter "//" quand on concatène
const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ?? '';

export function buildUrl(path: string) {
  // on s’assure qu’il y a toujours un slash au début du path
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: { 
      'Content-Type': 'application/json',
      ...options.headers 
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  return res.json();
}
