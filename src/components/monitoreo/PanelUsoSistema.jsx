import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { BiBarChart } from "react-icons/bi";

export default function PanelUsoSistema() {
  const [totalUsos, setTotalUsos] = useState(0);
  const [ultimoUso, setUltimoUso] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "logs_uso"),
      where("role", "==", "Beneficiario")
    );

    const unsub = onSnapshot(q, (snap) => {
      let suma = 0;
      let last = null;

      snap.docs.forEach((doc) => {
        const d = doc.data();
        suma += d.totalRoutes || 0;
        if (d.lastTimestamp) {
          const fecha = d.lastTimestamp.toDate();
          if (!last || fecha > last.fecha) {
            last = {
              fecha,
              ruta: d.lastRoute,
              usuario: d.userEmail,
            };
          }
        }
      });

      setTotalUsos(suma);
      setUltimoUso(last);
    });

    return () => unsub();
  }, []);

  return (
    <div className="monitoreo-panel">
      <div className="panel-titulo">
        <BiBarChart className="panel-icono" /> Uso del Sistema
      </div>
      <div className="panel-contenido">
        <p>
          <strong>Total de rutas registradas:</strong> {totalUsos}
        </p>
        {ultimoUso ? (
          <>
            <p>
              <strong>Fecha:</strong> {ultimoUso.fecha.toLocaleString()}
            </p>
            <p>
              <strong>Usuario:</strong> {ultimoUso.usuario}
            </p>
            <p>
              <strong>Ruta:</strong> {ultimoUso.ruta}
            </p>
          </>
        ) : (
          <p>No hay rutas registradas.</p>
        )}
      </div>
    </div>
  );
}
