import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserProfileStore } from '@/store/userProfile';
import { apiFetch } from '@/utils/api';

type Role = 'VIEWER' | 'EDITOR';

type ShareEntry = {
  id: string;
  invitedEmail?: string | null;
  invitedUserId?: string | null;
  role: Role;
  createdAt?: string;
};

export function SharePanel({
  resourceType,
  resourceId,
  className,
}: {
  resourceType: 'bilan-type' | 'section';
  resourceId?: string | null;
  className?: string;
}) {
  const { profile, fetchProfile } = useUserProfileStore();
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('EDITOR');
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});

  const adminEnv = (import.meta.env.VITE_ADMIN_MAILS ||
    import.meta.env.VITE_ADMIN_MAIL ||
    '') as string;
  const adminSet = useMemo(
    () =>
      new Set(
        adminEnv
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
      ),
    [adminEnv],
  );
  const isAdmin = !!profile?.email && adminSet.has(profile.email.toLowerCase());

  const baseUrl =
    resourceType === 'bilan-type' ? '/api/v1/bilan-types' : '/api/v1/sections';

  async function loadShares() {
    if (!resourceId) return;
    setLoading(true);
    try {
      const list = await apiFetch<ShareEntry[]>(
        `${baseUrl}/${resourceId}/shares`,
      );
      setShares(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!profile) fetchProfile().catch(() => {});
  }, [profile, fetchProfile]);

  useEffect(() => {
    if (isAdmin && resourceId) {
      loadShares().catch(() => {});
    }
  }, [isAdmin, resourceId]);

  if (!isAdmin) return null; // feature flag: UI only for admin

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Partage</CardTitle>
      </CardHeader>
      <CardContent>
        {!resourceId ? (
          <p className="text-sm text-gray-600">
            Sauvegardez d’abord pour activer le partage.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  placeholder="email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email à inviter"
                />
              </div>
              <div className="w-40">
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EDITOR">Éditeur</SelectItem>
                    <SelectItem value="VIEWER">Lecteur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button
                  disabled={!email || loading}
                  onClick={async () => {
                    try {
                      await apiFetch(`${baseUrl}/${resourceId}/shares`, {
                        method: 'POST',
                        body: JSON.stringify({ email, role }),
                      });
                      setEmail('');
                      await loadShares();
                    } catch (e) {
                      alert((e as Error)?.message || 'Erreur lors du partage');
                    }
                  }}
                >
                  Partager
                </Button>
              </div>
            </div>

            <div className="border rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="text-left p-2">Invité</th>
                    <th className="text-left p-2">Rôle</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shares.length === 0 ? (
                    <tr>
                      <td className="p-2 text-gray-500" colSpan={3}>
                        Aucun partage pour le moment.
                      </td>
                    </tr>
                  ) : (
                    shares.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="p-2">{s.invitedEmail || '—'}</td>
                        <td className="p-2">
                          {s.role === 'EDITOR' ? 'Éditeur' : 'Lecteur'}
                        </td>
                        <td className="p-2 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!!busyIds[s.id]}
                            onClick={async () => {
                              setBusyIds((b) => ({ ...b, [s.id]: true }));
                              try {
                                await apiFetch(
                                  `${baseUrl}/${resourceId}/shares/${s.id}`,
                                  {
                                    method: 'DELETE',
                                  },
                                );
                                await loadShares();
                              } catch (e) {
                                alert(
                                  (e as Error)?.message ||
                                    'Erreur lors de la suppression',
                                );
                              } finally {
                                setBusyIds((b) => ({ ...b, [s.id]: false }));
                              }
                            }}
                          >
                            Retirer
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SharePanel;
