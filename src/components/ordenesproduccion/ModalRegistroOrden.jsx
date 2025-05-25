// ModalRegistroOrden.jsx
import React, { useState, useRef } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { serverTimestamp } from "firebase/firestore";
import { Typeahead } from "react-bootstrap-typeahead";
import * as Fa from "react-icons/fa";
import "react-bootstrap-typeahead/css/Typeahead.css";

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
  const materiaRef = useRef(null);

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
    setOp((prev) => ({
      ...prev,
      materias_primas: [
        ...prev.materias_primas,
        { ...mp, unidad_medida: unidad },
      ],
    }));
    // limpiar input de materia prima
    setMp({ nombre: "", cantidad_utilizada: "" });
    materiaRef.current.clear();
  };

  const delLinea = (i) =>
    setOp((prev) => ({
      ...prev,
      materias_primas: prev.materias_primas.filter((_, idx) => idx !== i),
    }));

  const submit = (e) => {
    e.preventDefault();
    if (!op.producto || !op.cantidad_planeada) {
      setMsg("Producto y cantidad requeridos");
      setShowMsg(true);
      return;
    }
    handleAdd(op);
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
        <Modal.Title>Nueva Orden</Modal.Title>
      </Modal.Header>

      <Form onSubmit={submit}>
        <Modal.Body className="modal-body">
          {/* === Producto === */}
          <Form.Group className="modal-group">
            <Form.Label>Producto</Form.Label>
            <Typeahead
              id="producto-search"
              labelKey="nombre_producto"
              options={productosList}
              placeholder="— Seleccionar o buscar —"
              selected={
                op.producto
                  ? productosList.filter(
                      (p) => p.nombre_producto === op.producto
                    )
                  : []
              }
              onChange={(sel) =>
                setOp({ ...op, producto: sel[0]?.nombre_producto || "" })
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

          {/* Cant. planeada & Proveedor */}
          <Row className="g-3">
            <Col md={6}>
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
          </Row>

          {/* Fecha inicio / Fecha fin estimada */}
          <Row className="g-3">
            <Col md={6}>
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
            <Col md={6}>
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

          {/* Costos */}
          <Row className="g-3">
            <Col md={6}>
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
            <Col md={6}>
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

          {/* Reproceso */}
          <Form.Check
            className="mt-2"
            label="¿Reproceso?"
            name="es_reproceso"
            checked={op.es_reproceso}
            onChange={ch}
          />
          {op.es_reproceso && (
            <Row className="g-3">
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

          {/* === Materia prima + Cantidad + Botón “+” === */}
          <Row className="g-3 align-items-center">
            <Col md={6}>
              <Form.Group className="modal-group">
                <Form.Label>Materia prima</Form.Label>
                <Typeahead
                  id="materia-search"
                  ref={materiaRef}
                  labelKey="nombre"
                  options={materiasList.filter(
                    (m) =>
                      !op.materias_primas.some((mp) => mp.nombre === m.nombre)
                  )}
                  placeholder="— Seleccionar o buscar —"
                  selected={
                    mp.nombre
                      ? materiasList.filter((m) => m.nombre === mp.nombre)
                      : []
                  }
                  onChange={(sel) =>
                    setMp((m) => ({
                      ...m,
                      nombre: sel[0]?.nombre || "",
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
            </Col>
            <Col md={4}>
              <Form.Group className="modal-group">
                <Form.Label>Cantidad</Form.Label>
                <Form.Control
                  type="number"
                  value={mp.cantidad_utilizada}
                  onChange={(e) =>
                    setMp((m) => ({
                      ...m,
                      cantidad_utilizada: e.target.value,
                    }))
                  }
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="success" className="w-100" onClick={addLinea}>
                +
              </Button>
            </Col>
          </Row>

          {/* Lista de materias agregadas */}
          {op.materias_primas.length > 0 && (
            <div className="chip-group">
              {op.materias_primas.map((m, i) => (
                <div className="orden-item" key={i}>
                  <div className="orden-top d-flex align-items-center justify-content-between">
                    {/* Icono + Nombre */}
                    <div className="d-flex align-items-center">
                      <div className="op-icon">
                        <Fa.FaCube />
                      </div>
                      <span className="orden-producto">{m.nombre}</span>
                    </div>
                    {/* Cantidad + Botón eliminar */}
                    <div className="d-flex align-items-center">
                      <span className="me-2">
                        {m.cantidad_utilizada} {m.unidad_medida}
                      </span>
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
