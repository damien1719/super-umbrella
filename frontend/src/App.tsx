import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard';
import MesBiens from './pages/MesBiens';
import Agenda from './pages/Agenda';
import Resultats from './pages/Resultats';
import Abonnement from './pages/Abonnement';
import MonCompte from './pages/MonCompte';
import { PageProvider, usePageStore } from './store/pageContext';

function CurrentPage() {
  const page = usePageStore((s) => s.currentPage);
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
  return (
    <PageProvider>
      <div className="app">
        <Sidebar />
        <main className="main">
          <CurrentPage />
        </main>
      </div>
    </PageProvider>
  );
}
