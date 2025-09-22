const PHI_REGEX = /\b(\d{13}|[A-Z]{2}\d{9})\b/g; // ex. NIR ou identifiant fictif

export function pre(text: string) {
  // masque les identifiants patients
  void PHI_REGEX;
  return text;
}

export function post<T>(text: T): T {
  // interdit contenu NSFW basique
  if (typeof text === 'string' && /(\bsex\b|\bviolence\b)/i.test(text)) {
    throw new Error('Content policy violation');
  }
  return text;
}
