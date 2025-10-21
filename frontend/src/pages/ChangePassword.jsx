import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Získat dočasný token z location state
  const tempToken = location.state?.tempToken;
  const userName = location.state?.userName;

  // Pokud není tempToken, přesměrovat na login
  React.useEffect(() => {
    if (!tempToken) {
      navigate('/login');
    }
  }, [tempToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validace
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
      // Nastavit dočasný token pro tento request
      const response = await api.post('/auth/change-password', 
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`
          }
        }
      );

      // Přihlásit uživatele s novým tokenem
      login(response.data.token, response.data.user);

      // Přesměrovat na úkoly (nebo dashboard pokud je manažer)
      if (response.data.user.role === 'manager') {
        navigate('/dashboard');
      } else {
        navigate('/tasks');
      }
    } catch (err) {
      console.error('Chyba při změně hesla:', err);
      setError(err.response?.data?.error || 'Nepodařilo se změnit heslo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Změna hesla</h1>
            <p className="text-gray-600 mt-2">
              {userName && `Vítejte, ${userName}!`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Pro pokračování si nastavte nové heslo
            </p>
          </div>

          {/* Upozornění */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Povinná změna hesla</strong><br />
              Z bezpečnostních důvodů musíte změnit své dočasné heslo.
            </p>
          </div>

          {/* Formulář */}
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
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Změna hesla...' : 'Změnit heslo'}
            </button>
          </form>

          {/* Bezpečnostní tipy */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">
              💡 Tipy pro silné heslo:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Kombinujte velká a malá písmena</li>
              <li>• Přidejte čísla a speciální znaky</li>
              <li>• Nepoužívejte osobní informace</li>
              <li>• Vytvořte unikátní heslo pro každý systém</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          © 2025 Nevymyslíš CRM
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
