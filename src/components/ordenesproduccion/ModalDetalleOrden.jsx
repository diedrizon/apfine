import React from "react";
import { Modal, Button } from "react-bootstrap";
import {
  FaClipboardList,
  FaCubes,
  FaCalendarAlt,
  FaUser,
  FaWeight,
  FaFlask,
  FaTasks,
  FaHistory
} from "react-icons/fa";

export default function ModalDetalleOrden({ show, close, data }) {
  if (!data) return null;

  const fmtFecha = (fecha) => {
    if (!fecha) return "—";
    const d = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return d.toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <Modal show={show} onHide={close} centered className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Orden de Producción</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">

        <div className="detalle-item">
          <span className="detalle-label"><FaClipboardList /> Producto:</span>
          <span className="detalle-value">{data.producto || "—"}</span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label"><FaTasks /> Proceso:</span>
          <span className="detalle-value">{data.proceso || "—"}</span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label"><FaUser /> Responsable:</span>
          <span className="detalle-value">{data.responsable || "—"}</span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label"><FaCubes /> Cantidad planeada:</span>
          <span className="detalle-value">{data.cantidad_planeada ?? "—"}</span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label"><FaCubes /> Cantidad real:</span>
          <span className="detalle-value">{data.cantidad_real ?? "—"}</span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label"><FaCalendarAlt /> Fecha de inicio:</span>
          <span className="detalle-value">{fmtFecha(data.fecha_inicio)}</span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label"><FaCalendarAlt /> Fin estimada:</span>
          <span className="detalle-value">{fmtFecha(data.fecha_fin_estimada)}</span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label"><FaCalendarAlt /> Fin real:</span>
          <span className="detalle-value">{fmtFecha(data.fecha_fin_real)}</span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label"><FaTasks /> Estado:</span>
          <span className="detalle-value">{data.estado || "—"}</span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label"><FaWeight /> Costo estimado (C$):</span>
          <span className="detalle-value">{data.costo_estimado ?? "—"}</span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label"><FaWeight /> Costo real (C$):</span>
          <span className="detalle-value">{data.costo_real ?? "—"}</span>
        </div>

        {data.es_reproceso && (
          <>
            <div className="detalle-item">
              <span className="detalle-label"><FaTasks /> Es reproceso:</span>
              <span className="detalle-value">Sí</span>
            </div>
            <div className="detalle-item">
              <span className="detalle-label"><FaCubes /> Cantidad reprocesada:</span>
              <span className="detalle-value">{data.cantidad_reprocesada ?? "—"}</span>
            </div>
            <div className="detalle-item">
              <span className="detalle-label"><FaTasks /> Motivo:</span>
              <span className="detalle-value">{data.motivo_reproceso || "—"}</span>
            </div>
          </>
        )}

        <div className="detalle-item">
          <span className="detalle-label"><FaFlask /> Insumos utilizados:</span>
        </div>

        {data.materias_primas?.length > 0 ? (
          <ul className="detalle-sublista">
            {data.materias_primas.map((m, i) => (
              <li key={i}>
                {m.nombre} – {m.cantidad_usada} unidades
              </li>
            ))}
          </ul>
        ) : (
          <p className="detalle-value">Sin insumos registrados.</p>
        )}

        <div className="detalle-item">
          <span className="detalle-label"><FaHistory /> Historial de avances:</span>
        </div>

        {data.avances && data.avances.length > 0 ? (
          <ul className="detalle-sublista">
            {data.avances.map((a, i) => (
              <li key={i}>
                {a.fecha?.toDate?.().toLocaleDateString("es-NI") || "Fecha desconocida"} –{" "}
                {a.cantidad ?? "—"} unidades – {a.estado || "—"}
                {a.horas ? ` – ${a.horas} h` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="detalle-value">Sin historial registrado.</p>
        )}

      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <Button variant="secondary" onClick={close}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
