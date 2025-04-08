// src/components/gastos/ModalRegistroGasto.jsx
import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../database/firebaseconfig";

function ModalRegistroGasto({
  show,
  handleClose,
  gastoNuevo,
  setGastoNuevo,
  handleAddGasto,
  setMensaje,
  setShowModalMensaje,
  // Recibimos las categorías filtradas para Gastos
  categorias,
}) {
  // Estado para archivo
  const [fileComprobante, setFileComprobante] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setGastoNuevo((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFileComprobante(e.target.files[0]);
    }
  }

  // Validaciones
  function validar() {
    const hoy = new Date();
    const fecha = new Date(gastoNuevo.fecha_gasto);
    if (fecha > hoy) {
      setMensaje("La fecha no puede ser futura.");
      setShowModalMensaje(true);
      return false;
    }
    const montoNum = parseFloat(gastoNuevo.monto);
    if (isNaN(montoNum) || montoNum < 1 || montoNum > 1000000) {
      setMensaje("El monto debe estar entre 1 y 1,000,000.");
      setShowModalMensaje(true);
      return false;
    }
    if (!gastoNuevo.tipo_gasto) {
      setMensaje("Debes seleccionar el tipo de gasto.");
      setShowModalMensaje(true);
      return false;
    }
    if (!gastoNuevo.categoria) {
      setMensaje("Debes seleccionar la categoría.");
      setShowModalMensaje(true);
      return false;
    }
    if (gastoNuevo.proveedor && gastoNuevo.proveedor.length > 50) {
      setMensaje("El proveedor no debe exceder 50 caracteres.");
      setShowModalMensaje(true);
      return false;
    }
    if (gastoNuevo.descripcion && gastoNuevo.descripcion.length > 100) {
      setMensaje("La descripción no debe exceder 100 caracteres.");
      setShowModalMensaje(true);
      return false;
    }
    if (fileComprobante && fileComprobante.size > 5 * 1024 * 1024) {
      setMensaje("El archivo no debe superar los 5 MB.");
      setShowModalMensaje(true);
      return false;
    }
    return true;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    let urlArchivo = "";
    if (fileComprobante) {
      try {
        const ext = fileComprobante.name.split(".").pop();
        const fileName = `comprobante_${Date.now()}.${ext}`;
        const storageRef = ref(storage, `gastos/${fileName}`);
        await uploadBytes(storageRef, fileComprobante);
        urlArchivo = await getDownloadURL(storageRef);
      } catch (error) {
        console.error(error);
        setMensaje("Error al subir el comprobante.");
        setShowModalMensaje(true);
        return;
      }
    }

    handleAddGasto({ ...gastoNuevo, comprobanteURL: urlArchivo });
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Registrar Gasto</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={4}>Fecha Gasto *</Col>
            <Col md={8}>
              <Form.Control
                type="date"
                name="fecha_gasto"
                value={gastoNuevo.fecha_gasto}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>
  
          <Row className="mb-3">
            <Col md={4}>Monto *</Col>
            <Col md={8}>
              <Form.Control
                type="number"
                name="monto"
                value={gastoNuevo.monto}
                onChange={handleChange}
                placeholder=">=1 y <=1,000,000"
                required
              />
            </Col>
          </Row>
  
          <Row className="mb-3">
            <Col md={4}>Tipo de Gasto *</Col>
            <Col md={8}>
              <Form.Select
                name="tipo_gasto"
                value={gastoNuevo.tipo_gasto}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione</option>
                <option value="Personal">Personal</option>
                <option value="Operativo">Operativo</option>
              </Form.Select>
            </Col>
          </Row>
  
          <Row className="mb-3">
            <Col md={4}>Categoría *</Col>
            <Col md={8}>
              <Form.Select
                name="categoria"
                value={gastoNuevo.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
  
          <Row className="mb-3">
            <Col md={4}>Proveedor</Col>
            <Col md={8}>
              <Form.Control
                type="text"
                name="proveedor"
                value={gastoNuevo.proveedor}
                onChange={handleChange}
                placeholder="Máx 50 caracteres"
              />
            </Col>
          </Row>
  
          <Row className="mb-3">
            <Col md={4}>Medio de Pago</Col>
            <Col md={8}>
              <Form.Select
                name="medio_pago"
                value={gastoNuevo.medio_pago}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Otro">Otro</option>
              </Form.Select>
            </Col>
          </Row>
  
          <Row className="mb-3">
            <Col md={4}>Descripción</Col>
            <Col md={8}>
              <Form.Control
                type="text"
                name="descripcion"
                value={gastoNuevo.descripcion}
                onChange={handleChange}
                placeholder="Máx 100 caracteres"
              />
            </Col>
          </Row>
  
          <Row className="mb-3">
            <Col md={4}>Comprobante</Col>
            <Col md={8}>
              <Form.Control
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
              />
              <small>(Opcional, máx 5 MB)</small>
            </Col>
          </Row>
        </Modal.Body>
  
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Registrar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalRegistroGasto;
