import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Check, Save, X, Edit2, Download, UserPlus, FileText, ArrowRight } from 'lucide-react';

const Pricing = () => {
  const [services, setServices] = useState([]);
  const [servicesByCategory, setServicesByCategory] = useState({});
  const [clients, setClients] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [quoteName, setQuoteName] = useState('');
  const [customAdjustments, setCustomAdjustments] = useState('');
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [applyToClient, setApplyToClient] = useState(true);
  const [isNewLead, setIsNewLead] = useState(false);
  const [leadData, setLeadData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    fetchServices();
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchQuotes(selectedClient);
    } else {
      setQuotes([]);
    }
  }, [selectedClient]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/pricing/services');
      setServices(response.data.services);
      setServicesByCategory(response.data.servicesByCategory);
    } catch (error) {
      console.error('Chyba při načítání služeb:', error);
    } finally {
      setLoading(false);
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

  const fetchQuotes = async (clientId) => {
    try {
      const response = await api.get(`/pricing/quotes?client_id=${clientId}`);
      setQuotes(response.data.quotes);
    } catch (error) {
      console.error('Chyba při načítání nabídek:', error);
    }
  };

  const categoryLabels = {
    creative_visual: '🎨 Kreativní a vizuální služby',
    copywriting: '✍️ Copywriting',
    ads_management: '📊 Správa reklamních kampaní',
    marketing_strategy: '🎯 Marketingové strategie',
    graphics: '🖼️ Grafické práce',
    filming: '🎬 Natáčení a focení',
    web: '🌐 Webové stránky a systémy'
  };

  const handleServiceToggle = (service) => {
    const exists = selectedServices.find(s => s.id === service.id);
    if (exists) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, {
        ...service,
        price: service.base_price,
        original_price: service.base_price
      }]);
    }
  };

  const handlePriceChange = (serviceId, newPrice) => {
    setSelectedServices(selectedServices.map(s =>
      s.id === serviceId ? { ...s, price: parseFloat(newPrice) || 0 } : s
    ));
  };

  const calculateTotals = () => {
    let monthly = 0;
    let oneTime = 0;

    selectedServices.forEach(service => {
      if (service.price_type === 'monthly') {
        monthly += parseFloat(service.price) || 0;
      } else if (service.price_type === 'one_time') {
        oneTime += parseFloat(service.price) || 0;
      }
    });

    return { monthly, oneTime };
  };

  const handleSaveQuote = async () => {
    // Validace
    if (!selectedClient && !isNewLead) {
      alert('Vyberte klienta nebo vytvořte nový lead');
      return;
    }

    if (isNewLead && !leadData.company_name) {
      alert('Vyplňte název firmy pro nový lead');
      return;
    }

    if (selectedServices.length === 0) {
      alert('Vyberte alespoň jednu službu');
      return;
    }

    try {
      const response = await api.post('/pricing/quotes', {
        client_id: selectedClient || null,
        lead_data: isNewLead ? leadData : null,
        create_lead: isNewLead,
        quote_name: quoteName || 'Nabídka služeb',
        services: selectedServices,
        custom_adjustments: customAdjustments,
        apply_to_client: applyToClient && !isNewLead
      });

      let msg = '';
      if (isNewLead) {
        msg = 'Nabídka byla vytvořena a uložena do pipeline jako nový lead!';
      } else if (applyToClient) {
        msg = 'Nabídka byla uložena a aplikována na klienta (pravidelná fakturace nastavena)';
      } else {
        msg = 'Nabídka byla uložena (bez nastavení pravidelné fakturace)';
      }
      
      alert(msg);
      
      // Refresh nabídek pokud máme klienta
      if (selectedClient) {
        fetchQuotes(selectedClient);
      }
      
      // Reset formulář
      setSelectedServices([]);
      setQuoteName('');
      setCustomAdjustments('');
      if (isNewLead) {
        setLeadData({
          company_name: '',
          contact_person: '',
          email: '',
          phone: '',
          notes: ''
        });
        setIsNewLead(false);
      }
    } catch (error) {
      console.error('Chyba při ukládání nabídky:', error);
      alert('Nepodařilo se uložit nabídku: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDownloadPDF = async (quoteId) => {
    try {
      const response = await api.get(`/pricing/quotes/${quoteId}/pdf`, {
        responseType: 'blob'
      });
      
      // Vytvořit odkaz na stažení
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

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Naceňování služeb</h1>
        <p className="text-gray-600">Vytvořte nabídku pro klienta výběrem služeb z ceníku</p>
      </div>

      {/* Banner - Link na archiv nabídek */}
      <Link 
        to="/quotes-archive"
        className="block mb-6 bg-gradient-to-r from-purple-50 to-orange-50 border-2 border-purple-200 rounded-lg p-4 hover:shadow-lg transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                📄 Archiv všech cenových nabídek
              </h3>
              <p className="text-sm text-gray-600">
                Zobrazit, upravit nebo stáhnout PDF všech vytvořených nabídek
              </p>
            </div>
          </div>
          <ArrowRight className="text-purple-600 group-hover:translate-x-2 transition-transform" size={24} />
        </div>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Service Selection */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <div key={category} className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {categoryLabels[category] || category}
              </h3>
              <div className="space-y-2">
                {categoryServices.map(service => {
                  const isSelected = selectedServices.find(s => s.id === service.id);
                  
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleServiceToggle(service)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check size={14} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{service.service_name}</h4>
                            {service.description && (
                              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                            )}
                            <div className="flex items-center space-x-3 mt-2">
                              <span className="text-lg font-bold text-primary-600">
                                {service.base_price.toLocaleString()} Kč
                              </span>
                              <span className="text-sm text-gray-500">
                                {service.price_type === 'monthly' ? '/ měsíčně' : '/ jednorázově'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right - Quote Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shrnutí nabídky</h3>

            {/* Toggle: Existující klient vs Nový lead */}
            <div className="mb-4">
              <div className="flex items-center space-x-4 mb-3">
                <button
                  onClick={() => setIsNewLead(false)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                    !isNewLead
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Existující klient
                </button>
                <button
                  onClick={() => setIsNewLead(true)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${
                    isNewLead
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <UserPlus size={16} />
                  <span>Nový lead</span>
                </button>
              </div>

              {!isNewLead ? (
                <div>
                  <label className="label">Klient *</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="input-field"
                  >
                    <option value="">-- Vyberte klienta --</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="label">Název firmy *</label>
                    <input
                      type="text"
                      value={leadData.company_name}
                      onChange={(e) => setLeadData({...leadData, company_name: e.target.value})}
                      className="input-field"
                      placeholder="Název firmy"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Kontaktní osoba</label>
                    <input
                      type="text"
                      value={leadData.contact_person}
                      onChange={(e) => setLeadData({...leadData, contact_person: e.target.value})}
                      className="input-field"
                      placeholder="Jméno kontaktní osoby"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={leadData.email}
                      onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                      className="input-field"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="label">Telefon</label>
                    <input
                      type="tel"
                      value={leadData.phone}
                      onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                      className="input-field"
                      placeholder="+420 XXX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="label">Poznámky</label>
                    <textarea
                      value={leadData.notes}
                      onChange={(e) => setLeadData({...leadData, notes: e.target.value})}
                      className="input-field"
                      rows={2}
                      placeholder="Poznámky k leadu..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quote Name */}
            <div className="mb-4">
              <label className="label">Název nabídky</label>
              <input
                type="text"
                value={quoteName}
                onChange={(e) => setQuoteName(e.target.value)}
                className="input-field"
                placeholder="Nabídka služeb"
              />
            </div>

            {/* Selected Services */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Vybrané služby ({selectedServices.length})</h4>
              <div className="space-y-2">
                {selectedServices.map(service => (
                  <div key={service.id} className="bg-gray-50 p-3 rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{service.service_name}</p>
                        <p className="text-xs text-gray-500">
                          {service.price_type === 'monthly' ? 'Měsíční' : 'Jednorázová'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceToggle(service);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => handlePriceChange(service.id, e.target.value)}
                        className="input-field text-sm"
                        min="0"
                        step="100"
                      />
                      <span className="text-sm text-gray-600">Kč</span>
                    </div>
                  </div>
                ))}

                {selectedServices.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Zatím nejsou vybrány žádné služby
                  </p>
                )}
              </div>
            </div>

            {/* Custom Adjustments */}
            <div className="mb-4">
              <label className="label">Poznámky / Úpravy</label>
              <textarea
                value={customAdjustments}
                onChange={(e) => setCustomAdjustments(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Sleva, specifické úpravy, poznámky..."
              />
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pravidelné měsíčně:</span>
                <span className="text-lg font-bold text-primary-600">
                  {totals.monthly.toLocaleString()} Kč
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Jednorázově:</span>
                <span className="text-lg font-bold text-gray-900">
                  {totals.oneTime.toLocaleString()} Kč
                </span>
              </div>
            </div>

            {/* Checkbox - Aplikovat na klienta - jen pokud není nový lead */}
            {!isNewLead && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyToClient}
                    onChange={(e) => setApplyToClient(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Aplikovat jako pravidelnou fakturaci</p>
                    <p className="text-xs text-gray-500">
                      Pokud zaškrtnete, měsíční částka se nastaví u klienta jako pravidelná faktura
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveQuote}
              disabled={(!selectedClient && !isNewLead) || (isNewLead && !leadData.company_name) || selectedServices.length === 0}
              className="btn-primary w-full mt-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>{isNewLead ? 'Vytvořit lead a nabídku' : 'Uložit nabídku'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historie nabídek */}
      {selectedClient && quotes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Historie nabídek pro klienta</h2>
          <div className="space-y-4">
            {quotes.map((quote, index) => {
              let services = [];
              try {
                services = typeof quote.services === 'string' 
                  ? JSON.parse(quote.services) 
                  : (quote.services || []);
              } catch (e) {
                console.error('Error parsing services:', e);
                services = [];
              }
              return (
                <div key={quote.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{quote.quote_name}</h3>
                      <p className="text-sm text-gray-600">
                        Vytvořeno: {new Date(quote.created_at).toLocaleDateString('cs-CZ')} 
                        {quote.created_by_name && ` • ${quote.created_by_name}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {index === 0 && (
                        <span className="badge badge-success">Nejnovější</span>
                      )}
                      <button
                        onClick={() => handleDownloadPDF(quote.id)}
                        className="btn-secondary flex items-center space-x-2 text-sm"
                        title="Stáhnout PDF"
                      >
                        <Download size={16} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Měsíčně:</p>
                      <p className="text-xl font-bold text-purple-600">
                        {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(quote.monthly_total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jednorázově:</p>
                      <p className="text-xl font-bold text-gray-900">
                        {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(quote.one_time_total)}
                      </p>
                    </div>
                  </div>

                  <details className="text-sm">
                    <summary className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium">
                      Zobrazit služby ({services.length})
                    </summary>
                    <div className="mt-2 space-y-1 pl-4">
                      {services.map((service, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700">
                          <span>• {service.service_name}</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(service.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>

                  {quote.custom_adjustments && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Poznámky:</p>
                      <p className="text-sm text-gray-900">{quote.custom_adjustments}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
