import AppSidebar from './components/Sidebar/Sidebar';
import { SidebarProvider } from './components/ui/sidebar';
import Dashboard from './pages/Dashboard';
import MesBiens from './pages/MesBiens';
import Agenda from './pages/Agenda';
import Resultats from './pages/Resultats';
import Abonnement from './pages/Abonnement';
import MonCompte from './pages/MonCompte';
import { PageProvider, usePageStore } from './store/pageContext';

function PageContainer() {
  const currentPage = usePageStore((s) => s.currentPage);

  switch (currentPage) {
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
      <SidebarProvider>
        <div className="flex h-screen">
          <AppSidebar />
          <main className="flex-1 p-4">
            <PageContainer />
          </main>
        </div>
      </SidebarProvider>
    </PageProvider>
  );
}
