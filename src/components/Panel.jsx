import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../database/authcontext";
import {
  BiMoney,
  BiCog,
  BiBarChartAlt2,
  BiWorld,
  BiChevronDown,
  BiChevronRight,
  BiDollar,
  BiListCheck,
  BiCube,
  BiFolder,
  BiTargetLock,
  BiBulb,
  BiClipboard,
  BiPackage,
  BiBell,
  BiUser,
  BiBook,
  BiBookOpen,
} from "react-icons/bi";
import "../styles/Panel.css";

function Panel({ isSidebarOpen, toggleSidebar }) {
  const [openModule, setOpenModule] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [userPhoto, setUserPhoto] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const photo = localStorage.getItem("userPhotoURL");
    const name = localStorage.getItem("userDisplayName");
    const email = localStorage.getItem("userEmail");

    if (photo || name || email) {
      setUserPhoto(photo);
      setUserName(name);
      setUserEmail(email);
    }
  }, []);

  function toggleModuleName(moduleName) {
    setOpenModule(openModule === moduleName ? null : moduleName);
  }

  function handleNavigate(path) {
    navigate(path);
    if (isMobile) toggleSidebar();
  }

  if (!isLoggedIn) return null;

  function renderSubItem(icon, label, onClick) {
    return (
      <li className="submenu-item" onClick={onClick}>
        <span className="submenu-icon">{icon}</span>
        <span>{label}</span>
      </li>
    );
  }

  const getInitial = (name = "") => name.trim().charAt(0).toUpperCase();

  return (
    <>
      {isMobile && isSidebarOpen && (
        <div className="overlay" onClick={toggleSidebar}></div>
      )}
      <aside className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="header-left">
            <img src="/Icono.png" alt="Logo APFINE" className="logo-icon" />
            <div className="logo-text-group">
              <span className="logo-text">APFINE</span>
              <span className="version">v1.0</span>
            </div>
          </div>
          <button className="close-sidebar" onClick={toggleSidebar}>
            X
          </button>
        </div>

        <div className="sidebar-body">
          <button className="new-chat-btn">
            <BiBarChartAlt2 /> Nuevo chat
          </button>

          <ul className="sidebar-menu">
            <li className="module" onClick={() => toggleModuleName("finanzas")}>
              <BiMoney className="module-icon" />
              <span className="module-text">Finanzas</span>
              {openModule === "finanzas" ? (
                <BiChevronDown />
              ) : (
                <BiChevronRight />
              )}
            </li>
            {openModule === "finanzas" && (
              <ul className="submenu">
                {renderSubItem(<BiDollar />, "Ingresos", () =>
                  handleNavigate("/ingresos")
                )}
                {renderSubItem(<BiListCheck />, "Gastos", () =>
                  handleNavigate("/gastos")
                )}
                {renderSubItem(<BiCube />, "Gastos fijos", () =>
                  handleNavigate("/gastofijos")
                )}
                {renderSubItem(<BiFolder />, "Categorías", () =>
                  handleNavigate("/categorias")
                )}
                {renderSubItem(<BiTargetLock />, "Metas", () =>
                  handleNavigate("/metas")
                )}
                {renderSubItem(<BiBulb />, "Recomendaciones", () =>
                  handleNavigate("/recomendaciones")
                )}
              </ul>
            )}

            {/* Producción */}
            <li
              className="module"
              onClick={() => toggleModuleName("produccion")}
            >
              <BiCog className="module-icon" />
              <span className="module-text">Producción</span>
              {openModule === "produccion" ? (
                <BiChevronDown />
              ) : (
                <BiChevronRight />
              )}
            </li>
            {openModule === "produccion" && (
              <ul className="submenu">
                {renderSubItem(<BiBarChartAlt2 />, "Vista general", () => {})}
                {renderSubItem(<BiCube />, "Materias primas", () =>
                  handleNavigate("/materias-primas")
                )}
                {renderSubItem(<BiListCheck />, "Inventario", () =>
                  handleNavigate("/inventario")
                )}
                {renderSubItem(
                  <BiClipboard />,
                  "Órdenes de producción",
                  () => {}
                )}
              </ul>
            )}

            {/* Reportes */}
            <li className="module" onClick={() => toggleModuleName("reportes")}>
              <BiBarChartAlt2 className="module-icon" />
              <span className="module-text">Reportes</span>
              {openModule === "reportes" ? (
                <BiChevronDown />
              ) : (
                <BiChevronRight />
              )}
            </li>
            {openModule === "reportes" && (
              <ul className="submenu">
                {renderSubItem(<BiPackage />, "Dashboard", () => {})}
                {renderSubItem(
                  <BiBarChartAlt2 />,
                  "Datos / Reportes",
                  () => {}
                )}
                {renderSubItem(<BiCube />, "Exportar", () => {})}
                {renderSubItem(<BiBell />, "Alertas", () => {})}
              </ul>
            )}

            {/* Comunidad */}
            <li
              className="module"
              onClick={() => toggleModuleName("comunidad")}
            >
              <BiWorld className="module-icon" />
              <span className="module-text">Comunidad y Educación</span>
              {openModule === "comunidad" ? (
                <BiChevronDown />
              ) : (
                <BiChevronRight />
              )}
            </li>
            {openModule === "comunidad" && (
              <ul className="submenu">
                {renderSubItem(<BiUser />, "Comunidad", () => {})}
                {renderSubItem(<BiBook />, "Educación", () => {})}
                {renderSubItem(<BiBookOpen />, "Tutoriales / Quiz", () => {})}
              </ul>
            )}

            {/* Administración (solo si es admin) */}
            {isAdmin && (
              <>
                <li
                  className="module"
                  onClick={() => toggleModuleName("admin")}
                >
                  <BiCog className="module-icon" />
                  <span className="module-text">Administración</span>
                  {openModule === "admin" ? (
                    <BiChevronDown />
                  ) : (
                    <BiChevronRight />
                  )}
                </li>
                {openModule === "admin" && (
                  <ul className="submenu">
                    {renderSubItem(
                      <BiUser />,
                      "Gestión de usuarios",
                      () => {
                        handleNavigate("/gestion-usuarios");
                      }
                    )}
                    {renderSubItem(
                      <BiTargetLock />,
                      "Roles y permisos",
                      () => {}
                    )}
                    {renderSubItem(
                      <BiBulb />,
                      "Supervisión de IA",
                      () => {}
                    )}
                    {renderSubItem(
                      <BiCog />,
                      "Monitoreo / Configuración",
                      () => {}
                    )}
                  </ul>
                )}
              </>
            )}
          </ul>
        </div>

        <div className="sidebar-footer user-footer">
          {userPhoto ? (
            <img src={userPhoto} alt="Foto de perfil" className="user-photo" />
          ) : (
            <div className="user-photo-inicial">{getInitial(userName)}</div>
          )}
          <div className="user-info-text">
            <div className="user-name" title={userName}>
              {userName}
            </div>
            <div className="user-email" title={userEmail}>
              {userEmail}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Panel;
