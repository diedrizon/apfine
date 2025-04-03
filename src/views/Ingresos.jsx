import React, { useState } from 'react'
import { Button, Container, Row, Col } from 'react-bootstrap'
import TablaIngresos from '../components/ingresos/TablaIngresos'
import ModalRegistroIngreso from '../components/ingresos/ModalRegistroIngreso'
import ModalEdicionIngreso from '../components/ingresos/ModalEdicionIngreso'
import ModalEliminacionIngreso from '../components/ingresos/ModalEliminacionIngreso'
import '../styles/Ingresos.css'
const Ingresos = () => {
  const [showRegistro, setShowRegistro] = useState(false)
  const [showEdicion, setShowEdicion] = useState(false)
  const [showEliminacion, setShowEliminacion] = useState(false)
  const [selectedIngreso, setSelectedIngreso] = useState(null)
  const [refresh, setRefresh] = useState(false)
  const refreshCallback = () => setRefresh(!refresh)
  const openRegistro = () => setShowRegistro(true)
  const closeRegistro = () => setShowRegistro(false)
  const openEdicion = (ingreso) => { setSelectedIngreso(ingreso); setShowEdicion(true) }
  const closeEdicion = () => { setSelectedIngreso(null); setShowEdicion(false) }
  const openEliminacion = (ingreso) => { setSelectedIngreso(ingreso); setShowEliminacion(true) }
  const closeEliminacion = () => { setSelectedIngreso(null); setShowEliminacion(false) }
  return (
    <Container fluid className="ingresos-container">
      <Row className="mb-3">
        <Col>
          <h2 className="text-center">Ingresos (Ventas)</h2>
        </Col>
      </Row>
      <Row className="mb-3 justify-content-end">
        <Col xs="auto">
          <Button variant="primary" onClick={openRegistro}>
            <i className="bi bi-plus-circle"></i> Registrar Ingreso
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <TablaIngresos onEdit={openEdicion} onDelete={openEliminacion} refresh={refresh} />
        </Col>
      </Row>
      <ModalRegistroIngreso show={showRegistro} handleClose={closeRegistro} refreshCallback={refreshCallback} />
      <ModalEdicionIngreso show={showEdicion} handleClose={closeEdicion} ingreso={selectedIngreso} refreshCallback={refreshCallback} />
      <ModalEliminacionIngreso show={showEliminacion} handleClose={closeEliminacion} ingreso={selectedIngreso} refreshCallback={refreshCallback} />
    </Container>
  )
}
export default Ingresos
