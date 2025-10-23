import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, Edit, Trash2, X, Mail, Phone, Users as UsersIcon, Eye, ExternalLink, Key, Lock } from 'lucide-react';

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [clientUsers, setClientUsers] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [editingCredential, setEditingCredential] = useState(null);
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
    google_drive_link: '',
  });
  const [credentialFormData, setCredentialFormData] = useState({
    platform: '',
    username: '',
    password: '',
    notes: '',
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
        google_drive_link: client.google_drive_link || '',
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
        google_drive_link: '',
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

  // Otevřít detail klienta
  const handleOpenDetailModal = async (client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
    
    // Načíst přihlašovací údaje
    try {
      const response = await api.get(`/clients/${client.id}/credentials`);
      setCredentials(response.data.credentials);
    } catch (error) {
      console.error('Chyba při načítání přihlašovacích údajů:', error);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedClient(null);
    setCredentials([]);
  };

  // Správa přihlašovacích údajů
  const handleOpenCredentialModal = (credential = null) => {
    if (credential) {
      setEditingCredential(credential);
      setCredentialFormData({
        platform: credential.platform,
        username: credential.username || '',
        password: credential.password || '',
        notes: credential.notes || '',
      });
    } else {
      setEditingCredential(null);
      setCredentialFormData({
        platform: '',
        username: '',
        password: '',
        notes: '',
      });
    }
    setShowCredentialModal(true);
  };

  const handleCloseCredentialModal = () => {
    setShowCredentialModal(false);
    setEditingCredential(null);
    setCredentialFormData({
      platform: '',
      username: '',
      password: '',
      notes: '',
    });
  };

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();

    if (!credentialFormData.platform) {
      alert('Platforma je povinná');
      return;
    }

    try {
      if (editingCredential) {
        await api.put(`/clients/${selectedClient.id}/credentials/${editingCredential.id}`, credentialFormData);
      } else {
        await api.post(`/clients/${selectedClient.id}/credentials`, credentialFormData);
      }
      
      // Znovu načíst přihlašovací údaje
      const response = await api.get(`/clients/${selectedClient.id}/credentials`);
      setCredentials(response.data.credentials);
      handleCloseCredentialModal();
    } catch (error) {
      console.error('Chyba při ukládání přihlašovacích údajů:', error);
      alert('Nepodařilo se uložit přihlašovací údaje');
    }
  };

  const handleDeleteCredential = async (credentialId) => {
    if (!window.confirm('Opravdu chcete smazat tyto přihlašovací údaje?')) {
      return;
    }

    try {
      await api.delete(`/clients/${selectedClient.id}/credentials/${credentialId}`);
      
      // Znovu načíst přihlašovací údaje
      const response = await api.get(`/clients/${selectedClient.id}/credentials`);
      setCredentials(response.data.credentials);
    } catch (error) {
      console.error('Chyba při mazání přihlašovacích údajů:', error);
      alert('Nepodařilo se smazat přihlašovací údaje');
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
                <button
                  onClick={() => handleOpenDetailModal(client)}
                  className="text-green-600 hover:text-green-700"
                  title="Zobrazit detail"
                >
                  <Eye size={18} />
                </button>
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

              <div>
                <label className="label">Google Drive odkaz</label>
                <input
                  type="url"
                  value={formData.google_drive_link}
                  onChange={(e) => setFormData({ ...formData, google_drive_link: e.target.value })}
                  className="input-field"
                  placeholder="https://drive.google.com/..."
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

      {/* Modal pro detail klienta */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Detail klienta - {selectedClient.name}
              </h2>
              <button onClick={handleCloseDetailModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Základní informace */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Základní informace</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Jméno</p>
                    <p className="font-medium">{selectedClient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block text-xs px-2 py-1 rounded ${getStatusBadge(selectedClient.status)}`}>
                      {selectedClient.status === 'active' ? 'Aktivní' : 'Neaktivní'}
                    </span>
                  </div>
                  {selectedClient.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium flex items-center">
                        <Mail size={16} className="mr-2" />
                        {selectedClient.email}
                      </p>
                    </div>
                  )}
                  {selectedClient.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Telefon</p>
                      <p className="font-medium flex items-center">
                        <Phone size={16} className="mr-2" />
                        {selectedClient.phone}
                      </p>
                    </div>
                  )}
                </div>
                {selectedClient.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Poznámky</p>
                    <p className="mt-1 text-gray-900">{selectedClient.notes}</p>
                  </div>
                )}
              </div>

              {/* Google Drive */}
              {selectedClient.google_drive_link && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Úložiště souborů</h3>
                  <a
                    href={selectedClient.google_drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                  >
                    <ExternalLink size={18} />
                    <span>Otevřít Google Drive</span>
                  </a>
                </div>
              )}

              {/* Fakturační údaje */}
              {(selectedClient.billing_company_name || selectedClient.ico || selectedClient.dic || selectedClient.billing_address) && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Fakturační údaje</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedClient.billing_company_name && (
                      <div>
                        <p className="text-sm text-gray-600">Název firmy</p>
                        <p className="font-medium">{selectedClient.billing_company_name}</p>
                      </div>
                    )}
                    {selectedClient.ico && (
                      <div>
                        <p className="text-sm text-gray-600">IČO</p>
                        <p className="font-medium">{selectedClient.ico}</p>
                      </div>
                    )}
                    {selectedClient.dic && (
                      <div>
                        <p className="text-sm text-gray-600">DIČ</p>
                        <p className="font-medium">{selectedClient.dic}</p>
                      </div>
                    )}
                    {selectedClient.billing_address && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Fakturační adresa</p>
                        <p className="font-medium whitespace-pre-line">{selectedClient.billing_address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Přihlašovací údaje */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Přihlašovací údaje</h3>
                  <button
                    onClick={() => handleOpenCredentialModal()}
                    className="btn-primary text-sm flex items-center space-x-1"
                  >
                    <Plus size={16} />
                    <span>Přidat údaje</span>
                  </button>
                </div>

                {credentials.length === 0 ? (
                  <p className="text-gray-500 text-sm">Žádné přihlašovací údaje</p>
                ) : (
                  <div className="space-y-3">
                    {credentials.map((cred) => (
                      <div key={cred.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Key size={16} className="text-purple-600" />
                              <h4 className="font-semibold text-gray-900">{cred.platform}</h4>
                            </div>
                            {cred.username && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Uživatelské jméno:</span> {cred.username}
                              </p>
                            )}
                            {cred.password && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <Lock size={14} className="mr-1" />
                                <span className="font-medium">Heslo:</span> 
                                <span className="ml-1 font-mono">{cred.password}</span>
                              </p>
                            )}
                            {cred.notes && (
                              <p className="text-sm text-gray-500 mt-2">{cred.notes}</p>
                            )}
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={() => handleOpenCredentialModal(cred)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCredential(cred.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button onClick={handleCloseDetailModal} className="btn-secondary">
                  Zavřít
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pro přidání/úpravu přihlašovacích údajů */}
      {showCredentialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingCredential ? 'Upravit přihlašovací údaje' : 'Přidat přihlašovací údaje'}
              </h2>
              <button onClick={handleCloseCredentialModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCredentialSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Platforma *</label>
                <input
                  type="text"
                  value={credentialFormData.platform}
                  onChange={(e) => setCredentialFormData({ ...credentialFormData, platform: e.target.value })}
                  className="input-field"
                  placeholder="např. Facebook, Instagram, Google Ads..."
                  required
                />
              </div>

              <div>
                <label className="label">Přihlašovací jméno</label>
                <input
                  type="text"
                  value={credentialFormData.username}
                  onChange={(e) => setCredentialFormData({ ...credentialFormData, username: e.target.value })}
                  className="input-field"
                  placeholder="Email nebo uživatelské jméno"
                />
              </div>

              <div>
                <label className="label">Heslo</label>
                <input
                  type="text"
                  value={credentialFormData.password}
                  onChange={(e) => setCredentialFormData({ ...credentialFormData, password: e.target.value })}
                  className="input-field"
                  placeholder="Heslo"
                />
              </div>

              <div>
                <label className="label">Poznámky</label>
                <textarea
                  value={credentialFormData.notes}
                  onChange={(e) => setCredentialFormData({ ...credentialFormData, notes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Dodatečné informace..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {editingCredential ? 'Uložit změny' : 'Přidat údaje'}
                </button>
                <button type="button" onClick={handleCloseCredentialModal} className="flex-1 btn-secondary">
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
