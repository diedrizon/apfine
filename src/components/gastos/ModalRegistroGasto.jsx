import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../database/firebaseconfig";

// 👉 Validación externa y limpia
function validarGasto(gasto, archivo, setMensaje, setShowModalMensaje) {
  const hoy = new Date();
  const fecha = new Date(gasto.fecha_gasto);

  if (!gasto.fecha_gasto || isNaN(fecha) || fecha > hoy) {
    setMensaje("La fecha es inválida o futura.");
    setShowModalMensaje(true);
    return false;
  }

  const monto = parseFloat(gasto.monto);
  if (isNaN(monto) || monto < 1 || monto > 1000000) {
    setMensaje("El monto debe estar entre C$1 y C$1,000,000.");
    setShowModalMensaje(true);
    return false;
  }

  if (!gasto.tipo_gasto) {
    setMensaje("Selecciona un tipo de gasto.");
    setShowModalMensaje(true);
    return false;
  }

  if (!gasto.categoria) {
    setMensaje("Selecciona una categoría.");
    setShowModalMensaje(true);
    return false;
  }

  if (gasto.proveedor && gasto.proveedor.length > 50) {
    setMensaje("El proveedor no puede exceder los 50 caracteres.");
    setShowModalMensaje(true);
    return false;
  }

  if (gasto.descripcion && gasto.descripcion.length > 100) {
    setMensaje("La descripción no puede exceder los 100 caracteres.");
    setShowModalMensaje(true);
    return false;
  }

  if (archivo && archivo.size > 5 * 1024 * 1024) {
    setMensaje("El archivo no puede superar los 5MB.");
    setShowModalMensaje(true);
    return false;
  }

  return true;
}

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGastoNuevo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileComprobante(e.target.files[0]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const valido = validarGasto(gastoNuevo, fileComprobante, setMensaje, setShowModalMensaje);
    if (!valido) return;

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
          <div className="modal-group">
            <label htmlFor="fecha_gasto">Fecha del Gasto *</label>
            <input
              type="date"
              id="fecha_gasto"
              name="fecha_gasto"
              value={gastoNuevo.fecha_gasto}
              onChange={handleChange}
              className="form-control-fecha"
              required
            />
          </div>

          <div className="modal-group">
            <label htmlFor="monto">Monto *</label>
            <input
              type="number"
              id="monto"
              name="monto"
              value={gastoNuevo.monto}
              onChange={handleChange}
              placeholder="Ej: 500"
              required
            />
          </div>

          <div className="modal-group">
            <label htmlFor="tipo_gasto">Tipo de Gasto *</label>
            <select
              id="tipo_gasto"
              name="tipo_gasto"
              value={gastoNuevo.tipo_gasto}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione</option>
              <option value="Personal">Personal</option>
              <option value="Operativo">Operativo</option>
            </select>
          </div>

          <div className="modal-group">
            <label htmlFor="categoria">Categoría *</label>
            <select
              id="categoria"
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
            </select>
          </div>

          <div className="modal-group">
            <label htmlFor="proveedor">Proveedor</label>
            <input
              type="text"
              id="proveedor"
              name="proveedor"
              value={gastoNuevo.proveedor}
              onChange={handleChange}
              placeholder="Máx 50 caracteres"
            />
          </div>

          <div className="modal-group">
            <label htmlFor="medio_pago">Medio de Pago</label>
            <select
              id="medio_pago"
              name="medio_pago"
              value={gastoNuevo.medio_pago}
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
              value={gastoNuevo.descripcion}
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

export default ModalRegistroGasto;
