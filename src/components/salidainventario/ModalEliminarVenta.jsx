// src/components/salidainventario/ModalEliminarVenta.jsx
import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";

export default function ModalEliminarVenta({
  show,
  handleClose,
  venta,
  handleConfirmDelete,
}) {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Eliminar Venta</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-warning-body text-center">
        <FaExclamationTriangle className="warning-icon" />
        {venta ? (
          <p>
            ¿Eliminar la venta del <strong>{venta.fecha}</strong> para{" "}
            <strong>{venta.cliente}</strong> por C$
            <strong>{venta.total.toFixed(2)}</strong>?
            <br />
            Se eliminará el ingreso asociado y se devolverá stock.
          </p>
        ) : (
          <p>No hay venta seleccionada.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleConfirmDelete}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
);
}
