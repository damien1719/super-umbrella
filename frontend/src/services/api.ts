// api.ts — point d'entrée HTTP avec VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL as string;
if (!API_URL) console.error("[api.ts] VITE_API_URL non défini");

function buildURL(
  path: string,
  params?: Record<string, string | number | undefined>
): string {
  const url = new URL(path, API_URL);
  Object.entries(params ?? {}).forEach(([key, val]) => {
    if (val != null) url.searchParams.set(key, String(val));
  });
  return url.toString();
}

async function fetchBlob(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<Blob> {
  const res = await fetch(buildURL(path, params), { credentials: "include" });
  if (!res.ok) throw new Error(`Erreur ${res.status} ${res.statusText}`);
  return res.blob();
}

export const downloadCerfa2031 = (
  anneeId: string | number,
  activityId: string | number
) => fetchBlob("/api/v1/cerfa/2031-sd", { anneeId, activityId });

export const downloadCerfa2042 = (
  anneeId: string | number,
  activityId: string | number
) => fetchBlob("/api/v1/cerfa/2042", { anneeId, activityId });

export { buildURL, fetchBlob };
