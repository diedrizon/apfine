import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
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
  categorias,
}) {
  const [fileComprobante, setFileComprobante] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGastoNuevo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileComprobante(e.target.files[0]);
      if (errors.comprobante) setErrors((prev) => ({ ...prev, comprobante: null }));
    }
  };

  const validarGasto = () => {
    const newErrors = {};
    const hoy = new Date();
    const fecha = new Date(gastoNuevo.fecha_gasto);

    if (!gastoNuevo.fecha_gasto || isNaN(fecha) || fecha > hoy) {
      newErrors.fecha_gasto = "La fecha es inválida o futura.";
    }

    const monto = parseFloat(gastoNuevo.monto);
    if (isNaN(monto) || monto < 1 || monto > 1000000) {
      newErrors.monto = "El monto debe estar entre C$1 y C$1,000,000.";
    }

    if (!gastoNuevo.tipo_gasto) {
      newErrors.tipo_gasto = "Selecciona un tipo de gasto.";
    }

    if (!gastoNuevo.categoria) {
      newErrors.categoria = "Selecciona una categoría.";
    }

    if (gastoNuevo.proveedor && gastoNuevo.proveedor.length > 50) {
      newErrors.proveedor = "El proveedor no puede exceder los 50 caracteres.";
    }

    if (gastoNuevo.descripcion && gastoNuevo.descripcion.length > 100) {
      newErrors.descripcion = "La descripción no puede exceder los 100 caracteres.";
    }

    if (fileComprobante && fileComprobante.size > 5 * 1024 * 1024) {
      newErrors.comprobante = "El archivo no puede superar los 5MB.";
    }

    setErrors(newErrors);

    // Si hay errores, mostrar mensaje en el modal
    if (Object.keys(newErrors).length > 0) {
      setMensaje("Por favor corrige los errores en el formulario.");
      setShowModalMensaje(true);
    }

    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validarGasto()) return;

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
        setErrors((prev) => ({ ...prev, comprobante: "Error al subir el comprobante." }));
        setMensaje("Hubo un error al subir el comprobante.");
        setShowModalMensaje(true);
        return;
      }
    }

    handleAddGasto({ ...gastoNuevo, comprobanteURL: urlArchivo });
  };

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
          <Form.Group className="modal-group">
            <Form.Label htmlFor="fecha_gasto">Fecha del Gasto *</Form.Label>
            <Form.Control
              type="date"
              id="fecha_gasto"
              name="fecha_gasto"
              value={gastoNuevo.fecha_gasto}
              onChange={handleChange}
              className={errors.fecha_gasto ? "is-invalid" : ""}
            />
            {errors.fecha_gasto && (
              <Form.Control.Feedback type="invalid">
                {errors.fecha_gasto}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="modal-group">
            <Form.Label htmlFor="monto">Monto *</Form.Label>
            <Form.Control
              type="number"
              id="monto"
              name="monto"
              value={gastoNuevo.monto}
              onChange={handleChange}
              placeholder="Ej: 500"
              className={errors.monto ? "is-invalid" : ""}
            />
            {errors.monto && (
              <Form.Control.Feedback type="invalid">
                {errors.monto}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="modal-group">
            <Form.Label htmlFor="tipo_gasto">Tipo de Gasto *</Form.Label>
            <Form.Select
              id="tipo_gasto"
              name="tipo_gasto"
              value={gastoNuevo.tipo_gasto}
              onChange={handleChange}
              className={errors.tipo_gasto ? "is-invalid" : ""}
            >
              <option value="">Seleccione</option>
              <option value="Personal">Personal</option>
              <option value="Operativo">Operativo</option>
            </Form.Select>
            {errors.tipo_gasto && (
              <Form.Control.Feedback type="invalid">
                {errors.tipo_gasto}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="modal-group">
            <Form.Label htmlFor="categoria">Categoría *</Form.Label>
            <Form.Select
              id="categoria"
              name="categoria"
              value={gastoNuevo.categoria}
              onChange={handleChange}
              className={errors.categoria ? "is-invalid" : ""}
            >
              <option value="">Seleccione</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </Form.Select>
            {errors.categoria && (
              <Form.Control.Feedback type="invalid">
                {errors.categoria}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="modal-group">
            <Form.Label htmlFor="proveedor">Proveedor</Form.Label>
            <Form.Control
              type="text"
              id="proveedor"
              name="proveedor"
              value={gastoNuevo.proveedor}
              onChange={handleChange}
              placeholder="Máx 50 caracteres"
              className={errors.proveedor ? "is-invalid" : ""}
            />
            {errors.proveedor && (
              <Form.Control.Feedback type="invalid">
                {errors.proveedor}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="modal-group">
            <Form.Label htmlFor="descripcion">Descripción</Form.Label>
            <Form.Control
              as="textarea"
              id="descripcion"
              name="descripcion"
              value={gastoNuevo.descripcion}
              onChange={handleChange}
              placeholder="Máx 100 caracteres"
              rows={3}
              className={errors.descripcion ? "is-invalid" : ""}
            />
            {errors.descripcion && (
              <Form.Control.Feedback type="invalid">
                {errors.descripcion}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="modal-group">
            <Form.Label htmlFor="comprobante">Comprobante</Form.Label>
            <Form.Control
              type="file"
              id="comprobante"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className={errors.comprobante ? "is-invalid" : ""}
            />
            {errors.comprobante && (
              <Form.Control.Feedback type="invalid">
                {errors.comprobante}
              </Form.Control.Feedback>
            )}
            <small>(Opcional, máximo 5MB)</small>
          </Form.Group>
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
