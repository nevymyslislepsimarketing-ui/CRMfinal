import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Save, Building2 } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    billing_name: '',
    billing_ico: '',
    billing_dic: '',
    billing_address: '',
    billing_bank_account: '',
    billing_email: '',
    billing_phone: '',
  });

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      const response = await api.get(`/users/${user.id}/billing`);
      if (response.data.user) {
        setFormData({
          billing_name: response.data.user.billing_name || '',
          billing_ico: response.data.user.billing_ico || '',
          billing_dic: response.data.user.billing_dic || '',
          billing_address: response.data.user.billing_address || '',
          billing_bank_account: response.data.user.billing_bank_account || '',
          billing_email: response.data.user.billing_email || '',
          billing_phone: response.data.user.billing_phone || '',
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
    if (!formData.billing_name) {
      alert('Název firmy je povinný');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/users/${user.id}/billing`, formData);
      alert('Fakturační údaje úspěšně uloženy');
    } catch (error) {
      console.error('Chyba při ukládání nastavení:', error);
      alert('Nepodařilo se uložit fakturační údaje');
    } finally {
      setSaving(false);
    }
  };

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
                  value={formData.billing_name}
                  onChange={(e) => setFormData({ ...formData, billing_name: e.target.value })}
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
                    value={formData.billing_ico}
                    onChange={(e) => setFormData({ ...formData, billing_ico: e.target.value })}
                    className="input-field"
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <label className="label">DIČ</label>
                  <input
                    type="text"
                    value={formData.billing_dic}
                    onChange={(e) => setFormData({ ...formData, billing_dic: e.target.value })}
                    className="input-field"
                    placeholder="CZ12345678"
                  />
                </div>
              </div>

              <div>
                <label className="label">Adresa</label>
                <textarea
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
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
                  value={formData.billing_email}
                  onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                  className="input-field"
                  placeholder="fakturace@firma.cz"
                />
              </div>

              <div>
                <label className="label">Telefon</label>
                <input
                  type="tel"
                  value={formData.billing_phone}
                  onChange={(e) => setFormData({ ...formData, billing_phone: e.target.value })}
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
                value={formData.billing_bank_account}
                onChange={(e) => setFormData({ ...formData, billing_bank_account: e.target.value })}
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
