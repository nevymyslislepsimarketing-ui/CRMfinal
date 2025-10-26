import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const ProfitOverview = () => {
  const [selectedManager, setSelectedManager] = useState('');
  const [managers, setManagers] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [summary, setSummary] = useState({
    paid: 0,
    unpaid: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    if (selectedManager) {
      fetchProfitData();
    }
  }, [selectedManager]);

  const fetchManagers = async () => {
    try {
      const response = await api.get('/users');
      const managersList = response.data.users.filter(u => u.role === 'manager');
      setManagers(managersList);
      
      // Automaticky vybrat prvního manažera
      if (managersList.length > 0 && !selectedManager) {
        setSelectedManager(managersList[0].id);
      }
    } catch (error) {
      console.error('Chyba při načítání manažerů:', error);
    }
  };

  const fetchProfitData = async () => {
    if (!selectedManager) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/invoices/profit-overview/${selectedManager}`);
      
      setMonthlyData(response.data.monthlyData || []);
      setSummary(response.data.summary || { paid: 0, unpaid: 0, total: 0 });
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('cs-CZ', { 
      style: 'currency', 
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-green-600 flex items-center space-x-2">
            <CheckCircle size={16} />
            <span>Proplaceno: {formatCurrency(payload[0].value)}</span>
          </p>
          <p className="text-orange-600 flex items-center space-x-2">
            <Clock size={16} />
            <span>Čeká: {formatCurrency(payload[1].value)}</span>
          </p>
          <p className="text-blue-600 font-semibold mt-2 pt-2 border-t">
            Celkem: {formatCurrency(payload[0].value + payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <TrendingUp size={32} className="text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Přehled zisků</h1>
            <p className="text-gray-600 mt-1">Měsíční přehled fakturovaných částek</p>
          </div>
        </div>

        <div className="w-64">
          <label className="label">Vybrat manažera</label>
          <select
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
            className="input-field"
          >
            <option value="">-- Všichni manažeři --</option>
            {managers.map(manager => (
              <option key={manager.id} value={manager.id}>
                {manager.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Souhrn */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <CheckCircle size={28} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Proplaceno</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.paid)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <Clock size={28} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-700 font-medium">Čeká na proplacení</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(summary.unpaid)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <DollarSign size={28} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Celkem vyfakturováno</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(summary.total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graf */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Měsíční vývoj příjmů</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp size={48} className="mx-auto mb-4 opacity-30" />
            <p>Žádná data k zobrazení</p>
            <p className="text-sm mt-2">Vyberte manažera nebo vytvořte faktury</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="paid" 
                name="Proplaceno" 
                fill="#10b981" 
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="unpaid" 
                name="Čeká na proplacení" 
                fill="#f59e0b" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabulka detailů */}
      {monthlyData.length > 0 && (
        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Detail po měsících</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Měsíc
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proplaceno
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Čeká
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Celkem
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Úspěšnost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyData.map((row, index) => {
                  const total = row.paid + row.unpaid;
                  const successRate = total > 0 ? (row.paid / total * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">
                        {formatCurrency(row.paid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600 font-semibold">
                        {formatCurrency(row.unpaid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-bold">
                        {formatCurrency(total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`px-2 py-1 rounded ${
                          successRate >= 80 ? 'bg-green-100 text-green-800' :
                          successRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {successRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitOverview;
