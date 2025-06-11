import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Card, Row, Col } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import * as FaIcons from "react-icons/fa";
import ModalEditarCantidad from "./ModalEditarCantidad";
import "react-bootstrap-typeahead/css/Typeahead.css";

function ModalEdicionVenta({
  show,
  handleClose,
  productos,
  categoriasIngreso,
  medioOpciones,
  ventaEditada,
  setVentaEditada,
  handleEditVenta,
}) {
  const [selProducto, setSelProducto] = useState([]);
  const [selCantidad, setSelCantidad] = useState("");
  const [errors, setErrors] = useState({});
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    if (!show) {
      setSelProducto([]);
      setSelCantidad("");
      setErrors({});
      setShowQtyModal(false);
      setEditIndex(null);
    }
  }, [show]);

  const items = ventaEditada?.items || [];
  const opcionesProductos = productos.filter(
    (p) => !items.some((c) => c.id === p.id)
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
    setVentaEditada((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: prod.id,
          nombre: prod.nombre_producto,
          cantidad: qty,
          precio: Number(prod.precio_venta || prod.precio_unitario || 0),
          stock_actual: prod.stock_actual,
        },
      ],
    }));
    setSelProducto([]);
    setSelCantidad("");
    setErrors((p) => ({ ...p, producto: null, cantidad: null, carrito: null }));
  };

  const eliminarLinea = (i) =>
    setVentaEditada((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== i),
    }));

  const abrirEditarCantidad = (i) => {
    setEditIndex(i);
    setShowQtyModal(true);
  };

  const guardarCantidad = (qty) => {
    const updated = [...items];
    updated[editIndex] = { ...updated[editIndex], cantidad: qty };
    setVentaEditada((prev) => ({ ...prev, items: updated }));
  };

  const totalVenta = items.reduce(
    (s, c) => s + c.cantidad * Number(c.precio || c.precio_unitario || 0),
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!ventaEditada?.cliente?.trim())
      newErrors.cliente = "Este campo es obligatorio";
    if (!items.length) newErrors.carrito = "Debes agregar al menos un producto";
    if (!ventaEditada?.categoria)
      newErrors.categoria = "Selecciona una categoría";
    if (!ventaEditada?.medio_pago)
      newErrors.medio = "Selecciona medio de pago";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    handleEditVenta({ ...ventaEditada, total: totalVenta });
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
        <Modal.Title>Editar Venta</Modal.Title>
      </Modal.Header>
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Body>
          {ventaEditada ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Cliente / Motivo</Form.Label>
                <Form.Control
                  type="text"
                  value={ventaEditada.cliente}
                  onChange={(e) =>
                    setVentaEditada((p) => ({ ...p, cliente: e.target.value }))
                  }
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
                    id="th-producto-editar"
                    labelKey="nombre_producto"
                    options={opcionesProductos}
                    placeholder="Buscar producto..."
                    selected={selProducto}
                    onChange={(sel) => {
                      setSelProducto(sel);
                      if (errors.producto)
                        setErrors((p) => ({ ...p, producto: null }));
                    }}
                    className={errors.producto ? "is-invalid" : ""}
                  />
                  {errors.producto && (
                    <Form.Control.Feedback
                      type="invalid"
                      style={{ display: "block" }}
                    >
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
                      if (errors.cantidad)
                        setErrors((p) => ({ ...p, cantidad: null }));
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

              {items.length > 0 ? (
                items.map((c, i) => {
                  const precioUnitario = Number(
                    c.precio || c.precio_unitario || 0
                  );
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

              {items.length > 0 && (
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
                  id="th-cat-editar"
                  labelKey="nombre"
                  options={categoriasIngreso}
                  placeholder="Buscar categoría..."
                  selected={
                    ventaEditada.categoria ? [ventaEditada.categoria] : []
                  }
                  onChange={(sel) =>
                    setVentaEditada((p) => ({
                      ...p,
                      categoria: sel.length ? sel[0] : null,
                    }))
                  }
                  className={errors.categoria ? "is-invalid" : ""}
                />
                {errors.categoria && (
                  <Form.Control.Feedback
                    type="invalid"
                    style={{ display: "block" }}
                  >
                    {errors.categoria}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Form.Group>
                <Form.Label>Medio de Pago</Form.Label>
                <Typeahead
                  id="th-medio-editar"
                  labelKey="label"
                  options={medioOpciones}
                  placeholder="Seleccionar medio..."
                  selected={
                    ventaEditada.medio_pago
                      ? [{ label: ventaEditada.medio_pago }]
                      : []
                  }
                  onChange={(sel) =>
                    setVentaEditada((p) => ({
                      ...p,
                      medio_pago: sel.length ? sel[0].label : "",
                    }))
                  }
                  className={errors.medio ? "is-invalid" : ""}
                />
                {errors.medio && (
                  <Form.Control.Feedback
                    type="invalid"
                    style={{ display: "block" }}
                  >
                    {errors.medio}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </>
          ) : (
            <p>No se ha cargado ninguna venta para editar.</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!ventaEditada}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Form>

      <ModalEditarCantidad
        show={showQtyModal}
        handleClose={() => setShowQtyModal(false)}
        item={editIndex !== null ? items[editIndex] : null}
        handleSave={guardarCantidad}
      />
    </Modal>
  );
}

export default ModalEdicionVenta;
