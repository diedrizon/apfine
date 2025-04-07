// src/components/ingresos/ModalDetalleIngreso.jsx
import React from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";

function ModalDetalleIngreso({ show, handleClose, ingresoDetalle }) {
  if (!ingresoDetalle) return null;

  const {
    fecha_ingreso,
    monto,
    tipo_ingreso,
    categoria,
    fuente,
    medio_pago,
    descripcion,
    comprobanteURL,
  } = ingresoDetalle;

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
        <Modal.Title>Detalle del Ingreso</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-2">
          <Col md={4}>Fecha Ingreso:</Col>
          <Col md={8}>{fecha_ingreso || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Monto:</Col>
          <Col md={8}>{monto || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Tipo Ingreso:</Col>
          <Col md={8}>{tipo_ingreso || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Categoría:</Col>
          <Col md={8}>{categoria || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Fuente:</Col>
          <Col md={8}>{fuente || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Medio de Pago:</Col>
          <Col md={8}>{medio_pago || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Descripción:</Col>
          <Col md={8}>{descripcion || "—"}</Col>
        </Row>

        <hr />
        {comprobanteURL ? (
          <>
            <p>Comprobante:</p>
            <a href={comprobanteURL} target="_blank" rel="noreferrer">
              Ver comprobante
            </a>
          </>
        ) : (
          <p>No hay comprobante adjunto.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalDetalleIngreso;
