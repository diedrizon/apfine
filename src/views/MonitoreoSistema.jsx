// src/views/MonitoreoSistema.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../database/authcontext";
import { db } from "../database/firebaseconfig";
import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import PanelUsoSistema from "../components/monitoreo/PanelUsoSistema";
import PanelErroresSistema from "../components/monitoreo/PanelErroresSistema";
import SubirReporteManual from "../components/monitoreo/SubirReporteManual";
import PanelConfiguracionSistema from "../components/monitoreo/PanelConfiguracionSistema";
import PanelGenerarReporteSistema from "../components/monitoreo/PanelGenerarReporteSistema";

import "../styles/MonitoreoSistema.css";

export default function MonitoreoSistema({ isSidebarOpen }) {
  const { user, perfil } = useAuth();
  const location = useLocation();

  const [ setMonitorEnabled] = useState(true);
  const [lastBenefUso, setLastBenefUso] = useState(null);

  // ON/OFF monitoreo
  useEffect(() => {
    const cfgRef = doc(db, "config", "system_settings");
    const unsub = onSnapshot(cfgRef, (snap) => {
      if (snap.exists()) setMonitorEnabled(snap.data().monitoringEnabled);
    });
    return () => unsub();
  }, [ setMonitorEnabled ]);

  // Suscripción al documento único con el último beneficiario
  useEffect(() => {
    const lastRef = doc(db, "monitor_config", "last_beneficiario");
    const unsub = onSnapshot(lastRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setLastBenefUso({ usuario: d.userEmail, ruta: d.lastRoute });
      }
    });
    return () => unsub();
  }, []);

  return (
    <div
      id="monitoreo-root"
      className={`monitoreo-container ${isSidebarOpen ? "sidebar-open" : ""}`}
    >
      <div className="monitoreo-header">
        <h2>Monitoreo y Configuración del Sistema</h2>

        {user && perfil?.rol === "Beneficiario" && (
          <>
            <p>
              Usuario actual: <strong>{user.email}</strong>
            </p>
            <p>
              Ruta actual: <strong>{location.pathname}</strong>
            </p>
          </>
        )}

        {perfil?.rol === "Administrador" && lastBenefUso && (
          <>
            <p>
              Usuario monitoreado: <strong>{lastBenefUso.usuario}</strong>
            </p>
            <p>
              Última ruta: <strong>{lastBenefUso.ruta}</strong>
            </p>
          </>
        )}
      </div>

      <div className="monitoreo-content">
        <div className="monitoreo-card">
          <PanelUsoSistema />
        </div>
        <div className="monitoreo-card">
          <PanelErroresSistema />
        </div>
        <div className="monitoreo-card">
          <SubirReporteManual />
        </div>
        <div className="monitoreo-card">
          <PanelConfiguracionSistema />
        </div>
        <div className="monitoreo-card">
          <PanelGenerarReporteSistema />
        </div>
      </div>
    </div>
  );
}
