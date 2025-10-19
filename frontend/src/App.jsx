import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import Layout from './components/Layout';
import Login from './pages/Login';
import DashboardUser from './pages/DashboardUser';
import DashboardSupport from './pages/DashboardSupport';
import TicketDetails from './pages/TicketDetails';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.tipo !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route 
          path="dashboard-usuario" 
          element={
            <PrivateRoute role="usuario">
              <DashboardUser />
            </PrivateRoute>
          } 
        />
        <Route 
          path="dashboard-suporte" 
          element={
            <PrivateRoute role="suporte">
              <DashboardSupport />
            </PrivateRoute>
          } 
        />
        <Route 
          path="ticket/:id" 
          element={
            <PrivateRoute>
              <TicketDetails />
            </PrivateRoute>
          } 
        />
        <Route 
          index 
          element={<NavigateToDashboard />} 
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const NavigateToDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Carregando...
      </div>
    );
  }

  if (user?.tipo === 'suporte') {
    return <Navigate to="/dashboard-suporte" replace />;
  }
  
  return <Navigate to="/dashboard-usuario" replace />;
};

export default App;