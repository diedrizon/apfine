import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
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
  categorias,
}) {
  const [fileComprobante, setFileComprobante] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIngresoEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileComprobante(e.target.files[0]);
    }
  };

  const validarIngreso = () => {
    const hoy = new Date();
    const fecha = new Date(ingresoEditado.fecha_ingreso);

    if (!ingresoEditado.fecha_ingreso || isNaN(fecha) || fecha > hoy) {
      setMensaje("La fecha es inválida o futura.");
      setShowModalMensaje(true);
      return false;
    }

    const monto = parseFloat(ingresoEditado.monto);
    if (isNaN(monto) || monto < 1 || monto > 1000000) {
      setMensaje("El monto debe estar entre C$1 y C$1,000,000.");
      setShowModalMensaje(true);
      return false;
    }

    if (!ingresoEditado.tipo_ingreso) {
      setMensaje("Selecciona un tipo de ingreso.");
      setShowModalMensaje(true);
      return false;
    }

    if (!ingresoEditado.categoria) {
      setMensaje("Selecciona una categoría.");
      setShowModalMensaje(true);
      return false;
    }

    if (ingresoEditado.fuente && ingresoEditado.fuente.length > 50) {
      setMensaje("La fuente no puede exceder los 50 caracteres.");
      setShowModalMensaje(true);
      return false;
    }

    if (ingresoEditado.descripcion && ingresoEditado.descripcion.length > 100) {
      setMensaje("La descripción no puede exceder los 100 caracteres.");
      setShowModalMensaje(true);
      return false;
    }

    if (fileComprobante && fileComprobante.size > 5 * 1024 * 1024) {
      setMensaje("El archivo no puede superar los 5MB.");
      setShowModalMensaje(true);
      return false;
    }

    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validarIngreso()) return;

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
        <Modal.Title>Editar Ingreso</Modal.Title>
      </Modal.Header>

      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <div className="modal-group">
            <label htmlFor="fecha_ingreso">Fecha del Ingreso *</label>
            <input
              type="date"
              id="fecha_ingreso"
              name="fecha_ingreso"
              value={ingresoEditado.fecha_ingreso}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-group">
            <label htmlFor="monto">Monto *</label>
            <input
              type="number"
              id="monto"
              name="monto"
              value={ingresoEditado.monto}
              onChange={handleChange}
              placeholder="Ej: 1500"
              required
            />
          </div>

          <div className="modal-group">
            <label htmlFor="tipo_ingreso">Tipo de Ingreso *</label>
            <select
              id="tipo_ingreso"
              name="tipo_ingreso"
              value={ingresoEditado.tipo_ingreso}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione</option>
              <option value="Venta">Venta</option>
              <option value="Préstamo">Préstamo</option>
              <option value="Donación">Donación</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="modal-group">
            <label htmlFor="categoria">Categoría *</label>
            <select
              id="categoria"
              name="categoria"
              value={ingresoEditado.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-group">
            <label htmlFor="fuente">Fuente</label>
            <input
              type="text"
              id="fuente"
              name="fuente"
              value={ingresoEditado.fuente}
              onChange={handleChange}
              placeholder="Máx 50 caracteres"
            />
          </div>

          <div className="modal-group">
            <label htmlFor="medio_pago">Medio de Pago</label>
            <select
              id="medio_pago"
              name="medio_pago"
              value={ingresoEditado.medio_pago}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="modal-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={ingresoEditado.descripcion}
              onChange={handleChange}
              placeholder="Máx 100 caracteres"
              rows={3}
            ></textarea>
          </div>

          <div className="modal-group">
            <label htmlFor="comprobante">Comprobante</label>
            <input
              type="file"
              id="comprobante"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
            />
            <small>(Opcional, máximo 5MB)</small>
            {ingresoEditado.comprobanteURL && (
              <a
                href={ingresoEditado.comprobanteURL}
                target="_blank"
                rel="noreferrer"
                className="comprobante-link"
              >
                Ver comprobante actual
              </a>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalEdicionIngreso;
