import React from "react";
import { Modal, Button } from "react-bootstrap";

function ModalDetalleIngreso({ show, handleClose, ingresoDetalle }) {
  if (!ingresoDetalle) return null;

  const {
    fecha_ingreso,
    monto,
    tipo_ingreso,
    categoria,
    fuente,
    medio_pago,
    descripcion,
    comprobanteURL,
  } = ingresoDetalle;

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
        <Modal.Title>Detalle del Ingreso</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="detalle-ingreso">
          <div className="detalle-item">
            <div className="detalle-label">Fecha:</div>
            <div className="detalle-value">{fecha_ingreso || "—"}</div>
          </div>
          <div className="detalle-item">
            <div className="detalle-label">Monto:</div>
            <div className="detalle-value">C${monto || "—"}</div>
          </div>
          <div className="detalle-item">
            <div className="detalle-label">Tipo de Ingreso:</div>
            <div className="detalle-value">{tipo_ingreso || "—"}</div>
          </div>
          <div className="detalle-item">
            <div className="detalle-label">Categoría:</div>
            <div className="detalle-value">{categoria || "—"}</div>
          </div>
          <div className="detalle-item">
            <div className="detalle-label">Fuente:</div>
            <div className="detalle-value">{fuente || "—"}</div>
          </div>
          <div className="detalle-item">
            <div className="detalle-label">Medio de Pago:</div>
            <div className="detalle-value">{medio_pago || "—"}</div>
          </div>
          <div className="detalle-item">
            <div className="detalle-label">Descripción:</div>
            <div className="detalle-value">{descripcion || "—"}</div>
          </div>
          <div className="detalle-item">
            <div className="detalle-label">Comprobante:</div>
            <div className="detalle-value">
              {comprobanteURL ? (
                <a
                  href={comprobanteURL}
                  target="_blank"
                  rel="noreferrer"
                  className="comprobante-link"
                >
                  Ver comprobante
                </a>
              ) : (
                "No se adjuntó comprobante"
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalDetalleIngreso;
