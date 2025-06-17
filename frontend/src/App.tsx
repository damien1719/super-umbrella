import { useState } from 'react';
import AppSidebar from './components/Sidebar/AppSidebar';
import { SidebarProvider } from './components/ui/sidebar';
import Dashboard from './pages/Dashboard';
import MesBiens from './pages/MesBiens';
import Agenda from './pages/Agenda';
import Resultats from './pages/Resultats';
import Abonnement from './pages/Abonnement';
import MonCompte from './pages/MonCompte';
import { PageProvider, usePageStore } from './store/pageContext';
import type { Page } from './store/pageContext';

function PageContainer({ currentPage }: { currentPage: Page }) {
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
        <InnerApp />
      </SidebarProvider>
    </PageProvider>
  );
}

function InnerApp() {
  // Hooks dans le bon provider
  const currentPage = usePageStore((s) => s.currentPage);
  const setCurrentPage = usePageStore((s) => s.setCurrentPage);
  const [, setIsProfileDialogOpen] = useState(false);

  return (
    <>
      <AppSidebar
        activeSection={currentPage}
        onSectionChange={setCurrentPage}
        onProfileEdit={() => setIsProfileDialogOpen(true)}
      />
      <PageContainer currentPage={currentPage} />
      {/* Ici tu peux gérer ton dialog de profil */}
    </>
  );
}
