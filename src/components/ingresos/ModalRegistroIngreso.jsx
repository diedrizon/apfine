import React, { useState } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../database/firebaseconfig'
import { useAuth } from '../../database/authcontext'
const ModalRegistroIngreso = ({ show, handleClose, refreshCallback }) => {
  const { user } = useAuth()
  const [fechaTransaccion, setFechaTransaccion] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [numeroFactura, setNumeroFactura] = useState('')
  const [cliente, setCliente] = useState({ nombre: '', rucCedula: '', direccion: '', contacto: '' })
  const [descripcionVenta, setDescripcionVenta] = useState('')
  const [detalle, setDetalle] = useState([{ cantidad: '', unidad: '', precioUnitario: '', subtotalItem: '' }])
  const [subtotalVenta, setSubtotalVenta] = useState('')
  const [descuento, setDescuento] = useState('')
  const [iva, setIva] = useState('')
  const [totalConIVA, setTotalConIVA] = useState('')
  const [condicionPago, setCondicionPago] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [formaPago, setFormaPago] = useState('')
  const [retenciones, setRetenciones] = useState({ ir: '', iva: '' })
  const [observaciones, setObservaciones] = useState('')
  const registrarIngreso = async (e) => {
    e.preventDefault()
    const nuevoIngreso = {
      fechaTransaccion,
      tipoDocumento,
      numeroFactura,
      cliente,
      descripcionVenta,
      detalle,
      subtotalVenta,
      descuento,
      iva,
      totalConIVA,
      condicionPago,
      fechaVencimiento,
      formaPago,
      retenciones,
      observaciones,
      userId: user.uid,
      creadoEn: new Date()
    }
    try {
      await addDoc(collection(db, 'ingresos'), nuevoIngreso)
      handleClose()
      refreshCallback()
    } catch (error) { console.error(error) }
  }
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Registrar Ingreso</Modal.Title>
      </Modal.Header>
      <Form onSubmit={registrarIngreso}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Fecha</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="date" value={fechaTransaccion} onChange={e => setFechaTransaccion(e.target.value)} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Documento</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="text" value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Nº Factura</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="text" value={numeroFactura} onChange={e => setNumeroFactura(e.target.value)} required />
            </Col>
          </Row>
          <fieldset className="mb-3">
            <legend className="sub-legend">Cliente</legend>
            <Row className="mb-3">
              <Col md={4}><Form.Label>Nombre</Form.Label></Col>
              <Col md={8}>
                <Form.Control type="text" value={cliente.nombre} onChange={e => setCliente({ ...cliente, nombre: e.target.value })} required />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><Form.Label>RUC/Cédula</Form.Label></Col>
              <Col md={8}>
                <Form.Control type="text" value={cliente.rucCedula} onChange={e => setCliente({ ...cliente, rucCedula: e.target.value })} required />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><Form.Label>Dirección</Form.Label></Col>
              <Col md={8}>
                <Form.Control type="text" value={cliente.direccion} onChange={e => setCliente({ ...cliente, direccion: e.target.value })} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><Form.Label>Contacto</Form.Label></Col>
              <Col md={8}>
                <Form.Control type="text" value={cliente.contacto} onChange={e => setCliente({ ...cliente, contacto: e.target.value })} />
              </Col>
            </Row>
          </fieldset>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Descripción</Form.Label></Col>
            <Col md={8}>
              <Form.Control as="textarea" rows={2} value={descripcionVenta} onChange={e => setDescripcionVenta(e.target.value)} />
            </Col>
          </Row>
          {detalle.map((item, index) => (
            <Row className="mb-3" key={index}>
              <Col md={4}>
                <Form.Control type="number" placeholder="Cantidad" value={item.cantidad} onChange={e => {
                  const nuevos = [...detalle]
                  nuevos[index].cantidad = e.target.value
                  nuevos[index].subtotalItem = e.target.value * (nuevos[index].precioUnitario || 0)
                  setDetalle(nuevos)
                }} required />
              </Col>
              <Col md={4}>
                <Form.Control type="text" placeholder="Unidad" value={item.unidad} onChange={e => {
                  const nuevos = [...detalle]
                  nuevos[index].unidad = e.target.value
                  setDetalle(nuevos)
                }} required />
              </Col>
              <Col md={4}>
                <Form.Control type="number" placeholder="Precio Unitario" value={item.precioUnitario} onChange={e => {
                  const nuevos = [...detalle]
                  nuevos[index].precioUnitario = e.target.value
                  nuevos[index].subtotalItem = e.target.value * (nuevos[index].cantidad || 0)
                  setDetalle(nuevos)
                }} required />
              </Col>
            </Row>
          ))}
          <Row className="mb-3">
            <Col md={4}><Form.Label>Subtotal Venta</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="number" value={subtotalVenta} onChange={e => setSubtotalVenta(e.target.value)} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Descuento</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="number" value={descuento} onChange={e => setDescuento(e.target.value)} />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>IVA (15%)</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="number" value={iva} onChange={e => setIva(e.target.value)} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Total con IVA</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="number" value={totalConIVA} onChange={e => setTotalConIVA(e.target.value)} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Condición de Pago</Form.Label></Col>
            <Col md={8}>
              <Form.Select value={condicionPago} onChange={e => setCondicionPago(e.target.value)} required>
                <option value="">Seleccione</option>
                <option value="Contado">Contado</option>
                <option value="Crédito">Crédito</option>
              </Form.Select>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Plazo/Vencimiento</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="date" value={fechaVencimiento} onChange={e => setFechaVencimiento(e.target.value)} />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Forma de Pago</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="text" value={formaPago} onChange={e => setFormaPago(e.target.value)} required />
            </Col>
          </Row>
          <fieldset className="mb-3">
            <legend className="sub-legend">Retenciones</legend>
            <Row className="mb-3">
              <Col md={4}><Form.Label>Retención IR</Form.Label></Col>
              <Col md={8}>
                <Form.Control type="number" value={retenciones.ir} onChange={e => setRetenciones({ ...retenciones, ir: e.target.value })} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><Form.Label>Retención IVA</Form.Label></Col>
              <Col md={8}>
                <Form.Control type="number" value={retenciones.iva} onChange={e => setRetenciones({ ...retenciones, iva: e.target.value })} />
              </Col>
            </Row>
          </fieldset>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Observaciones</Form.Label></Col>
            <Col md={8}>
              <Form.Control as="textarea" rows={2} value={observaciones} onChange={e => setObservaciones(e.target.value)} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" type="submit">Registrar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
export default ModalRegistroIngreso
