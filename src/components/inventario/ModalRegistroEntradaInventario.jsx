import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function ModalRegistroEntradaInventario({
  show,
  handleClose,
  producto,
  handleGuardarEntrada
}) {
  const [entrada, setEntrada] = useState({
    cantidad: "",
    costo_unitario: "",
    precio_venta: "",
    fecha: new Date().toISOString().split("T")[0]
  });

  const change = (e) =>
    setEntrada({ ...entrada, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!entrada.cantidad || parseFloat(entrada.cantidad) <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }
    handleGuardarEntrada(entrada);
    setEntrada({
      cantidad: "",
      costo_unitario: "",
      precio_venta: "",
      fecha: new Date().toISOString().split("T")[0]
    });
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Nueva entrada para {producto?.nombre_producto}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submit}>
        <Modal.Body className="modal-body">
          <Form.Group className="mb-2">
            <Form.Label>Cantidad agregada</Form.Label>
            <Form.Control
              type="number"
              name="cantidad"
              value={entrada.cantidad}
              onChange={change}
              required
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Costo unitario (C$)</Form.Label>
            <Form.Control
              type="number"
              name="costo_unitario"
              value={entrada.costo_unitario}
              onChange={change}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Precio de venta (C$)</Form.Label>
            <Form.Control
              type="number"
              name="precio_venta"
              value={entrada.precio_venta}
              onChange={change}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Fecha de entrada</Form.Label>
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
          <Button type="submit" variant="primary">
            Guardar entrada
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
