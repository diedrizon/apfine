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
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  function toggleModuleName(moduleName) {
    setOpenModule(openModule === moduleName ? null : moduleName);
  }
  function handleNavigate(path) {
    navigate(path);
    if (isMobile) {
      toggleSidebar();
    }
  }
  if (!isLoggedIn) {
    return null;
  }
  function renderSubItem(icon, label, onClick) {
    return (
      <li className="submenu-item" onClick={onClick}>
        {icon}
        <span>{label}</span>
      </li>
    );
  }
  return (
    <>
      {isMobile && isSidebarOpen && (
        <div className="overlay" onClick={toggleSidebar}></div>
      )}
      <aside className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="header-left">
            <img src="/LogoImg.png" alt="APFINE Icon" className="logo" />
            <span className="version">v1.0</span>
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
                {renderSubItem(<BiListCheck />, "Gastos", () => {})}
                {renderSubItem(<BiCube />, "Gastos fijos", () => {})}
                {renderSubItem(<BiFolder />, "Categorías", () =>
                  handleNavigate("/categorias")
                )}
                {renderSubItem(<BiTargetLock />, "Metas", () => {})}
                {renderSubItem(<BiBulb />, "Recomendaciones", () => {})}
              </ul>
            )}
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
                {renderSubItem(<BiCube />, "Materias primas", () => {})}
                {renderSubItem(<BiPackage />, "Inventario", () => {})}
                {renderSubItem(
                  <BiClipboard />,
                  "Órdenes de producción",
                  () => {}
                )}
              </ul>
            )}
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
            <li className="module" onClick={() => toggleModuleName("admin")}>
              <BiCog className="module-icon" />
              <span className="module-text">Administración</span>
              {openModule === "admin" ? <BiChevronDown /> : <BiChevronRight />}
            </li>
            {openModule === "admin" && (
              <ul className="submenu">
                {renderSubItem(<BiUser />, "Gestión de usuarios", () => {})}
                {renderSubItem(<BiTargetLock />, "Roles y permisos", () => {})}
                {renderSubItem(<BiBulb />, "Supervisión de IA", () => {})}
                {renderSubItem(
                  <BiCog />,
                  "Monitoreo / Configuración",
                  () => {}
                )}
              </ul>
            )}
          </ul>
        </div>
        <div className="sidebar-footer">
          <span className="footer-email">diedrinzonfargas@gmail.com</span>
        </div>
      </aside>
    </>
  );
}
export default Panel;
