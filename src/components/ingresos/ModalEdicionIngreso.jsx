import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../database/firebaseconfig'
const ModalEdicionIngreso = ({ show, handleClose, ingreso, refreshCallback }) => {
  const [formData, setFormData] = useState({
    fechaTransaccion: '',
    tipoDocumento: '',
    numeroFactura: '',
    cliente: { nombre: '', rucCedula: '', direccion: '', contacto: '' },
    descripcionVenta: '',
    detalle: [],
    subtotalVenta: '',
    descuento: '',
    iva: '',
    totalConIVA: '',
    condicionPago: '',
    fechaVencimiento: '',
    formaPago: '',
    retenciones: { ir: '', iva: '' },
    observaciones: ''
  })
  useEffect(() => { if (ingreso) setFormData(ingreso) }, [ingreso])
  const actualizarIngreso = async (e) => {
    e.preventDefault()
    try {
      await updateDoc(doc(db, 'ingresos', ingreso.id), formData)
      handleClose()
      refreshCallback()
    } catch (error) { console.error(error) }
  }
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Editar Ingreso</Modal.Title>
      </Modal.Header>
      <Form onSubmit={actualizarIngreso}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Fecha</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="date" value={formData.fechaTransaccion} onChange={e => setFormData({ ...formData, fechaTransaccion: e.target.value })} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Documento</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="text" value={formData.tipoDocumento} onChange={e => setFormData({ ...formData, tipoDocumento: e.target.value })} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Nº Factura</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="text" value={formData.numeroFactura} onChange={e => setFormData({ ...formData, numeroFactura: e.target.value })} required />
            </Col>
          </Row>
          <fieldset className="mb-3">
            <legend className="sub-legend">Cliente</legend>
            <Row className="mb-3">
              <Col md={4}><Form.Label>Nombre</Form.Label></Col>
              <Col md={8}>
                <Form.Control type="text" value={formData.cliente.nombre} onChange={e => setFormData({ ...formData, cliente: { ...formData.cliente, nombre: e.target.value } })} required />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><Form.Label>RUC/Cédula</Form.Label></Col>
              <Col md={8}>
                <Form.Control type="text" value={formData.cliente.rucCedula} onChange={e => setFormData({ ...formData, cliente: { ...formData.cliente, rucCedula: e.target.value } })} required />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><Form.Label>Dirección</Form.Label></Col>
              <Col md={8}>
                <Form.Control type="text" value={formData.cliente.direccion} onChange={e => setFormData({ ...formData, cliente: { ...formData.cliente, direccion: e.target.value } })} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><Form.Label>Contacto</Form.Label></Col>
              <Col md={8}>
                <Form.Control type="text" value={formData.cliente.contacto} onChange={e => setFormData({ ...formData, cliente: { ...formData.cliente, contacto: e.target.value } })} />
              </Col>
            </Row>
          </fieldset>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Descripción</Form.Label></Col>
            <Col md={8}>
              <Form.Control as="textarea" rows={2} value={formData.descripcionVenta} onChange={e => setFormData({ ...formData, descripcionVenta: e.target.value })} />
            </Col>
          </Row>
          {formData.detalle && formData.detalle.map((item, index) => (
            <Row className="mb-3" key={index}>
              <Col md={4}>
                <Form.Control type="number" placeholder="Cantidad" value={item.cantidad} onChange={e => {
                  const nuevos = [...formData.detalle]
                  nuevos[index].cantidad = e.target.value
                  nuevos[index].subtotalItem = e.target.value * (nuevos[index].precioUnitario || 0)
                  setFormData({ ...formData, detalle: nuevos })
                }} required />
              </Col>
              <Col md={4}>
                <Form.Control type="text" placeholder="Unidad" value={item.unidad} onChange={e => {
                  const nuevos = [...formData.detalle]
                  nuevos[index].unidad = e.target.value
                  setFormData({ ...formData, detalle: nuevos })
                }} required />
              </Col>
              <Col md={4}>
                <Form.Control type="number" placeholder="Precio Unitario" value={item.precioUnitario} onChange={e => {
                  const nuevos = [...formData.detalle]
                  nuevos[index].precioUnitario = e.target.value
                  nuevos[index].subtotalItem = e.target.value * (nuevos[index].cantidad || 0)
                  setFormData({ ...formData, detalle: nuevos })
                }} required />
              </Col>
            </Row>
          ))}
          <Row className="mb-3">
            <Col md={4}><Form.Label>Subtotal Venta</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="number" value={formData.subtotalVenta} onChange={e => setFormData({ ...formData, subtotalVenta: e.target.value })} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Descuento</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="number" value={formData.descuento} onChange={e => setFormData({ ...formData, descuento: e.target.value })} />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>IVA (15%)</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="number" value={formData.iva} onChange={e => setFormData({ ...formData, iva: e.target.value })} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Total con IVA</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="number" value={formData.totalConIVA} onChange={e => setFormData({ ...formData, totalConIVA: e.target.value })} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Condición de Pago</Form.Label></Col>
            <Col md={8}>
              <Form.Select value={formData.condicionPago} onChange={e => setFormData({ ...formData, condicionPago: e.target.value })} required>
                <option value="">Seleccione</option>
                <option value="Contado">Contado</option>
                <option value="Crédito">Crédito</option>
              </Form.Select>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Plazo/Vencimiento</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="date" value={formData.fechaVencimiento} onChange={e => setFormData({ ...formData, fechaVencimiento: e.target.value })} />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Forma de Pago</Form.Label></Col>
            <Col md={8}>
              <Form.Control type="text" value={formData.formaPago} onChange={e => setFormData({ ...formData, formaPago: e.target.value })} required />
            </Col>
          </Row>
          <fieldset className="mb-3">
            <legend className="sub-legend">Retenciones</legend>
            <Row className="mb-3">
              <Col md={4}><Form.Label>Retención IR</Form.Label></Col>
              <Col md={8}>
                <Form.Control type="number" value={formData.retenciones.ir} onChange={e => setFormData({ ...formData, retenciones: { ...formData.retenciones, ir: e.target.value } })} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><Form.Label>Retención IVA</Form.Label></Col>
              <Col md={8}>
                <Form.Control type="number" value={formData.retenciones.iva} onChange={e => setFormData({ ...formData, retenciones: { ...formData.retenciones, iva: e.target.value } })} />
              </Col>
            </Row>
          </fieldset>
          <Row className="mb-3">
            <Col md={4}><Form.Label>Observaciones</Form.Label></Col>
            <Col md={8}>
              <Form.Control as="textarea" rows={2} value={formData.observaciones} onChange={e => setFormData({ ...formData, observaciones: e.target.value })} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" type="submit">Actualizar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
export default ModalEdicionIngreso
