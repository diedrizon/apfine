import React from "react"
import { Modal, Button } from "react-bootstrap"
import { FaExclamationTriangle } from "react-icons/fa"

export default function ModalEliminacionOrden({ show, close, data, confirm }) {
  return (
    <Modal show={show} onHide={close} centered className="modal-mensaje">
      <Modal.Header closeButton />
      <Modal.Body className="modal-warning-body">
        <FaExclamationTriangle className="warning-icon" />
        <p>
          ¿Estás seguro de eliminar la orden&nbsp;
          <strong>{data?.producto}</strong>?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={confirm}>
          Sí, eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
