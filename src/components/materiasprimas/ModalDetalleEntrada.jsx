import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ModalDetalleEntrada({
  show,
  handleClose,
  entradaDetalle,
}) {
  if (!entradaDetalle) return null;

  const fechaHora = entradaDetalle.creada_en?.toDate
    ? entradaDetalle.creada_en.toDate().toLocaleString("es-NI", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : new Date(entradaDetalle.fecha).toLocaleString("es-NI", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Entrada</Modal.Title>
      </Modal.Header>
      <Modal.Body className="detalle-ingreso">
        <div className="detalle-item">
          <span className="detalle-label">Fecha y hora:</span>
          <span className="detalle-value">{fechaHora}</span>
        </div>
        <div className="detalle-item">
          <span className="detalle-label">Cantidad:</span>
          <span className="detalle-value">{entradaDetalle.cantidad}</span>
        </div>
        <div className="detalle-item">
          <span className="detalle-label">Proveedor:</span>
          <span className="detalle-value">
            {entradaDetalle.proveedor || "—"}
          </span>
        </div>
        <div className="detalle-item">
          <span className="detalle-label">Costo unitario:</span>
          <span className="detalle-value">{entradaDetalle.costo_unitario}</span>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
