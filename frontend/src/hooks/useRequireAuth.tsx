import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const provider = (import.meta.env.VITE_AUTH_PROVIDER || 'supabase').toLowerCase();
  useEffect(() => {
    if (!loading && !user) {
      if (provider !== 'keycloak') {
        navigate('/login');
      }
      // sinon, on laisse App.tsx afficher <SSOLoginRedirect />
    }
  }, [user, loading, navigate, provider]);
};
