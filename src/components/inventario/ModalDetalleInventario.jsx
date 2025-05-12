import React from "react";
import { Modal, Button } from "react-bootstrap";

const RowDetalle = ({ l, v }) => (
  <div className="detalle-item">
    <span className="detalle-label">{l}</span>
    <span className="detalle-value">{v || "—"}</span>
  </div>
);

export default function ModalDetalleInventario({ show, handleClose, item }) {
  if (!item) return null;
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Producto</Modal.Title>
      </Modal.Header>
      <Modal.Body className="detalle-ingreso">
        <RowDetalle l="Nombre" v={item.nombre_producto} />
        <RowDetalle l="SKU" v={item.SKU} />
        <RowDetalle l="Stock actual" v={item.stock_actual} />
        <RowDetalle l="Stock mínimo" v={item.stock_minimo} />
        <RowDetalle l="Costo unitario (C$)" v={item.costo_unitario} />
        <RowDetalle l="Precio venta (C$)" v={item.precio_venta} />
        <RowDetalle l="Ubicación" v={item.ubicacion} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
