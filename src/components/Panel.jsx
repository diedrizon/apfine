import React from "react";
import "../styles/Panel.css";
import {
  BiMoney,
  BiCog,
  BiBarChartAlt2,
  BiWorld
} from "react-icons/bi";

const Panel = ({ isSidebarOpen, toggleSidebar }) => {
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
          <li className="module">
            <BiMoney className="module-icon" />
            <span className="module-text">Finanzas</span>
          </li>
          <li className="module">
            <BiCog className="module-icon" />
            <span className="module-text">Producción</span>
          </li>
          <li className="module">
            <BiBarChartAlt2 className="module-icon" />
            <span className="module-text">Reportes</span>
          </li>
          <li className="module">
            <BiWorld className="module-icon" />
            <span className="module-text">Comunidad y Educación</span>
          </li>
          <li className="module">
            <BiCog className="module-icon" />
            <span className="module-text">Administración</span>
          </li>
        </ul>
      </div>

      <div className="sidebar-footer">
        <span className="footer-email">diedrinzonfargas@gmail.com</span>
      </div>
    </aside>
  );
};

export default Panel;
