import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Sparkles, Copy, Check, History, Trash2, RefreshCw } from 'lucide-react';

const AICaptions = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [postType, setPostType] = useState('post');
  const [tone, setTone] = useState('professional');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const platforms = [
    { value: 'instagram', label: '📸 Instagram' },
    { value: 'facebook', label: '👍 Facebook' },
    { value: 'linkedin', label: '💼 LinkedIn' },
    { value: 'tiktok', label: '🎵 TikTok' },
    { value: 'twitter', label: '🐦 Twitter/X' },
  ];

  const postTypes = [
    { value: 'post', label: 'Běžný příspěvek' },
    { value: 'story', label: 'Story' },
    { value: 'reel', label: 'Reel/Video' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'announcement', label: 'Oznámení' },
    { value: 'promotion', label: 'Propagace/Akce' },
  ];

  const tones = [
    { value: 'professional', label: 'Profesionální' },
    { value: 'friendly', label: 'Přátelský' },
    { value: 'playful', label: 'Hravý' },
    { value: 'formal', label: 'Formální' },
    { value: 'casual', label: 'Neformální' },
    { value: 'inspiring', label: 'Inspirativní' },
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchHistory();
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.clients);
    } catch (error) {
      console.error('Chyba při načítání klientů:', error);
    }
  };

  const fetchHistory = async () => {
    if (!selectedClient) return;
    
    try {
      const response = await api.get(`/ai-captions/history/${selectedClient}`);
      setHistory(response.data.history);
    } catch (error) {
      console.error('Chyba při načítání historie:', error);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Zadejte téma příspěvku');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/ai-captions/generate', {
        client_id: selectedClient || null,
        topic: topic.trim(),
        platform,
        post_type: postType,
        tone,
      });

      setGeneratedText(response.data.text);
      
      // Refresh history
      if (selectedClient) {
        fetchHistory();
      }
    } catch (error) {
      console.error('Chyba při generování:', error);
      alert(error.response?.data?.details || 'Nepodařilo se vygenerovat text. Zkontrolujte API klíč.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Opravdu chcete smazat tuto položku?')) return;

    try {
      await api.delete(`/ai-captions/history/${id}`);
      fetchHistory();
    } catch (error) {
      console.error('Chyba při mazání:', error);
    }
  };

  const handleUseFromHistory = (item) => {
    setTopic(item.prompt);
    setPlatform(item.platform || 'instagram');
    setPostType(item.post_type || 'post');
    setGeneratedText(item.generated_text);
    setShowHistory(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <Sparkles className="text-primary-600" size={32} />
          <span>AI Generátor popisků</span>
        </h1>
        <p className="text-gray-600">Vytvářejte poutavé texty pro sociální sítě pomocí AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nastavení příspěvku</h3>

            <div className="space-y-4">
              <div>
                <label className="label">Klient (volitelné)</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="input-field"
                >
                  <option value="">-- Bez klienta --</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  AI se učí ze starších příspěvků pro daného klienta
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Platforma</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="input-field"
                  >
                    {platforms.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Typ příspěvku</label>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="input-field"
                  >
                    {postTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Tón hlasu</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="input-field"
                >
                  {tones.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Téma / O čem má být příspěvek *</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Např: Představení nové kolekce letních triček, slevy až 30%, moderní design..."
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Generuji...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Vygenerovat text</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Text */}
          {generatedText && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Vygenerovaný text</h3>
                <button
                  onClick={handleCopy}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      <span>Zkopírováno!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span>Kopírovat</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-900 whitespace-pre-wrap">{generatedText}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>{generatedText.length} znaků</span>
                <button
                  onClick={handleGenerate}
                  className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  <RefreshCw size={14} />
                  <span>Vygenerovat znovu</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right - History */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <History size={20} />
                <span>Historie</span>
              </h3>
              {selectedClient && (
                <span className="text-xs text-gray-500">{history.length} položek</span>
              )}
            </div>

            {!selectedClient ? (
              <div className="text-center py-8">
                <History size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Vyberte klienta pro zobrazení historie</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <History size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Zatím žádná historie</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => handleUseFromHistory(item)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.prompt}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('cs-CZ', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistory(item.id);
                        }}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {item.generated_text}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {item.platform}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                        {item.post_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICaptions;
