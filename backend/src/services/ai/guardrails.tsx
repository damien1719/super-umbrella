const PHI_REGEX = /\b(\d{13}|[A-Z]{2}\d{9})\b/g; // ex. NIR ou identifiant fictif

export function pre(text: string) {
  // masque les identifiants patients
  return text.replace(PHI_REGEX, "[REDACTED]");
}

export function post(text: string) {
  // interdit contenu NSFW basique
  if (/(\bsex\b|\bviolence\b)/i.test(text)) {
    throw new Error("Content policy violation");
  }
  return text;
}
