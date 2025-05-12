import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ModalDetalleEntradaInventario({ show, handleClose, entrada }) {
  if (!entrada) return null;

  const formatDateTime = (ts, fallback) => {
    let d = ts?.toDate ? ts.toDate() : new Date(fallback || ts);
    return d.toLocaleString("es-NI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Entrada</Modal.Title>
      </Modal.Header>
      <Modal.Body className="detalle-ingreso">
        <div className="detalle-item">
          <span className="detalle-label">Fecha y hora:</span>
          <span className="detalle-value">
            {formatDateTime(entrada.creada_en, entrada.fecha)}
          </span>
        </div>
        <div className="detalle-item">
          <span className="detalle-label">Cantidad:</span>
          <span className="detalle-value">{entrada.cantidad}</span>
        </div>
        <div className="detalle-item">
          <span className="detalle-label">Costo unitario (C$):</span>
          <span className="detalle-value">
            {entrada.costo_unitario ? `C$ ${entrada.costo_unitario}` : "—"}
          </span>
        </div>
        <div className="detalle-item">
          <span className="detalle-label">Precio de venta (C$):</span>
          <span className="detalle-value">
            {entrada.precio_venta ? `C$ ${entrada.precio_venta}` : "—"}
          </span>
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
