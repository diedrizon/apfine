import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const unidades = [
  "Kilogramo",
  "Libra",
  "Litro",
  "Unidad",
  "Metro",
  "Mililitro",
  "Gramo",
];

export default function ModalRegistroMateria({
  show,
  handleClose,
  materiaNueva,
  setMateriaNueva,
  handleAddMateria,
  setMensaje,
  setShowModalMensaje,
  materiasExistentes,
}) {
  if (!materiaNueva) return null;

  const change = (e) =>
    setMateriaNueva({ ...materiaNueva, [e.target.name]: e.target.value });

  const validar = () => {
    const {
      nombre,
      unidad_medida,
      stock_actual,
      stock_minimo,
      costo_unitario,
    } = materiaNueva;
    if (!nombre.trim()) {
      setMensaje("El nombre es obligatorio.");
      setShowModalMensaje(true);
      return false;
    }
    if (!unidad_medida) {
      setMensaje("Selecciona una unidad.");
      setShowModalMensaje(true);
      return false;
    }
    if (!stock_actual || stock_actual <= 0) {
      setMensaje("Stock inválido.");
      setShowModalMensaje(true);
      return false;
    }
    if (!stock_minimo || stock_minimo < 0) {
      setMensaje("Stock mínimo inválido.");
      setShowModalMensaje(true);
      return false;
    }
    if (!costo_unitario || costo_unitario <= 0) {
      setMensaje("Costo inválido.");
      setShowModalMensaje(true);
      return false;
    }
    return true;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validar()) return;
    const existe = materiasExistentes.find(
      (m) =>
        m.nombre.toLowerCase().trim() ===
        materiaNueva.nombre.toLowerCase().trim()
    );
    if (existe) {
      const actualizado = {
        ...existe,
        stock_actual:
          parseFloat(existe.stock_actual) +
          parseFloat(materiaNueva.stock_actual),
        ultima_compra:
          materiaNueva.ultima_compra || new Date().toISOString().split("T")[0],
        costo_unitario: materiaNueva.costo_unitario,
        proveedor: materiaNueva.proveedor,
      };
      handleAddMateria(actualizado, true);
    } else {
      handleAddMateria(materiaNueva, false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Registrar Insumo</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submit}>
        <Modal.Body className="modal-body">
          <div className="modal-group">
            <Form.Label>Nombre*</Form.Label>
            <Form.Control
              name="nombre"
              value={materiaNueva.nombre || ""}
              onChange={change}
              required
            />
          </div>

          <Row className="modal-group">
            <Col>
              <Form.Label>Unidad*</Form.Label>
              <Form.Select
                name="unidad_medida"
                value={materiaNueva.unidad_medida || ""}
                onChange={change}
                required
              >
                <option value="">Selecciona unidad</option>
                {unidades.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <div className="modal-row-2col">
            <div className="modal-group">
              <Form.Label>Stock a agregar*</Form.Label>
              <Form.Control
                type="number"
                name="stock_actual"
                value={materiaNueva.stock_actual || ""}
                onChange={change}
              />
            </div>
            <div className="modal-group">
              <Form.Label>Stock mínimo*</Form.Label>
              <Form.Control
                type="number"
                name="stock_minimo"
                value={materiaNueva.stock_minimo || ""}
                onChange={change}
              />
            </div>
          </div>

          <div className="modal-group">
            <Form.Label>Costo unitario (C$)*</Form.Label>
            <Form.Control
              type="number"
              name="costo_unitario"
              value={materiaNueva.costo_unitario || ""}
              onChange={change}
            />
          </div>

          <div className="modal-group">
            <Form.Label>Proveedor</Form.Label>
            <Form.Control
              name="proveedor"
              value={materiaNueva.proveedor || ""}
              onChange={change}
            />
          </div>

          <div className="modal-group">
            <Form.Label>Fecha de última compra</Form.Label>
            <Form.Control
              type="date"
              name="ultima_compra"
              value={materiaNueva.ultima_compra || ""}
              onChange={change}
            />
          </div>
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
