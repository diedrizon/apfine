import React from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";

function ModalDetalleGasto({ show, handleClose, gastoDetalle }) {
  if (!gastoDetalle) return null;

  const {
    fecha_gasto,
    monto,
    tipo_gasto,
    categoria,
    proveedor,
    medio_pago,
    descripcion,
    comprobanteURL,
  } = gastoDetalle;

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
        <Modal.Title>Detalle del Gasto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-2">
          <Col md={4}>Fecha Gasto:</Col>
          <Col md={8}>{fecha_gasto || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Monto:</Col>
          <Col md={8}>{monto || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Tipo Gasto:</Col>
          <Col md={8}>{tipo_gasto || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Categoría:</Col>
          <Col md={8}>{categoria || "—"}</Col>
        </Row>
        <Row className="mb-2">
          <Col md={4}>Proveedor:</Col>
          <Col md={8}>{proveedor || "—"}</Col>
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
          <p>No se adjuntó comprobante.</p>
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

export default ModalDetalleGasto;
