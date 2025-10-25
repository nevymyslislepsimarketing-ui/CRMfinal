import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        console.error('Google auth error:', error);
        alert('Přihlášení selhalo');
        navigate('/google-drive');
        return;
      }

      if (code) {
        try {
          const response = await api.post('/google-drive/callback', { code });
          
          // Uložit tokeny do localStorage
          localStorage.setItem('google_access_token', response.data.access_token);
          if (response.data.refresh_token) {
            localStorage.setItem('google_refresh_token', response.data.refresh_token);
          }

          // Přesměrovat zpět na Google Drive
          navigate('/google-drive');
        } catch (error) {
          console.error('Chyba při zpracování callback:', error);
          alert('Nepodařilo se dokončit přihlášení');
          navigate('/google-drive');
        }
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Připojování k Google Drive...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
