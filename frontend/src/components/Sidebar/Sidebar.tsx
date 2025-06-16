import './Sidebar.css';
import { usePageStore } from '../../store/pageContext';

export default function Sidebar() {
  const current = usePageStore((s) => s.currentPage);
  const setCurrentPage = usePageStore((s) => s.setCurrentPage);

  const items: {
    label: string;
    page: Parameters<typeof setCurrentPage>[0];
    icon: string;
  }[] = [
    { label: 'Dashboard', page: 'Dashboard', icon: '📊' },
    { label: 'Mes biens', page: 'MesBiens', icon: '🏠' },
    { label: 'Mon agenda', page: 'Agenda', icon: '📅' },
    { label: 'Déclaration fiscale', page: 'Resultats', icon: '📋' },
    { label: 'Abonnement', page: 'Abonnement', icon: '💳' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Menu</h2>
      </div>

      <div className="sidebar-content">
        {items.map((item) => (
          <button
            key={item.page}
            className={`sidebar-item ${current === item.page ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.page)}
          >
            <span className="sidebar-icon" role="img" aria-label={item.label}>
              {item.icon}
            </span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button
          className={`sidebar-item ${current === 'MonCompte' ? 'active' : ''}`}
          onClick={() => setCurrentPage('MonCompte')}
        >
          <span className="sidebar-icon" role="img" aria-label="Mon compte">
            👤
          </span>
          <span className="sidebar-label">Mon compte</span>
        </button>
      </div>
    </nav>
  );
}
