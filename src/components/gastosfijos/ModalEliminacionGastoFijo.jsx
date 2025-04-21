import React from "react";
import { Modal, Button } from "react-bootstrap";

function ModalEliminacionGastoFijo({
  show,
  handleClose,
  gastoFijoAEliminar,
  handleDeleteGastoFijo
}) {
  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" dialogClassName="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Eliminar Gasto Fijo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {gastoFijoAEliminar ? (
          <p>
            ¿Eliminar gasto fijo <strong>{gastoFijoAEliminar.nombre_gasto}</strong> con monto <strong>C${gastoFijoAEliminar.monto_mensual}</strong>?
          </p>
        ) : (
          <p>No se seleccionó gasto fijo.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
        <Button variant="danger" onClick={handleDeleteGastoFijo}>Eliminar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEliminacionGastoFijo;
