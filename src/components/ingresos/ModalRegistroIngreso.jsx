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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIngresoNuevo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileComprobante(e.target.files[0]);
    }
  };

  const validarIngreso = () => {
    const hoy = new Date();
    const fecha = new Date(ingresoNuevo.fecha_ingreso);

    if (!ingresoNuevo.fecha_ingreso || isNaN(fecha) || fecha > hoy) {
      setMensaje("La fecha es inválida o futura.");
      setShowModalMensaje(true);
      return false;
    }

    const monto = parseFloat(ingresoNuevo.monto);
    if (isNaN(monto) || monto < 1 || monto > 1000000) {
      setMensaje("El monto debe estar entre C$1 y C$1,000,000.");
      setShowModalMensaje(true);
      return false;
    }

    if (!ingresoNuevo.tipo_ingreso) {
      setMensaje("Selecciona un tipo de ingreso.");
      setShowModalMensaje(true);
      return false;
    }

    if (!ingresoNuevo.categoria) {
      setMensaje("Selecciona una categoría.");
      setShowModalMensaje(true);
      return false;
    }

    if (ingresoNuevo.fuente && ingresoNuevo.fuente.length > 50) {
      setMensaje("La fuente no puede exceder 50 caracteres.");
      setShowModalMensaje(true);
      return false;
    }

    if (ingresoNuevo.descripcion && ingresoNuevo.descripcion.length > 100) {
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
        setMensaje("Error al subir el comprobante.");
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
          <div className="modal-group">
            <label htmlFor="fecha_ingreso">Fecha del Ingreso *</label>
            <input
              type="date"
              id="fecha_ingreso"
              name="fecha_ingreso"
              value={ingresoNuevo.fecha_ingreso}
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
              value={ingresoNuevo.monto}
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
              value={ingresoNuevo.tipo_ingreso}
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
              value={ingresoNuevo.categoria}
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
              value={ingresoNuevo.fuente}
              onChange={handleChange}
              placeholder="Ej: Cliente X"
            />
          </div>

          <div className="modal-group">
            <label htmlFor="medio_pago">Medio de Pago</label>
            <select
              id="medio_pago"
              name="medio_pago"
              value={ingresoNuevo.medio_pago}
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
              value={ingresoNuevo.descripcion}
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
          </div>
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
