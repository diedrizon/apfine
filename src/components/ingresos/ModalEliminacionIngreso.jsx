// src/components/ingresos/ModalEliminacionIngreso.jsx
import React from "react";
import { Modal, Button } from "react-bootstrap";

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
        {ingresoAEliminar ? (
          <p>
            ¿Estás seguro de eliminar el ingreso de tipo{" "}
            <strong>{ingresoAEliminar.tipo_ingreso}</strong> con monto{" "}
            <strong>C${ingresoAEliminar.monto}</strong>?
          </p>
        ) : (
          <p>No hay ingreso seleccionado.</p>
        )}
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
