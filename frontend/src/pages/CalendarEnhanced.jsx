import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock } from 'lucide-react';

const CalendarEnhanced = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month' nebo 'week'
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
    is_shared: false,
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

  const handleOpenModal = (date = null, timeSlot = null) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    
    let deadlineValue = '';
    let startTimeValue = '';
    let endTimeValue = '';
    
    if (date) {
      deadlineValue = date.toISOString().split('T')[0];
      
      if (timeSlot) {
        const dateStr = date.toISOString().split('T')[0];
        startTimeValue = `${dateStr}T${timeSlot}:00`;
        // End time je o hodinu později
        const endHour = parseInt(timeSlot.split(':')[0]) + 1;
        endTimeValue = `${dateStr}T${endHour.toString().padStart(2, '0')}:00:00`;
      }
    }
    
    setFormData({
      ...formData,
      deadline: deadlineValue,
      start_time: startTimeValue,
      end_time: endTimeValue,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
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
      is_shared: false,
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

  // Získat pondělí aktuálního týdne
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Pokud je neděle, vrátit se o 6 dní
    return new Date(d.setDate(diff));
  };

  // Generovat dny pro týdenní zobrazení
  const getWeekDays = () => {
    const monday = getMonday(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Generovat časové sloty od 6:00 do 24:00
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  // Získat úkoly pro konkrétní datum
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Získat úkoly pro konkrétní časový slot
  const getTasksForTimeSlot = (date, timeSlot) => {
    return tasks.filter(task => {
      if (!task.start_time) return false;
      const taskStart = new Date(task.start_time);
      const taskDate = taskStart.toDateString();
      const taskHour = taskStart.getHours();
      const slotHour = parseInt(timeSlot.split(':')[0]);
      
      return taskDate === date.toDateString() && taskHour === slotHour;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startingDayOfWeek = firstDay.getDay();
    
    // Upravit tak, aby týden začínal pondělím (0=Po, 1=Út, ..., 6=Ne)
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const previousPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
  ];

  const dayNamesShort = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const dayNamesFull = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];

  const today = new Date();
  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  const getTaskTypeColor = (taskTypeId) => {
    const taskType = taskTypes.find(t => t.id === taskTypeId);
    return taskType?.color || '#C8B6FF';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kalendář</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center space-x-2">
          <Plus size={18} />
          <span>Nový úkol</span>
        </button>
      </div>

      {/* Navigace a přepínání zobrazení */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          {/* Levá část - navigace */}
          <div className="flex items-center space-x-4">
            <button
              onClick={previousPeriod}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Dnes
            </button>
            <button
              onClick={nextPeriod}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {viewMode === 'month' 
                ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : `Týden ${getMonday(currentDate).getDate()}. - ${getWeekDays()[6].getDate()}. ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              }
            </h2>
          </div>

          {/* Pravá část - přepínání zobrazení */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'month'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon size={16} className="inline mr-2" />
              Měsíc
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'week'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock size={16} className="inline mr-2" />
              Týden
            </button>
          </div>
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

      {/* Měsíční zobrazení */}
      {viewMode === 'month' && (
        <div className="card">
          {/* Dny v týdnu */}
          <div className="grid grid-cols-7 gap-0 mb-2">
            {dayNamesShort.map(day => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dny v měsíci */}
          <div className="grid grid-cols-7 gap-0">
            {(() => {
              const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
              const calendarDays = [];
              
              // Prázdná pole na začátku
              for (let i = 0; i < startingDayOfWeek; i++) {
                calendarDays.push(
                  <div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>
                );
              }
              
              // Dny měsíce
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayTasks = getTasksForDate(date);
                
                calendarDays.push(
                  <div
                    key={day}
                    onClick={() => handleOpenModal(date)}
                    className={`min-h-24 border border-gray-200 p-2 hover:bg-gray-50 transition cursor-pointer ${
                      isToday(date) ? 'bg-purple-50 border-2 border-purple-500' : 'bg-white'
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isToday(date) ? 'text-purple-700' : 'text-gray-700'}`}>
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
                          {task.start_time && (
                            <span className="font-semibold mr-1">{formatTime(task.start_time)}</span>
                          )}
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
              
              return calendarDays;
            })()}
          </div>
        </div>
      )}

      {/* Týdenní zobrazení */}
      {viewMode === 'week' && (
        <div className="card overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Hlavička s dny */}
            <div className="grid grid-cols-8 gap-0 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="p-2 border-r border-gray-200">
                <div className="text-xs text-gray-500 text-center">Čas</div>
              </div>
              {getWeekDays().map((date, index) => (
                <div
                  key={index}
                  className={`p-2 text-center border-r border-gray-200 ${
                    isToday(date) ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="text-xs text-gray-500">{dayNamesFull[index]}</div>
                  <div className={`text-lg font-semibold ${isToday(date) ? 'text-purple-700' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Časové sloty */}
            <div className="relative">
              {getTimeSlots().map((timeSlot) => (
                <div key={timeSlot} className="grid grid-cols-8 gap-0 border-b border-gray-200">
                  {/* Časový label */}
                  <div className="p-2 border-r border-gray-200 bg-gray-50">
                    <div className="text-xs text-gray-600 font-medium">{timeSlot}</div>
                  </div>
                  
                  {/* Buňky pro každý den */}
                  {getWeekDays().map((date, dayIndex) => {
                    const slotTasks = getTasksForTimeSlot(date, timeSlot);
                    return (
                      <div
                        key={dayIndex}
                        onClick={() => handleOpenModal(date, timeSlot)}
                        className={`min-h-16 p-1 border-r border-gray-200 hover:bg-gray-50 cursor-pointer transition ${
                          isToday(date) ? 'bg-purple-50 bg-opacity-30' : ''
                        }`}
                      >
                        {slotTasks.map(task => (
                          <div
                            key={task.id}
                            className="text-xs p-1 mb-1 rounded truncate font-medium"
                            style={{ 
                              backgroundColor: getTaskTypeColor(task.task_type_id),
                              color: 'white'
                            }}
                            title={`${task.title} - ${formatTime(task.start_time)} - ${formatTime(task.end_time)}`}
                          >
                            {task.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_shared"
                  checked={formData.is_shared}
                  onChange={(e) => setFormData({ ...formData, is_shared: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_shared" className="text-sm font-medium text-gray-700">
                  Sdílená aktivita (viditelná pro všechny)
                </label>
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

export default CalendarEnhanced;
