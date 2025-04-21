import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

function ModalEdicionMeta({
  show,
  handleClose,
  metaEditada,
  setMetaEditada,
  handleEditMeta,
  setMensaje,
  setShowModalMensaje,
}) {
  if (!metaEditada) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setMetaEditada((prev) => ({ ...prev, [name]: value }));
  }

  function validar() {
    const hoy = new Date();
    if (!metaEditada.nombre_meta.trim()) {
      setMensaje("Falta el nombre");
      setShowModalMensaje(true);
      return false;
    }
    if (!metaEditada.tipo) {
      setMensaje("Selecciona el tipo");
      setShowModalMensaje(true);
      return false;
    }
    const obj = parseFloat(metaEditada.monto_objetivo);
    if (isNaN(obj) || obj <= 0) {
      setMensaje("Monto objetivo inválido");
      setShowModalMensaje(true);
      return false;
    }
    if (!metaEditada.fecha_limite) {
      setMensaje("Fecha límite requerida");
      setShowModalMensaje(true);
      return false;
    }
    if (new Date(metaEditada.fecha_limite) < hoy) {
      setMensaje("La fecha límite no puede ser pasada");
      setShowModalMensaje(true);
      return false;
    }
    const actual = parseFloat(metaEditada.monto_actual);
    if (isNaN(actual) || actual < 0) {
      setMensaje("Monto actual inválido");
      setShowModalMensaje(true);
      return false;
    }
    return true;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    handleEditMeta(metaEditada);
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Meta</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          {/* Igual que registro + monto_actual */}
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="nombre_meta"
              value={metaEditada.nombre_meta}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo *</Form.Label>
            <Form.Select
              name="tipo"
              value={metaEditada.tipo}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              <option value="Ahorro">Ahorro</option>
              <option value="Inversión">Inversión</option>
              <option value="Reducción gasto">Reducción gasto</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Monto objetivo *</Form.Label>
            <Form.Control
              type="number"
              name="monto_objetivo"
              value={metaEditada.monto_objetivo}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Monto actual</Form.Label>
            <Form.Control
              type="number"
              name="monto_actual"
              value={metaEditada.monto_actual}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha límite *</Form.Label>
            <Form.Control
              type="date"
              name="fecha_limite"
              value={metaEditada.fecha_limite}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
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

export default ModalEdicionMeta;
