import { Tabs } from '@/components/ui/tabs';
import TrameCard from '../TrameCard';
import CreerTrameModal from '../ui/creer-trame-modale';
import { Plus } from 'lucide-react';
import type { TrameOption } from '../bilan/TrameSelector';

type TrameTabKey = 'mine' | 'official' | 'community';

interface TrameSelectionCollections {
  mine: TrameOption[];
  official: TrameOption[];
  community: TrameOption[];
}

interface TrameSelectionStepProps {
  mode: 'section' | 'bilanType';
  selectedTrame: TrameOption | undefined;
  onTrameChange: (value: string) => void;
  collections: TrameSelectionCollections;
  activeTab: TrameTabKey;
  onTabChange: (tab: TrameTabKey) => void;
  trameKind?: string;
  onCreateTrame: (id: string) => void;
}

export function TrameSelectionStep({
  mode,
  selectedTrame,
  onTrameChange,
  collections,
  activeTab,
  onTabChange,
  trameKind,
  onCreateTrame,
}: TrameSelectionStepProps) {
  const displayedTrames = (() => {
    switch (activeTab) {
      case 'mine':
        return collections.mine;
      case 'official':
        return collections.official;
      case 'community':
        return collections.community;
      default:
        return [] as TrameOption[];
    }
  })();

  return (
    <div className="space-y-4">
      <div
        className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-wood-50/60
               border-b border-wood-200 pt-2 pb-3"
      >
        <div className="flex items-center justify-between gap-3">
          <Tabs
            active={activeTab}
            onChange={(key) => onTabChange(key as TrameTabKey)}
            tabs={[
              {
                key: 'mine',
                label: mode === 'bilanType' ? 'Mes trames' : 'Mes parties',
                count: collections.mine.length,
                hidden: collections.mine.length === 0,
              },
              {
                key: 'official',
                label: 'Partagées par Bilan Plume',
                count: collections.official.length,
              },
              {
                key: 'community',
                label: 'Partagées par la communauté',
                count: collections.community.length,
              },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedTrames.map((trame) => (
          <TrameCard
            key={trame.value}
            trame={{
              id: trame.value,
              title: trame.label,
              description: trame.description,
              coverUrl: trame.coverUrl,
              sharedBy:
                trame.isPublic && trame.author?.prenom
                  ? trame.author.prenom
                  : undefined,
            }}
            kind={trameKind}
            selected={selectedTrame?.value === trame.value}
            onSelect={() => onTrameChange(trame.value)}
            showLink={true}
          />
        ))}

        <CreerTrameModal
          trigger={
            <button
              type="button"
              aria-label="Créer un nouveau test"
              className="
                group relative w-full max-w-120
                rounded-xl border-2 border-dashed
                border-primary-300 bg-primary-50/60
                hover:bg-primary-100/70 hover:border-primary-400
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
                transition-all duration-150
                p-5 flex flex-col items-center justify-center text-center
              "
            >
              <span
                className="
                  inline-flex h-10 w-10 items-center justify-center rounded-full
                  bg-primary-600 text-white mb-3 transition-transform
                  group-hover:scale-105
                "
              >
                <Plus className="h-5 w-5" />
              </span>
              <span className="font-semibold text-primary-700">
                {mode === 'bilanType'
                  ? 'Créez votre trame'
                  : 'Créez une partie personnalisée'}
              </span>
              <span className="mt-1 text-sm text-primary-700/80">
                {mode === 'bilanType'
                  ? 'Trame personnalisée à votre pratique'
                  : 'Partie de bilan personnalisée à votre pratique'}
              </span>
            </button>
          }
          initialCategory={trameKind}
          onCreated={onCreateTrame}
        />
      </div>
    </div>
  );
}

export type { TrameSelectionStepProps, TrameSelectionCollections, TrameTabKey };
