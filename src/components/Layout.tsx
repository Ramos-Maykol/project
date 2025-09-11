import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Factory, 
  BarChart3, 
  Settings, 
  FileText, 
  LogOut, 
  User,
  Home
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home, roles: ['admin', 'operator'] },
    { id: 'data-management', label: 'Gestión de Datos', icon: BarChart3, roles: ['admin', 'operator'] },
    { id: 'predictions', label: 'Predicciones', icon: Factory, roles: ['admin', 'operator'] },
    { id: 'reports', label: 'Reportes', icon: FileText, roles: ['admin', 'operator'] },
    { id: 'settings', label: 'Configuración', icon: Settings, roles: ['admin'] }
  ];

  const availableItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'operator')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Factory className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold">Sistema Predictivo Manufactura</h1>
                <p className="text-sm text-gray-300">Optimización de Procesos Industriales</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-300 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {availableItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onPageChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};