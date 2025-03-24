import React, { useState } from "react";
import "../styles/Panel.css";
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
  BiBookOpen
} from "react-icons/bi";

const Panel = ({ isSidebarOpen, toggleSidebar }) => {
  const [openModule, setOpenModule] = useState(null);

  const toggleModule = (moduleName) => {
    setOpenModule(openModule === moduleName ? null : moduleName);
  };

  const renderSubItem = (icon, label) => (
    <li className="submenu-item">
      {icon}
      <span>{label}</span>
    </li>
  );

  return (
    <aside className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-header">
        <h2>APFINE</h2>
        <button className="close-sidebar" onClick={toggleSidebar}>
          X
        </button>
      </div>

      <div className="sidebar-body">
        <button className="new-chat-btn">
          <BiBarChartAlt2 /> Nuevo chat
        </button>

        <ul className="sidebar-menu">
          {/* Finanzas */}
          <li className="module" onClick={() => toggleModule("finanzas")}>
            <BiMoney className="module-icon" />
            <span className="module-text">Finanzas</span>
            {openModule === "finanzas" ? <BiChevronDown /> : <BiChevronRight />}
          </li>
          {openModule === "finanzas" && (
            <ul className="submenu">
              {renderSubItem(<BiDollar />, "Ingresos")}
              {renderSubItem(<BiListCheck />, "Gastos")}
              {renderSubItem(<BiCube />, "Gastos fijos")}
              {renderSubItem(<BiFolder />, "Categorías")}
              {renderSubItem(<BiTargetLock />, "Metas")}
              {renderSubItem(<BiBulb />, "Recomendaciones")}
            </ul>
          )}

          {/* Producción */}
          <li className="module" onClick={() => toggleModule("produccion")}>
            <BiCog className="module-icon" />
            <span className="module-text">Producción</span>
            {openModule === "produccion" ? <BiChevronDown /> : <BiChevronRight />}
          </li>
          {openModule === "produccion" && (
            <ul className="submenu">
              {renderSubItem(<BiBarChartAlt2 />, "Vista general")}
              {renderSubItem(<BiCube />, "Materias primas")}
              {renderSubItem(<BiPackage />, "Inventario")}
              {renderSubItem(<BiClipboard />, "Órdenes de producción")}
            </ul>
          )}

          {/* Reportes */}
          <li className="module" onClick={() => toggleModule("reportes")}>
            <BiBarChartAlt2 className="module-icon" />
            <span className="module-text">Reportes</span>
            {openModule === "reportes" ? <BiChevronDown /> : <BiChevronRight />}
          </li>
          {openModule === "reportes" && (
            <ul className="submenu">
              {renderSubItem(<BiPackage />, "Dashboard")}
              {renderSubItem(<BiBarChartAlt2 />, "Datos / Reportes")}
              {renderSubItem(<BiCube />, "Exportar")}
              {renderSubItem(<BiBell />, "Alertas")}
            </ul>
          )}

          {/* Comunidad y Educación */}
          <li className="module" onClick={() => toggleModule("comunidad")}>
            <BiWorld className="module-icon" />
            <span className="module-text">Comunidad y Educación</span>
            {openModule === "comunidad" ? <BiChevronDown /> : <BiChevronRight />}
          </li>
          {openModule === "comunidad" && (
            <ul className="submenu">
              {renderSubItem(<BiUser />, "Comunidad")}
              {renderSubItem(<BiBook />, "Educación")}
              {renderSubItem(<BiBookOpen />, "Tutoriales / Quiz")}
            </ul>
          )}

          {/* Administración */}
          <li className="module" onClick={() => toggleModule("admin")}>
            <BiCog className="module-icon" />
            <span className="module-text">Administración</span>
            {openModule === "admin" ? <BiChevronDown /> : <BiChevronRight />}
          </li>
          {openModule === "admin" && (
            <ul className="submenu">
              {renderSubItem(<BiUser />, "Gestión de usuarios")}
              {renderSubItem(<BiTargetLock />, "Roles y permisos")}
              {renderSubItem(<BiBulb />, "Supervisión de IA")}
              {renderSubItem(<BiCog />, "Monitoreo / Configuración")}
            </ul>
          )}
        </ul>
      </div>

      <div className="sidebar-footer">
        <span className="footer-email">diedrinzonfargas@gmail.com</span>
      </div>
    </aside>
  );
};

export default Panel;
