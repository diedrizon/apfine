import React from "react";
import { Modal, Button } from "react-bootstrap";

const Row = ({ l, v }) => (
  <div className="detalle-item">
    <span className="detalle-label">{l}</span>
    <span className="detalle-value">{v ?? "—"}</span>
  </div>
);

export default function ModalDetalleOrden({ show, handleClose, orden }) {
  if (!orden) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Detalle de la Orden</Modal.Title>
      </Modal.Header>

      <Modal.Body className="detalle-ingreso">
        {/* Datos generales */}
        <Row l="Producto" v={orden.producto} />
        <Row l="Cantidad planeada" v={orden.cantidad_planeada} />
        <Row l="Cantidad real" v={orden.cantidad_real} />
        <Row l="Estado" v={orden.estado} />

        {/* Fechas */}
        <Row l="Fecha de inicio" v={orden.fecha_inicio} />
        <Row l="Fecha fin estimada" v={orden.fecha_fin_estimada} />
        <Row l="Fecha fin real" v={orden.fecha_fin_real} />

        {/* Costos */}
        <Row l="Costo estimado" v={orden.costo_estimado} />
        <Row l="Costo real" v={orden.costo_real} />
        <Row l="Costo mano de obra" v={orden.costo_mano_obra} />

        {/* Horas y reproceso */}
        <Row l="Horas trabajadas" v={orden.horas_trabajadas} />
        {orden.es_reproceso && (
          <>
            <Row l="Cantidad reprocesada" v={orden.cantidad_reprocesada} />
            <Row l="Motivo del reproceso" v={orden.motivo_reproceso} />
          </>
        )}

        {/* Materias primas */}
        <div className="detalle-item">
          <strong>Materias primas utilizadas</strong>
        </div>
        {orden.materias_primas?.map((m, i) => (
          <Row
            key={i}
            l={m.nombre}
            v={`${m.cantidad_utilizada} ${m.unidad_medida}`}
          />
        ))}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
