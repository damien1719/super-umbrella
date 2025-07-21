import { FormEvent, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { validateEmail } from '../utils/validateEmail';
import { apiFetch } from '../utils/api';

export default function SignUp() {
  const navigate = useNavigate();
  const signUp = useAuth((s) => s.signUp);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [emailValid, setEmailValid] = useState(true);
  const [pwdValid, setPwdValid] = useState(true);
  const [confirmValid, setConfirmValid] = useState(true);

  useEffect(() => {
    setEmailValid(!email || validateEmail(email));
  }, [email]);

  useEffect(() => {
    setPwdValid(
      !password || (password.length >= 8 && /[^A-Za-z0-9]/.test(password)),
    );
    setConfirmValid(!confirm || confirm === password);
  }, [password, confirm]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isPwdValid = password.length >= 8 && /[^A-Za-z0-9]/.test(password);
    const isConfirmValid = password === confirm;
    setEmailValid(isEmailValid);
    setPwdValid(isPwdValid);
    setConfirmValid(isConfirmValid);
    if (!isEmailValid || !isPwdValid || !isConfirmValid || !accept) return;
    setLoading(true);
    setError(null);
    try {
      await signUp(email, password, firstName, lastName);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-xs w-full p-4"
      >
        <h1 className="text-2xl font-bold mb-4">Inscription</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Prénom"
          className="border p-2 rounded"
          disabled={loading}
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Nom"
          className="border p-2 rounded"
          disabled={loading}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className={`border p-2 rounded ${emailValid ? '' : 'border-red-500'}`}
          disabled={loading}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          type="password"
          className={`border p-2 rounded ${pwdValid ? '' : 'border-red-500'}`}
          disabled={loading}
        />
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirmation"
          type="password"
          className={`border p-2 rounded ${confirmValid ? '' : 'border-red-500'}`}
          disabled={loading}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
            disabled={loading}
          />
          J’accepte les CGU
        </label>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'S\u2019inscrire...' : 'S\u2019inscrire'}
        </button>
      </form>
    </div>
  );
}
