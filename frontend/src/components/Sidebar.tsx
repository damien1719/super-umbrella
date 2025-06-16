import './Sidebar.css';
import { usePageStore } from '../store/pageContext';

export default function Sidebar() {
  const current = usePageStore((s) => s.currentPage);
  const setCurrentPage = usePageStore((s) => s.setCurrentPage);

  const items: { label: string; page: Parameters<typeof setCurrentPage>[0] }[] =
    [
      { label: 'Dashboard', page: 'Dashboard' },
      { label: 'Mes biens', page: 'MesBiens' },
      { label: 'Mon agenda', page: 'Agenda' },
      { label: 'Déclaration fiscale', page: 'Resultats' },
      { label: 'Abonnement', page: 'Abonnement' },
    ];

  return (
    <nav className="sidebar">
      {items.map((item) => (
        <button
          key={item.page}
          className={current === item.page ? 'active' : ''}
          onClick={() => setCurrentPage(item.page)}
        >
          {item.label}
        </button>
      ))}
      <div className="bottom">
        <button
          className={current === 'MonCompte' ? 'active' : ''}
          onClick={() => setCurrentPage('MonCompte')}
        >
          Mon compte
        </button>
      </div>
    </nav>
  );
}
