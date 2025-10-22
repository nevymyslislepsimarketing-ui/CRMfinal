import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  FileText, 
  LogOut,
  Menu,
  X,
  TrendingUp,
  Shield,
  Settings as SettingsIcon,
  Mail,
  Calendar,
  User
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, managerOnly: true },
    { name: 'Pipeline', href: '/pipeline', icon: TrendingUp, managerOnly: true },
    { name: 'Klienti', href: '/clients', icon: Users },
    { name: 'Úkoly', href: '/tasks', icon: CheckSquare },
    { name: 'Kalendář', href: '/calendar', icon: Calendar },
    { name: 'Faktury', href: '/invoices', icon: FileText, managerOnly: true },
    { name: 'Admin', href: '/admin', icon: Shield, managerOnly: true },
    { name: 'Nastavení', href: '/settings', icon: SettingsIcon, managerOnly: true },
  ];

  const getUserInitials = () => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-orange-400 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Nevymyslíš
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5">CRM System</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                // Skrýt manager-only stránky pro běžné uživatele
                if (item.managerOnly && user?.role !== 'manager') {
                  return null;
                }
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side - Email & User */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Email Button */}
              <a
                href="https://mail.zoho.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                <Mail size={18} />
                <span>Email</span>
              </a>

              <div className="h-8 w-px bg-gray-300"></div>

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {getUserInitials()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role === 'manager' ? 'Manažer' : 'Pracovník'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
                  title="Odhlásit se"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            {/* User Info Mobile */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-orange-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {getUserInitials()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role === 'manager' ? 'Manažer' : 'Pracovník'}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                // Skrýt manager-only stránky pro běžné uživatele
                if (item.managerOnly && user?.role !== 'manager') {
                  return null;
                }
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="border-t border-gray-200 my-2"></div>

              <a
                href="https://mail.zoho.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 transition-all"
              >
                <Mail size={20} />
                <span>Email</span>
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut size={20} />
                <span>Odhlásit se</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
