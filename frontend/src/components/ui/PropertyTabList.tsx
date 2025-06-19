import { cn } from '../../lib/utils';

type Tab = 'view' | 'documents' | 'finances' | 'inventaire';

interface PropertyTabListProps {
  value: Tab;
  onChange: (tab: Tab) => void;
}

export function PropertyTabList({ value, onChange }: PropertyTabListProps) {
  const tabs: Tab[] = ['view', 'documents', 'finances', 'inventaire'];
  const labels = {
    view: 'Vue',
    documents: 'Documents',
    finances: 'Finances',
    inventaire: 'Inventaire',
  };
  return (
    <div className="mb-4 flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={cn(
            'px-4 py-2 text-sm font-medium',
            value === tab
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500',
          )}
          onClick={() => onChange(tab)}
        >
          {labels[tab]}
        </button>
      ))}
    </div>
  );
}
