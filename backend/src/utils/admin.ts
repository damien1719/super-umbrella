import { prisma } from '../prisma';

function parseAdminEmails(): Set<string> {
  const one = process.env.ADMIN_MAIL || '';
  const many = process.env.ADMIN_MAILS || '';
  const all = [one, many].filter(Boolean).join(',');
  return new Set(
    all
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

const ADMIN_EMAILS = parseAdminEmails();

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export async function isAdminUser(userId: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;
  const profile = await db.profile.findUnique({ where: { userId } });
  return isAdminEmail(profile?.email ?? null);
}

