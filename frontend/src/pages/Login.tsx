import { FormEvent, useState } from 'react';
import { useAuth } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState('demo@local');
  const [pwd, setPwd] = useState('demo');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate('/bilans');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleSignIn(email, pwd);
  };

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
            onClick={() => handleSignIn('demo@local', 'demo')}
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
