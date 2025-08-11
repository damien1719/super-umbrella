import { FormEvent, useEffect, useState, useRef } from 'react';
import { useAuth } from '../store/auth';
import { useNavigate } from 'react-router-dom';

const provider = (
  import.meta.env.VITE_AUTH_PROVIDER || 'supabase'
).toLowerCase();

export default function Login() {
  const navigate = useNavigate();
  const signIn = useAuth((s) => s.signIn);
  const signUp = useAuth((s) => s.signUp); // pour le bouton "Créer un compte" en KC
  const [email, setEmail] = useState('demo@local');
  const [pwd, setPwd] = useState('demo');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, initialized } = useAuth();
  const autoRef = useRef(false);


  useEffect(() => {
    if (initialized && user) navigate('/');
  }, [initialized, user, navigate]);

  // --- SUPABASE: formulaire classique ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, pwd); // en provider supabase, c'est bien email/pwd
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // --- KEYCLOAK: redirection SSO ---
  const handleSSOLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn(); // en provider keycloak, signIn() doit faire kc.login()
      // pas de navigate ici: redirection vers Keycloak puis retour
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion SSO');
      setLoading(false);
    }
  };

  const handleSSOSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      await signUp(); // en provider keycloak, signUp() doit faire kc.register()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible d’ouvrir la page d’inscription',
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    if (provider !== 'keycloak') return;
    if (!initialized) return;           // attendre l'init du store
    if (user) return;                   // déjà connecté
    if (autoRef.current) return;        // éviter doubles appels/HMR
    autoRef.current = true;
    void handleSSOLogin();
  }, [initialized, user]);

  // ----------------- RENDU -----------------
  if (provider === 'keycloak') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
    /* return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col gap-4 max-w-xs w-full p-4">
          <h1 className="text-2xl font-bold mb-4">Connexion</h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={handleSSOLogin}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Redirection…' : 'Se connecter avec SSO'}
          </button>

          <button
            type="button"
            onClick={handleSSOSignUp}
            className="border p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            disabled={loading}
          >
            Créer un compte
          </button>
        </div>
      </div>
    ); */
  }

  // --- SUPABASE (formulaire existant) ---
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-xs w-full p-4"
      >
        <h1 className="text-2xl font-bold mb-4">Connexion</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className="border p-2 rounded"
          disabled={loading}
        />
        <input
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="password"
          type="password"
          className="border p-2 rounded"
          disabled={loading}
        />

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        {import.meta.env.VITE_AUTH_PROVIDER === 'fake' && (
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                await signIn('demo@local', 'demo');
                navigate('/');
              } finally {
                setLoading(false);
              }
            }}
            className="border p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            disabled={loading}
          >
            ➡︎ Accès démo direct
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="border p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          disabled={loading}
        >
          Créer un compte
        </button>
      </form>
    </div>
  );
}
