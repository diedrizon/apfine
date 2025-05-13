import React from "react";
import { Modal, Button } from "react-bootstrap";
import {
  FaCube,
  FaUser,
  FaMoneyBillAlt,
  FaCalendarAlt,
  FaTruck,
} from "react-icons/fa";

export default function ModalDetalleEntrada({
  show,
  handleClose,
  entradaDetalle,
}) {
  if (!entradaDetalle) return null;

  const formatDateTime = (ts, fallback) => {
    let dateObj;
    if (ts?.toDate) {
      dateObj = ts.toDate();
    } else {
      dateObj = new Date(fallback || ts);
    }
    return dateObj.toLocaleString("es-NI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Entrada</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <div className="detalle-item">
          <span className="detalle-label">
            <FaCube className="me-2" />
            Cantidad ingresada:
          </span>
          <span className="detalle-value">
            {entradaDetalle.cantidad ?? "—"}
          </span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label">
            <FaTruck className="me-2" />
            Proveedor:
          </span>
          <span className="detalle-value">
            {entradaDetalle.proveedor || "—"}
          </span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label">
            <FaMoneyBillAlt className="me-2" />
            Costo unitario (C$):
          </span>
          <span className="detalle-value">
            {entradaDetalle.costo_unitario ?? "—"}
          </span>
        </div>

        <div className="detalle-item">
          <span className="detalle-label">
            <FaCalendarAlt className="me-2" />
            Fecha de ingreso:
          </span>
          <span className="detalle-value">
            {formatDateTime(entradaDetalle.creada_en, entradaDetalle.fecha)}
          </span>
        </div>

        {entradaDetalle.usuario_id && (
          <div className="detalle-item">
            <span className="detalle-label">
              <FaUser className="me-2" />
              Usuario ID:
            </span>
            <span className="detalle-value">{entradaDetalle.usuario_id}</span>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
