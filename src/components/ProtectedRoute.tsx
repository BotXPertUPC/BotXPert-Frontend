import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMasterPassword } from '../context/MasterPasswordContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useMasterPassword();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;