import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Encabezado.css";
import { useAuth } from "../database/authcontext";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";
import { BiSun, BiMoon } from "react-icons/bi";

const Encabezado = ({ isSidebarOpen, toggleSidebar, isDarkMode, toggleTheme }) => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const ocultarHeaderEn = ["/", "/login", "/recuperar", "/privacidad", "/terminos-condiciones"];
  const esRuta404 = location.pathname && ![
    "/", "/login", "/recuperar", "/inicio", "/categorias", "/ingresos", "/gastos", "/recomendaciones"
  ].includes(location.pathname);

  if (ocultarHeaderEn.includes(location.pathname) || esRuta404) return null;

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
        {!isLoggedIn && <h1 className="guest-title">Prestame Dinero</h1>}
      </div>

      {isLoggedIn && (
        <>
          <button className="logout-button" onClick={handleLogout}>
            <FiLogOut className="logout-icon" />
          </button>
          <button className="theme-toggle-button" onClick={toggleTheme}>
            {isDarkMode ? <BiSun /> : <BiMoon />}
          </button>
        </>
      )}
    </header>
  );
};

export default Encabezado;
