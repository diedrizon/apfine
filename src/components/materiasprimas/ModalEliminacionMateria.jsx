import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";

export default function ModalEliminacionMateria({
  show,
  handleClose,
  materia,
  confirmarEliminacion,
}) {
  if (!materia) return null;

  return (
    <Modal show={show} onHide={handleClose} centered className="modal-mensaje">
      <Modal.Header closeButton />
      <Modal.Body className="modal-warning-body">
        <div className="icono-advertencia">
          <FaExclamationTriangle size={50} color="#dc3545" />
        </div>
        <p className="mensaje-eliminacion">
          ¿Estás seguro de que deseas eliminar el insumo{" "}
          <strong>{materia.nombre}</strong>?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={() => confirmarEliminacion(materia.id)}
        >
          Sí, eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
