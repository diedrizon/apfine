// src/components/salidainventario/ModalHistorialVenta.jsx
import React, { useState } from "react";
import { Modal, Button, Row, Col, Form, Card } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";

export default function ModalHistorialVenta({
  show,
  handleClose,
  ventas,
  onFilter,
  onDelete,
}) {
  const [fechaIni, setFechaIni] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const filtrar = () => {
    onFilter(fechaIni, fechaFin);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="md" // Cambia el tamaño del modal a "md" (mediano)
      centered
      dialogClassName="historial-modal" // Clase personalizada
    >
      <Modal.Header closeButton>
        <Modal.Title>Historial de Ventas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3 gx-3">
          <Col md={5}>
            <Form.Group>
              <Form.Label>Desde</Form.Label>
              <Form.Control
                type="date"
                value={fechaIni}
                onChange={(e) => setFechaIni(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group>
              <Form.Label>Hasta</Form.Label>
              <Form.Control
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2} className="d-grid align-self-end">
            <Button onClick={filtrar}>Filtrar</Button>
          </Col>
        </Row>

        {ventas.length === 0 ? (
          <p>No hay ventas en ese rango.</p>
        ) : (
          ventas.map((v) => (
            <Card key={v.id} className="sv-historial-card mb-2">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{v.fecha}</strong> – {v.cliente}
                  <div>Total: C${v.total.toFixed(2)}</div>
                </div>
                <div className="sv-historial-actions">
                  <Button
                    variant="link"
                    onClick={() => onDelete(v)}
                    title="Eliminar venta"
                  >
                    <FaIcons.FaTrash />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
