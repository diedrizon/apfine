// src/components/ordenesproduccion/ModalRegistroOrden.jsx

import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import { db } from "../../database/firebaseconfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function ModalRegistroOrden({
  show,
  close,
  save,
  uid,
}) {
  const defaultData = {
    prioridad: "Media", // Valor predeterminado
    proceso: "",
    producto: "",
    cantidad_planeada: "",
    fecha_inicio: "",
    fecha_fin_estimada: "",
    estado: "Planificada",
    cantidad_real: "",
    fecha_fin_real: "",
    costo_estimado: "",
    costo_real: "",
    horas_trabajadas: "",
    es_reproceso: false,
    materias_primas: [],
  };

  const [data, setData] = useState(defaultData);
  const [repoInsumos, setRepoInsumos] = useState([]);
  const [repoProductos, setRepoProductos] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      const q1 = query(
        collection(db, "materias_primas"),
        where("userId", "==", uid)
      );
      const snap1 = await getDocs(q1);
      setRepoInsumos(
        snap1.docs.map((d) => ({
          value: d.id,
          label: d.data().nombre,
        }))
      );

      const q2 = query(
        collection(db, "inventario"),
        where("userId", "==", uid)
      );
      const snap2 = await getDocs(q2);
      setRepoProductos(
        snap2.docs.map((d) => ({
          value: d.data().nombre_producto,
          label: d.data().nombre_producto,
        }))
      );
    })();
  }, [uid]);

  const loadInsumos = (input) => {
    const txt = input.toLowerCase();
    return Promise.resolve(
      repoInsumos.filter((i) => i.label.toLowerCase().includes(txt))
    );
  };

  const loadProductos = (input) => {
    const txt = input.toLowerCase();
    return Promise.resolve(
      repoProductos.filter((p) => p.label.toLowerCase().includes(txt))
    );
  };

  const addInsumo = (opcion) => {
    if (data.materias_primas.find((m) => m.id === opcion.value)) return;
    setData({
      ...data,
      materias_primas: [
        ...data.materias_primas,
        { id: opcion.value, nombre: opcion.label, cantidad_usada: "" },
      ],
    });
  };

  const seleccionarProducto = (opcion) => {
    setData({ ...data, producto: opcion?.value || "" });
  };

  const chg = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const chgCheckbox = (e) => {
    const { name, checked } = e.target;
    setData({ ...data, [name]: checked });
  };

  const qty = (i, val) => {
    const arr = [...data.materias_primas];
    arr[i].cantidad_usada = val;
    setData({ ...data, materias_primas: arr });
  };

  const validate = () => {
    const newErrors = {};

    // Producto
    if (!data.producto) {
      newErrors.producto = "Debe seleccionar un producto";
    }

    // Cantidad planeada: requerida y mayor a 0
    if (!data.cantidad_planeada) {
      newErrors.cantidad_planeada = "Ingrese la cantidad planeada";
    } else if (Number(data.cantidad_planeada) <= 0) {
      newErrors.cantidad_planeada = "La cantidad planeada debe ser mayor a 0";
    }

    // Fecha de inicio
    if (!data.fecha_inicio) {
      newErrors.fecha_inicio = "Ingrese la fecha de inicio";
    }

    // Fecha fin estimada (opcional): si se ingresa, debe ser posterior a la fecha de inicio
    if (data.fecha_fin_estimada) {
      if (new Date(data.fecha_fin_estimada) < new Date(data.fecha_inicio)) {
        newErrors.fecha_fin_estimada =
          "La fecha fin estimada debe ser posterior a la fecha de inicio";
      }
    }

    // Cantidad real (opcional): si se ingresa, no puede ser negativa
    if (data.cantidad_real !== undefined && data.cantidad_real !== "") {
      if (Number(data.cantidad_real) < 0) {
        newErrors.cantidad_real =
          "La cantidad real no puede ser negativa";
      }
    }

    // Fecha fin real (opcional)
    if (data.fecha_fin_real) {
      if (isNaN(new Date(data.fecha_fin_real).getTime())) {
        newErrors.fecha_fin_real = "Fecha fin real no es válida";
      }
    }

    // Costos: tanto estimado como real son requeridos y no pueden ser negativos
    if (data.costo_estimado === "" || data.costo_estimado == null) {
      newErrors.costo_estimado = "Ingrese el costo estimado";
    } else if (Number(data.costo_estimado) < 0) {
      newErrors.costo_estimado = "El costo estimado no puede ser negativo";
    }

    if (data.costo_real === "" || data.costo_real == null) {
      newErrors.costo_real = "Ingrese el costo real";
    } else if (Number(data.costo_real) < 0) {
      newErrors.costo_real = "El costo real no puede ser negativo";
    }

    // Horas trabajadas: requerida y no puede ser negativa
    if (data.horas_trabajadas === "" || data.horas_trabajadas == null) {
      newErrors.horas_trabajadas = "Ingrese las horas trabajadas";
    } else if (Number(data.horas_trabajadas) < 0) {
      newErrors.horas_trabajadas =
        "Las horas trabajadas no pueden ser negativas";
    }

    // Validación para reproceso
    if (data.es_reproceso) {
      if (!data.cantidad_reprocesada) {
        newErrors.cantidad_reprocesada =
          "Ingrese la cantidad reprocesada";
      } else if (Number(data.cantidad_reprocesada) <= 0) {
        newErrors.cantidad_reprocesada =
          "La cantidad reprocesada debe ser mayor a 0";
      }
      if (!data.motivo_reproceso) {
        newErrors.motivo_reproceso =
          "Ingrese el motivo de reproceso";
      }
    }

    // Validación de insumos (materias primas)
    if (data.materias_primas.length > 0) {
      data.materias_primas.forEach((m, i) => {
        if (!m.cantidad_usada) {
          newErrors[`materia_${i}`] = "Ingrese la cantidad usada";
        } else if (Number(m.cantidad_usada) <= 0) {
          newErrors[`materia_${i}`] =
            "La cantidad usada debe ser mayor a 0";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const ok = () => {
    if (!validate()) return;
    save(data);
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: 10,
      background: "var(--secondary-bg)",
      border: "2px solid var(--primary)",
      color: "var(--text-title)",
    }),
    menu: (base) => ({ ...base, background: "var(--secondary-bg)" }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? "var(--primary)" : "transparent",
      color: state.isFocused ? "#fff" : "var(--text-title)",
    }),
    input: (base) => ({ ...base, color: "var(--text-title)" }),
    singleValue: (base) => ({ ...base, color: "var(--text-title)" }),
    placeholder: (base) => ({ ...base, color: "var(--text-label)" }),
  };

  return (
    <Modal show={show} onHide={close} centered className="custom-modal">
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          ok();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Nueva Orden de Producción</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          {/* PRIMERA FILA */}
          <Row className="modal-row-2col">
            <Col className="modal-group">
              <Form.Label>Prioridad</Form.Label>
              <Form.Select
                name="prioridad"
                value={data?.prioridad || "Media"} // Usa un valor predeterminado si `data.prioridad` es undefined
                onChange={chg}
              >
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </Form.Select>
            </Col>
            <Col className="modal-group">
              <Form.Label>Proceso</Form.Label>
              <Form.Control name="proceso" value={data.proceso} onChange={chg} />
            </Col>
          </Row>

          {/* PRODUCTO */}
          <Form.Group className="modal-group">
            <Form.Label>Producto (del inventario)</Form.Label>
            <AsyncSelect
              cacheOptions
              defaultOptions={repoProductos}
              loadOptions={loadProductos}
              onChange={seleccionarProducto}
              placeholder="Seleccionar producto..."
              styles={selectStyles}
            />
            {errors.producto && (
              <div className="text-danger" style={{ fontSize: "0.9rem" }}>
                {errors.producto}
              </div>
            )}
          </Form.Group>

          {/* RESPONSABLE + CANT. PLANEADA */}
          <Row className="modal-row-2col">
            <Col className="modal-group">
              <Form.Label>Responsable</Form.Label>
              <Form.Control
                name="responsable"
                value={data.responsable}
                onChange={chg}
              />
            </Col>
            <Col className="modal-group">
              <Form.Label>Cant. planeada</Form.Label>
              <Form.Control
                type="number"
                name="cantidad_planeada"
                value={data.cantidad_planeada}
                onChange={chg}
              />
              {errors.cantidad_planeada && (
                <div className="text-danger" style={{ fontSize: "0.9rem" }}>
                  {errors.cantidad_planeada}
                </div>
              )}
            </Col>
          </Row>

          {/* FECHAS */}
          <Row className="modal-row-2col">
            <Col className="modal-group">
              <Form.Label>Inicio</Form.Label>
              <Form.Control
                type="date"
                name="fecha_inicio"
                value={data.fecha_inicio}
                onChange={chg}
              />
              {errors.fecha_inicio && (
                <div className="text-danger" style={{ fontSize: "0.9rem" }}>
                  {errors.fecha_inicio}
                </div>
              )}
            </Col>
            <Col className="modal-group">
              <Form.Label>Fin estimada</Form.Label>
              <Form.Control
                type="date"
                name="fecha_fin_estimada"
                value={data.fecha_fin_estimada}
                onChange={chg}
              />
              {errors.fecha_fin_estimada && (
                <div className="text-danger" style={{ fontSize: "0.9rem" }}>
                  {errors.fecha_fin_estimada}
                </div>
              )}
            </Col>
          </Row>

          {/* ESTADO */}
          <Form.Group className="modal-group">
            <Form.Label>Estado</Form.Label>
            <Form.Select name="estado" value={data.estado} onChange={chg}>
              <option>Planificada</option>
              <option>En proceso</option>
              <option>Control calidad</option>
              <option>Empaque</option>
              <option>Completada</option>
            </Form.Select>
          </Form.Group>

          {/* REALIDAD: cantidad_real + fecha_fin_real */}
          <Row className="modal-row-2col">
            <Col className="modal-group">
              <Form.Label>Cantidad real</Form.Label>
              <Form.Control
                type="number"
                name="cantidad_real"
                value={data.cantidad_real}
                onChange={chg}
              />
              {errors.cantidad_real && (
                <div className="text-danger" style={{ fontSize: "0.9rem" }}>
                  {errors.cantidad_real}
                </div>
              )}
            </Col>
            <Col className="modal-group">
              <Form.Label>Fecha fin real</Form.Label>
              <Form.Control
                type="date"
                name="fecha_fin_real"
                value={data.fecha_fin_real}
                onChange={chg}
              />
              {errors.fecha_fin_real && (
                <div className="text-danger" style={{ fontSize: "0.9rem" }}>
                  {errors.fecha_fin_real}
                </div>
              )}
            </Col>
          </Row>

          {/* COSTOS: estimado + real */}
          <Row className="modal-row-2col">
            <Col className="modal-group">
              <Form.Label>Costo estimado (C$)</Form.Label>
              <Form.Control
                type="number"
                name="costo_estimado"
                value={data.costo_estimado}
                onChange={chg}
              />
              {errors.costo_estimado && (
                <div className="text-danger" style={{ fontSize: "0.9rem" }}>
                  {errors.costo_estimado}
                </div>
              )}
            </Col>
            <Col className="modal-group">
              <Form.Label>Costo real (C$)</Form.Label>
              <Form.Control
                type="number"
                name="costo_real"
                value={data.costo_real}
                onChange={chg}
              />
              {errors.costo_real && (
                <div className="text-danger" style={{ fontSize: "0.9rem" }}>
                  {errors.costo_real}
                </div>
              )}
            </Col>
          </Row>

          {/* HORAS + REPROCESO */}
          <Row className="modal-row-2col">
            <Col className="modal-group">
              <Form.Label>Horas trabajadas</Form.Label>
              <Form.Control
                type="number"
                name="horas_trabajadas"
                value={data.horas_trabajadas}
                onChange={chg}
              />
              {errors.horas_trabajadas && (
                <div className="text-danger" style={{ fontSize: "0.9rem" }}>
                  {errors.horas_trabajadas}
                </div>
              )}
            </Col>
            <Col className="modal-group d-flex align-items-center">
              <Form.Check
                type="checkbox"
                name="es_reproceso"
                label="Es reproceso"
                checked={data.es_reproceso}
                onChange={chgCheckbox}
              />
            </Col>
          </Row>

          {/* SI ES REPROCESO, mostrar detalles */}
          {data.es_reproceso && (
            <Row className="modal-row-2col">
              <Col className="modal-group">
                <Form.Label>Cantidad reprocesada</Form.Label>
                <Form.Control
                  type="number"
                  name="cantidad_reprocesada"
                  value={data.cantidad_reprocesada}
                  onChange={chg}
                />
                {errors.cantidad_reprocesada && (
                  <div className="text-danger" style={{ fontSize: "0.9rem" }}>
                    {errors.cantidad_reprocesada}
                  </div>
                )}
              </Col>
              <Col className="modal-group">
                <Form.Label>Motivo reproceso</Form.Label>
                <Form.Control
                  type="text"
                  name="motivo_reproceso"
                  value={data.motivo_reproceso}
                  onChange={chg}
                />
                {errors.motivo_reproceso && (
                  <div className="text-danger" style={{ fontSize: "0.9rem" }}>
                    {errors.motivo_reproceso}
                  </div>
                )}
              </Col>
            </Row>
          )}

          {/* INSUMOS */}
          <Form.Group className="modal-group">
            <Form.Label>Insumos (materias primas)</Form.Label>
            <AsyncSelect
              cacheOptions
              defaultOptions={repoInsumos}
              loadOptions={loadInsumos}
              onChange={addInsumo}
              placeholder="Seleccionar materia prima..."
              styles={selectStyles}
            />
            <ul className="mp-list">
              {data.materias_primas.map((m, i) => (
                <li key={m.id}>
                  {m.nombre}
                  <input
                    type="number"
                    value={m.cantidad_usada}
                    onChange={(e) => qty(i, e.target.value)}
                    className="mp-input"
                  />
                  {errors[`materia_${i}`] && (
                    <div className="text-danger" style={{ fontSize: "0.9rem" }}>
                      {errors[`materia_${i}`]}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="modal-footer">
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
