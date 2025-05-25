import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { serverTimestamp } from "firebase/firestore";
import * as Fa from "react-icons/fa";

export default function ModalRegistroOrden({
  show,
  handleClose,
  handleAdd,
  setMsg,
  setShowMsg,
  productosList,
  materiasList,
}) {
  const [op, setOp] = useState({
    producto: "",
    cantidad_planeada: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin_estimada: "",
    proveedor_actual: "",
    costo_estimado: "",
    costo_mano_obra: "",
    es_reproceso: false,
    motivo_reproceso: "",
    materias_primas: [],
    created_at: serverTimestamp(),
  });
  const [mp, setMp] = useState({ nombre: "", cantidad_utilizada: "" });
  const ch = (e) =>
    setOp({
      ...op,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  const addLinea = () => {
    if (!mp.nombre || !mp.cantidad_utilizada) return;
    const unidad =
      materiasList.find((m) => m.nombre === mp.nombre)?.unidad_medida || "";
    setOp({
      ...op,
      materias_primas: [
        ...op.materias_primas,
        { ...mp, unidad_medida: unidad },
      ],
    });
    setMp({ nombre: "", cantidad_utilizada: "" });
  };
  const delLinea = (i) =>
    setOp({
      ...op,
      materias_primas: op.materias_primas.filter((_, idx) => idx !== i),
    });
  const submit = (e) => {
    e.preventDefault();
    if (!op.producto || !op.cantidad_planeada) {
      setMsg("Producto y cantidad requeridos");
      setShowMsg(true);
      return;
    }
    handleAdd(op);
  };
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Nueva Orden</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submit}>
        <Modal.Body className="modal-body">
          <Form.Group className="modal-group">
            <Form.Label>Producto</Form.Label>
            <Form.Select name="producto" value={op.producto} onChange={ch}>
              <option value="">— Seleccionar —</option>
              {productosList.map((p) => (
                <option key={p.id} value={p.nombre_producto}>
                  {p.nombre_producto}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Row>
            <Col md={4}>
              <Form.Group className="modal-group">
                <Form.Label>Cant. planeada</Form.Label>
                <Form.Control
                  type="number"
                  name="cantidad_planeada"
                  value={op.cantidad_planeada}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="modal-group">
                <Form.Label>Fecha inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_inicio"
                  value={op.fecha_inicio}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="modal-group">
                <Form.Label>Fecha fin estimada</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fin_estimada"
                  value={op.fecha_fin_estimada}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="modal-group">
                <Form.Label>Proveedor actual</Form.Label>
                <Form.Control
                  name="proveedor_actual"
                  value={op.proveedor_actual}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="modal-group">
                <Form.Label>Costo estimado</Form.Label>
                <Form.Control
                  type="number"
                  name="costo_estimado"
                  value={op.costo_estimado}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="modal-group">
                <Form.Label>Costo mano obra</Form.Label>
                <Form.Control
                  type="number"
                  name="costo_mano_obra"
                  value={op.costo_mano_obra}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Check
            className="mt-2"
            label="¿Reproceso?"
            name="es_reproceso"
            checked={op.es_reproceso}
            onChange={ch}
          />
          {op.es_reproceso && (
            <Row>
              <Col md={6}>
                <Form.Group className="modal-group">
                  <Form.Label>Motivo reproceso</Form.Label>
                  <Form.Control
                    name="motivo_reproceso"
                    value={op.motivo_reproceso}
                    onChange={ch}
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
          <hr />
          <Row className="align-items-end">
            <Col md={7}>
              <Form.Group className="modal-group">
                <Form.Label>Materia prima</Form.Label>
                <Form.Select
                  value={mp.nombre}
                  onChange={(e) => setMp({ ...mp, nombre: e.target.value })}
                >
                  <option value="">— seleccionar —</option>
                  {materiasList.map((m) => (
                    <option key={m.id} value={m.nombre}>
                      {m.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="modal-group">
                <Form.Label>Cantidad</Form.Label>
                <Form.Control
                  type="number"
                  value={mp.cantidad_utilizada}
                  onChange={(e) =>
                    setMp({ ...mp, cantidad_utilizada: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button variant="success" className="w-100" onClick={addLinea}>
                +
              </Button>
            </Col>
          </Row>
          {op.materias_primas.length > 0 && (
            <div className="chip-group">
              {op.materias_primas.map((m, i) => (
                <div className="orden-item" key={i}>
                  <div className="orden-top">
                    <div className="op-icon">
                      <Fa.FaCube />
                    </div>
                    <span className="orden-producto">{m.nombre}</span>
                    <span className="orden-estado">
                      {m.cantidad_utilizada} {m.unidad_medida}
                    </span>
                  </div>
                  <div className="orden-actions-expanded">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => delLinea(i)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
