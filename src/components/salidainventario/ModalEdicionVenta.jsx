import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Card, Row, Col } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import * as FaIcons from "react-icons/fa";
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

  useEffect(() => {
    if (!show) {
      setSelProducto([]);
      setSelCantidad("");
    }
  }, [show]);

  const items = ventaEditada?.items || [];

  const opcionesProductos = productos.filter(
    (p) => !items.some((c) => c.id === p.id)
  );

  const agregarAlCarrito = () => {
    if (!selProducto.length) {
      return alert("Debes seleccionar un producto");
    }
    if (!selCantidad || Number(selCantidad) < 1) {
      return alert("Debes ingresar una cantidad válida");
    }
    const prod = selProducto[0];
    const qty = Number(selCantidad);
    if (qty > prod.stock_actual) {
      return alert("La cantidad supera el stock disponible");
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
  };

  const eliminarLinea = (i) =>
    setVentaEditada((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== i),
    }));

  const editarLinea = (i) => {
    const actual = items[i];
    const nueva = parseInt(prompt("Nueva cantidad:", actual.cantidad), 10);
    if (!nueva || nueva < 1 || nueva > actual.stock_actual) {
      return alert("Cantidad inválida");
    }
    const updated = [...items];
    updated[i] = { ...actual, cantidad: nueva };
    setVentaEditada((prev) => ({
      ...prev,
      items: updated,
    }));
  };

  const totalVenta = items.reduce(
    (s, c) => s + c.cantidad * Number(c.precio || c.precio_unitario || 0),
    0
  );

  const confirmarEdicion = () => {
    if (!ventaEditada?.categoria) {
      return alert("Selecciona categoría de ingreso");
    }
    if (!ventaEditada?.medio_pago) {
      return alert("Selecciona medio de pago");
    }
    if (!items.length) {
      return alert("El carrito está vacío");
    }
    handleEditVenta({
      ...ventaEditada,
      total: totalVenta,
    });
    handleClose();
  };

  const handleCategoriaChange = (selected) => {
    setVentaEditada((prev) => ({
      ...prev,
      categoria: selected.length ? selected[0] : null,
    }));
  };

  const handleMedioChange = (selected) => {
    setVentaEditada((prev) => ({
      ...prev,
      medio_pago: selected.length ? selected[0].label : "",
    }));
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Editar Venta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {ventaEditada ? (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Cliente / Motivo</Form.Label>
              <Form.Control
                type="text"
                value={ventaEditada.cliente || ""}
                onChange={(e) =>
                  setVentaEditada((prev) => ({
                    ...prev,
                    cliente: e.target.value,
                  }))
                }
              />
            </Form.Group>

            <Row className="gx-3 mb-3">
              <Col md={5}>
                <Form.Label>Producto</Form.Label>
                <Typeahead
                  id="th-producto-editar"
                  labelKey="nombre_producto"
                  options={opcionesProductos}
                  placeholder="Buscar producto..."
                  selected={selProducto}
                  onChange={setSelProducto}
                />
              </Col>
              <Col md={2}>
                <Form.Label>Cantidad</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={selCantidad}
                  onChange={(e) => setSelCantidad(e.target.value)}
                />
              </Col>
              <Col md={2} className="d-grid align-self-end">
                <Button onClick={agregarAlCarrito}>Añadir</Button>
              </Col>
            </Row>

            {items.length > 0 ? (
              items.map((c, i) => {
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
                          onClick={() => editarLinea(i)}
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
                onChange={handleCategoriaChange}
              />
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
                onChange={handleMedioChange}
              />
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
        <Button
          variant="primary"
          onClick={confirmarEdicion}
          disabled={!ventaEditada}
        >
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEdicionVenta;
