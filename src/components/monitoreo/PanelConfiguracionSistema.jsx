// src/components/monitoreo/PanelConfiguracionSistema.jsx
import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { BiCog } from "react-icons/bi";

export default function PanelConfiguracionSistema() {
  const [config, setConfig] = useState({ monitoringEnabled: true });
  const [loading, setLoading] = useState(true);
  const cfgRef = doc(db, "config", "system_settings");

  useEffect(() => {
    (async () => {
      const snap = await getDoc(cfgRef);
      if (snap.exists()) setConfig(snap.data());
      setLoading(false);
    })();
  }, []);

  const toggleMonitoring = async () => {
    const next = { ...config, monitoringEnabled: !config.monitoringEnabled };
    setConfig(next);
    await setDoc(cfgRef, next, { merge: true });
  };

  if (loading) return null;
  return (
    <div className="monitoreo-panel">
      <div className="panel-titulo">
        <BiCog className="panel-icono" /> Configuración del Sistema
      </div>
      <div className="panel-contenido">
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={config.monitoringEnabled}
            onChange={toggleMonitoring}
          />
          Habilitar Monitoreo
        </label>
        <p style={{ fontSize: "0.85rem", marginTop: 4 }}>
          {config.monitoringEnabled
            ? "El sistema registrará rutas automáticamente."
            : "El sistema NO registrará nuevas rutas."}
        </p>
      </div>
    </div>
  );
}
