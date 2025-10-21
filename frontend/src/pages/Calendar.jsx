import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    task_type_id: '',
    start_time: '',
    end_time: '',
    priority: 'medium',
    status: 'pending',
    client_id: '',
    assigned_to: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchTaskTypes();
    fetchClients();
    fetchUsers();
  }, [currentDate]);

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

  const fetchTaskTypes = async () => {
    try {
      const response = await api.get('/task-types');
      setTaskTypes(response.data.taskTypes);
    } catch (error) {
      console.error('Chyba při načítání typů úkolů:', error);
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

  const handleOpenModal = (date = null) => {
    if (date) {
      setSelectedDate(date);
      setFormData({
        ...formData,
        deadline: date.toISOString().split('T')[0],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    setFormData({
      title: '',
      description: '',
      deadline: '',
      task_type_id: '',
      start_time: '',
      end_time: '',
      priority: 'medium',
      status: 'pending',
      client_id: '',
      assigned_to: '',
    });
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

      await api.post('/tasks', submitData);
      fetchTasks();
      handleCloseModal();
      alert('Úkol úspěšně vytvořen');
    } catch (error) {
      console.error('Chyba při vytváření úkolu:', error);
      alert('Nepodařilo se vytvořit úkol');
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const monthNames = [
    'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
  ];

  const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const getTaskTypeColor = (taskTypeId) => {
    const taskType = taskTypes.find(t => t.id === taskTypeId);
    return taskType?.color || '#C8B6FF';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-24"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayTasks = getTasksForDate(date);
    
    calendarDays.push(
      <div
        key={day}
        className={`min-h-24 border border-gray-200 p-2 hover:bg-gray-50 transition ${
          isToday(day) ? 'bg-pastel-purple bg-opacity-20 border-2 border-pastel-purple-dark' : 'bg-white'
        }`}
      >
        <div className={`text-sm font-semibold mb-1 ${isToday(day) ? 'text-purple-700' : 'text-gray-700'}`}>
          {day}
        </div>
        <div className="space-y-1">
          {dayTasks.slice(0, 3).map(task => (
            <div
              key={task.id}
              className="text-xs p-1 rounded truncate"
              style={{ backgroundColor: getTaskTypeColor(task.task_type_id) + '40' }}
              title={task.title}
            >
              {task.title}
            </div>
          ))}
          {dayTasks.length > 3 && (
            <div className="text-xs text-gray-500">+{dayTasks.length - 3} další</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kalendář</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center space-x-2">
          <Plus size={18} />
          <span>Nový úkol</span>
        </button>
      </div>

      {/* Navigace měsíce */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Legenda typů úkolů */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-3">Typy aktivit:</h3>
        <div className="flex flex-wrap gap-3">
          {taskTypes.map(type => (
            <div key={type.id} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: type.color }}
              ></div>
              <span className="text-sm">{type.icon} {type.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kalendář */}
      <div className="card">
        {/* Dny v týdnu */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Dny v měsíci */}
        <div className="grid grid-cols-7 gap-0">
          {calendarDays}
        </div>
      </div>

      {/* Modal pro vytvoření úkolu */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Přidat úkol do kalendáře</h2>
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
                  Přidat úkol
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

export default Calendar;
