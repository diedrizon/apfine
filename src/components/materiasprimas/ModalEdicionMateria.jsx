import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

function ModalEdicionMateria({
  show,
  handleClose,
  materiaEditada,
  setMateriaEditada,
  handleEditMateria,
  setMensaje,
  setShowModalMensaje,
}) {
  const handleChange = (e) =>
    setMateriaEditada({ ...materiaEditada, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!materiaEditada.nombre || !materiaEditada.stock_actual) {
      setMensaje("Completa los campos obligatorios.");
      setShowModalMensaje(true);
      return;
    }
    handleEditMateria(materiaEditada);
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Editar Insumo</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="modal-body">
          <Row className="modal-group">
            <Col>
              <Form.Label>Nombre*</Form.Label>
              <Form.Control
                name="nombre"
                value={materiaEditada.nombre}
                onChange={handleChange}
                required
              />
            </Col>
            <Col sm={4}>
              <Form.Label>Unidad*</Form.Label>
              <Form.Control
                name="unidad_medida"
                value={materiaEditada.unidad_medida}
                onChange={handleChange}
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
                value={materiaEditada.stock_actual}
                onChange={handleChange}
                required
              />
            </Col>
            <Col>
              <Form.Label>Stock mínimo*</Form.Label>
              <Form.Control
                type="number"
                name="stock_minimo"
                value={materiaEditada.stock_minimo}
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
                value={materiaEditada.costo_unitario}
                onChange={handleChange}
                required
              />
            </Col>
            <Col>
              <Form.Label>Proveedor</Form.Label>
              <Form.Control
                name="proveedor"
                value={materiaEditada.proveedor}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Form.Group className="modal-group">
            <Form.Label>Última compra</Form.Label>
            <Form.Control
              type="date"
              name="ultima_compra"
              value={materiaEditada.ultima_compra}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar cambios
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalEdicionMateria;
