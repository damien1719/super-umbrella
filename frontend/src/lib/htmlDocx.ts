export async function toDocxBlob(html: string): Promise<Blob> {
  // Support both ESM and CJS default exports
  const mod: any = await import('html-docx-js-typescript');
  const api = (mod && (mod.asBlob ? mod : mod.default)) || mod;
  return api.asBlob(html);
}


