import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

function ModalRegistroMeta({
  show,
  handleClose,
  metaNueva,
  setMetaNueva,
  handleAddMeta,
  setMensaje,
  setShowModalMensaje,
}) {
  function handleChange(e) {
    const { name, value } = e.target;
    setMetaNueva((prev) => ({ ...prev, [name]: value }));
  }

  function validar() {
    const hoy = new Date();
    if (!metaNueva.nombre_meta.trim()) {
      setMensaje("Falta el nombre de la meta");
      setShowModalMensaje(true);
      return false;
    }
    if (!metaNueva.tipo) {
      setMensaje("Selecciona el tipo");
      setShowModalMensaje(true);
      return false;
    }
    const obj = parseFloat(metaNueva.monto_objetivo);
    if (isNaN(obj) || obj <= 0) {
      setMensaje("Monto objetivo inválido");
      setShowModalMensaje(true);
      return false;
    }
    if (!metaNueva.fecha_limite) {
      setMensaje("Fecha límite requerida");
      setShowModalMensaje(true);
      return false;
    }
    if (new Date(metaNueva.fecha_limite) < hoy) {
      setMensaje("La fecha límite no puede ser pasada");
      setShowModalMensaje(true);
      return false;
    }
    return true;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    handleAddMeta({ ...metaNueva, monto_actual: 0 });
    limpiarCampos();
  }

  function limpiarCampos() {
    setMetaNueva({
      nombre_meta: "",
      tipo: "",
      monto_objetivo: "",
      fecha_limite: "",
    });
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
        <Modal.Title>Registrar Meta</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="nombre_meta"
              value={metaNueva.nombre_meta}
              onChange={handleChange}
              placeholder="Ej. Fondo vacaciones"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo *</Form.Label>
            <Form.Select
              name="tipo"
              value={metaNueva.tipo}
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
              value={metaNueva.monto_objetivo}
              onChange={handleChange}
              placeholder=">= 0"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha límite *</Form.Label>
            <Form.Control
              type="date"
              name="fecha_limite"
              value={metaNueva.fecha_limite}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Crear
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalRegistroMeta;
