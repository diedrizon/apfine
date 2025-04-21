import React from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";

function ModalDetalleGastoFijo({ show, handleClose, gastoFijoDetalle }) {
  if (!gastoFijoDetalle) return null;

  const {
    nombre_gasto,
    monto_mensual,
    frecuencia,
    proximo_pago,
    recordatorio_activado
  } = gastoFijoDetalle;

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
        <Modal.Title>Detalle de Gasto Fijo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-2">
          <Col md={4}>Nombre:</Col>
          <Col md={8}>{nombre_gasto || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Monto mensual:</Col>
          <Col md={8}>C${monto_mensual || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Frecuencia:</Col>
          <Col md={8}>{frecuencia || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Próximo pago:</Col>
          <Col md={8}>{proximo_pago || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Recordatorio:</Col>
          <Col md={8}>{recordatorio_activado ? "Activado" : "Desactivado"}</Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalDetalleGastoFijo;
