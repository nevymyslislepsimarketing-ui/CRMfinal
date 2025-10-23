import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Users, CheckSquare, FileText, AlertCircle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Non-manažeři přesměrovat na úkoly
  if (user && user.role !== 'manager') {
    return <Navigate to="/tasks" replace />;
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.stats);
      setRecentTasks(response.data.recentTasks);
      setUpcomingTasks(response.data.upcomingTasks);
      setRecentInvoices(response.data.recentInvoices);
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-red-100 text-red-800',
    };
    return styles[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Statistiky */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role === 'manager' ? 'lg:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-2'} gap-6 mb-8`}>
        <div 
          onClick={() => navigate('/clients')} 
          className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Celkem klientů</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalClients || 0}</p>
              <p className="text-blue-100 text-sm mt-1">
                {stats?.activeClients || 0} aktivních
              </p>
            </div>
            <Users size={48} className="text-blue-200" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/tasks')} 
          className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white cursor-pointer hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Nevyřízené úkoly</p>
              <p className="text-3xl font-bold mt-2">{stats?.pendingTasks || 0}</p>
              <p className="text-yellow-100 text-sm mt-1">K dokončení</p>
            </div>
            <CheckSquare size={48} className="text-yellow-200" />
          </div>
        </div>

        {/* Fakturační statistiky pouze pro manažery */}
        {user?.role === 'manager' && (
          <>
            <div 
              onClick={() => navigate('/invoices')} 
              className="card bg-gradient-to-br from-red-500 to-red-600 text-white cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Faktury po splatnosti</p>
                  <p className="text-3xl font-bold mt-2">{stats?.overdueInvoices || 0}</p>
                  <p className="text-red-100 text-sm mt-1">
                    Z {stats?.totalInvoices || 0} celkem
                  </p>
                </div>
                <AlertCircle size={48} className="text-red-200" />
              </div>
            </div>

            <div 
              onClick={() => navigate('/invoices')} 
              className="card bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Nezaplaceno</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(stats?.unpaidAmount || 0)}
                  </p>
                  <p className="text-green-100 text-sm mt-1">Celková částka</p>
                </div>
                <TrendingUp size={48} className="text-green-200" />
              </div>
            </div>

            <div 
              onClick={() => navigate('/invoices')} 
              className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Za tento měsíc</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(stats?.monthlyPaidAmount || 0)}
                  </p>
                  <p className="text-purple-100 text-sm mt-1">Vyfakturováno</p>
                </div>
                <FileText size={48} className="text-purple-200" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nadcházející úkoly */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Nadcházející úkoly</h2>
            <Link
              to="/tasks"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Zobrazit vše
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">Žádné nadcházející úkoly</p>
            ) : (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Klient: {task.client_name || 'Neznámý'}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          Termín: {formatDate(task.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Nedávné faktury - pouze pro manažery */}
        {user?.role === 'manager' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Nedávné faktury</h2>
            <Link
              to="/invoices"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Zobrazit vše
            </Link>
          </div>
          <div className="space-y-3">
            {recentInvoices.length === 0 ? (
              <p className="text-gray-500 text-sm">Žádné faktury</p>
            ) : (
              recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {invoice.invoice_number}
                        </h3>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {invoice.client_name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          Splatnost: {formatDate(invoice.due_date)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            invoice.paid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {invoice.paid ? 'Zaplaceno' : 'Nezaplaceno'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
