import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function ModalRegistroAvance({
  show,
  close,
  orden,
  saveAvance,
}) {
  const [avance, setAvance] = useState({
    cantidad_real: orden?.cantidad_real || "",
    fecha_fin_real: orden?.fecha_fin_real?.split("T")?.[0] || "",
    horas_trabajadas: orden?.horas_trabajadas || "",
    costo_real: orden?.costo_real || "",
    estado: orden?.estado || "En proceso",
  });

  const change = (e) => {
    setAvance({ ...avance, [e.target.name]: e.target.value });
  };

  const validar = () => {
    if (!avance.cantidad_real || parseFloat(avance.cantidad_real) < 0)
      return false;
    if (!avance.fecha_fin_real) return false;
    return true;
  };

  const guardar = () => {
    if (!validar()) return;
    saveAvance(avance);
  };

  return (
    <Modal show={show} onHide={close} centered className="custom-modal">
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          guardar();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Registrar Avance de Producción</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Row className="modal-row-2col">
            <Col className="modal-group">
              <Form.Label>Cantidad real producida*</Form.Label>
              <Form.Control
                type="number"
                name="cantidad_real"
                value={avance.cantidad_real}
                onChange={change}
              />
            </Col>
            <Col className="modal-group">
              <Form.Label>Fecha fin real*</Form.Label>
              <Form.Control
                type="date"
                name="fecha_fin_real"
                value={avance.fecha_fin_real}
                onChange={change}
              />
            </Col>
          </Row>

          <Row className="modal-row-2col">
            <Col className="modal-group">
              <Form.Label>Horas trabajadas</Form.Label>
              <Form.Control
                type="number"
                name="horas_trabajadas"
                value={avance.horas_trabajadas}
                onChange={change}
              />
            </Col>
            <Col className="modal-group">
              <Form.Label>Costo real (C$)</Form.Label>
              <Form.Control
                type="number"
                name="costo_real"
                value={avance.costo_real}
                onChange={change}
              />
            </Col>
          </Row>

          <Form.Group className="modal-group">
            <Form.Label>Estado actual</Form.Label>
            <Form.Select name="estado" value={avance.estado} onChange={change}>
              <option>En proceso</option>
              <option>Finalizada</option>
              <option>Cancelada</option>
              <option>Pausada</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="modal-footer">
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar avance
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
