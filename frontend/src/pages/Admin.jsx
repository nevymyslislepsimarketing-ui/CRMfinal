import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Users, Plus, X, CheckCircle, XCircle, Trash2, Ban, UserCheck, Edit } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    position: '',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: '',
    position: '',
  });

  useEffect(() => {
    if (user?.role !== 'manager') {
      alert('Nemáte oprávnění k této stránce');
      return;
    }
    fetchUsers();
    fetchTasks();
    fetchProjects();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Chyba při načítání uživatelů:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Chyba při načítání úkolů:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Chyba při načítání projektů:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert('Vyplňte všechna povinná pole');
      return;
    }

    try {
      await api.post('/auth/register', formData);
      fetchUsers();
      setShowUserModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        position: '',
      });
      alert('Uživatel úspěšně vytvořen');
    } catch (error) {
      console.error('Chyba při vytváření uživatele:', error);
      alert(error.response?.data?.error || 'Nepodařilo se vytvořit uživatele');
    }
  };

  const getUserTasks = (userId) => {
    return tasks.filter(task => task.assigned_to === userId);
  };

  const getUserProjects = (userId) => {
    return projects.filter(project => project.assigned_to === userId);
  };

  const getTaskStats = (userId) => {
    const userTasks = getUserTasks(userId);
    const completed = userTasks.filter(t => t.status === 'completed').length;
    const pending = userTasks.filter(t => t.status === 'pending').length;
    const inProgress = userTasks.filter(t => t.status === 'in_progress').length;
    return { total: userTasks.length, completed, pending, inProgress };
  };

  const getProjectStats = (userId) => {
    const userProjects = getUserProjects(userId);
    const inProgress = userProjects.filter(p => p.status === 'in_progress').length;
    const completed = userProjects.filter(p => p.status === 'completed').length;
    return { total: userProjects.length, inProgress, completed };
  };

  const handleToggleStatus = async (userId) => {
    if (!confirm('Opravdu chcete změnit status tohoto uživatele?')) return;

    try {
      await api.patch(`/users/${userId}/toggle-status`);
      fetchUsers();
      alert('Status uživatele byl změněn');
    } catch (error) {
      console.error('Chyba při změně statusu:', error);
      alert(error.response?.data?.error || 'Nepodařilo se změnit status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Opravdu chcete smazat tohoto uživatele? Tato akce je nevratná!')) return;

    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
      alert('Uživatel byl úspěšně smazán');
    } catch (error) {
      console.error('Chyba při mazání uživatele:', error);
      alert(error.response?.data?.error || 'Nepodařilo se smazat uživatele');
    }
  };

  const canManageUser = (targetUser) => {
    const isAdmin = user.email === 'info@nevymyslis.cz';
    const isManager = user.role === 'manager';
    const targetIsEmployee = targetUser.role === 'employee';
    const isSelf = targetUser.id === user.id;

    if (isSelf) return false; // Nelze upravovat sebe
    if (isAdmin) return true; // Admin může vše
    if (isManager && targetIsEmployee) return true; // Manager jen employees
    return false;
  };

  // Otevřít modal pro úpravu uživatele
  const handleOpenEditModal = (targetUser) => {
    setEditingUser(targetUser);
    setEditFormData({
      name: targetUser.name,
      role: targetUser.role,
      position: targetUser.position || '',
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditFormData({
      name: '',
      role: '',
      position: '',
    });
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    
    try {
      await api.patch(`/users/${editingUser.id}`, editFormData);
      fetchUsers();
      handleCloseEditModal();
      alert('Uživatel úspěšně upraven');
    } catch (error) {
      console.error('Chyba při úpravě uživatele:', error);
      alert(error.response?.data?.error || 'Nepodařilo se upravit uživatele');
    }
  };

  if (user?.role !== 'manager') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Přístup odepřen</h1>
        <p className="text-gray-600 mt-2">Nemáte oprávnění k této stránce</p>
      </div>
    );
  }

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Správa uživatelů a přehled týmu</p>
        </div>
        <button
          onClick={() => setShowUserModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Nový uživatel</span>
        </button>
      </div>

      {/* Přehled uživatelů */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => {
          const stats = getTaskStats(u.id);
          const projectStats = getProjectStats(u.id);
          return (
            <div key={u.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{u.name}</h3>
                    {!u.is_active && (
                      <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                        Neaktivní
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{u.position || u.role}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      u.role === 'manager'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {u.role === 'manager' ? 'Manažer' : 'Pracovník'}
                  </span>
                  
                  {canManageUser(u) && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1.5 rounded hover:bg-gray-100 text-blue-600 transition-colors"
                        title="Upravit uživatele"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                          u.is_active ? 'text-orange-600' : 'text-green-600'
                        }`}
                        title={u.is_active ? 'Deaktivovat uživatele' : 'Aktivovat uživatele'}
                      >
                        {u.is_active ? <Ban size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded hover:bg-gray-100 text-red-600 transition-colors"
                        title="Smazat uživatele"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Přehled úkolů:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Celkem úkolů:</span>
                    <span className="font-semibold">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <CheckCircle size={14} className="mr-1 text-green-600" />
                      Hotové:
                    </span>
                    <span className="text-green-600 font-semibold">{stats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Probíhá:</span>
                    <span className="text-blue-600 font-semibold">{stats.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <XCircle size={14} className="mr-1 text-yellow-600" />
                      Čeká:
                    </span>
                    <span className="text-yellow-600 font-semibold">{stats.pending}</span>
                  </div>
                </div>

                {stats.total > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pastel-purple to-pastel-purple-dark h-2 rounded-full transition-all"
                        style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {Math.round((stats.completed / stats.total) * 100)}% dokončeno
                    </p>
                  </div>
                )}
              </div>

              {/* Přehled projektů */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold mb-3">Přehled projektů:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Celkem projektů:</span>
                    <span className="font-semibold">{projectStats.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Probíhá:</span>
                    <span className="text-blue-600 font-semibold">{projectStats.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <CheckCircle size={14} className="mr-1 text-green-600" />
                      Dokončeno:
                    </span>
                    <span className="text-green-600 font-semibold">{projectStats.completed}</span>
                  </div>
                </div>

                {projectStats.total > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pastel-orange to-pastel-orange-dark h-2 rounded-full transition-all"
                        style={{ width: `${(projectStats.completed / projectStats.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {Math.round((projectStats.completed / projectStats.total) * 100)}% dokončeno
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal pro vytvoření uživatele */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Vytvořit nového uživatele</h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="label">Jméno *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Heslo *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="label">Pozice</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="input-field"
                  placeholder="např. Grafik, Social Media Manager..."
                />
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                >
                  <option value="employee">Pracovník</option>
                  <option value="manager">Manažer</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Vytvořit uživatele
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pro úpravu uživatele */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upravit uživatele</h2>
              <button onClick={handleCloseEditModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div>
                <label className="label">Jméno</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Pozice</label>
                <input
                  type="text"
                  value={editFormData.position}
                  onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                  className="input-field"
                  placeholder="např. Grafik, Social Media Manager..."
                />
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="input-field"
                >
                  <option value="employee">Pracovník</option>
                  <option value="manager">Manažer</option>
                </select>
                {user.email === 'info@nevymyslis.cz' && editingUser.role === 'manager' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pouze hlavní administrátor může změnit roli manažera na pracovníka
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Uložit změny
                </button>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
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

export default Admin;
