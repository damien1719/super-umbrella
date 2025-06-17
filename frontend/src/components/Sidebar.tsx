import { NavLink } from 'react-router-dom';
import { Button } from './ui/button';
import type { Page } from '../store/pageContext';

interface SidebarProps {
  onNavigate: (page: Page) => void;
}

// On ajoute le champ `path` pour chaque page
const items: { label: string; page: Page; path: string }[] = [
  { label: 'Dashboard', page: 'Dashboard', path: '/' },
  { label: 'Mes Biens', page: 'MesBiens', path: '/biens' },
  { label: 'Abonnement', page: 'Abonnement', path: '/abonnement' },
  { label: 'Mon Agenda', page: 'Agenda', path: '/agenda' },
  { label: 'Mon Compte', page: 'MonCompte', path: '/compte' },
  { label: 'Déclaration Fiscale', page: 'Resultats', path: '/resultats' },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <nav className="w-48 border-r min-h-screen p-4 space-y-2">
      {items.map((item) => (
        <NavLink key={item.page} to={item.path} end={item.path === '/'}>
          {({ isActive }) => (
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              data-active={isActive}
              onClick={() => onNavigate(item.page)}
            >
              {item.label}
            </Button>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
