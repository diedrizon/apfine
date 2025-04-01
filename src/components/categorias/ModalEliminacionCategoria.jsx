import React from "react";
import { Modal, Button } from "react-bootstrap";

function ModalEliminacionCategoria({ show, handleClose, handleDeleteCategoria }) {
  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} centered dialogClassName="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Eliminar Categoría</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro de que deseas eliminar esta categoría?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
        <Button variant="danger" onClick={handleDeleteCategoria}>Eliminar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEliminacionCategoria;
