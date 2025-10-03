// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirige vers /login en gardant la route d'origine dans state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si connecté, affiche les enfants (routes enfants)
  return <Outlet />;
};

export default PrivateRoute;
