import React from "react";
import { Modal, Button } from "react-bootstrap";

function ModalDetalleGasto({ show, handleClose, gastoDetalle }) {
  if (!gastoDetalle) return null;

  const {
    fecha_gasto,
    monto,
    tipo_gasto,
    categoria,
    proveedor,
    medio_pago,
    descripcion,
    comprobanteURL,
  } = gastoDetalle;

  const Item = ({ label, value }) => (
    <div className="detalle-item">
      <span className="detalle-label">{label}</span>
      <span className="detalle-value">{value || "—"}</span>
    </div>
  );

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
        <Modal.Title>Detalle del Gasto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="detalle-gasto">
          <Item label="Fecha del Gasto" value={fecha_gasto} />
          <Item label="Monto" value={`C$ ${monto}`} />
          <Item label="Tipo de Gasto" value={tipo_gasto} />
          <Item label="Categoría" value={categoria} />
          <Item label="Proveedor" value={proveedor} />
          <Item label="Medio de Pago" value={medio_pago} />
          <Item label="Descripción" value={descripcion} />

          <div className="detalle-item">
            <span className="detalle-label">Comprobante</span>
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
              <span className="detalle-value">No se adjuntó comprobante.</span>
            )}
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

export default ModalDetalleGasto;
