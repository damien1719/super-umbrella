import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './store/auth';
import { useRequireAuth } from './hooks/useRequireAuth';
import { useEffect, useRef } from 'react';
import BilanV2 from './pages/MesBilans';
import Bilan from './pages/EditeurBilan';
import Agenda from './pages/Agenda';
import Abonnement from './pages/Abonnement';
import MonCompteV2 from './pages/MonCompte';
import Patients from './pages/Patients';
import Bibliotheque from './pages/Bibliothèque';
import CreationTrame from './pages/CreationTrame';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { usePageStore } from './store/pageContext';
import { useUserProfileStore } from './store/userProfile';
import { AppSidebar } from './components/AppSidebar';


/* function useInitAuth() {
  const { loading, initialize } = useAuth();

  useEffect(() => {
    const provider = (import.meta.env.VITE_AUTH_PROVIDER || 'fake').toLowerCase();

    if (provider === 'keycloak') {
      initKeycloak({ onLoad: 'check-sso', pkceMethod: 'S256', checkLoginIframe: false })
        .then(() => {
          if (kc.authenticated) {
            setAuthTokenGetter(() => kc.token || undefined);
          }
          initialize();
        })
        .catch(console.error);
    } else {
      initialize();
    }
  }, [initialize]);

  return loading;
} */

function useInitAuth() {
  const { loading, initialize } = useAuth();

  useEffect(() => {
    initialize()
      .then(() => console.log('[auth] initialize done'))
      .catch((e) => console.error('[auth] initialize err', e));
  }, [initialize]);

  return loading;
}

function ProtectedLayout() {
  const setCurrentPage = usePageStore((s) => s.setCurrentPage);
  const { user } = useAuth();
  const { profileId, fetchProfile } = useUserProfileStore();
  const loading = useInitAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useRequireAuth();

  useEffect(() => {
    if (user && !profileId) {
      fetchProfile().catch(() => {
        /* ignore */
      });
    }
  }, [user, profileId, fetchProfile]);

/*   useEffect(() => {
    if (user) {
      const atRoot = location.pathname === '/' || location.pathname === '';
      if (!atRoot) navigate('/', { replace: true });
    }
  }, [user, location.pathname, navigate]); */

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    if (provider === 'keycloak') {
      return <SSOLoginRedirect />;
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar onNavigate={setCurrentPage} />
      <main className="flex-1 p-4 overflow-auto bg-wood-50">
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
    if (provider === 'keycloak') {
      return <SSOLoginRedirect />; // 👉 redirige direct vers Keycloak
    }
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
    if (provider === 'keycloak') {
      return <SSOLoginRedirect />;
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="">
      <Outlet />
    </main>
  );
}


function SSOLoginRedirect() {
  const signIn = useAuth((s) => s.signIn);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    console.log('[SSO] redirecting to KC login');
    signIn().catch((e) => {
      console.error('[SSO] login error', e);
      calledRef.current = false;
    });
  }, [signIn]);

  return <div>Redirection vers l’espace sécurisé…</div>;
}

const provider = (import.meta.env.VITE_AUTH_PROVIDER || 'supabase').toLowerCase();




export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {provider !== 'keycloak' && <Route path="/signup" element={<SignUp />} />}
      <Route element={<WizardLayout />}></Route>
      <Route element={<BilanLayout />}>
        <Route path="/bilan/:bilanId" element={<Bilan />} />
      </Route>
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<BilanV2 />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/bibliotheque" element={<Bibliotheque />} />
        <Route path="/creation-trame/:sectionId" element={<CreationTrame />} />
        <Route path="/abonnement" element={<Abonnement />} />
        <Route path="/compte" element={<MonCompteV2 />} />
      </Route>
    </Routes>
  );
}
