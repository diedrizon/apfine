import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import * as FaIcons from 'react-icons/fa';

function getDocumentoIcon(tipoDocumento) {
  if (tipoDocumento.toLowerCase().includes('factura')) return <FaIcons.FaFileInvoice />;
  return <FaIcons.FaFileInvoiceDollar />;
}

const TarjetaIngreso = ({ ingreso, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => setExpanded(!expanded);
  
  return (
    <Card className={`ingreso-card ${expanded ? 'expanded' : ''}`} onClick={toggleExpand}>
      <Card.Body>
        <div className="ingreso-header">
          <div className="ingreso-icon">
            {getDocumentoIcon(ingreso.tipoDocumento)}
          </div>
          <div className="ingreso-info">
            <h5>{ingreso.numeroFactura}</h5>
            <small>{ingreso.fechaTransaccion}</small>
          </div>
          <div className="ingreso-total">
            <h5>${ingreso.totalConIVA}</h5>
          </div>
        </div>
        <div className="ingreso-client">
          <strong>{ingreso.cliente.nombre}</strong>
        </div>
        {expanded && (
          <div className="ingreso-actions">
            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(ingreso); }}>
              <FaIcons.FaEdit /> Editar
            </Button>
            <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(ingreso); }}>
              <FaIcons.FaTrash /> Eliminar
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TarjetaIngreso;
