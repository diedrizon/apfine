import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";

function ModalEliminacionIngreso({
  show,
  handleClose,
  ingresoAEliminar,
  handleDeleteIngreso,
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
        <Modal.Title>Eliminar Ingreso</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="modal-warning-body">
          <FaExclamationTriangle className="warning-icon" />
          <div className="warning-text">
            {ingresoAEliminar ? (
              <p>
                ¿Estás seguro de que deseas eliminar el ingreso del tipo{" "}
                <strong>{ingresoAEliminar.tipo_ingreso}</strong> con monto{" "}
                <strong>C${ingresoAEliminar.monto}</strong>?
              </p>
            ) : (
              <p>No se ha seleccionado ingreso.</p>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDeleteIngreso}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEliminacionIngreso;
