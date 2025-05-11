import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../database/authcontext";

const ProtectedRoute = ({ element, allowRoles = [] }) => {
  const { user, perfil, cargando } = useAuth();

  // Esperar a que termine de cargar el contexto de autenticación
  if (cargando) return null;

  // Usuario no autenticado
  if (!user) return <Navigate to="/login" replace />;

  // Usuario autenticado pero sin rol permitido
  if (allowRoles.length && !allowRoles.includes(perfil?.rol)) {
    return <Navigate to="/inicio" replace />;
  }

  // Acceso permitido
  return element;
};

export default ProtectedRoute;
