// src/components/monitoreo/PanelErroresSistema.jsx
import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { BiErrorCircle } from "react-icons/bi";

export default function PanelErroresSistema() {
  const [totalErrores, setTotalErrores] = useState(0);
  const [ultimosErrores, setUltimosErrores] = useState([]);

  useEffect(() => {
    const erroresCol = collection(db, "logs_errores");
    const unsubCount = onSnapshot(erroresCol, (snap) => {
      setTotalErrores(snap.size);
    });
    const q = query(erroresCol, orderBy("timestamp", "desc"), limit(5));
    const unsubLast = onSnapshot(q, (snap) => {
      setUltimosErrores(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => {
      unsubCount();
      unsubLast();
    };
  }, []);

  return (
    <div className="monitoreo-panel">
      <div className="panel-titulo">
        <BiErrorCircle className="panel-icono" /> Errores del Sistema
      </div>
      <div className="panel-contenido">
        <p>
          <strong>Total de errores registrados:</strong> {totalErrores}
        </p>
        {ultimosErrores.length > 0 ? (
          <ul className="errores-lista">
            {ultimosErrores.map((err) => (
              <li key={err.id} className="error-item">
                {err.message}{" "}
                <em>(
                  {err.timestamp
                    ? new Date(err.timestamp.toDate()).toLocaleString()
                    : "Fecha desconocida"}
                )</em>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay errores registrados.</p>
        )}
      </div>
    </div>
  );
}
