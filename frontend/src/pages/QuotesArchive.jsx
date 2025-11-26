import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Download, Edit, Trash2, Search, X, Save, FileText } from 'lucide-react';

const QuotesArchive = () => {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuote, setEditingQuote] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    quote_name: '',
    custom_adjustments: ''
  });

  useEffect(() => {
    fetchAllQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [searchTerm, quotes]);

  const fetchAllQuotes = async () => {
    try {
      const response = await api.get('/pricing/quotes');
      setQuotes(response.data.quotes);
      setFilteredQuotes(response.data.quotes);
    } catch (error) {
      console.error('Chyba při načítání nabídek:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = () => {
    if (!searchTerm) {
      setFilteredQuotes(quotes);
      return;
    }

    const filtered = quotes.filter(quote => {
      const searchLower = searchTerm.toLowerCase();
      return (
        quote.quote_name?.toLowerCase().includes(searchLower) ||
        quote.client_name?.toLowerCase().includes(searchLower) ||
        quote.lead_company_name?.toLowerCase().includes(searchLower) ||
        quote.created_by_name?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredQuotes(filtered);
  };

  const handleDownloadPDF = async (quoteId) => {
    try {
      const response = await api.get(`/pricing/quotes/${quoteId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nabidka-${quoteId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Chyba při stahování PDF:', error);
      alert('Nepodařilo se stáhnout PDF');
    }
  };

  const handleOpenEditModal = (quote) => {
    setEditingQuote(quote);
    setEditFormData({
      quote_name: quote.quote_name || '',
      custom_adjustments: quote.custom_adjustments || ''
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingQuote(null);
    setEditFormData({
      quote_name: '',
      custom_adjustments: ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingQuote) return;

    try {
      await api.put(`/pricing/quotes/${editingQuote.id}`, editFormData);
      alert('Nabídka byla úspěšně aktualizována');
      fetchAllQuotes();
      handleCloseEditModal();
    } catch (error) {
      console.error('Chyba při úpravě nabídky:', error);
      alert('Nepodařilo se upravit nabídku');
    }
  };

  const handleDelete = async (quoteId, quoteName) => {
    if (!window.confirm(`Opravdu chcete smazat nabídku "${quoteName}"?`)) return;

    try {
      await api.delete(`/pricing/quotes/${quoteId}`);
      alert('Nabídka byla smazána');
      fetchAllQuotes();
    } catch (error) {
      console.error('Chyba při mazání nabídky:', error);
      alert('Nepodařilo se smazat nabídku');
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📄 Archiv cenových nabídek</h1>
            <p className="text-gray-600 mt-1">Všechny vytvořené cenové nabídky</p>
          </div>
          <div className="bg-primary-100 px-4 py-2 rounded-lg">
            <p className="text-sm text-primary-800 font-medium">
              Celkem: <span className="text-lg font-bold">{quotes.length}</span> nabídek
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Hledat podle názvu nabídky, klienta nebo autora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Quotes Grid */}
      {filteredQuotes.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">
            {searchTerm ? 'Žádné nabídky nenalezeny' : 'Zatím nejsou žádné nabídky'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuotes.map((quote) => {
            let services = [];
            try {
              services = typeof quote.services === 'string' 
                ? JSON.parse(quote.services) 
                : (quote.services || []);
            } catch (e) {
              console.error('Error parsing services:', e);
              services = [];
            }

            const recipientName = quote.client_name || quote.lead_company_name || 'N/A';
            const isLead = !quote.client_id && quote.pipeline_id;

            return (
              <div key={quote.id} className="card hover:shadow-xl transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {quote.quote_name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {recipientName}
                      </span>
                      {isLead && (
                        <span className="badge badge-warning text-xs">Lead</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="mb-4 text-sm text-gray-600">
                  <p>Vytvořeno: {new Date(quote.created_at).toLocaleDateString('cs-CZ')}</p>
                  {quote.created_by_name && (
                    <p>Autor: {quote.created_by_name}</p>
                  )}
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Měsíčně</p>
                    <p className="text-lg font-bold text-purple-600">
                      {quote.monthly_total.toLocaleString()} Kč
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Jednorázově</p>
                    <p className="text-lg font-bold text-gray-900">
                      {quote.one_time_total.toLocaleString()} Kč
                    </p>
                  </div>
                </div>

                {/* Services Summary */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Služby ({services.length})
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto text-xs text-gray-600">
                    {services.slice(0, 3).map((service, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>• {service.service_name}</span>
                        <span className="font-medium">{service.price.toLocaleString()} Kč</span>
                      </div>
                    ))}
                    {services.length > 3 && (
                      <p className="text-primary-600 italic">+ {services.length - 3} dalších...</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownloadPDF(quote.id)}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2 text-sm"
                    title="Stáhnout PDF"
                  >
                    <Download size={16} />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(quote)}
                    className="btn-secondary flex items-center justify-center"
                    title="Upravit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(quote.id, quote.quote_name)}
                    className="btn-danger flex items-center justify-center"
                    title="Smazat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upravit nabídku</h2>
              <button onClick={handleCloseEditModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label">Název nabídky</label>
                <input
                  type="text"
                  value={editFormData.quote_name}
                  onChange={(e) => setEditFormData({ ...editFormData, quote_name: e.target.value })}
                  className="input-field"
                  placeholder="Název nabídky"
                />
              </div>

              <div>
                <label className="label">Poznámky / Úpravy</label>
                <textarea
                  value={editFormData.custom_adjustments}
                  onChange={(e) => setEditFormData({ ...editFormData, custom_adjustments: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder="Dodatečné poznámky nebo úpravy k nabídce..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Informace o nabídce:</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Pro: </span>
                    <span>{editingQuote.client_name || editingQuote.lead_company_name}</span>
                  </div>
                  <div>
                    <span className="font-medium">Celkem měsíčně: </span>
                    <span className="text-purple-600 font-bold">
                      {editingQuote.monthly_total.toLocaleString()} Kč
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button onClick={handleSaveEdit} className="flex-1 btn-primary flex items-center justify-center space-x-2">
                  <Save size={18} />
                  <span>Uložit změny</span>
                </button>
                <button onClick={handleCloseEditModal} className="flex-1 btn-secondary">
                  Zrušit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesArchive;
