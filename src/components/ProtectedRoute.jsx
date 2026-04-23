import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { state } = useContext(AppContext);

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && state.role !== 'ROLE_ADMIN' && state.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
