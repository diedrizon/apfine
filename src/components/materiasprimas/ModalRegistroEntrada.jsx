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

  const change = (e) => {
    const { name, value } = e.target;
    setEntrada((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!entrada.cantidad || parseFloat(entrada.cantidad) <= 0) {
      alert("Cantidad inválida.");
      return false;
    }
    if (!entrada.costo_unitario || parseFloat(entrada.costo_unitario) <= 0) {
      alert("Costo unitario inválido.");
      return false;
    }
    if (!entrada.fecha) {
      alert("Fecha requerida.");
      return false;
    }
    return true;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validar()) return;
    handleGuardarEntrada(entrada);
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Entrada de {materia?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Row className="modal-row-2col">
            <Col className="modal-group">
              <Form.Label>Cantidad*</Form.Label>
              <Form.Control
                type="number"
                name="cantidad"
                value={entrada.cantidad}
                onChange={change}
                required
              />
            </Col>
            <Col className="modal-group">
              <Form.Label>Proveedor</Form.Label>
              <Form.Control
                name="proveedor"
                value={entrada.proveedor}
                onChange={change}
                placeholder="Opcional"
              />
            </Col>
          </Row>

          <Row className="modal-row-2col">
            <Col className="modal-group">
              <Form.Label>Costo unitario (C$)*</Form.Label>
              <Form.Control
                type="number"
                name="costo_unitario"
                value={entrada.costo_unitario}
                onChange={change}
                required
              />
            </Col>
            <Col className="modal-group">
              <Form.Label>Fecha*</Form.Label>
              <Form.Control
                type="date"
                name="fecha"
                value={entrada.fecha}
                onChange={change}
                required
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar entrada
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
