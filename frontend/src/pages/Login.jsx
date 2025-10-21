import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Vyplňte všechna pole');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      // Zkontrolovat, zda je nutná změna hesla
      if (result.requirePasswordChange) {
        navigate('/change-password', {
          state: {
            tempToken: result.tempToken,
            userName: result.user.name
          }
        });
      } else {
        // Normální přihlášení
        if (result.user && result.user.role === 'manager') {
          navigate('/dashboard');
        } else {
          navigate('/tasks');
        }
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">Nevymyslíš CRM</h1>
          <p className="text-gray-600">Přihlaste se do systému</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="vas@email.cz"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Heslo
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Přihlásit se</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Nemáte účet?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Zaregistrujte se
              </Link>
            </p>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold mb-1">Demo přístup:</p>
            <p className="text-xs text-gray-500">Email: admin@nevymyslis.cz</p>
            <p className="text-xs text-gray-500">Heslo: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
