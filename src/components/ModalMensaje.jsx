import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../styles/ModalMensaje.css";


function ModalMensaje({ show, handleClose, message, className }) {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className={`modal-mensaje ${className || ""}`}
    >
      <Modal.Header closeButton>
        <Modal.Title>Mensaje</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalMensaje;
