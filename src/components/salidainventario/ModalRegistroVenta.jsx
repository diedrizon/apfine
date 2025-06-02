import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Card, Row, Col } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import * as FaIcons from "react-icons/fa";
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

  useEffect(() => {
    if (!show) {
      setSelProducto([]);
      setSelCantidad("");
      setCarrito([]);
      setCliente("");
      setConfCategoria([]);
      setConfMedio([]);
    }
  }, [show]);

  const opcionesProductos = productos.filter(
    (p) => !carrito.some((c) => c.id === p.id)
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
  };

  const eliminarLinea = (i) =>
    setCarrito(carrito.filter((_, idx) => idx !== i));

  const editarLinea = (i) => {
    const actual = carrito[i];
    const nueva = parseInt(prompt("Nueva cantidad:", actual.cantidad), 10);
    if (!nueva || nueva < 1 || nueva > actual.stock_actual) {
      return alert("Cantidad inválida");
    }
    const updated = [...carrito];
    updated[i] = { ...actual, cantidad: nueva };
    setCarrito(updated);
  };

  const totalVenta = carrito.reduce(
    (s, c) => s + c.cantidad * Number(c.precio || c.precio_unitario || 0),
    0
  );

  const confirmarRegistro = () => {
    if (!confCategoria.length) {
      return alert("Selecciona categoría de ingreso");
    }
    if (!confMedio.length) {
      return alert("Selecciona medio de pago");
    }
    if (!cliente.trim()) {
      return alert("Debes especificar Cliente / Motivo");
    }
    if (!carrito.length) {
      return alert("El carrito está vacío");
    }

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
    <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Registrar Venta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Cliente / Motivo</Form.Label>
          <Form.Control
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />
        </Form.Group>

        <Row className="gx-3 mb-3">
          <Col md={5}>
            <Form.Label>Producto</Form.Label>
            <Typeahead
              id="th-producto-registro"
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
            onChange={setConfCategoria}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Medio de Pago</Form.Label>
          <Typeahead
            id="th-medio-registro"
            labelKey="label"
            options={medioOpciones}
            placeholder="Seleccionar medio..."
            selected={confMedio}
            onChange={setConfMedio}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={confirmarRegistro}>
          Confirmar Venta
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalRegistroVenta;
