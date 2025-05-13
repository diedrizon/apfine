import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { auth } from "../../database/firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";

const unidades = [
  "Kilogramo",
  "Libra",
  "Litro",
  "Unidad",
  "Metro",
  "Mililitro",
  "Gramo",
];

export default function ModalEdicionMateria({
  show,
  handleClose,
  materiaEditada,
  setMateriaEditada,
  handleEditMateria,
  setMensaje,
  setShowModalMensaje,
}) {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  if (!materiaEditada) return null;

  const change = (e) =>
    setMateriaEditada({
      ...materiaEditada,
      [e.target.name]: e.target.value,
    });

  const validar = () => {
    const {
      nombre,
      unidad_medida,
      stock_actual,
      stock_minimo,
      costo_unitario,
    } = materiaEditada;
    if (!nombre.trim()) {
      setMensaje("El nombre es obligatorio.");
      setShowModalMensaje(true);
      return false;
    }
    if (!unidad_medida) {
      setMensaje("Selecciona una unidad.");
      setShowModalMensaje(true);
      return false;
    }
    if (!stock_actual || stock_actual <= 0) {
      setMensaje("Stock inválido.");
      setShowModalMensaje(true);
      return false;
    }
    if (!stock_minimo || stock_minimo < 0) {
      setMensaje("Stock mínimo inválido.");
      setShowModalMensaje(true);
      return false;
    }
    if (!costo_unitario || costo_unitario <= 0) {
      setMensaje("Costo inválido.");
      setShowModalMensaje(true);
      return false;
    }
    return true;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validar()) return;

    const actualizado = {
      ...materiaEditada,
      usuario_id: materiaEditada.usuario_id || uid,
    };

    handleEditMateria(actualizado);
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Editar Insumo</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submit}>
        <Modal.Body className="modal-body">
          <Row className="modal-group">
            <Col>
              <Form.Label>Nombre*</Form.Label>
              <Form.Control
                name="nombre"
                value={materiaEditada.nombre}
                onChange={change}
                required
              />
            </Col>
            <Col sm={4}>
              <Form.Label>Unidad*</Form.Label>
              <Form.Select
                name="unidad_medida"
                value={materiaEditada.unidad_medida}
                onChange={change}
                required
              >
                <option value="">Selecciona unidad</option>
                {unidades.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <Row className="modal-group">
            <Col>
              <Form.Label>Stock actual*</Form.Label>
              <Form.Control
                type="number"
                name="stock_actual"
                value={materiaEditada.stock_actual}
                onChange={change}
                required
              />
            </Col>
            <Col>
              <Form.Label>Stock mínimo*</Form.Label>
              <Form.Control
                type="number"
                name="stock_minimo"
                value={materiaEditada.stock_minimo}
                onChange={change}
                required
              />
            </Col>
          </Row>
          <Row className="modal-group">
            <Col>
              <Form.Label>Costo unitario (C$)*</Form.Label>
              <Form.Control
                type="number"
                name="costo_unitario"
                value={materiaEditada.costo_unitario}
                onChange={change}
                required
              />
            </Col>
            <Col>
              <Form.Label>Proveedor</Form.Label>
              <Form.Control
                name="proveedor"
                value={materiaEditada.proveedor || ""}
                onChange={change}
              />
            </Col>
          </Row>
          <Form.Group className="modal-group">
            <Form.Label>Última compra</Form.Label>
            <Form.Control
              type="date"
              name="ultima_compra"
              value={materiaEditada.ultima_compra || ""}
              onChange={change}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar cambios
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
