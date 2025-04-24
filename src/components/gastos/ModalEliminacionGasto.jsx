import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";

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
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="modal-warning-body">
          <div className="warning-icon">
            <FaExclamationTriangle />
          </div>

          {gastoAEliminar ? (
            <div className="warning-text">
              <p>
                Estás a punto de eliminar el gasto de tipo{" "}
                <strong>{gastoAEliminar.tipo_gasto}</strong> con monto{" "}
                <strong>C${gastoAEliminar.monto}</strong>.
              </p>
              <p>¿Estás seguro de continuar?</p>
            </div>
          ) : (
            <p>No se ha seleccionado un gasto.</p>
          )}
        </div>
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
