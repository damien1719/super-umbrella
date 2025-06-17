import Dashboard from './pages/Dashboard';
import MesBiens from './pages/MesBiens';
import Agenda from './pages/Agenda';
import Resultats from './pages/Resultats';
import Abonnement from './pages/Abonnement';
import MonCompte from './pages/MonCompte';
import { usePageStore } from './store/pageContext';
import type { Page } from './store/pageContext';
import { Sidebar } from './components/Sidebar';

function PageRenderer({ page }: { page: Page }) {
  switch (page) {
    case 'Dashboard':
      return <Dashboard />;
    case 'MesBiens':
      return <MesBiens />;
    case 'Agenda':
      return <Agenda />;
    case 'Resultats':
      return <Resultats />;
    case 'Abonnement':
      return <Abonnement />;
    case 'MonCompte':
      return <MonCompte />;
    default:
      return null;
  }
}

export default function App() {
  const currentPage = usePageStore((s) => s.currentPage);
  const setCurrentPage = usePageStore((s) => s.setCurrentPage);

  return (
    <div className="flex">
      <Sidebar current={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 p-4">
        <PageRenderer page={currentPage} />
      </main>
    </div>
  );
}
