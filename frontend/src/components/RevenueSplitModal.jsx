import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import api from '../api/axios';

const RevenueSplitModal = ({ client, onClose, onSave }) => {
  const [users, setUsers] = useState([]);
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Načíst uživatele
      const usersResponse = await api.get('/users');
      setUsers(usersResponse.data.users);

      // Načíst existující rozdělení
      const splitsResponse = await api.get(`/revenue-splits/client/${client.id}`);
      
      // Vytvořit splits pro všechny uživatele
      const existingSplits = splitsResponse.data.splits || [];
      const allSplits = usersResponse.data.users.map(user => {
        const existing = existingSplits.find(s => s.user_id === user.id);
        return {
          user_id: user.id,
          user_name: user.name,
          amount: existing ? parseFloat(existing.amount) : 0,
          notes: existing ? existing.notes : ''
        };
      });
      
      setSplits(allSplits);
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (userId, value) => {
    setSplits(splits.map(s => 
      s.user_id === userId 
        ? { ...s, amount: parseFloat(value) || 0 }
        : s
    ));
  };

  const handleNotesChange = (userId, value) => {
    setSplits(splits.map(s => 
      s.user_id === userId 
        ? { ...s, notes: value }
        : s
    ));
  };

  const getTotalSplit = () => {
    return splits.reduce((sum, s) => sum + s.amount, 0);
  };

  const handleSave = () => {
    const validSplits = splits.filter(s => s.amount > 0);
    onSave(validSplits);
  };

  const totalSplit = getTotalSplit();
  const remaining = client.monthly_recurring_amount - totalSplit;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Rozdělení měsíčního příjmu</h2>
            <p className="text-sm text-gray-600 mt-1">
              Klient: {client.name} • Celková částka: {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(client.monthly_recurring_amount)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Přehled */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Celkem k rozdělení</p>
              <p className="text-2xl font-bold text-blue-700">
                {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(client.monthly_recurring_amount)}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Rozděleno</p>
              <p className="text-2xl font-bold text-purple-700">
                {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(totalSplit)}
              </p>
            </div>
            <div className={`${remaining < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
              <p className="text-sm text-gray-600">Zbývá</p>
              <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-700' : 'text-green-700'}`}>
                {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(remaining)}
              </p>
            </div>
          </div>

          {remaining < 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold">⚠️ Pozor! Rozdělená částka překračuje celkovou částku o {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(Math.abs(remaining))}</p>
            </div>
          )}

          {/* Seznam pracovníků */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Rozdělení mezi pracovníky:</h3>
            {splits.map(split => (
              <div key={split.user_id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <p className="font-medium text-gray-900">{split.user_name}</p>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-600 mb-1">Částka měsíčně</label>
                    <input
                      type="number"
                      value={split.amount}
                      onChange={(e) => handleAmountChange(split.user_id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="100"
                    />
                  </div>
                  <div className="col-span-5">
                    <label className="block text-xs text-gray-600 mb-1">Poznámka (volitelné)</label>
                    <input
                      type="text"
                      value={split.notes}
                      onChange={(e) => handleNotesChange(split.user_id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="např. za správu socek"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tlačítka */}
          <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
              disabled={remaining < 0}
            >
              <Save size={18} />
              <span>Uložit rozdělení</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Zrušit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueSplitModal;
