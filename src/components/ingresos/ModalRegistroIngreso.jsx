import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
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
  categorias,
}) {
  const [fileComprobante, setFileComprobante] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIngresoNuevo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileComprobante(e.target.files[0]);
      if (errors.comprobante) setErrors((prev) => ({ ...prev, comprobante: null }));
    }
  };

  const validarIngreso = () => {
    const newErrors = {};
    const hoy = new Date();
    const fecha = new Date(ingresoNuevo.fecha_ingreso);

    if (!ingresoNuevo.fecha_ingreso || isNaN(fecha) || fecha > hoy) {
      newErrors.fecha_ingreso = "La fecha es inválida o futura.";
    }

    const monto = parseFloat(ingresoNuevo.monto);
    if (isNaN(monto) || monto < 1 || monto > 1000000) {
      newErrors.monto = "El monto debe estar entre C$1 y C$1,000,000.";
    }

    if (!ingresoNuevo.tipo_ingreso) {
      newErrors.tipo_ingreso = "Selecciona un tipo de ingreso.";
    }

    if (!ingresoNuevo.categoria) {
      newErrors.categoria = "Selecciona una categoría.";
    }

    if (ingresoNuevo.fuente && ingresoNuevo.fuente.length > 50) {
      newErrors.fuente = "La fuente no puede exceder 50 caracteres.";
    }

    if (ingresoNuevo.descripcion && ingresoNuevo.descripcion.length > 100) {
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
    if (!validarIngreso()) return;

    let urlArchivo = "";
    if (fileComprobante) {
      try {
        const ext = fileComprobante.name.split(".").pop();
        const fileName = `comprobante_${Date.now()}.${ext}`;
        const storageRef = ref(storage, `ingresos/${fileName}`);
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

    handleAddIngreso({ ...ingresoNuevo, comprobanteURL: urlArchivo });
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
        <Modal.Title>Registrar Ingreso</Modal.Title>
      </Modal.Header>

      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Form.Group className="modal-group">
            <Form.Label htmlFor="fecha_ingreso">Fecha del Ingreso *</Form.Label>
            <Form.Control
              type="date"
              id="fecha_ingreso"
              name="fecha_ingreso"
              value={ingresoNuevo.fecha_ingreso}
              onChange={handleChange}
              className={errors.fecha_ingreso ? "is-invalid" : ""}
            />
            {errors.fecha_ingreso && (
              <Form.Control.Feedback type="invalid">
                {errors.fecha_ingreso}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="modal-group">
            <Form.Label htmlFor="monto">Monto *</Form.Label>
            <Form.Control
              type="number"
              id="monto"
              name="monto"
              value={ingresoNuevo.monto}
              onChange={handleChange}
              placeholder="Ej: 1500"
              className={errors.monto ? "is-invalid" : ""}
            />
            {errors.monto && (
              <Form.Control.Feedback type="invalid">
                {errors.monto}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="modal-group">
            <Form.Label htmlFor="tipo_ingreso">Tipo de Ingreso *</Form.Label>
            <Form.Select
              id="tipo_ingreso"
              name="tipo_ingreso"
              value={ingresoNuevo.tipo_ingreso}
              onChange={handleChange}
              className={errors.tipo_ingreso ? "is-invalid" : ""}
            >
              <option value="">Seleccione</option>
              <option value="Venta">Venta</option>
              <option value="Préstamo">Préstamo</option>
              <option value="Donación">Donación</option>
              <option value="Otro">Otro</option>
            </Form.Select>
            {errors.tipo_ingreso && (
              <Form.Control.Feedback type="invalid">
                {errors.tipo_ingreso}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="modal-group">
            <Form.Label htmlFor="categoria">Categoría *</Form.Label>
            <Form.Select
              id="categoria"
              name="categoria"
              value={ingresoNuevo.categoria}
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
            <Form.Label htmlFor="fuente">Fuente</Form.Label>
            <Form.Control
              type="text"
              id="fuente"
              name="fuente"
              value={ingresoNuevo.fuente}
              onChange={handleChange}
              placeholder="Ej: Cliente X"
              className={errors.fuente ? "is-invalid" : ""}
            />
            {errors.fuente && (
              <Form.Control.Feedback type="invalid">
                {errors.fuente}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="modal-group">
            <Form.Label htmlFor="descripcion">Descripción</Form.Label>
            <Form.Control
              as="textarea"
              id="descripcion"
              name="descripcion"
              value={ingresoNuevo.descripcion}
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

export default ModalRegistroIngreso;
