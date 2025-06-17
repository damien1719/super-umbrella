import { useState } from 'react';
import AppSidebar from './components/SideBar/AppSidebar';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import Dashboard from './pages/Dashboard';
import MesBiens from './pages/MesBiens';
import Agenda from './pages/Agenda';
import Resultats from './pages/Resultats';
import Abonnement from './pages/Abonnement';
import MonCompte from './pages/MonCompte';
import { PageProvider, usePageStore } from './store/pageContext';
import type { Page } from './store/pageContext';


export default function App() {
  const [activeSection, setActiveSection] = useState("MesBiens")
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

  const renderActiveSection = () => {
    switch (activeSection) {
      case "Dashboard":
        return <Dashboard />
      case "MesBiens":
        return <MesBiens />
      case "Agenda":
        return <Agenda />
      case "Abonnement":
        return <Abonnement />
      default:
        return <MonCompte />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onProfileEdit={() => setIsProfileDialogOpen(true)}
      />
      <SidebarInset>
        <main className="flex-1 space-y-4 p-8 pt-6">{renderActiveSection()}</main>
      </SidebarInset>


    </SidebarProvider>
  )
}