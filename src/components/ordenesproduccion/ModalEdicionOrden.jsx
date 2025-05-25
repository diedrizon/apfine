import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import * as Fa from "react-icons/fa";

export default function ModalEdicionOrden({
  show,
  handleClose,
  orden,
  setOrden,
  handleEdit,
  setMsg,
  setShowMsg,
  productosList,
  materiasList,
}) {
  const [mp, setMp] = useState({ nombre: "", cantidad_utilizada: "" });
  useEffect(() => {
    if (show) setMp({ nombre: "", cantidad_utilizada: "" });
  }, [show]);
  if (!orden) return null;
  const ch = (e) =>
    setOrden({
      ...orden,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  const addLinea = () => {
    if (!mp.nombre || !mp.cantidad_utilizada) return;
    const unidad =
      materiasList.find((m) => m.nombre === mp.nombre)?.unidad_medida || "";
    setOrden({
      ...orden,
      materias_primas: [
        ...orden.materias_primas,
        { ...mp, unidad_medida: unidad },
      ],
    });
    setMp({ nombre: "", cantidad_utilizada: "" });
  };
  const delLinea = (i) =>
    setOrden({
      ...orden,
      materias_primas: orden.materias_primas.filter((_, idx) => idx !== i),
    });
  const submit = (e) => {
    e.preventDefault();
    if (!orden.producto || !orden.cantidad_planeada) {
      setMsg("Producto y cantidad requeridos");
      setShowMsg(true);
      return;
    }
    handleEdit(orden);
  };
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Orden</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submit}>
        <Modal.Body className="modal-body">
          <Form.Group className="modal-group">
            <Form.Label>Producto</Form.Label>
            <Form.Select name="producto" value={orden.producto} onChange={ch}>
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
                  value={orden.cantidad_planeada}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="modal-group">
                <Form.Label>Cant. real</Form.Label>
                <Form.Control
                  type="number"
                  name="cantidad_real"
                  value={orden.cantidad_real || ""}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="modal-group">
                <Form.Label>Estado</Form.Label>
                <Form.Select name="estado" value={orden.estado} onChange={ch}>
                  <option>Planificada</option>
                  <option>En proceso</option>
                  <option>Completada</option>
                  <option>Cancelada</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Group className="modal-group">
                <Form.Label>Fecha fin estimada</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fin_estimada"
                  value={orden.fecha_fin_estimada || ""}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="modal-group">
                <Form.Label>Fecha fin real</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fin_real"
                  value={orden.fecha_fin_real || ""}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="modal-group">
                <Form.Label>Horas trabajadas</Form.Label>
                <Form.Control
                  type="number"
                  name="horas_trabajadas"
                  value={orden.horas_trabajadas || ""}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Group className="modal-group">
                <Form.Label>Costo estimado</Form.Label>
                <Form.Control
                  type="number"
                  name="costo_estimado"
                  value={orden.costo_estimado || ""}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="modal-group">
                <Form.Label>Costo real</Form.Label>
                <Form.Control
                  type="number"
                  name="costo_real"
                  value={orden.costo_real || ""}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="modal-group">
                <Form.Label>Costo mano obra</Form.Label>
                <Form.Control
                  type="number"
                  name="costo_mano_obra"
                  value={orden.costo_mano_obra || ""}
                  onChange={ch}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Check
            className="mt-2"
            label="¿Reproceso?"
            name="es_reproceso"
            checked={orden.es_reproceso}
            onChange={ch}
          />
          {orden.es_reproceso && (
            <Row>
              <Col md={6}>
                <Form.Group className="modal-group">
                  <Form.Label>Motivo reproceso</Form.Label>
                  <Form.Control
                    name="motivo_reproceso"
                    value={orden.motivo_reproceso || ""}
                    onChange={ch}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="modal-group">
                  <Form.Label>Cant. reprocesada</Form.Label>
                  <Form.Control
                    type="number"
                    name="cantidad_reprocesada"
                    value={orden.cantidad_reprocesada || ""}
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
          {orden.materias_primas.length > 0 && (
            <div className="chip-group">
              {orden.materias_primas.map((m, i) => (
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
