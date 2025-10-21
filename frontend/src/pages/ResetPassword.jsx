import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Chybí reset token. Použijte odkaz z emailu.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Chybí reset token');
      return;
    }

    if (newPassword.length < 8) {
      setError('Heslo musí mít alespoň 8 znaků');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword
      });

      setSuccess(true);

      // Po 3 sekundách přesměrovat na login
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Chyba při resetu hesla:', err);
      setError(err.response?.data?.error || 'Nepodařilo se resetovat heslo');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Heslo změněno!</h1>
            <p className="text-gray-600 mb-6">
              Vaše heslo bylo úspěšně změněno. Za chvíli budete přesměrováni na přihlášení.
            </p>
            <Link
              to="/login"
              className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium transition"
            >
              Přejít na přihlášení
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Nové heslo</h1>
            <p className="text-gray-600 mt-2">
              Zadejte své nové heslo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Nové heslo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nové heslo *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                  placeholder="Alespoň 8 znaků"
                  required
                  autoFocus
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimálně 8 znaků
              </p>
            </div>

            {/* Potvrzení hesla */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potvrzení hesla *
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                  placeholder="Zadejte heslo znovu"
                  required
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Tlačítko */}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetování hesla...' : 'Resetovat heslo'}
            </button>
          </form>

          {/* Zpět na přihlášení */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Zpět na přihlášení
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          © 2025 Nevymyslíš CRM
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
