import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";

export default function ModalEliminacionOrden({
  show,
  handleClose,
  orden,
  handleDelete,
}) {
  if (!orden) return null;
  return (
    <Modal show={show} onHide={handleClose} centered className="modal-mensaje">
      <Modal.Header closeButton>
        <Modal.Title>Eliminar Orden</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-warning-body">
        <FaExclamationTriangle className="warning-icon" />
        {/* Mostrar el nombre del producto en lugar del ID */}
        <p>¿Eliminar la orden del producto "{orden.producto}"?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
