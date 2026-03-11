import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('revaDoToken');

  if (!token) {
    // If no token is found, redirect to login
    return <Navigate to="/auth" replace />;
  }

  // If token exists, show the requested component
  return children;
};

export default ProtectedRoute;