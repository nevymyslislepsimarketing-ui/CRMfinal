import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit, Trash2, X, Calendar, User } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    status: 'pending',
    client_id: '',
    assigned_to: '',
    task_type_id: '',
    start_time: '',
    end_time: '',
  });
  const [recurringFormData, setRecurringFormData] = useState({
    title: '',
    description: '',
    task_type_id: '',
    recurrence_pattern: 'daily',
    frequency: 1,
    start_date: '',
    end_date: '',
    priority: 'medium',
    client_id: '',
    assigned_to: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchClients();
    fetchUsers();
    fetchTaskTypes();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Chyba při načítání úkolů:', error);
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

  const fetchTaskTypes = async () => {
    try {
      const response = await api.get('/task-types');
      setTaskTypes(response.data.taskTypes);
    } catch (error) {
      console.error('Chyba při načítání typů úkolů:', error);
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        priority: task.priority,
        status: task.status,
        client_id: task.client_id || '',
        assigned_to: task.assigned_to || '',
        task_type_id: task.task_type_id || '',
        start_time: task.start_time ? task.start_time.substring(0, 16) : '',
        end_time: task.end_time ? task.end_time.substring(0, 16) : '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        status: 'pending',
        client_id: '',
        assigned_to: '',
        task_type_id: '',
        start_time: '',
        end_time: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      alert('Název úkolu je povinný');
      return;
    }

    try {
      const submitData = {
        ...formData,
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
        task_type_id: formData.task_type_id ? parseInt(formData.task_type_id) : null,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, submitData);
      } else {
        await api.post('/tasks', submitData);
      }
      fetchTasks();
      handleCloseModal();
    } catch (error) {
      console.error('Chyba při ukládání úkolu:', error);
      alert('Nepodařilo se uložit úkol');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Opravdu chcete smazat tento úkol?')) return;

    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Chyba při mazání úkolu:', error);
      alert('Nepodařilo se smazat úkol');
    }
  };

  const handleRecurringSubmit = async (e) => {
    e.preventDefault();
    if (!recurringFormData.title || !recurringFormData.start_date) {
      alert('Název a počáteční datum jsou povinné');
      return;
    }

    try {
      const submitData = {
        ...recurringFormData,
        client_id: recurringFormData.client_id ? parseInt(recurringFormData.client_id) : null,
        task_type_id: recurringFormData.task_type_id ? parseInt(recurringFormData.task_type_id) : null,
        assigned_to: recurringFormData.assigned_to ? parseInt(recurringFormData.assigned_to) : null,
        frequency: parseInt(recurringFormData.frequency),
      };

      await api.post('/recurring-tasks', submitData);
      alert('Opakovaný úkol úspěšně vytvořen');
      setShowRecurringModal(false);
      setRecurringFormData({
        title: '',
        description: '',
        task_type_id: '',
        recurrence_pattern: 'daily',
        frequency: 1,
        start_date: '',
        end_date: '',
        priority: 'medium',
        client_id: '',
        assigned_to: '',
      });
    } catch (error) {
      console.error('Chyba při vytváření opakovaného úkolu:', error);
      alert('Nepodařilo se vytvořit opakovaný úkol');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    const labels = {
      pending: 'Čeká',
      in_progress: 'Probíhá',
      completed: 'Hotovo',
    };
    return { style: styles[status] || 'bg-gray-100 text-gray-800', label: labels[status] || status };
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-red-100 text-red-800',
    };
    const labels = {
      low: 'Nízká',
      medium: 'Střední',
      high: 'Vysoká',
    };
    return { style: styles[priority] || 'bg-gray-100 text-gray-800', label: labels[priority] || priority };
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
        <h1 className="text-3xl font-bold text-gray-900">Úkoly</h1>
        <div className="flex space-x-3">
          <button onClick={() => setShowRecurringModal(true)} className="btn-secondary flex items-center space-x-2">
            <Calendar size={18} />
            <span>Opakovaný úkol</span>
          </button>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center space-x-2">
            <Plus size={18} />
            <span>Přidat úkol</span>
          </button>
        </div>
      </div>

      {/* Seznam úkolů */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const statusBadge = getStatusBadge(task.status);
          const priorityBadge = getPriorityBadge(task.priority);
          
          return (
            <div key={task.id} className="card hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    {task.task_type_id && taskTypes.find(t => t.id === task.task_type_id) && (
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: taskTypes.find(t => t.id === task.task_type_id)?.color + '40' }}
                      >
                        {taskTypes.find(t => t.id === task.task_type_id)?.icon} {taskTypes.find(t => t.id === task.task_type_id)?.name}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${statusBadge.style}`}>
                      {statusBadge.label}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${priorityBadge.style}`}>
                      {priorityBadge.label}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {task.client_name && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Klient:</span>
                        {task.client_name}
                      </div>
                    )}
                    {task.assigned_to_name && (
                      <div className="flex items-center">
                        <User size={16} className="mr-1" />
                        {task.assigned_to_name}
                      </div>
                    )}
                    {task.deadline && (
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        {formatDate(task.deadline)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(task)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Zatím žádné úkoly</p>
        </div>
      )}

      {/* Modal pro přidání/úpravu úkolu */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingTask ? 'Upravit úkol' : 'Přidat úkol'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Název *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Popis</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Priorita</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="low">Nízká</option>
                    <option value="medium">Střední</option>
                    <option value="high">Vysoká</option>
                  </select>
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="pending">Čeká</option>
                    <option value="in_progress">Probíhá</option>
                    <option value="completed">Hotovo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Typ aktivity</label>
                <select
                  value={formData.task_type_id}
                  onChange={(e) => setFormData({ ...formData, task_type_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">-- Vyberte typ aktivity --</option>
                  {taskTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Začátek</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Konec</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label">Termín</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Klient</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">-- Vyberte klienta --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
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

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {editingTask ? 'Uložit změny' : 'Přidat úkol'}
                </button>
                <button type="button" onClick={handleCloseModal} className="flex-1 btn-secondary">
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pro opakovaný úkol */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Vytvořit opakovaný úkol</h2>
              <button onClick={() => setShowRecurringModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleRecurringSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Název *</label>
                <input
                  type="text"
                  value={recurringFormData.title}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Popis</label>
                <textarea
                  value={recurringFormData.description}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div>
                <label className="label">Typ aktivity</label>
                <select
                  value={recurringFormData.task_type_id}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, task_type_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">-- Vyberte typ aktivity --</option>
                  {taskTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Opakování</label>
                  <select
                    value={recurringFormData.recurrence_pattern}
                    onChange={(e) => setRecurringFormData({ ...recurringFormData, recurrence_pattern: e.target.value })}
                    className="input-field"
                  >
                    <option value="daily">Denně</option>
                    <option value="weekly">Týdně</option>
                    <option value="monthly">Měsíčně</option>
                  </select>
                </div>
                <div>
                  <label className="label">Frekvence (každých X dní/týdnů/měsíců)</label>
                  <input
                    type="number"
                    min="1"
                    value={recurringFormData.frequency}
                    onChange={(e) => setRecurringFormData({ ...recurringFormData, frequency: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Počáteční datum *</label>
                  <input
                    type="date"
                    value={recurringFormData.start_date}
                    onChange={(e) => setRecurringFormData({ ...recurringFormData, start_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Koncové datum (volitelné)</label>
                  <input
                    type="date"
                    value={recurringFormData.end_date}
                    onChange={(e) => setRecurringFormData({ ...recurringFormData, end_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label">Priorita</label>
                <select
                  value={recurringFormData.priority}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, priority: e.target.value })}
                  className="input-field"
                >
                  <option value="low">Nízká</option>
                  <option value="medium">Střední</option>
                  <option value="high">Vysoká</option>
                </select>
              </div>

              <div>
                <label className="label">Klient</label>
                <select
                  value={recurringFormData.client_id}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, client_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">-- Vyberte klienta --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Přiřadit uživateli</label>
                <select
                  value={recurringFormData.assigned_to}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, assigned_to: e.target.value })}
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

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-800">
                  💡 Opakovaný úkol bude automaticky vytvářet nové úkoly podle nastaveného opakování.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Vytvořit opakovaný úkol
                </button>
                <button
                  type="button"
                  onClick={() => setShowRecurringModal(false)}
                  className="flex-1 btn-secondary"
                >
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

export default Tasks;
