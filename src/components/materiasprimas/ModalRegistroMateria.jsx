import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

function ModalRegistroMateria({
  show,
  handleClose,
  materiaNueva,
  setMateriaNueva,
  handleAddMateria,
  setMensaje,
  setShowModalMensaje,
}) {
  // Evita errores si materiaNueva aún no está definido
  if (!materiaNueva) return null;

  const handleChange = (e) =>
    setMateriaNueva({ ...materiaNueva, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, stock_actual } = materiaNueva;

    // Validación mínima
    if (!nombre || !stock_actual) {
      setMensaje("Completa los campos obligatorios.");
      setShowModalMensaje(true);
      return;
    }

    handleAddMateria(materiaNueva);
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Registrar Insumo</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="modal-body">
          <Row className="modal-group">
            <Col>
              <Form.Label>Nombre*</Form.Label>
              <Form.Control
                name="nombre"
                value={materiaNueva.nombre || ""}
                onChange={handleChange}
                required
              />
            </Col>
            <Col sm={4}>
              <Form.Label>Unidad*</Form.Label>
              <Form.Control
                name="unidad_medida"
                value={materiaNueva.unidad_medida || ""}
                onChange={handleChange}
                placeholder="kg, lt, un"
                required
              />
            </Col>
          </Row>

          <Row className="modal-group">
            <Col>
              <Form.Label>Stock actual*</Form.Label>
              <Form.Control
                type="number"
                name="stock_actual"
                value={materiaNueva.stock_actual || ""}
                onChange={handleChange}
                required
              />
            </Col>
            <Col>
              <Form.Label>Stock mínimo*</Form.Label>
              <Form.Control
                type="number"
                name="stock_minimo"
                value={materiaNueva.stock_minimo || ""}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>

          <Row className="modal-group">
            <Col>
              <Form.Label>Costo unitario (C$)*</Form.Label>
              <Form.Control
                type="number"
                name="costo_unitario"
                value={materiaNueva.costo_unitario || ""}
                onChange={handleChange}
                required
              />
            </Col>
            <Col>
              <Form.Label>Proveedor</Form.Label>
              <Form.Control
                name="proveedor"
                value={materiaNueva.proveedor || ""}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Form.Group className="modal-group">
            <Form.Label>Última compra</Form.Label>
            <Form.Control
              type="date"
              name="ultima_compra"
              value={materiaNueva.ultima_compra || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="modal-footer">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalRegistroMateria;
