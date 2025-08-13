interface PatientName {
  firstName?: string | null;
  lastName?: string | null;
}

const PLACEHOLDER = '[[PATIENT]]';

function buildNamePatterns({ firstName, lastName }: PatientName): RegExp[] {
  const patterns: string[] = [];
  const names: string[] = [];
  if (firstName && firstName.trim()) names.push(firstName.trim());
  if (lastName && lastName.trim()) names.push(lastName.trim());
  if (names.length === 2) {
    patterns.push(`${names[0]}\s+${names[1]}`);
    patterns.push(`${names[1]}\s+${names[0]}`);
  }
  patterns.push(...names);
  // Escape regex special chars and enable word boundaries where relevant
  const escaped = patterns.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return escaped.map((p) => new RegExp(p, 'gi'));
}

export function anonymizeText(input: string, patient: PatientName): string {
  if (!input) return input;
  const regs = buildNamePatterns(patient);
  let out = input;
  for (const r of regs) out = out.replace(r, PLACEHOLDER);
  return out;
}

export function deanonymizeText(input: string, patient: PatientName): string {
  if (!input) return input;
  const replacement = [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim();
  if (!replacement) return input;
  return input.replace(new RegExp(PLACEHOLDER, 'g'), replacement);
}

export const Anonymization = {
  PLACEHOLDER,
  anonymizeText,
  deanonymizeText,
};


