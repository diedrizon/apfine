// src/components/ingresos/ModalEdicionIngreso.jsx
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

function ModalEdicionIngreso({
  show,
  handleClose,
  ingresoEditado,
  setIngresoEditado,
  handleEditIngreso,
  setMensaje,
  setShowModalMensaje,
}) {
  const [fileComprobante, setFileComprobante] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setIngresoEditado((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFileComprobante(e.target.files[0]);
    }
  }

  if (!ingresoEditado) return null;

  function validar() {
    // fecha no futura
    const hoy = new Date();
    const fecha = new Date(ingresoEditado.fecha_ingreso);
    if (fecha > hoy) {
      setMensaje("La fecha no puede ser futura.");
      setShowModalMensaje(true);
      return false;
    }
    // monto
    const montoNum = parseFloat(ingresoEditado.monto);
    if (isNaN(montoNum) || montoNum < 1 || montoNum > 1000000) {
      setMensaje("El monto debe estar entre 1 y 1,000,000.");
      setShowModalMensaje(true);
      return false;
    }
    // tipo_ingreso y categoria
    if (!ingresoEditado.tipo_ingreso) {
      setMensaje("Debes elegir un tipo de ingreso.");
      setShowModalMensaje(true);
      return false;
    }
    if (!ingresoEditado.categoria) {
      setMensaje("Debes elegir una categoría.");
      setShowModalMensaje(true);
      return false;
    }
    // fuente y descripcion
    if (ingresoEditado.fuente && ingresoEditado.fuente.length > 80) {
      setMensaje("La fuente no puede exceder 80 caracteres.");
      setShowModalMensaje(true);
      return false;
    }
    if (
      ingresoEditado.descripcion &&
      ingresoEditado.descripcion.length > 100
    ) {
      setMensaje("La descripción no puede exceder 100 caracteres.");
      setShowModalMensaje(true);
      return false;
    }
    // archivo
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

    let urlArchivo = ingresoEditado.comprobanteURL || "";
    if (fileComprobante) {
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

    handleEditIngreso({ ...ingresoEditado, comprobanteURL: urlArchivo });
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Ingreso</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={4}>Fecha Ingreso *</Col>
            <Col md={8}>
              <Form.Control
                type="date"
                name="fecha_ingreso"
                value={ingresoEditado.fecha_ingreso || ""}
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
                value={ingresoEditado.monto || ""}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>Tipo de Ingreso *</Col>
            <Col md={8}>
              <Form.Select
                name="tipo_ingreso"
                value={ingresoEditado.tipo_ingreso || ""}
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
            <Col md={4}>Categoría *</Col>
            <Col md={8}>
              <Form.Select
                name="categoria"
                value={ingresoEditado.categoria || ""}
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
            <Col md={4}>Fuente</Col>
            <Col md={8}>
              <Form.Control
                type="text"
                name="fuente"
                value={ingresoEditado.fuente || ""}
                onChange={handleChange}
                placeholder="Máx 80 caracteres"
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>Medio de Pago</Col>
            <Col md={8}>
              <Form.Select
                name="medio_pago"
                value={ingresoEditado.medio_pago || ""}
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
            <Col md={4}>Descripción</Col>
            <Col md={8}>
              <Form.Control
                type="text"
                name="descripcion"
                value={ingresoEditado.descripcion || ""}
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
              {ingresoEditado.comprobanteURL && (
                <div style={{ marginTop: "10px" }}>
                  <a
                    href={ingresoEditado.comprobanteURL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver comprobante actual
                  </a>
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
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

export default ModalEdicionIngreso;
