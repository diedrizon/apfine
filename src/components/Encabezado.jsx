import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Encabezado.css";
import { useAuth } from "../database/authcontext";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";

const Encabezado = ({ isSidebarOpen, toggleSidebar }) => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (isSidebarOpen) toggleSidebar();
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminPassword");
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className={`header ${isSidebarOpen ? "header-sidebar-open" : ""}`}>
      <div className="header-content">
        {isLoggedIn && (
          <button className="menu-button" onClick={toggleSidebar}>
            <HiOutlineMenuAlt1 className="menu-icon" />
          </button>
        )}

        {/* Título cuando NO está autenticado */}
        {!isLoggedIn && <h1 className="guest-title">Prestame Dinero</h1>}
      </div>

      {/* Botón de logout cuando está autenticado */}
      {isLoggedIn && (
        <button className="logout-button" onClick={handleLogout}>
          <FiLogOut className="logout-icon" />
        </button>
      )}
    </header>
  );
};

export default Encabezado;
