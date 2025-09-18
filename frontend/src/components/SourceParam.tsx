import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserProfileStore } from '@/store/userProfile';
import { useSectionStore } from '@/store/sections';
import { Button } from '@/components/ui/button';

type SectionSource = 'USER' | 'BILANPLUME';

export function SourceParam({
  sectionId,
  className,
}: {
  sectionId?: string | null;
  className?: string;
}) {
  const { profile, fetchProfile } = useUserProfileStore();
  const updateSection = useSectionStore((s) => s.update);
  const section = useSectionStore((s) =>
    s.items.find((it) => it.id === sectionId),
  );

  // Same admin visibility logic as SharePanel.tsx
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

  useEffect(() => {
    if (!profile) fetchProfile().catch(() => {});
  }, [profile, fetchProfile]);

  const [value, setValue] = useState<SectionSource>(
    (section?.source as SectionSource) || 'USER',
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (section?.source && (section.source as SectionSource) !== value) {
      setValue(section.source as SectionSource);
    }
  }, [section?.source]);

  if (!isAdmin || !sectionId) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Source de la section</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Définissez l&apos;origine de cette section. Ce paramètre est réservé aux
            administrateurs.
          </p>
          <div className="w-60 space-y-3">
            <Select
              value={value}
              onValueChange={(v) => setValue(v as SectionSource)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Créée par l&apos;utilisateur</SelectItem>
                <SelectItem value="BILANPLUME">BilanPlume</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Button
                onClick={async () => {
                  if (!sectionId) return;
                  try {
                    setIsSaving(true);
                    const payload: Parameters<typeof updateSection>[1] =
                      value === 'BILANPLUME'
                        ? { source: value, isPublic: true }
                        : { source: value };
                    await updateSection(sectionId, payload);
                  } catch (e) {
                    alert(
                      (e as Error)?.message ||
                        'Erreur lors de la mise à jour de la source',
                    );
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={
                  isSaving || value === ((section?.source as SectionSource) || 'USER')
                }
              >
                {isSaving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SourceParam;
