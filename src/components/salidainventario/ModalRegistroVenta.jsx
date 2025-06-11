import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Card, Row, Col } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import * as FaIcons from "react-icons/fa";
import ModalEditarCantidad from "./ModalEditarCantidad";
import "react-bootstrap-typeahead/css/Typeahead.css";

function ModalRegistroVenta({
  show,
  handleClose,
  productos,
  categoriasIngreso,
  medioOpciones,
  handleAddVenta,
}) {
  const [selProducto, setSelProducto] = useState([]);
  const [selCantidad, setSelCantidad] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState("");
  const [confCategoria, setConfCategoria] = useState([]);
  const [confMedio, setConfMedio] = useState([]);
  const [errors, setErrors] = useState({});
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    if (!show) {
      setSelProducto([]);
      setSelCantidad("");
      setCarrito([]);
      setCliente("");
      setConfCategoria([]);
      setConfMedio([]);
      setErrors({});
      setShowQtyModal(false);
      setEditIndex(null);
    }
  }, [show]);

  const opcionesProductos = productos.filter(
    (p) => !carrito.some((c) => c.id === p.id)
  );

  const agregarAlCarrito = () => {
    const newErrors = {};
    if (!selProducto.length) newErrors.producto = "Selecciona un producto";
    if (!selCantidad || Number(selCantidad) < 1)
      newErrors.cantidad = "Ingresa cantidad > 0";
    if (Object.keys(newErrors).length) {
      setErrors({ ...errors, ...newErrors });
      return;
    }
    const prod = selProducto[0];
    const qty = Number(selCantidad);
    if (qty > prod.stock_actual) {
      alert("La cantidad supera el stock disponible");
      return;
    }
    setCarrito([
      ...carrito,
      {
        id: prod.id,
        nombre: prod.nombre_producto,
        cantidad: qty,
        precio: Number(prod.precio_venta || prod.precio_unitario || 0),
        stock_actual: prod.stock_actual,
      },
    ]);
    setSelProducto([]);
    setSelCantidad("");
    setErrors((prev) => ({
      ...prev,
      producto: null,
      cantidad: null,
      carrito: null,
    }));
  };

  const eliminarLinea = (i) =>
    setCarrito(carrito.filter((_, idx) => idx !== i));

  const abrirEditarCantidad = (i) => {
    setEditIndex(i);
    setShowQtyModal(true);
  };

  const guardarCantidad = (qty) => {
    const updated = [...carrito];
    updated[editIndex] = { ...updated[editIndex], cantidad: qty };
    setCarrito(updated);
  };

  const totalVenta = carrito.reduce(
    (s, c) => s + c.cantidad * Number(c.precio || c.precio_unitario || 0),
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!cliente.trim()) newErrors.cliente = "Este campo es obligatorio";
    if (!carrito.length) newErrors.carrito = "Debes agregar al menos un producto";
    if (!confCategoria.length) newErrors.categoria = "Selecciona una categoría";
    if (!confMedio.length) newErrors.medio = "Selecciona medio de pago";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    handleAddVenta({
      cliente,
      carrito,
      total: totalVenta,
      categoria: confCategoria[0],
      medio_pago: confMedio[0].label,
    });
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="md"
      backdrop="static"
      keyboard={false}
      centered
      dialogClassName="si-custom-modal"
      scrollable
    >
      <Modal.Header closeButton>
        <FaIcons.FaPiggyBank style={{ fontSize: 24, marginRight: 8 }} />
        <Modal.Title>Registrar Venta</Modal.Title>
      </Modal.Header>
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Cliente / Motivo</Form.Label>
            <Form.Control
              type="text"
              value={cliente}
              onChange={(e) => {
                setCliente(e.target.value);
                if (errors.cliente) setErrors((p) => ({ ...p, cliente: null }));
              }}
              className={errors.cliente ? "is-invalid" : ""}
            />
            {errors.cliente && (
              <Form.Control.Feedback type="invalid">
                {errors.cliente}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Row className="gx-3 mb-3">
            <Col md={6}>
              <Form.Label>Producto</Form.Label>
              <Typeahead
                id="th-producto-registro"
                labelKey="nombre_producto"
                options={opcionesProductos}
                placeholder="Buscar producto..."
                selected={selProducto}
                onChange={(sel) => {
                  setSelProducto(sel);
                  if (errors.producto) setErrors((p) => ({ ...p, producto: null }));
                }}
                className={errors.producto ? "is-invalid" : ""}
              />
              {errors.producto && (
                <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
                  {errors.producto}
                </Form.Control.Feedback>
              )}
            </Col>

            <Col md={3}>
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={selCantidad}
                onChange={(e) => {
                  setSelCantidad(e.target.value);
                  if (errors.cantidad) setErrors((p) => ({ ...p, cantidad: null }));
                }}
                className={errors.cantidad ? "is-invalid" : ""}
              />
              {errors.cantidad && (
                <Form.Control.Feedback type="invalid">
                  {errors.cantidad}
                </Form.Control.Feedback>
              )}
            </Col>

            <Col md={3} className="d-grid align-self-end">
              <Button onClick={agregarAlCarrito}>Añadir</Button>
            </Col>
          </Row>

          {carrito.length > 0 ? (
            carrito.map((c, i) => {
              const precioUnitario = Number(c.precio || c.precio_unitario || 0);
              const subtotal = c.cantidad * precioUnitario;
              return (
                <Card key={i} className="si-item-card mb-2">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{c.nombre}</strong>
                      <div>
                        {c.cantidad} × C${precioUnitario.toFixed(2)} ={" "}
                        <em>C${subtotal.toFixed(2)}</em>
                      </div>
                    </div>
                    <div className="si-item-actions">
                      <Button
                        variant="link"
                        onClick={() => abrirEditarCantidad(i)}
                        title="Editar"
                      >
                        <FaIcons.FaEdit />
                      </Button>
                      <Button
                        variant="link"
                        onClick={() => eliminarLinea(i)}
                        title="Eliminar"
                      >
                        <FaIcons.FaTrash />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              );
            })
          ) : (
            <p>No hay productos cargados.</p>
          )}

          {errors.carrito && (
            <p style={{ color: "red" }}>{errors.carrito}</p>
          )}

          {carrito.length > 0 && (
            <Card className="si-summary mt-3">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <h5>Total: C${totalVenta.toFixed(2)}</h5>
              </Card.Body>
            </Card>
          )}

          <hr />

          <Form.Group className="mb-3">
            <Form.Label>Categoría de Ingreso</Form.Label>
            <Typeahead
              id="th-cat-registro"
              labelKey="nombre"
              options={categoriasIngreso}
              placeholder="Buscar categoría..."
              selected={confCategoria}
              onChange={(sel) => {
                setConfCategoria(sel);
                if (errors.categoria) setErrors((p) => ({ ...p, categoria: null }));
              }}
              className={errors.categoria ? "is-invalid" : ""}
            />
            {errors.categoria && (
              <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
                {errors.categoria}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group>
            <Form.Label>Medio de Pago</Form.Label>
            <Typeahead
              id="th-medio-registro"
              labelKey="label"
              options={medioOpciones}
              placeholder="Seleccionar medio..."
              selected={confMedio}
              onChange={(sel) => {
                setConfMedio(sel);
                if (errors.medio) setErrors((p) => ({ ...p, medio: null }));
              }}
              className={errors.medio ? "is-invalid" : ""}
            />
            {errors.medio && (
              <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
                {errors.medio}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Confirmar Venta
          </Button>
        </Modal.Footer>
      </Form>
      <ModalEditarCantidad
        show={showQtyModal}
        handleClose={() => setShowQtyModal(false)}
        item={editIndex !== null ? carrito[editIndex] : null}
        handleSave={guardarCantidad}
      />
    </Modal>
  );
}

export default ModalRegistroVenta;
