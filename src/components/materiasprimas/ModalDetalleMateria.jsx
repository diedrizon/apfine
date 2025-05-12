import React from "react";
import { Modal, Button } from "react-bootstrap";

function ModalDetalleMateria({ show, handleClose, materiaDetalle }) {
  if (!materiaDetalle) return null;

  const fecha =
    materiaDetalle.ultima_compra &&
    new Date(materiaDetalle.ultima_compra).toLocaleDateString("es-NI");

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Insumo</Modal.Title>
      </Modal.Header>
      <Modal.Body className="detalle-ingreso">
        <div className="detalle-item">
          <span className="detalle-label">Nombre</span>
          <span className="detalle-value">{materiaDetalle.nombre}</span>
        </div>
        <div className="detalle-item">
          <span className="detalle-label">Unidad</span>
          <span className="detalle-value">{materiaDetalle.unidad_medida}</span>
        </div>
        <div className="detalle-item">
          <span className="detalle-label">Stock actual</span>
          <span className="detalle-value">{materiaDetalle.stock_actual}</span>
        </div>
        <div className="detalle-item">
          <span className="detalle-label">Stock mínimo</span>
          <span className="detalle-value">{materiaDetalle.stock_minimo}</span>
        </div>
        <div className="detalle-item">
          <span className="detalle-label">Costo unitario (C$)</span>
          <span className="detalle-value">{materiaDetalle.costo_unitario}</span>
        </div>
        <div className="detalle-item">
          <span className="detalle-label">Proveedor</span>
          <span className="detalle-value">{materiaDetalle.proveedor}</span>
        </div>
        <div className="detalle-item">
          <span className="detalle-label">Última compra</span>
          <span className="detalle-value">{fecha}</span>
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

export default ModalDetalleMateria;
