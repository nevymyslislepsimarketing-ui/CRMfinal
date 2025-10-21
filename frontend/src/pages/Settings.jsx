import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Save, Building2 } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    ico: '',
    dic: '',
    address: '',
    bank_account: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user?.role !== 'manager') {
      return;
    }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/company-settings/my');
      if (response.data.settings) {
        setFormData({
          company_name: response.data.settings.company_name || '',
          ico: response.data.settings.ico || '',
          dic: response.data.settings.dic || '',
          address: response.data.settings.address || '',
          bank_account: response.data.settings.bank_account || '',
          email: response.data.settings.email || '',
          phone: response.data.settings.phone || '',
        });
      }
    } catch (error) {
      console.error('Chyba při načítání nastavení:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name) {
      alert('Název firmy je povinný');
      return;
    }

    setSaving(true);
    try {
      await api.post('/company-settings/my', formData);
      alert('Fakturační údaje úspěšně uloženy');
    } catch (error) {
      console.error('Chyba při ukládání nastavení:', error);
      alert('Nepodařilo se uložit fakturační údaje');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'manager') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Přístup odepřen</h1>
        <p className="text-gray-600 mt-2">Nemáte oprávnění k této stránce</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Building2 size={32} className="text-primary-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fakturační údaje</h1>
          <p className="text-gray-600 mt-1">Nastavte svoje údaje pro vystavování faktur</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Základní údaje</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Název firmy *</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="např. Nevymyslíš s.r.o."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">IČO</label>
                  <input
                    type="text"
                    value={formData.ico}
                    onChange={(e) => setFormData({ ...formData, ico: e.target.value })}
                    className="input-field"
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <label className="label">DIČ</label>
                  <input
                    type="text"
                    value={formData.dic}
                    onChange={(e) => setFormData({ ...formData, dic: e.target.value })}
                    className="input-field"
                    placeholder="CZ12345678"
                  />
                </div>
              </div>

              <div>
                <label className="label">Adresa</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Ulice 123, 110 00 Praha 1"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Kontaktní údaje</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="fakturace@firma.cz"
                />
              </div>

              <div>
                <label className="label">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="+420 777 888 999"
                />
              </div>
            </div>
          </div>

          <div className="pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bankovní údaje</h2>
            
            <div>
              <label className="label">Číslo účtu</label>
              <input
                type="text"
                value={formData.bank_account}
                onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                className="input-field"
                placeholder="123456789/0100"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              <Save size={18} />
              <span>{saving ? 'Ukládám...' : 'Uložit nastavení'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Tyto údaje budou automaticky použity při vytváření faktur a PDF exportu.
        </p>
      </div>
    </div>
  );
};

export default Settings;
