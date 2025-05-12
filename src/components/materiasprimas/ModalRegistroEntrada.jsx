import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function ModalRegistroEntrada({
  show,
  handleClose,
  materia,
  handleGuardarEntrada,
}) {
  const [entrada, setEntrada] = useState({
    cantidad: "",
    proveedor: "",
    costo_unitario: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  const change = (e) =>
    setEntrada({ ...entrada, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (
      !entrada.cantidad ||
      !entrada.costo_unitario ||
      parseFloat(entrada.cantidad) <= 0 ||
      parseFloat(entrada.costo_unitario) <= 0
    ) {
      alert("Cantidad y costo deben ser mayores a cero.");
      return;
    }
    handleGuardarEntrada(entrada);
    setEntrada({
      cantidad: "",
      proveedor: "",
      costo_unitario: "",
      fecha: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Nueva entrada para {materia?.nombre}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submit}>
        <Modal.Body className="modal-body">
          <Row className="modal-group">
            <Col>
              <Form.Label>Cantidad agregada</Form.Label>
              <Form.Control
                type="number"
                name="cantidad"
                value={entrada.cantidad}
                onChange={change}
                required
              />
            </Col>
            <Col>
              <Form.Label>Unidad</Form.Label>
              <Form.Control value={materia?.unidad_medida} disabled readOnly />
            </Col>
          </Row>
          <Row className="modal-group">
            <Col>
              <Form.Label>Costo unitario (C$)</Form.Label>
              <Form.Control
                type="number"
                name="costo_unitario"
                value={entrada.costo_unitario}
                onChange={change}
                required
              />
            </Col>
            <Col>
              <Form.Label>Proveedor</Form.Label>
              <Form.Control
                name="proveedor"
                value={entrada.proveedor}
                onChange={change}
              />
            </Col>
          </Row>
          <Form.Group className="modal-group">
            <Form.Label>Fecha de compra</Form.Label>
            <Form.Control
              type="date"
              name="fecha"
              value={entrada.fecha}
              onChange={change}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar entrada
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
