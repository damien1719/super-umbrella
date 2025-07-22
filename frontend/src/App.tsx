import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './store/auth';
import { useRequireAuth } from './hooks/useRequireAuth';
import { useEffect } from 'react';
import MesBilans from './pages/MesBilans';
import PropertyDashboard from './pages/PropertyDashboard';
import NewLocation from './pages/NewLocation';
import Bilan from './pages/Bilan';
import Agenda from './pages/Agenda';
import Abonnement from './pages/Abonnement';
import MonCompteV2 from './pages/MonCompte';
import Patients from './pages/Patients';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { usePageStore } from './store/pageContext';
import { useUserProfileStore } from './store/userProfile';
import { AppSidebar } from './components/AppSidebar';

function useInitAuth() {
  const { loading, initialize } = useAuth();
  useEffect(() => {
    initialize();
  }, [initialize]);
  return loading;
}

function ProtectedLayout() {
  const setCurrentPage = usePageStore((s) => s.setCurrentPage);
  const { user } = useAuth();
  const { profileId, fetchProfile } = useUserProfileStore();
  const loading = useInitAuth();
  useRequireAuth();

  useEffect(() => {
    if (user && !profileId) {
      fetchProfile().catch(() => {
        /* ignore */
      });
    }
  }, [user, profileId, fetchProfile]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex">
      <AppSidebar onNavigate={setCurrentPage} />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}

function WizardLayout() {
  const setCurrentPage = usePageStore((s) => s.setCurrentPage);
  const { user } = useAuth();
  const { profileId, fetchProfile } = useUserProfileStore();
  const loading = useInitAuth();
  useRequireAuth();

  useEffect(() => {
    if (user && !profileId) {
      fetchProfile().catch(() => {
        /* ignore */
      });
    }
  }, [user, profileId, fetchProfile]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex">
      <AppSidebar onNavigate={setCurrentPage} />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}

function BilanLayout() {
  const { user } = useAuth();
  const loading = useInitAuth();
  useRequireAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="">
      <Outlet />
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route element={<WizardLayout />}>
        <Route path="/biens/:id/locations/new" element={<NewLocation />} />
      </Route>
      <Route element={<BilanLayout />}>
        <Route path="/bilan/:bilanId" element={<Bilan />} />
      </Route>
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<MesBilans />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/biens/:id/dashboard" element={<PropertyDashboard />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/abonnement" element={<Abonnement />} />
        <Route path="/compte" element={<MonCompteV2 />} />
      </Route>
    </Routes>
  );
}
