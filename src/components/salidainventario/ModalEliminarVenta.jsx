import React, { useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";

export default function ModalEliminarVenta({
  show,
  handleClose,
  venta,
  handleConfirmDelete,
}) {
  const [loading, setLoading] = useState(false);

  const confirmar = async () => {
    if (!venta) return;
    try {
      setLoading(true);
      await handleConfirmDelete(); // hace el borrado en la vista
      handleClose(); // cierra modal cuando termina
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header
        closeButton
        className="bg-success-subtle border-success-subtle" /* mantiene tu tono verde */
      >
        <Modal.Title>Eliminar Venta</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <FaExclamationTriangle
          color="#dc3545"
          size={56}
          style={{ marginBottom: 20 }}
        />
        {venta ? (
          <p>
            ¿Eliminar la venta del <strong>{venta.fecha}</strong> para{" "}
            <strong>{venta.cliente}</strong> por C$
            <strong>{Number(venta.total).toFixed(2)}</strong>?<br />
            Se eliminará el ingreso asociado y se devolverá stock.
          </p>
        ) : (
          <p>No se ha seleccionado ninguna venta.</p>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-success-subtle border-success-subtle">
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={confirmar} disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" /> Eliminando…
            </>
          ) : (
            "Eliminar"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
