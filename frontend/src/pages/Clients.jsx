import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, Edit, Trash2, X, Mail, Phone, Users as UsersIcon } from 'lucide-react';

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [clientUsers, setClientUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    notes: '',
    billing_company_name: '',
    ico: '',
    dic: '',
    billing_address: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.clients);
    } catch (error) {
      console.error('Chyba při načítání klientů:', error);
      alert('Nepodařilo se načíst klienty');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        status: client.status,
        notes: client.notes || '',
        billing_company_name: client.billing_company_name || '',
        ico: client.ico || '',
        dic: client.dic || '',
        billing_address: client.billing_address || '',
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'active',
        notes: '',
        billing_company_name: '',
        ico: '',
        dic: '',
        billing_address: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'active',
      notes: '',
      billing_company_name: '',
      ico: '',
      dic: '',
      billing_address: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Jméno klienta je povinné');
      return;
    }

    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      fetchClients();
      handleCloseModal();
    } catch (error) {
      console.error('Chyba při ukládání klienta:', error);
      alert('Nepodařilo se uložit klienta');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Opravdu chcete smazat tohoto klienta?')) {
      return;
    }

    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch (error) {
      console.error('Chyba při mazání klienta:', error);
      alert('Nepodařilo se smazat klienta');
    }
  };

  const getStatusBadge = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const handleOpenAccessModal = async (client) => {
    setSelectedClient(client);
    try {
      // Načíst všechny uživatele
      const usersResponse = await api.get('/users');
      setAllUsers(usersResponse.data.users.filter(u => u.role !== 'manager'));
      
      // Načíst uživatele s přístupem k tomuto klientovi
      const clientUsersResponse = await api.get(`/clients/${client.id}/users`);
      setClientUsers(clientUsersResponse.data.users);
      
      setShowAccessModal(true);
    } catch (error) {
      console.error('Chyba při načítání uživatelů:', error);
      alert('Nepodařilo se načíst uživatele');
    }
  };

  const handleToggleAccess = async (userId) => {
    const hasAccess = clientUsers.some(u => u.id === userId);
    
    try {
      if (hasAccess) {
        // Odebrat přístup
        await api.delete(`/clients/${selectedClient.id}/users/${userId}`);
        setClientUsers(clientUsers.filter(u => u.id !== userId));
      } else {
        // Přidat přístup
        await api.post(`/clients/${selectedClient.id}/users/${userId}`);
        const user = allUsers.find(u => u.id === userId);
        setClientUsers([...clientUsers, user]);
      }
    } catch (error) {
      console.error('Chyba při změně přístupu:', error);
      alert('Nepodařilo se změnit přístup');
    }
  };

  const handleCloseAccessModal = () => {
    setShowAccessModal(false);
    setSelectedClient(null);
    setClientUsers([]);
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Klienti</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center space-x-2">
          <Plus size={18} />
          <span>Přidat klienta</span>
        </button>
      </div>

      {/* Seznam klientů */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="card hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                <span className={`inline-block text-xs px-2 py-1 rounded mt-2 ${getStatusBadge(client.status)}`}>
                  {client.status === 'active' ? 'Aktivní' : 'Neaktivní'}
                </span>
              </div>
              <div className="flex space-x-2">
                {user?.role === 'manager' && (
                  <button
                    onClick={() => handleOpenAccessModal(client)}
                    className="text-blue-600 hover:text-blue-700"
                    title="Spravovat přístup"
                  >
                    <UsersIcon size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleOpenModal(client)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {client.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-2" />
                  {client.email}
                </div>
              )}
              {client.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-2" />
                  {client.phone}
                </div>
              )}
              {client.notes && (
                <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
                  {client.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Zatím žádní klienti</p>
        </div>
      )}

      {/* Modal pro přidání/úpravu klienta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingClient ? 'Upravit klienta' : 'Přidat klienta'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Jméno *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Aktivní</option>
                  <option value="inactive">Neaktivní</option>
                </select>
              </div>

              <div>
                <label className="label">Poznámky</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={4}
                />
              </div>

              {/* Fakturační údaje */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-4">Fakturační údaje</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">Název firmy</label>
                    <input
                      type="text"
                      value={formData.billing_company_name}
                      onChange={(e) => setFormData({ ...formData, billing_company_name: e.target.value })}
                      className="input-field"
                      placeholder="např. Firma s.r.o."
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
                    <label className="label">Fakturační adresa</label>
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

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {editingClient ? 'Uložit změny' : 'Přidat klienta'}
                </button>
                <button type="button" onClick={handleCloseModal} className="flex-1 btn-secondary">
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pro správu přístupu */}
      {showAccessModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Správa přístupu - {selectedClient.name}
              </h2>
              <button onClick={handleCloseAccessModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Vyberte uživatele, kteří mají mít přístup k tomuto klientovi
              </p>

              <div className="space-y-2">
                {allUsers.map((userItem) => {
                  const hasAccess = clientUsers.some(u => u.id === userItem.id);
                  return (
                    <div
                      key={userItem.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-gray-900">{userItem.name}</p>
                          <p className="text-sm text-gray-500">{userItem.email}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasAccess}
                          onChange={() => handleToggleAccess(userItem.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  );
                })}
              </div>

              {allUsers.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Žádní zaměstnanci k dispozici
                </p>
              )}

              <div className="mt-6">
                <button
                  onClick={handleCloseAccessModal}
                  className="w-full btn-primary"
                >
                  Zavřít
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
