import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!email) {
      setError('Zadejte prosím váš email');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      
      // Pro development zobrazit reset URL
      if (response.data.resetUrl) {
        setResetUrl(response.data.resetUrl);
      }
    } catch (err) {
      console.error('Chyba při žádosti o reset hesla:', err);
      setError(err.response?.data?.error || 'Nepodařilo se odeslat žádost');
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
              <Mail size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Zapomenuté heslo</h1>
            <p className="text-gray-600 mt-2">
              Zadejte váš email a my vám pošleme odkaz pro reset hesla
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="vas@email.cz"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Odesílání...' : 'Odeslat odkaz pro reset'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium mb-2">
                  ✅ Email odeslán!
                </p>
                <p className="text-sm text-green-700">
                  Pokud email existuje v našem systému, byl na něj odeslán odkaz pro reset hesla.
                  Zkontrolujte prosím vaši emailovou schránku.
                </p>
              </div>

              {/* Pro development zobrazit odkaz */}
              {resetUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-semibold mb-2">
                    🔧 Development mode - Reset odkaz:
                  </p>
                  <a 
                    href={resetUrl}
                    className="text-xs text-blue-800 break-all underline hover:text-blue-900"
                  >
                    {resetUrl}
                  </a>
                  <p className="text-xs text-blue-600 mt-2">
                    (V produkci bude odeslán emailem)
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setResetUrl('');
                }}
                className="w-full btn-secondary"
              >
                Odeslat další žádost
              </button>
            </div>
          )}

          {/* Zpět na přihlášení */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              <ArrowLeft size={16} className="mr-1" />
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

export default ForgotPassword;
