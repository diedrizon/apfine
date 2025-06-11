import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { db } from "../../database/firebaseconfig";
import { doc, getDoc } from "firebase/firestore";

function ModalEditarCantidad({ show, handleClose, item, handleSave }) {
  const [cantidad, setCantidad] = useState("");
  const [stockDisponible, setStockDisponible] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show && item) {
      setCantidad(item.cantidad.toString());
      setError("");
      (async () => {
        try {
          const snap = await getDoc(doc(db, "inventario", item.id));
          if (snap.exists()) {
            setStockDisponible(Number(snap.data().stock_actual));
          } else {
            setStockDisponible(item.stock_actual ?? 0);
          }
        } catch {
          setStockDisponible(item.stock_actual ?? 0);
        }
      })();
    }
  }, [show, item]);

  const onSave = () => {
    const qty = Number(cantidad);
    if (!qty || qty < 1) {
      setError("Ingresa cantidad > 0");
      return;
    }
    const diferencia = qty - item.cantidad;
    if (diferencia > stockDisponible) {
      setError("Supera el stock disponible");
      return;
    }
    handleSave(qty);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Cantidad</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Cantidad</Form.Label>
          <Form.Control
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => {
              setCantidad(e.target.value);
              if (error) setError("");
            }}
            className={error ? "is-invalid" : ""}
          />
          {error && (
            <Form.Control.Feedback style={{ display: "block" }} type="invalid">
              {error}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSave}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEditarCantidad;
