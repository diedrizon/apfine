import React from "react";
import { Modal, Button } from "react-bootstrap";

function ModalEliminacionMeta({
  show,
  handleClose,
  metaAEliminar,
  handleDeleteMeta,
}) {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Eliminar Meta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {metaAEliminar ? (
          <p>
            ¿Eliminar la meta <strong>{metaAEliminar.nombre_meta}</strong>?
          </p>
        ) : (
          <p>No se seleccionó meta.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDeleteMeta}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEliminacionMeta;
