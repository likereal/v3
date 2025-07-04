import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // Not logged in, redirect to /auth
    return <Navigate to="/auth" replace />;
  }

  // Logged in, render the children
  return <>{children}</>;
};

export default ProtectedRoute;