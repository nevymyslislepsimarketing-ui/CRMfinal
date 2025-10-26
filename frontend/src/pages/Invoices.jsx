import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit, Trash2, X, CheckCircle, Calendar, DollarSign, FileText, Repeat } from 'lucide-react';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('one-time'); // 'one-time' nebo 'recurring'
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [revenueSplits, setRevenueSplits] = useState([]);
  const [formData, setFormData] = useState({
    invoice_number: '',
    client_id: '',
    amount: '',
    description: '',
    issued_at: '',
    due_date: '',
    paid: false,
    monthly_recurring_amount: '',
    invoice_day: '',
    invoice_due_days: '',
  });

  useEffect(() => {
    fetchInvoices();
    fetchRecurring();
    fetchClients();
    fetchUsers();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data.invoices);
    } catch (error) {
      console.error('Chyba při načítání faktur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecurring = async () => {
    try {
      const response = await api.get('/invoices/recurring');
      setRecurring(response.data.recurring);
    } catch (error) {
      console.error('Chyba při načítání pravidelných faktur:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.clients);
    } catch (error) {
      console.error('Chyba při načítání klientů:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data.users);
    } catch (error) {
      console.error('Chyba při načítání uživatelů:', error);
    }
  };

  const handleOpenPDF = async (id) => {
    try {
      // Použít fetch s autorizací místo window.open
      const response = await api.get(`/invoices/${id}/html`, {
        responseType: 'text'
      });
      
      // Vytvořit blob z HTML
      const blob = new Blob([response.data], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Otevřít v novém okně
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Chyba při otevírání PDF:', error);
      alert('Nepodařilo se otevřít PDF faktury');
    }
  };

  const handleOpenModal = (type = 'one-time', invoice = null) => {
    setModalType(type);
    setRevenueSplits([]); // Reset splits
    
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        invoice_number: invoice.invoice_number,
        client_id: invoice.client_id || '',
        description: invoice.description || '',
        amount: invoice.amount,
        issued_at: invoice.issued_at ? invoice.issued_at.split('T')[0] : '',
        due_date: invoice.due_date ? invoice.due_date.split('T')[0] : '',
        paid: invoice.paid,
        monthly_recurring_amount: '',
        invoice_day: '',
        invoice_due_days: '',
      });
    } else {
      setEditingInvoice(null);
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const dueDate = nextMonth.toISOString().split('T')[0];
      
      setFormData({
        client_id: '',
        amount: '',
        description: '',
        issued_at: today,
        due_date: dueDate,
        paid: false,
        monthly_recurring_amount: '',
        invoice_day: '1',
        invoice_due_days: '14',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modalType === 'recurring') {
      // Pravidelná faktura
      if (!formData.client_id || !formData.monthly_recurring_amount) {
        alert('Vyplňte klienta a měsíční částku');
        return;
      }

      try {
        // Aktualizovat klienta s pravidelnou fakturací
        await api.put(`/clients/${formData.client_id}`, {
          monthly_recurring_amount: parseFloat(formData.monthly_recurring_amount),
          invoice_day: parseInt(formData.invoice_day) || 1,
          invoice_due_days: parseInt(formData.invoice_due_days) || 14,
        });

        // Uložit rozdělení příjmů pokud jsou
        if (revenueSplits.length > 0) {
          const validSplits = revenueSplits.filter(s => s.amount > 0);
          await api.post(`/revenue-splits/client/${formData.client_id}`, { 
            splits: validSplits 
          });
        }

        alert('Pravidelná fakturace nastavena');
        fetchRecurring();
        handleCloseModal();
      } catch (error) {
        console.error('Chyba při nastavování pravidelné fakturace:', error);
        alert(error.response?.data?.error || 'Nepodařilo se nastavit pravidelnou fakturaci');
      }
    } else {
      // Jednorázová faktura
      if (!formData.client_id || !formData.amount || !formData.issued_at || !formData.due_date || !formData.description) {
        alert('Vyplňte všechna povinná pole (včetně popisu služeb)');
        return;
      }

      try {
        const submitData = {
          ...formData,
          client_id: parseInt(formData.client_id),
          amount: parseFloat(formData.amount),
        };

        let invoiceId;
        if (editingInvoice) {
          await api.put(`/invoices/${editingInvoice.id}`, submitData);
          invoiceId = editingInvoice.id;
        } else {
          const response = await api.post('/invoices', submitData);
          invoiceId = response.data.invoice.id;
        }

        // Uložit rozdělení příjmů pokud jsou
        if (!editingInvoice && revenueSplits.length > 0) {
          // TODO: Implementovat ukládání rozdělení pro jednorázovou fakturu
          // Možná potřebujeme novou tabulku invoice_splits
          console.log('Revenue splits pro jednorázovou fakturu:', revenueSplits);
        }

        fetchInvoices();
        handleCloseModal();
      } catch (error) {
        console.error('Chyba při ukládání faktury:', error);
        alert(error.response?.data?.error || 'Nepodařilo se uložit fakturu');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Opravdu chcete smazat tuto fakturu?')) {
      return;
    }

    try {
      await api.delete(`/invoices/${id}`);
      fetchInvoices();
    } catch (error) {
      console.error('Chyba při mazání faktury:', error);
      alert('Nepodařilo se smazat fakturu');
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await api.patch(`/invoices/${id}/pay`);
      fetchInvoices();
    } catch (error) {
      console.error('Chyba při označování faktury:', error);
      alert('Nepodařilo se označit fakturu jako zaplacenou');
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

  const isOverdue = (invoice) => {
    if (invoice.paid) return false;
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    return dueDate < today;
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
        <h1 className="text-3xl font-bold text-gray-900">Faktury</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => handleOpenModal('one-time')} 
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Vytvořit jednorázovou fakturu</span>
          </button>
          <button 
            onClick={() => handleOpenModal('recurring')} 
            className="btn-primary flex items-center space-x-2"
          >
            <Repeat size={18} />
            <span>Nastavit pravidelnou fakturaci</span>
          </button>
        </div>
      </div>

      {/* Pravidelné faktury */}
      {recurring.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📅 Pravidelné měsíční platby</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recurring.map((client) => (
              <div key={client.id} className="card hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-600">{client.email}</p>
                  </div>
                  <span className="badge badge-info">Měsíčně</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Částka:</span>
                    <span className="text-xl font-bold text-purple-600">
                      {formatCurrency(client.monthly_recurring_amount)}
                    </span>
                  </div>
                  
                  {client.invoice_day && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Den vystavení:</span>
                      <span className="font-medium">{client.invoice_day}. den v měsíci</span>
                    </div>
                  )}
                  
                  {client.invoice_due_days && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Splatnost:</span>
                      <span className="font-medium">{client.invoice_due_days} dní</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Celkem faktur:</span>
                    <span className="font-medium">
                      {client.paid_invoices} / {client.total_invoices} zaplaceno
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seznam faktur */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">📄 Vystavené faktury</h2>
      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className={`card hover:shadow-lg transition ${
              isOverdue(invoice) ? 'border-l-4 border-red-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {invoice.invoice_number}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      invoice.paid
                        ? 'bg-green-100 text-green-800'
                        : isOverdue(invoice)
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {invoice.paid ? 'Zaplaceno' : isOverdue(invoice) ? 'Po splatnosti' : 'Nezaplaceno'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Klient:</span> {invoice.client_name}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <DollarSign size={16} className="mr-1" />
                      <span className="font-semibold text-lg text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      <span>Vystaveno: {formatDate(invoice.issued_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      <span>Splatnost: {formatDate(invoice.due_date)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleOpenPDF(invoice.id)}
                  className="text-blue-600 hover:text-blue-700"
                  title="Stáhnout PDF"
                >
                  <FileText size={18} />
                </button>
                {!invoice.paid && (
                  <button
                    onClick={() => handleMarkAsPaid(invoice.id)}
                    className="text-green-600 hover:text-green-700"
                    title="Označit jako zaplaceno"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleOpenModal('one-time', invoice)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(invoice.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {invoices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Zatím žádné faktury</p>
        </div>
      )}

      {/* Modal pro přidání/úpravu faktury */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {modalType === 'recurring' 
                  ? 'Nastavit pravidelnou měsíční fakturaci'
                  : (editingInvoice ? 'Upravit fakturu' : 'Vytvořit jednorázovou fakturu')}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalType === 'one-time' && editingInvoice && (
                <div>
                  <label className="label">Číslo faktury</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    className="input-field bg-gray-100"
                    readOnly
                    disabled
                  />
                </div>
              )}

              {modalType === 'one-time' && !editingInvoice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>ℹ️ Číslo faktury se vygeneruje automaticky</strong><br />
                    Formát: RRRRMMXXXXX (např. 202510001)
                  </p>
                </div>
              )}

              <div>
                <label className="label">Klient *</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">-- Vyberte klienta --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pole pro PRAVIDELNOU fakturaci */}
              {modalType === 'recurring' && (
                <>
                  <div>
                    <label className="label">Měsíční částka (Kč) *</label>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      value={formData.monthly_recurring_amount}
                      onChange={(e) => setFormData({ ...formData, monthly_recurring_amount: e.target.value })}
                      className="input-field"
                      placeholder="6000"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Den vystavení faktury</label>
                      <input
                        type="number"
                        min="1"
                        max="28"
                        value={formData.invoice_day}
                        onChange={(e) => setFormData({ ...formData, invoice_day: e.target.value })}
                        className="input-field"
                        placeholder="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">1-28 den v měsíci</p>
                    </div>
                    <div>
                      <label className="label">Splatnost (dní)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.invoice_due_days}
                        onChange={(e) => setFormData({ ...formData, invoice_due_days: e.target.value })}
                        className="input-field"
                        placeholder="14"
                      />
                      <p className="text-xs text-gray-500 mt-1">Počet dní do splatnosti</p>
                    </div>
                  </div>
                </>
              )}

              {/* Pole pro JEDNORÁZOVOU fakturu */}
              {modalType === 'one-time' && (
                <>
                  <div>
                    <label className="label">Částka (Kč) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Popis služeb *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Popis poskytnutých služeb..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Datum vystavení *</label>
                      <input
                        type="date"
                        value={formData.issued_at}
                        onChange={(e) => setFormData({ ...formData, issued_at: e.target.value })}
                        className={editingInvoice ? "input-field bg-gray-100" : "input-field"}
                        required
                        readOnly={editingInvoice}
                        disabled={editingInvoice}
                      />
                      {editingInvoice && (
                        <p className="text-xs text-gray-500 mt-1">Datum vystavení nelze měnit</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Datum splatnosti *</label>
                      <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="paid"
                      checked={formData.paid}
                      onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="paid" className="ml-2 text-sm text-gray-700">
                      Zaplaceno
                    </label>
                  </div>
                </>
              )}

              {/* Rozdělení příjmů mezi pracovníky */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">💰 Přerozdělení příjmů mezi pracovníky (volitelné)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Rozdělte {modalType === 'recurring' ? 'měsíční částku' : 'částku faktury'} mezi jednotlivé pracovníky.
                </p>
                
                <div className="space-y-3">
                  {allUsers.map(user => {
                    const split = revenueSplits.find(s => s.user_id === user.id);
                    return (
                      <div key={user.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{user.name}</p>
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={split?.amount || ''}
                            onChange={(e) => {
                              const amount = parseFloat(e.target.value) || 0;
                              const newSplits = revenueSplits.filter(s => s.user_id !== user.id);
                              if (amount > 0) {
                                newSplits.push({ user_id: user.id, user_name: user.name, amount, notes: '' });
                              }
                              setRevenueSplits(newSplits);
                            }}
                            placeholder="0"
                            className="input-field text-sm"
                          />
                        </div>
                        <span className="text-sm text-gray-600">Kč</span>
                      </div>
                    );
                  })}
                </div>
                
                {revenueSplits.length > 0 && (
                  <div className="mt-3 flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="font-medium text-gray-900">Celkem rozděleno:</span>
                    <span className="text-lg font-bold text-purple-700">
                      {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(
                        revenueSplits.reduce((sum, s) => sum + s.amount, 0)
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {modalType === 'recurring' 
                    ? 'Nastavit pravidelnou fakturaci' 
                    : (editingInvoice ? 'Uložit změny' : 'Vytvořit fakturu')}
                </button>
                <button type="button" onClick={handleCloseModal} className="flex-1 btn-secondary">
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

export default Invoices;
