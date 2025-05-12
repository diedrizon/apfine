import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function ModalEdicionInventario({
  show,
  handleClose,
  item,
  setItem,
  handleEdit,
  setMensaje,
  setShowModalMensaje,
}) {
  if (!item) return null;
  const ch = (e) => setItem({ ...item, [e.target.name]: e.target.value });
  const ok = () => {
    if (!item.nombre_producto.trim()) {
      setMensaje("Nombre requerido");
      setShowModalMensaje(true);
      return false;
    }
    if (!item.stock_actual) {
      setMensaje("Stock requerido");
      setShowModalMensaje(true);
      return false;
    }
    return true;
  };
  const submit = (e) => {
    e.preventDefault();
    if (ok()) handleEdit(item);
  };
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Producto</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submit}>
        <Modal.Body className="modal-body">
          <Form.Group>
            <Form.Label>Nombre*</Form.Label>
            <Form.Control
              name="nombre_producto"
              value={item.nombre_producto}
              onChange={ch}
            />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>SKU*</Form.Label>
                <Form.Control name="SKU" value={item.SKU} onChange={ch} />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Ubicación</Form.Label>
                <Form.Control
                  name="ubicacion"
                  value={item.ubicacion}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Stock actual*</Form.Label>
                <Form.Control
                  type="number"
                  name="stock_actual"
                  value={item.stock_actual}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Stock mínimo*</Form.Label>
                <Form.Control
                  type="number"
                  name="stock_minimo"
                  value={item.stock_minimo}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Costo unitario (C$)</Form.Label>
                <Form.Control
                  type="number"
                  name="costo_unitario"
                  value={item.costo_unitario}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Precio venta (C$)</Form.Label>
                <Form.Control
                  type="number"
                  name="precio_venta"
                  value={item.precio_venta}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
          </Row>
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
