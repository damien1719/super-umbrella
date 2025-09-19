'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SectionLibraryView from '@/components/section-library/SectionLibraryView';
import type { Section } from '@/store/sections';
import CreerTrameModal from '@/components/ui/creer-trame-modale';
import { useUserProfileStore } from '@/store/userProfile';
import type { TrameInfo } from '@/components/TrameCard';

interface ExplorerSectionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: Section[];
  isLoading?: boolean;
  selectedSectionId?: string | null;
  onSelectedSectionChange?: (sectionId: string | null) => void;
  onValidate: (section: Section) => void;
}

export function ExplorerSectionsModal({
  open,
  onOpenChange,
  sections,
  isLoading,
  selectedSectionId,
  onSelectedSectionChange,
  onValidate,
}: ExplorerSectionsModalProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    null,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const profileId = useUserProfileStore((state) => state.profile?.id ?? null);

  useEffect(() => {
    if (!open) {
      setInternalSelectedId(null);
    }
  }, [open]);

  const effectiveSelectedId = selectedSectionId ?? internalSelectedId;

  const setSelectedSectionId = (id: string | null) => {
    if (onSelectedSectionChange) {
      onSelectedSectionChange(id);
    } else {
      setInternalSelectedId(id);
    }
  };

  const mySections = useMemo(
    () =>
      sections.filter((section) =>
        profileId
          ? section.authorId === profileId ||
            (!section.isPublic && section.authorId !== profileId)
          : false,
      ),
    [sections, profileId],
  );

  const officialSections = useMemo(
    () => sections.filter((section) => section.source === 'BILANPLUME'),
    [sections],
  );

  const communitySections = useMemo(
    () =>
      sections.filter((section) => {
        const isOfficial = section.source === 'BILANPLUME';
        const isMine = profileId ? section.authorId === profileId : false;
        return section.isPublic && !isOfficial && !isMine;
      }),
    [sections, profileId],
  );

  const tabs = useMemo(
    () => [
      {
        key: 'all',
        label: 'Toutes les parties',
        sections,
        hidden: sections.length === 0,
      },
      {
        key: 'mine',
        label: 'Mes parties',
        sections: mySections,
        hidden: mySections.length === 0,
      },
      {
        key: 'official',
        label: 'Partagées Bilan Plume',
        sections: officialSections,
        hidden: officialSections.length === 0,
      },
      {
        key: 'community',
        label: 'Partagées par la communauté',
        sections: communitySections,
        hidden: communitySections.length === 0,
      },
    ],
    [sections, mySections, officialSections, communitySections],
  );

  const mapSectionToCard = (section: Section): TrameInfo => {
    const baseSharedBy = section.author?.prenom ?? null;
    const sharedBy =
      profileId && section.authorId === profileId ? null : baseSharedBy;

    return {
      id: section.id,
      title: section.title,
      description: section.description,
      coverUrl: section.coverUrl,
      job: section.job,
      sharedBy,
    };
  };

  const handleSelect = (section: Section) => {
    const nextId = effectiveSelectedId === section.id ? null : section.id;
    setSelectedSectionId(nextId);
  };

  const handleValidate = () => {
    if (!effectiveSelectedId) return;
    const selected = sections.find(
      (section) => section.id === effectiveSelectedId,
    );
    if (!selected) return;
    onValidate(selected);
    onOpenChange(false);
  };

  const handlePreview = (section: Section) => {
    navigate(`/creation-trame/${section.id}`, {
      state: {
        ...(location.state as Record<string, unknown> | undefined),
        returnTo: location.pathname,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="screen-90" className="flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Explorer les parties</DialogTitle>
          <DialogDescription>
            Sélectionnez une partie à ajouter à votre construction ou créez-en
            une nouvelle.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <SectionLibraryView
            tabs={tabs}
            initialTab="all"
            selectedSectionId={effectiveSelectedId}
            onSelectSection={handleSelect}
            onPreviewSection={handlePreview}
            mapSectionToCard={mapSectionToCard}
            toolbarActions={
              <div className="ml-auto">
                <CreerTrameModal />
              </div>
            }
            isLoading={isLoading}
            searchPlaceholder="Rechercher une partie..."
          />
        </div>

        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleValidate}
            disabled={!effectiveSelectedId}
          >
            {effectiveSelectedId ? 'Ajouter cette partie' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExplorerSectionsModal;
