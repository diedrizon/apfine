import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";

function ModalEliminacionUsuario({
  show,
  handleClose,
  usuarioAEliminar,
  handleDeleteUsuario,
}) {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="modal-mensaje"
    >
      <Modal.Header closeButton>
        <Modal.Title>Eliminar Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-warning-body">
        <FaExclamationTriangle className="warning-icon" />
        <p>
          ¿Estás seguro de eliminar al usuario{" "}
          <strong>{usuarioAEliminar?.nombre}</strong>?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDeleteUsuario}>
          Sí, eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEliminacionUsuario;
