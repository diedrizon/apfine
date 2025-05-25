import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { serverTimestamp } from "firebase/firestore";
export default function ModalRegistroAvance({
  show,
  handleClose,
  handleGuardarAvance,
}) {
  const [av, setAv] = useState({
    cantidad_producida: "",
    horas_trabajadas: "",
    nota: "",
    fecha: new Date().toISOString().split("T")[0],
    creada_en: serverTimestamp(),
  });
  const ch = (e) => setAv({ ...av, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (!av.cantidad_producida) return;
    handleGuardarAvance(av);
    setAv({ ...av, cantidad_producida: "", horas_trabajadas: "", nota: "" });
  };
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Avance de producción</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submit}>
        <Modal.Body className="modal-body">
          <Form.Group>
            <Form.Label>Cantidad producida</Form.Label>
            <Form.Control
              type="number"
              name="cantidad_producida"
              value={av.cantidad_producida}
              onChange={ch}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Horas trabajadas</Form.Label>
            <Form.Control
              type="number"
              name="horas_trabajadas"
              value={av.horas_trabajadas}
              onChange={ch}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Fecha</Form.Label>
            <Form.Control
              type="date"
              name="fecha"
              value={av.fecha}
              onChange={ch}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Nota</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="nota"
              value={av.nota}
              onChange={ch}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
