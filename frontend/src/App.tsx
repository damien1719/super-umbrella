import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';
import { useRequireAuth } from './hooks/useRequireAuth';
import { useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import MesBiens from './pages/MesBiens';
import Agenda from './pages/Agenda';
import Resultats from './pages/Resultats';
import Abonnement from './pages/Abonnement';
import MonCompte from './pages/MonCompte';
import Login from './pages/Login';
import { usePageStore } from './store/pageContext';
import { Sidebar } from './components/Sidebar';

function ProtectedLayout() {
  const currentPage = usePageStore((s) => s.currentPage);
  const setCurrentPage = usePageStore((s) => s.setCurrentPage);
  const { user, loading, initialize } = useAuth();
  useRequireAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  console.log('currrent Page', currentPage);
  console.log('user', user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex">
      <Sidebar onNavigate={setCurrentPage} />
      <main className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/biens" element={<MesBiens />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/resultats" element={<Resultats />} />
          <Route path="/abonnement" element={<Abonnement />} />
          <Route path="/compte" element={<MonCompte />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
