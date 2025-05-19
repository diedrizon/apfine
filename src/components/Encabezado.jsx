import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Encabezado.css";
import { useAuth } from "../database/authcontext";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { FiBell, FiLogOut } from "react-icons/fi";
import { BiSun, BiMoon, BiWifiOff } from "react-icons/bi";
import NotificationsModal from "./NotificacionesModal";

const Encabezado = ({
  isSidebarOpen,
  toggleSidebar,
  isDarkMode,
  toggleTheme,
}) => {
  const { isLoggedIn, logout, isOffline, cargando } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { title: "Bienvenido", message: "¡Gracias por usar APFINE!", time: "Ahora" }
  ];

  const ocultarHeaderEn = [
    "/",
    "/login",
    "/recuperar",
    "/privacidad",
    "/terminos-condiciones",
  ];

  const esRuta404 =
    location.pathname &&
    ![
      "/",
      "/login",
      "/recuperar",
      "/inicio",
      "/categorias",
      "/ingresos",
      "/gastos",
      "/recomendaciones",
      "/gastofijos",
      "/metas",
      "/materias-primas",
      "/gestion-usuarios",
      "/inventario",
      "/ordenes-produccion",
    ].includes(location.pathname);

  if (cargando || ocultarHeaderEn.includes(location.pathname) || esRuta404)
    return null;

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
      </div>

      {isLoggedIn && isOffline && (
        <div className="estado-offline">
          <BiWifiOff className="icono-offline" />
          <span>Sin conexión</span>
        </div>
      )}

      {isLoggedIn && (
        <>
          <button
            className="notifications-button"
            onClick={() => setNotificationsOpen(true)}
          >
            <div className="bell-wrapper">
              <FiBell
                className={`notifications-icon ${notifications.length > 0 ? "animate-bell" : ""
                  }`}
              />
            </div>
          </button>
          <button className="logout-button" onClick={handleLogout}>
            <FiLogOut className="logout-icon" />
          </button>
          <button className="theme-toggle-button" onClick={toggleTheme}>
            {isDarkMode ? <BiSun /> : <BiMoon />}
          </button>
        </>
      )}

      <NotificationsModal
        isOpen={isNotificationOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
      />
    </header>
  );
};

export default Encabezado;
