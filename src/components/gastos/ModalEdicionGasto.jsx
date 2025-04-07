import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../database/firebaseconfig";

function ModalEdicionGasto({
  show,
  handleClose,
  gastoEditado,
  setGastoEditado,
  handleEditGasto,
  setMensaje,
  setShowModalMensaje,
}) {
  const [fileComprobante, setFileComprobante] = useState(null);

  if (!gastoEditado) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setGastoEditado((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFileComprobante(e.target.files[0]);
    }
  }

  function validar() {
    // fecha no futura
    const hoy = new Date();
    const fecha = new Date(gastoEditado.fecha_gasto);
    if (fecha > hoy) {
      setMensaje("La fecha no puede ser futura.");
      setShowModalMensaje(true);
      return false;
    }
    // monto
    const montoNum = parseFloat(gastoEditado.monto);
    if (isNaN(montoNum) || montoNum < 1 || montoNum > 1000000) {
      setMensaje("El monto debe estar entre 1 y 1,000,000.");
      setShowModalMensaje(true);
      return false;
    }
    // tipo_gasto
    if (!gastoEditado.tipo_gasto) {
      setMensaje("Debes seleccionar el tipo de gasto.");
      setShowModalMensaje(true);
      return false;
    }
    // categoria
    if (!gastoEditado.categoria) {
      setMensaje("Debes seleccionar la categoría.");
      setShowModalMensaje(true);
      return false;
    }
    // proveedor
    if (gastoEditado.proveedor && gastoEditado.proveedor.length > 50) {
      setMensaje("El proveedor no debe exceder 50 caracteres.");
      setShowModalMensaje(true);
      return false;
    }
    // descripcion
    if (gastoEditado.descripcion && gastoEditado.descripcion.length > 100) {
      setMensaje("La descripción no debe exceder 100 caracteres.");
      setShowModalMensaje(true);
      return false;
    }
    // archivo 2MB
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

    let urlArchivo = gastoEditado.comprobanteURL || "";
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

    handleEditGasto({ ...gastoEditado, comprobanteURL: urlArchivo });
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
        <Modal.Title>Editar Gasto</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={4}>Fecha Gasto *</Col>
            <Col md={8}>
              <Form.Control
                type="date"
                name="fecha_gasto"
                value={gastoEditado.fecha_gasto || ""}
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
                value={gastoEditado.monto || ""}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>Tipo de Gasto *</Col>
            <Col md={8}>
              <Form.Select
                name="tipo_gasto"
                value={gastoEditado.tipo_gasto || ""}
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
                value={gastoEditado.categoria || ""}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione</option>
                <option value="Transporte">Transporte</option>
                <option value="Servicios Básicos">Servicios Básicos</option>
                <option value="Insumos">Insumos</option>
                <option value="Renta">Renta</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>Proveedor</Col>
            <Col md={8}>
              <Form.Control
                type="text"
                name="proveedor"
                value={gastoEditado.proveedor || ""}
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
                value={gastoEditado.medio_pago || ""}
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
                value={gastoEditado.descripcion || ""}
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
              {gastoEditado.comprobanteURL && (
                <div style={{ marginTop: "8px" }}>
                  <a
                    href={gastoEditado.comprobanteURL}
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

export default ModalEdicionGasto;
