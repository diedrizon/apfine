import React from "react";
import { Modal, Button } from "react-bootstrap";

function ModalEliminacionGasto({
  show,
  handleClose,
  gastoAEliminar,
  handleDeleteGasto,
}) {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Eliminar Gasto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {gastoAEliminar ? (
          <p>
            ¿Seguro que deseas eliminar el gasto de tipo{" "}
            <strong>{gastoAEliminar.tipo_gasto}</strong> con monto{" "}
            <strong>C${gastoAEliminar.monto}</strong>?
          </p>
        ) : (
          <p>No se ha seleccionado gasto.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDeleteGasto}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEliminacionGasto;
