import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../database/firebaseconfig'
const ModalEliminacionIngreso = ({ show, handleClose, ingreso, refreshCallback }) => {
  const eliminarIngreso = async () => {
    try {
      await deleteDoc(doc(db, 'ingresos', ingreso.id))
      handleClose()
      refreshCallback()
    } catch (error) { console.error(error) }
  }
  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Eliminar Ingreso</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Eliminar ingreso de factura Nº {ingreso && ingreso.numeroFactura}?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
        <Button variant="danger" onClick={eliminarIngreso}>Eliminar</Button>
      </Modal.Footer>
    </Modal>
  )
}
export default ModalEliminacionIngreso
