import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, X, Calendar, Users, CheckSquare, Edit, Trash2, FileText } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    type: 'web',
    brief: '',
    deadline: '',
    status: 'in_progress'
  });

  const projectTypes = [
    { value: 'web', label: '🌐 Web', color: 'bg-blue-100 text-blue-800' },
    { value: 'social_media', label: '📱 Sociální sítě', color: 'bg-purple-100 text-purple-800' },
    { value: 'campaign', label: '🎯 Kampaň', color: 'bg-green-100 text-green-800' },
    { value: 'video', label: '🎬 Natáčení', color: 'bg-red-100 text-red-800' },
    { value: 'photography', label: '📸 Focení', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'graphics', label: '🎨 Grafika', color: 'bg-pink-100 text-pink-800' }
  ];

  const statusOptions = [
    { value: 'in_progress', label: 'V realizaci', color: 'bg-blue-100 text-blue-800' },
    { value: 'waiting_for_client', label: 'Čeká na podklady', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Schváleno klientem', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Dokončeno', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Chyba při načítání projektů:', error);
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

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Chyba při načítání uživatelů:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProject) {
        await api.put(`/projects/${selectedProject.id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      fetchProjects();
      handleCloseModal();
    } catch (error) {
      console.error('Chyba při ukládání projektu:', error);
      alert('Nepodařilo se uložit projekt');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Opravdu chcete smazat tento projekt?')) {
      try {
        await api.delete(`/projects/${id}`);
        fetchProjects();
      } catch (error) {
        console.error('Chyba při mazání projektu:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject(null);
    setFormData({
      client_id: '',
      name: '',
      type: 'web',
      brief: '',
      deadline: '',
      status: 'in_progress'
    });
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setFormData({
      client_id: project.client_id || '',
      name: project.name,
      type: project.type,
      brief: project.brief || '',
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
      status: project.status
    });
    setShowModal(true);
  };

  const getTypeInfo = (type) => {
    return projectTypes.find(t => t.value === type) || projectTypes[0];
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const getProgress = (project) => {
    if (!project.total_tasks || project.total_tasks === 0) return 0;
    return Math.round((project.completed_tasks / project.total_tasks) * 100);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Projekty</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus size={18} />
          <span>Nový projekt</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-600">Celkem projektů</p>
          <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">V realizaci</p>
          <p className="text-2xl font-bold text-blue-600">
            {projects.filter(p => p.status === 'in_progress').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Čeká na podklady</p>
          <p className="text-2xl font-bold text-yellow-600">
            {projects.filter(p => p.status === 'waiting_for_client').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Dokončeno</p>
          <p className="text-2xl font-bold text-green-600">
            {projects.filter(p => p.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const typeInfo = getTypeInfo(project.type);
          const statusInfo = getStatusInfo(project.status);
          const progress = getProgress(project);

          return (
            <div key={project.id} className="card hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <span className={`text-xs px-2 py-1 rounded ${typeInfo.color} inline-block mb-2`}>
                    {typeInfo.label}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.client_name || 'Bez klienta'}</p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={14} className="mr-2" />
                  <span>
                    {project.deadline 
                      ? new Date(project.deadline).toLocaleDateString('cs-CZ')
                      : 'Bez termínu'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {project.total_tasks > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Checklist</span>
                      <span>{project.completed_tasks}/{project.total_tasks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {project.brief && (
                <p className="text-sm text-gray-600 line-clamp-2">{project.brief}</p>
              )}
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Zatím nemáte žádné projekty</p>
          <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center space-x-2">
            <Plus size={18} />
            <span>Vytvořit první projekt</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {selectedProject ? 'Upravit projekt' : 'Nový projekt'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Název projektu *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Typ projektu *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                  >
                    {projectTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Klient</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">-- Vyberte klienta --</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Brief / Zadání</label>
                <textarea
                  value={formData.brief}
                  onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder="Popis projektu, požadavky klienta, důležité poznámky..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {selectedProject ? 'Uložit změny' : 'Vytvořit projekt'}
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

export default Projects;
