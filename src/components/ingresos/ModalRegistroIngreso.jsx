// src/components/ingresos/ModalRegistroIngreso.jsx
import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../database/firebaseconfig";

function ModalRegistroIngreso({
  show,
  handleClose,
  ingresoNuevo,
  setIngresoNuevo,
  handleAddIngreso,
  setMensaje,
  setShowModalMensaje,
}) {
  // Estado local para el archivo
  const [fileComprobante, setFileComprobante] = useState(null);

  // Manejar cambios en inputs
  function handleChange(e) {
    const { name, value } = e.target;
    setIngresoNuevo((prev) => ({ ...prev, [name]: value }));
  }

  // Manejar archivo
  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFileComprobante(e.target.files[0]);
    }
  }

  // Validar formulario
  function validar() {
    // 1) fecha_ingreso no futura
    const hoy = new Date();
    const fecha = new Date(ingresoNuevo.fecha_ingreso);
    if (fecha > hoy) {
      setMensaje("La fecha no puede ser futura.");
      setShowModalMensaje(true);
      return false;
    }
    // 2) monto
    const montoNum = parseFloat(ingresoNuevo.monto);
    if (isNaN(montoNum) || montoNum < 1 || montoNum > 1000000) {
      setMensaje("El monto debe estar entre 1 y 1,000,000.");
      setShowModalMensaje(true);
      return false;
    }
    // 3) tipo_ingreso
    if (!ingresoNuevo.tipo_ingreso) {
      setMensaje("Debes elegir un tipo de ingreso.");
      setShowModalMensaje(true);
      return false;
    }
    // 4) categoria
    if (!ingresoNuevo.categoria) {
      setMensaje("Debes elegir una categoría.");
      setShowModalMensaje(true);
      return false;
    }
    // 5) fuente longitud
    if (ingresoNuevo.fuente && ingresoNuevo.fuente.length > 80) {
      setMensaje("La fuente no puede exceder 80 caracteres.");
      setShowModalMensaje(true);
      return false;
    }
    // 6) descripcion longitud
    if (ingresoNuevo.descripcion && ingresoNuevo.descripcion.length > 100) {
      setMensaje("La descripción no puede exceder 100 caracteres.");
      setShowModalMensaje(true);
      return false;
    }
    // 7) Archivo
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
      // Subir a Storage
      try {
        const ext = fileComprobante.name.split(".").pop();
        const fileName = `comprobante_${Date.now()}.${ext}`;
        const storageRef = ref(storage, `ingresos/${fileName}`);
        await uploadBytes(storageRef, fileComprobante);
        urlArchivo = await getDownloadURL(storageRef);
      } catch (error) {
        console.error(error);
        setMensaje("Error al subir el comprobante.");
        setShowModalMensaje(true);
        return;
      }
    }

    // Llamar a la función principal
    handleAddIngreso({ ...ingresoNuevo, comprobanteURL: urlArchivo });
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
        <Modal.Title>Registrar Ingreso</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Fecha Ingreso *</Form.Label>
            </Col>
            <Col md={8}>
              <Form.Control
                type="date"
                name="fecha_ingreso"
                value={ingresoNuevo.fecha_ingreso}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Monto *</Form.Label>
            </Col>
            <Col md={8}>
              <Form.Control
                type="number"
                name="monto"
                value={ingresoNuevo.monto}
                onChange={handleChange}
                placeholder=">=1 y <=1,000,000"
                required
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Tipo de Ingreso *</Form.Label>
            </Col>
            <Col md={8}>
              <Form.Select
                name="tipo_ingreso"
                value={ingresoNuevo.tipo_ingreso}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione</option>
                <option value="Venta">Venta</option>
                <option value="Préstamo">Préstamo</option>
                <option value="Donación">Donación</option>
                <option value="Otro">Otro</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Categoría *</Form.Label>
            </Col>
            <Col md={8}>
              <Form.Select
                name="categoria"
                value={ingresoNuevo.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione</option>
                <option value="Agro">Agro</option>
                <option value="Comercio">Comercio</option>
                <option value="Servicios">Servicios</option>
                <option value="Artesanía">Artesanía</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Fuente</Form.Label>
            </Col>
            <Col md={8}>
              <Form.Control
                type="text"
                name="fuente"
                value={ingresoNuevo.fuente}
                onChange={handleChange}
                placeholder="Máx 80 caracteres"
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Medio de Pago</Form.Label>
            </Col>
            <Col md={8}>
              <Form.Select
                name="medio_pago"
                value={ingresoNuevo.medio_pago}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tigo Money">Tigo Money</option>
                <option value="Otro">Otro</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Descripción</Form.Label>
            </Col>
            <Col md={8}>
              <Form.Control
                type="text"
                name="descripcion"
                value={ingresoNuevo.descripcion}
                onChange={handleChange}
                placeholder="Máx 100 caracteres"
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Comprobante</Form.Label>
            </Col>
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

export default ModalRegistroIngreso;
