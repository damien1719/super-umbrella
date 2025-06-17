import { Button } from './ui/button';
import type { Page } from '../store/pageContext';

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

const items: { label: string; page: Page }[] = [
  { label: 'Dashboard', page: 'Dashboard' },
  { label: 'MesBiens', page: 'MesBiens' },
  { label: 'Abonnement', page: 'Abonnement' },
  { label: 'Mon Agenda', page: 'Agenda' },
  { label: 'Mon Compte', page: 'MonCompte' },
  { label: 'Déclaration Fiscale', page: 'Resultats' },
];

export function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <nav className="w-48 border-r min-h-screen p-4 space-y-2">
      {items.map((item) => (
        <Button
          key={item.page}
          variant={current === item.page ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          data-active={current === item.page}
          onClick={() => onNavigate(item.page)}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
}
