import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Check, Save, X, Edit2 } from 'lucide-react';

const Pricing = () => {
  const [services, setServices] = useState([]);
  const [servicesByCategory, setServicesByCategory] = useState({});
  const [clients, setClients] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [quoteName, setQuoteName] = useState('');
  const [customAdjustments, setCustomAdjustments] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchClients();
  }, []);

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

  const categoryLabels = {
    social_media: '📱 Sociální sítě - Balíčky',
    social_media_extension: '➕ Rozšíření platforem',
    ads: '🎯 Reklamy',
    creative: '🎨 Kreativní služby',
    web: '🌐 Weby',
    maintenance: '🔧 Údržba'
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
    if (!selectedClient) {
      alert('Vyberte klienta');
      return;
    }

    if (selectedServices.length === 0) {
      alert('Vyberte alespoň jednu službu');
      return;
    }

    try {
      await api.post('/pricing/quotes', {
        client_id: selectedClient,
        quote_name: quoteName || 'Nabídka služeb',
        services: selectedServices,
        custom_adjustments: customAdjustments,
        apply_to_client: true
      });

      alert('Nabídka byla uložena a aplikována na klienta');
      
      // Reset
      setSelectedServices([]);
      setSelectedClient('');
      setQuoteName('');
      setCustomAdjustments('');
    } catch (error) {
      console.error('Chyba při ukládání nabídky:', error);
      alert('Nepodařilo se uložit nabídku');
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

            {/* Client Selection */}
            <div className="mb-4">
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

            {/* Save Button */}
            <button
              onClick={handleSaveQuote}
              disabled={!selectedClient || selectedServices.length === 0}
              className="btn-primary w-full mt-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>Uložit nabídku</span>
            </button>

            <p className="text-xs text-gray-500 mt-2 text-center">
              Nabídka bude uložena ke klientovi a nastavena jako pravidelná faktura
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
