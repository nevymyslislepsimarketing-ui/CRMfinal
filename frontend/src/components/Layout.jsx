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
  User,
  Briefcase,
  DollarSign,
  Sparkles,
  FolderOpen,
  ChevronDown
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState({
    tools: false,
    finance: false,
    system: false
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hlavní jednotlivé záložky (nejdůležitější zleva)
  const mainNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, managerOnly: true },
    { name: 'Klienti', href: '/clients', icon: Users },
    { name: 'Úkoly', href: '/tasks', icon: CheckSquare },
    { name: 'Projekty', href: '/projects', icon: Briefcase },
  ];

  // Dropdown skupiny (logicky seskupené)
  const dropdownGroups = {
    tools: {
      name: 'Nástroje',
      items: [
        { name: 'Kalendář', href: '/calendar', icon: Calendar },
        { name: 'AI Popisky', href: '/ai-captions', icon: Sparkles },
        { name: 'Google Drive', href: '/google-drive', icon: FolderOpen },
        { name: 'Pipeline', href: '/pipeline', icon: TrendingUp, managerOnly: true },
      ]
    },
    finance: {
      name: 'Finance',
      items: [
        { name: 'Naceňování', href: '/pricing', icon: DollarSign, managerOnly: true },
        { name: 'Faktury', href: '/invoices', icon: FileText, managerOnly: true },
      ]
    },
    system: {
      name: 'Systém',
      items: [
        { name: 'Admin', href: '/admin', icon: Shield, managerOnly: true },
        { name: 'Nastavení', href: '/settings', icon: SettingsIcon, managerOnly: true },
      ]
    }
  };

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

  // Zavřít dropdown při kliknutí mimo
  React.useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen({ tools: false, finance: false, system: false });
    };
    
    if (Object.values(dropdownOpen).some(v => v)) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

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
            
            {/* Desktop Navigation - Kompaktní s Dropdowns */}
            <div className="hidden lg:flex items-center space-x-1">
              {/* Hlavní navigace */}
              {mainNav.map((item) => {
                if (item.managerOnly && user?.role !== 'manager') {
                  return null;
                }
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Dropdown skupiny */}
              {Object.entries(dropdownGroups).map(([key, group]) => {
                // Filtrovat itemy podle role
                const visibleItems = group.items.filter(item => 
                  !item.managerOnly || user?.role === 'manager'
                );
                
                if (visibleItems.length === 0) return null;

                return (
                  <div key={key} className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(prev => ({ ...prev, [key]: !prev[key] }));
                      }}
                      className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                        visibleItems.some(item => isActive(item.href))
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span>{group.name}</span>
                      <ChevronDown size={12} className={`transition-transform ${dropdownOpen[key] ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen[key] && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        {visibleItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setDropdownOpen(prev => ({ ...prev, [key]: false }))}
                              className={`flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 transition-all ${
                                isActive(item.href) ? 'text-purple-600 bg-purple-50' : 'text-gray-700'
                              }`}
                            >
                              <Icon size={16} />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Side - Email & User - Kompaktní */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Email Button */}
              <a
                href="https://mail.zoho.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
                title="Email"
              >
                <Mail size={16} />
                <span className="hidden xl:inline">Email</span>
              </a>

              <div className="h-6 w-px bg-gray-300"></div>

              {/* User Info - Kompaktní */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {getUserInitials()}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-medium text-gray-900">{user?.name}</p>
                    <p className="text-[10px] text-gray-500 -mt-0.5">{user?.role === 'manager' ? 'Manažer' : 'Pracovník'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
                  title="Odhlásit se"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
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
          <div className="lg:hidden border-t border-gray-200 bg-white">
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
              {/* Hlavní navigace */}
              {mainNav.map((item) => {
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

              {/* Dropdown skupiny - v mobile rozbalené */}
              {Object.entries(dropdownGroups).map(([key, group]) => {
                const visibleItems = group.items.filter(item => 
                  !item.managerOnly || user?.role === 'manager'
                );
                
                if (visibleItems.length === 0) return null;

                return (
                  <div key={key}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.name}
                    </div>
                    {visibleItems.map((item) => {
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
                  </div>
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
