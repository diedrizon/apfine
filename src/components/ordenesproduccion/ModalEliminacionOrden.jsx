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
        <p>¿Eliminar la orden #{orden.id?.slice(-6)}?</p>
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
