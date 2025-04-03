import React, { useState, useEffect } from 'react'
import { Table, Button } from 'react-bootstrap'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../database/firebaseconfig'
import { useAuth } from '../../database/authcontext'
import { FaEdit, FaTrash } from 'react-icons/fa'
const TablaIngresos = ({ onEdit, onDelete, refresh }) => {
  const [ingresos, setIngresos] = useState([])
  const { user } = useAuth()
  const fetchIngresos = async () => {
    try {
      const q = query(collection(db, 'ingresos'), where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)
      const list = []
      querySnapshot.forEach(doc => { list.push({ id: doc.id, ...doc.data() }) })
      setIngresos(list)
    } catch (error) { console.error(error) }
  }
  useEffect(() => { fetchIngresos() }, [refresh])
  return (
    <Table striped bordered hover responsive className="tabla-ingresos">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Documento</th>
          <th>Nº Factura</th>
          <th>Cliente</th>
          <th>Total con IVA</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ingresos.map(ingreso => (
          <tr key={ingreso.id}>
            <td>{ingreso.fechaTransaccion}</td>
            <td>{ingreso.tipoDocumento}</td>
            <td>{ingreso.numeroFactura}</td>
            <td>{ingreso.cliente.nombre}</td>
            <td>{ingreso.totalConIVA}</td>
            <td>
              <Button variant="warning" size="sm" onClick={() => onEdit(ingreso)}>
                <FaEdit />
              </Button>{' '}
              <Button variant="danger" size="sm" onClick={() => onDelete(ingreso)}>
                <FaTrash />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
export default TablaIngresos
