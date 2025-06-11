import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

function ModalRegistroGastoFijo({
  show,
  handleClose,
  gastoFijoNuevo,
  setGastoFijoNuevo,
  handleAddGastoFijo,
  setMensaje,
  setShowModalMensaje
}) {
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setGastoFijoNuevo(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function validar() {
    const hoy = new Date();
    if (!gastoFijoNuevo.nombre_gasto.trim()) {
      setMensaje("Falta el nombre del gasto fijo");
      setShowModalMensaje(true);
      return false;
    }
    const monto = parseFloat(gastoFijoNuevo.monto_mensual);
    if (isNaN(monto) || monto <= 0) {
      setMensaje("Monto mensual inválido");
      setShowModalMensaje(true);
      return false;
    }
    if (!gastoFijoNuevo.frecuencia) {
      setMensaje("Selecciona la frecuencia");
      setShowModalMensaje(true);
      return false;
    }
    if (!gastoFijoNuevo.proximo_pago) {
      setMensaje("Indica la fecha del próximo pago");
      setShowModalMensaje(true);
      return false;
    }
    if (new Date(gastoFijoNuevo.proximo_pago) < hoy) {
      setMensaje("La fecha de próximo pago no puede ser pasada");
      setShowModalMensaje(true);
      return false;
    }
    return true;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    handleAddGastoFijo(gastoFijoNuevo);
    limpiarCampos();
  }

  function limpiarCampos() {
    setGastoFijoNuevo({
      nombre_gasto: "",
      monto_mensual: "",
      frecuencia: "",
      proximo_pago: "",
      recordatorio_activado: false
    });
  }

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" dialogClassName="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Registrar Gasto Fijo</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="nombre_gasto"
              value={gastoFijoNuevo.nombre_gasto}
              onChange={handleChange}
              placeholder="Ej. Alquiler"
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Monto mensual *</Form.Label>
                <Form.Control
                  type="number"
                  name="monto_mensual"
                  value={gastoFijoNuevo.monto_mensual}
                  onChange={handleChange}
                  placeholder=">= 0"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Frecuencia *</Form.Label>
                <Form.Select
                  name="frecuencia"
                  value={gastoFijoNuevo.frecuencia}
                  onChange={handleChange}
                >
                  <option value="">Seleccione</option>
                  <option value="Mensual">Mensual</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Semestral">Semestral</option>
                  <option value="Anual">Anual</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Próximo pago *</Form.Label>
            <Form.Control
              type="date"
              name="proximo_pago"
              value={gastoFijoNuevo.proximo_pago}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              label="Recordatorio activado"
              name="recordatorio_activado"
              checked={gastoFijoNuevo.recordatorio_activado}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" type="submit">Crear</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalRegistroGastoFijo;
