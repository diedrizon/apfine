import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";
import "../styles/ModalConfirmacion.css";

function ModalConfirmacion({
  show,
  handleClose,
  titulo = "Confirmación",
  mensaje = "¿Estás seguro de realizar esta acción?",
  onConfirm,
  confirmText = "Sí, confirmar",
  cancelText = "Cancelar",
  confirmVariant = "danger",
}) {
  return (
    <Modal show={show} onHide={handleClose} centered className="modal-mensaje">
      <Modal.Header closeButton>
        <Modal.Title>{titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-warning-body">
        <FaExclamationTriangle className="warning-icon" />
        <p>{mensaje}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalConfirmacion;
