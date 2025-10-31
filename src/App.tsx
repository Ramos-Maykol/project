import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { ImprovedDashboard } from './components/ImprovedDashboard';
import { DataManagement } from './components/DataManagement';
import { NewPredictions } from './components/NewPredictions';
import { OrderManagement } from './components/OrderManagement';
import { ImprovedReports } from './components/ImprovedReports';
import { Settings } from './components/Settings';
import { Chatbot } from './components/Chatbot';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <ImprovedDashboard />;
      case 'predictions':
        return <NewPredictions />;
      case 'order-management':
        return <OrderManagement />;
      case 'data-management':
        return <DataManagement />;
      case 'reports':
        return <ImprovedReports />;
      case 'settings':
        return <Settings />;
      default:
        return <ImprovedDashboard />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderCurrentPage()}
      </Layout>
      <Chatbot />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;