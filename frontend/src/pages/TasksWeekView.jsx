import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
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
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));
  const [loading, setLoading] = useState(true);

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
  }, [currentWeekStart]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Chyba při načítání úkolů:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskTypes = async () => {
    try {
      const response = await api.get('/task-types');
      setTaskTypes(response.data);
    } catch (error) {
      console.error('Chyba při načítání typů úkolů:', error);
    }
  };

  // Filtrovat úkoly pro konkrétní den
  const getTasksForDay = (dayOffset) => {
    const dayDate = getDateForDay(dayOffset);
    const dayKey = formatDateKey(dayDate);
    
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
            onClick={() => navigate('/tasks')}
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
                        onClick={() => navigate('/tasks')}
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
    </div>
  );
};

export default TasksWeekView;
