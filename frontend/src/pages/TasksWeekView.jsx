import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ChevronLeft, ChevronRight, Calendar, Plus, X, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Získat pondělí daného týdne
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const TasksWeekView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    status: 'new',
    client_id: '',
    assigned_to: '',
    task_type_id: '',
  });

  // Získat datum pro konkrétní den v týdnu (0 = pondělí, 6 = neděle)
  const getDateForDay = (dayOffset) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayOffset);
    return date;
  };

  // Formátovat datum pro zobrazení
  const formatDate = (date) => {
    return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' });
  };

  // Formátovat datum pro porovnání (YYYY-MM-DD)
  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const daysOfWeek = [
    { name: 'Pondělí', short: 'Po' },
    { name: 'Úterý', short: 'Út' },
    { name: 'Středa', short: 'St' },
    { name: 'Čtvrtek', short: 'Čt' },
    { name: 'Pátek', short: 'Pá' },
    { name: 'Sobota', short: 'So' },
    { name: 'Neděle', short: 'Ne' },
  ];

  useEffect(() => {
    fetchTasks();
    fetchTaskTypes();
    fetchClients();
    fetchUsers();
  }, [currentWeekStart]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      // API může vracet pole přímo nebo objekt s polem
      const tasksData = Array.isArray(response.data) ? response.data : (response.data.tasks || []);
      setTasks(tasksData);
      console.log('📋 Načteno úkolů:', tasksData.length);
    } catch (error) {
      console.error('Chyba při načítání úkolů:', error);
      setTasks([]); // Nastavit prázdné pole při chybě
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskTypes = async () => {
    try {
      const response = await api.get('/task-types');
      const typesData = Array.isArray(response.data) ? response.data : [];
      setTaskTypes(typesData);
      console.log('🎨 Načteno typů úkolů:', typesData.length);
    } catch (error) {
      console.error('Chyba při načítání typů úkolů:', error);
      setTaskTypes([]); // Nastavit prázdné pole při chybě
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Chyba při načítání klientů:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Chyba při načítání uživatelů:', error);
    }
  };

  // Filtrovat úkoly pro konkrétní den
  const getTasksForDay = (dayOffset) => {
    const dayDate = getDateForDay(dayOffset);
    const dayKey = formatDateKey(dayDate);
    
    // Ošetření pokud tasks není pole
    if (!Array.isArray(tasks)) {
      console.warn('⚠️ Tasks není pole:', tasks);
      return [];
    }
    
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      const taskKey = formatDateKey(taskDate);
      return taskKey === dayKey && task.status !== 'completed';
    });
  };

  // Přejít na předchozí týden
  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  // Přejít na další týden
  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  // Přejít na aktuální týden
  const goToToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  // Získat informace o typu úkolu
  const getTaskType = (taskTypeId) => {
    return taskTypes.find(type => type.id === taskTypeId);
  };

  // Získat badge pro status
  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-blue-100 text-blue-800',
      waiting_for_client: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Získat badge pro prioritu
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-red-100 text-red-600',
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  const isToday = (dayOffset) => {
    const dayDate = getDateForDay(dayOffset);
    const today = new Date();
    return formatDateKey(dayDate) === formatDateKey(today);
  };

  // Otevřít modal pro nový úkol
  const handleOpenModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      deadline: '',
      priority: 'medium',
      status: 'new',
      client_id: '',
      assigned_to: '',
      task_type_id: '',
    });
    setShowModal(true);
  };

  // Zavřít modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  // Otevřít detail úkolu
  const handleOpenDetail = (task) => {
    setViewingTask(task);
    setShowDetailModal(true);
  };

  // Zavřít detail
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setViewingTask(null);
  };

  // Editovat úkol z detailu
  const handleEditFromDetail = () => {
    setEditingTask(viewingTask);
    setFormData({
      title: viewingTask.title,
      description: viewingTask.description || '',
      deadline: viewingTask.deadline ? viewingTask.deadline.split('T')[0] : '',
      priority: viewingTask.priority,
      status: viewingTask.status,
      client_id: viewingTask.client_id || '',
      assigned_to: viewingTask.assigned_to || '',
      task_type_id: viewingTask.task_type_id || '',
    });
    setShowDetailModal(false);
    setShowModal(true);
  };

  // Uložit úkol
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.deadline) {
      alert('Název a deadline jsou povinné');
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

  // Smazat úkol
  const handleDelete = async (id) => {
    if (!window.confirm('Opravdu chcete smazat tento úkol?')) return;

    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
      handleCloseDetail();
    } catch (error) {
      console.error('Chyba při mazání úkolu:', error);
      alert('Nepodařilo se smazat úkol');
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'Nový',
      in_progress: 'V řešení',
      waiting_for_client: 'Čeká na klienta',
      completed: 'Hotovo',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'Nízká',
      medium: 'Střední',
      high: 'Vysoká',
    };
    return labels[priority] || priority;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading">Načítání...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Týdenní pohled - Úkoly</h1>
          <p className="text-gray-600 mt-1">
            {formatDate(getDateForDay(0))} - {formatDate(getDateForDay(6))}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={goToToday}
            className="btn-secondary flex items-center space-x-2"
          >
            <Calendar size={16} />
            <span>Dnes</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={previousWeek}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
              title="Předchozí týden"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={nextWeek}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
              title="Další týden"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button
            onClick={handleOpenModal}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Nový úkol</span>
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-4">
        {daysOfWeek.map((day, index) => {
          const dayTasks = getTasksForDay(index);
          const dayDate = getDateForDay(index);
          const isTodayDay = isToday(index);

          return (
            <div
              key={index}
              className={`rounded-lg border ${
                isTodayDay
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-3 border-b ${
                  isTodayDay ? 'border-purple-200' : 'border-gray-200'
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-sm font-semibold ${
                      isTodayDay ? 'text-purple-700' : 'text-gray-700'
                    }`}
                  >
                    {day.short}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      isTodayDay ? 'text-purple-600' : 'text-gray-500'
                    }`}
                  >
                    {formatDate(dayDate)}
                  </div>
                  {dayTasks.length > 0 && (
                    <div className="mt-1">
                      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                        isTodayDay ? 'bg-purple-600 text-white' : 'bg-gray-600 text-white'
                      }`}>
                        {dayTasks.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks for the day */}
              <div className="p-2 space-y-2 min-h-[300px]">
                {dayTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-20 text-gray-400 text-xs">
                    Žádné úkoly
                  </div>
                ) : (
                  dayTasks.map((task) => {
                    const taskType = getTaskType(task.task_type_id);
                    
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleOpenDetail(task)}
                        className="p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer bg-white"
                      >
                        {/* Task Type Icon & Name */}
                        {taskType && (
                          <div className="flex items-center space-x-1 mb-2">
                            <span className="text-lg">{taskType.icon}</span>
                            <span className="text-xs font-medium text-gray-600">
                              {taskType.name}
                            </span>
                          </div>
                        )}

                        {/* Task Title */}
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                          {task.title}
                        </h4>

                        {/* Client */}
                        {task.client_name && (
                          <p className="text-xs text-gray-600 mb-2">
                            🏢 {task.client_name}
                          </p>
                        )}

                        {/* Assigned To */}
                        {task.assigned_to_name && (
                          <p className="text-xs text-gray-600 mb-2">
                            👤 {task.assigned_to_name}
                          </p>
                        )}

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority === 'high' && '🔥'}
                            {task.priority === 'medium' && '⚡'}
                            {task.priority === 'low' && '📌'}
                          </span>
                          
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status === 'new' && 'Nový'}
                            {task.status === 'in_progress' && 'V řešení'}
                            {task.status === 'waiting_for_client' && 'Čeká'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal pro vytvoření/úpravu úkolu */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTask ? 'Upravit úkol' : 'Nový úkol'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Název úkolu *</label>
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
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Deadline *</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="input-field"
                    required
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Priorita</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-field"
                    required
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
                    required
                  >
                    <option value="new">Nový</option>
                    <option value="in_progress">V řešení</option>
                    <option value="waiting_for_client">Čeká na klienta</option>
                    <option value="completed">Hotovo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Typ aktivity</label>
                  <select
                    value={formData.task_type_id}
                    onChange={(e) => setFormData({ ...formData, task_type_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">-- Vyberte typ --</option>
                    {taskTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.name}
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
                    {users.map((usr) => (
                      <option key={usr.id} value={usr.id}>
                        {usr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Zrušit
                </button>
                <button type="submit" className="btn-primary">
                  {editingTask ? 'Uložit změny' : 'Vytvořit úkol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pro detail úkolu */}
      {showDetailModal && viewingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Detail úkolu</h2>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Type */}
              {viewingTask.task_type_id && getTaskType(viewingTask.task_type_id) && (
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTaskType(viewingTask.task_type_id).icon}</span>
                  <span className="text-lg font-medium text-gray-700">
                    {getTaskType(viewingTask.task_type_id).name}
                  </span>
                </div>
              )}

              {/* Title */}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewingTask.title}</h3>
              </div>

              {/* Description */}
              {viewingTask.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
                  <p className="text-gray-600">{viewingTask.description}</p>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <p className="text-gray-900">{formatDateDisplay(viewingTask.deadline)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(viewingTask.status)}`}>
                    {getStatusLabel(viewingTask.status)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorita</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${getPriorityColor(viewingTask.priority)}`}>
                    {getPriorityLabel(viewingTask.priority)}
                  </span>
                </div>

                {viewingTask.client_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Klient</label>
                    <p className="text-gray-900">{viewingTask.client_name}</p>
                  </div>
                )}

                {viewingTask.assigned_to_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Přiřazeno</label>
                    <p className="text-gray-900">{viewingTask.assigned_to_name}</p>
                  </div>
                )}

                {viewingTask.created_by_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vytvořil</label>
                    <p className="text-gray-900">{viewingTask.created_by_name}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t">
                <button
                  onClick={() => handleDelete(viewingTask.id)}
                  className="btn-danger flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Smazat</span>
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCloseDetail}
                    className="btn-secondary"
                  >
                    Zavřít
                  </button>
                  <button
                    onClick={handleEditFromDetail}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Edit size={16} />
                    <span>Upravit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksWeekView;
