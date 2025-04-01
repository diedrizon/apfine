import React from "react";
import { Table, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaCategorias = ({ categorias, openEditModal, openDeleteModal }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Color</th>
          <th>Ícono</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {categorias.map(categoria => (
          <tr key={categoria.id}>
            <td>{categoria.nombre}</td>
            <td>{categoria.descripcion}</td>
            <td>
              <div style={{ width: "20px", height: "20px", backgroundColor: categoria.color, borderRadius: "50%", display: "inline-block", marginRight: "5px" }} />
              {categoria.color}
            </td>
            <td>{categoria.icono}</td>
            <td>
              <Button variant="outline-warning" size="sm" className="me-2" onClick={() => openEditModal(categoria)}>
                <i className="bi bi-pencil"></i>
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(categoria)}>
                <i className="bi bi-trash"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaCategorias;
