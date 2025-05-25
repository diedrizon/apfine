// ModalEdicionOrden.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import * as Fa from "react-icons/fa";
import "react-bootstrap-typeahead/css/Typeahead.css";

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
    if (show) {
      setMp({ nombre: "", cantidad_utilizada: "" });
    }
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

  const MENU_STYLE = {
    maxHeight: "144px",
    overflowY: "auto",
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
          {/* Producto */}
          <Form.Group className="modal-group">
            <Form.Label>Producto</Form.Label>
            <Typeahead
              id="producto-edit"
              labelKey="nombre_producto"
              options={productosList}
              placeholder="— Seleccionar o buscar —"
              selected={
                orden.producto
                  ? productosList.filter(
                      (p) => p.nombre_producto === orden.producto
                    )
                  : []
              }
              onChange={(sel) =>
                setOrden((o) => ({
                  ...o,
                  producto: sel[0]?.nombre_producto || "",
                }))
              }
              renderInput={({ inputRef, referenceElementRef, ...inputProps }) => (
                <Form.Control
                  {...inputProps}
                  ref={(ref) => {
                    inputRef(ref);
                    referenceElementRef(ref);
                  }}
                />
              )}
              menuContainerStyle={{ width: "100%" }}
              menuStyle={MENU_STYLE}
            />
          </Form.Group>

          {/* Cantidades y Estado */}
          <Row className="g-3">
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

          {/* Fechas y Horas */}
          <Row className="g-3">
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

          {/* Costos */}
          <Row className="g-3">
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

          {/* Reproceso */}
          <Form.Check
            className="mt-2"
            label="¿Reproceso?"
            name="es_reproceso"
            checked={orden.es_reproceso}
            onChange={ch}
          />
          {orden.es_reproceso && (
            <Row className="g-3">
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

          {/* Nueva materia */}
          <Row className="g-3 align-items-center">
            <Col md={7}>
              <Form.Group className="modal-group">
                <Form.Label>Materia prima</Form.Label>
                <Typeahead
                  id="materia-edit"
                  labelKey="nombre"
                  options={materiasList.filter(
                    (m) =>
                      !orden.materias_primas.some((mp) => mp.nombre === m.nombre)
                  )}
                  placeholder="— Seleccionar o buscar —"
                  selected={[]}
                  onChange={(sel) =>
                    setMp({ nombre: sel[0]?.nombre || "", cantidad_utilizada: "" })
                  }
                  renderInput={({ inputRef, referenceElementRef, ...props }) => (
                    <Form.Control
                      {...props}
                      ref={(ref) => {
                        inputRef(ref);
                        referenceElementRef(ref);
                      }}
                    />
                  )}
                  menuContainerStyle={{ width: "100%" }}
                  menuStyle={MENU_STYLE}
                />
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
            <Col md={2} className="d-flex align-items-center">
              <Button variant="success" className="w-100" onClick={addLinea}>
                +
              </Button>
            </Col>
          </Row>

          {/* Lista de materias agregadas */}
          {orden.materias_primas.length > 0 && (
            <div className="chip-group">
              {orden.materias_primas.map((m, i) => (
                <div className="orden-item" key={i}>
                  <div className="orden-top d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className="op-icon">
                        <Fa.FaCube />
                      </div>
                      <span className="orden-producto">{m.nombre}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="number"
                        min="0"
                        value={m.cantidad_utilizada}
                        onChange={(e) => {
                          const nueva = e.target.value;
                          setOrden((prev) => ({
                            ...prev,
                            materias_primas: prev.materias_primas.map(
                              (item, idx) =>
                                idx === i
                                  ? { ...item, cantidad_utilizada: nueva }
                                  : item
                            ),
                          }));
                        }}
                        className="orden-cantidad"
                        style={{ width: "80px", marginRight: "0.5rem" }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => delLinea(i)}
                      >
                        ×
                      </Button>
                    </div>
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
