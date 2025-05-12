import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

function ModalEdicionUsuario({
  show,
  handleClose,
  usuarioEditado,
  setUsuarioEditado,
  handleEditUsuario,
}) {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="modal-group">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={usuarioEditado?.nombre || ""}
            onChange={(e) =>
              setUsuarioEditado({
                ...usuarioEditado,
                [e.target.name]: e.target.value,
              })
            }
          />
        </Form.Group>
        <Form.Group className="modal-group">
          <Form.Label>Correo</Form.Label>
          <Form.Control
            type="email"
            name="correo"
            value={usuarioEditado?.correo || ""}
            onChange={(e) =>
              setUsuarioEditado({
                ...usuarioEditado,
                [e.target.name]: e.target.value,
              })
            }
          />
        </Form.Group>
        <Form.Group className="modal-group">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            name="telefono"
            value={usuarioEditado?.telefono || ""}
            onChange={(e) =>
              setUsuarioEditado({
                ...usuarioEditado,
                [e.target.name]: e.target.value,
              })
            }
          />
        </Form.Group>
        <Form.Group className="modal-group">
          <Form.Label>Rol</Form.Label>
          <Form.Select
            name="rol"
            value={usuarioEditado?.rol || "Beneficiario"}
            onChange={(e) =>
              setUsuarioEditado({
                ...usuarioEditado,
                [e.target.name]: e.target.value,
              })
            }
          >
            <option>Beneficiario</option>
            <option>Administrador</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="modal-group">
          <Form.Label>Departamento</Form.Label>
          <Form.Control
            type="text"
            name="departamento"
            value={usuarioEditado?.departamento || ""}
            onChange={(e) =>
              setUsuarioEditado({
                ...usuarioEditado,
                departamento: e.target.value,
              })
            }
          />
        </Form.Group>

        <Form.Group className="modal-group">
          <Form.Label>Activo</Form.Label>
          <Form.Select
            name="activo"
            value={usuarioEditado?.activo ? "true" : "false"}
            onChange={(e) =>
              setUsuarioEditado({
                ...usuarioEditado,
                activo: e.target.value === "true",
              })
            }
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </Form.Select>
        </Form.Group>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={() => handleEditUsuario(usuarioEditado)}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEdicionUsuario;
