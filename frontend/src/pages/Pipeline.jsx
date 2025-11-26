import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit, Trash2, X, TrendingUp, CheckCircle } from 'lucide-react';

const Pipeline = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    stage: 'lead',
    value: '',
    probability: 0,
    source: '',
    notes: '',
    next_action: '',
    next_action_date: '',
    assigned_to: '',
  });

  const stages = [
    { value: 'lead', label: 'Lead', color: 'bg-gray-100 text-gray-800' },
    { value: 'qualified', label: 'Kvalifikovaný', color: 'bg-blue-100 text-blue-800' },
    { value: 'meeting', label: 'Schůzka', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'proposal', label: 'Nabídka', color: 'bg-purple-100 text-purple-800' },
    { value: 'negotiation', label: 'Vyjednávání', color: 'bg-orange-100 text-orange-800' },
    { value: 'won', label: 'Získáno', color: 'bg-green-100 text-green-800' },
    { value: 'lost', label: 'Ztraceno', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/pipeline');
      setLeads(response.data.pipeline);
    } catch (error) {
      console.error('Chyba při načítání pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Chyba při načítání uživatelů:', error);
    }
  };

  const handleOpenModal = (lead = null) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        company_name: lead.company_name,
        contact_person: lead.contact_person || '',
        email: lead.email || '',
        phone: lead.phone || '',
        stage: lead.stage,
        value: lead.value || '',
        probability: lead.probability || 0,
        source: lead.source || '',
        notes: lead.notes || '',
        next_action: lead.next_action || '',
        next_action_date: lead.next_action_date ? lead.next_action_date.split('T')[0] : '',
        assigned_to: lead.assigned_to || '',
      });
    } else {
      setEditingLead(null);
      setFormData({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        stage: 'lead',
        value: '',
        probability: 0,
        source: '',
        notes: '',
        next_action: '',
        next_action_date: '',
        assigned_to: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLead(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name) {
      alert('Název firmy je povinný');
      return;
    }

    try {
      const submitData = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : null,
        probability: parseInt(formData.probability),
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
      };

      if (editingLead) {
        await api.put(`/pipeline/${editingLead.id}`, submitData);
      } else {
        await api.post('/pipeline', submitData);
      }
      fetchLeads();
      handleCloseModal();
    } catch (error) {
      console.error('Chyba při ukládání leadu:', error);
      alert('Nepodařilo se uložit lead');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Opravdu chcete smazat tento lead?')) return;
    try {
      await api.delete(`/pipeline/${id}`);
      fetchLeads();
      alert('Lead byl úspěšně smazán');
    } catch (error) {
      console.error('Chyba při mazání leadu:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Nepodařilo se smazat lead';
      alert(`Chyba při mazání: ${errorMsg}`);
    }
  };

  const handleConvert = async (id) => {
    if (!window.confirm('Opravdu chcete konvertovat tento lead na klienta?')) return;
    try {
      await api.post(`/pipeline/${id}/convert`);
      fetchLeads();
      alert('Lead byl úspěšně konvertován na klienta');
    } catch (error) {
      console.error('Chyba při konverzi leadu:', error);
      alert('Nepodařilo se konvertovat lead');
    }
  };

  const getStageInfo = (stage) => {
    return stages.find(s => s.value === stage) || stages[0];
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const groupedLeads = stages.reduce((acc, stage) => {
    acc[stage.value] = leads.filter(lead => lead.stage === stage.value);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-gray-600 mt-1">Správa leadů a potenciálních klientů</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center space-x-2">
          <Plus size={18} />
          <span>Přidat lead</span>
        </button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stages.map(stage => (
          <div key={stage.value} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{stage.label}</h3>
              <span className="text-sm bg-white px-2 py-1 rounded-full">
                {groupedLeads[stage.value]?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {groupedLeads[stage.value]?.map(lead => (
                <div key={lead.id} className="card p-4 hover:shadow-xl">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-gray-900">{lead.company_name}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(lead);
                        }}
                        className="p-1.5 rounded-md text-primary-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        title="Upravit lead"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(lead.id);
                        }}
                        className="p-1.5 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        title="Smazat lead"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {lead.contact_person && (
                    <p className="text-xs text-gray-600 mb-1">{lead.contact_person}</p>
                  )}
                  {lead.value && (
                    <p className="text-sm font-semibold text-primary-600 mb-2">
                      {formatCurrency(lead.value)}
                    </p>
                  )}
                  {lead.next_action_date && (
                    <p className="text-xs text-gray-500">
                      📅 {formatDate(lead.next_action_date)}
                    </p>
                  )}
                  {lead.assigned_to_name && (
                    <p className="text-xs text-gray-500 mt-1">
                      👤 {lead.assigned_to_name}
                    </p>
                  )}
                  {stage.value === 'qualified' && (
                    <button
                      onClick={() => handleConvert(lead.id)}
                      className="mt-2 w-full text-xs btn-secondary flex items-center justify-center space-x-1"
                    >
                      <CheckCircle size={12} />
                      <span>Konvertovat</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingLead ? 'Upravit lead' : 'Přidat lead'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Název firmy *</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Kontaktní osoba</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="input-field"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="label">Stav</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="input-field"
                  >
                    {stages.map(stage => (
                      <option key={stage.value} value={stage.value}>{stage.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Hodnota (Kč)</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Pravděpodobnost (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Zdroj</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="input-field"
                    placeholder="např. LinkedIn, doporučení..."
                  />
                </div>
                <div>
                  <label className="label">Přiřadit uživateli</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="input-field"
                  >
                    <option value="">-- Vyberte uživatele --</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Další akce</label>
                <input
                  type="text"
                  value={formData.next_action}
                  onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                  className="input-field"
                  placeholder="Co je potřeba udělat dál?"
                />
              </div>

              <div>
                <label className="label">Datum další akce</label>
                <input
                  type="date"
                  value={formData.next_action_date}
                  onChange={(e) => setFormData({ ...formData, next_action_date: e.target.value })}
                  className="input-field"
                />
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

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {editingLead ? 'Uložit změny' : 'Přidat lead'}
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

export default Pipeline;
