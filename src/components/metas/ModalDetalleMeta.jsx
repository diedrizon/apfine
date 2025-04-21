import React from "react";
import { Modal, Button, Row, Col, Badge } from "react-bootstrap";

function ModalDetalleMeta({ show, handleClose, metaDetalle }) {
  if (!metaDetalle) return null;

  const { nombre_meta, tipo, monto_objetivo, fecha_limite, monto_actual } =
    metaDetalle;

  // calcular estado
  const ahora = new Date().toISOString().slice(0, 10);
  let estado = "Activa";
  if (monto_actual >= monto_objetivo) estado = "Cumplida";
  else if (ahora > fecha_limite) estado = "Vencida";

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Meta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-2">
          <Col md={4}>Nombre:</Col>
          <Col md={8}>{nombre_meta}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Tipo:</Col>
          <Col md={8}>{tipo}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Objetivo:</Col>
          <Col md={8}>C${monto_objetivo}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Actual:</Col>
          <Col md={8}>C${monto_actual}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Límite:</Col>
          <Col md={8}>{fecha_limite}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Estado:</Col>
          <Col md={8}>
            <Badge
              bg={
                estado === "Cumplida"
                  ? "success"
                  : estado === "Vencida"
                  ? "danger"
                  : "primary"
              }
            >
              {estado}
            </Badge>
          </Col>
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

export default ModalDetalleMeta;
