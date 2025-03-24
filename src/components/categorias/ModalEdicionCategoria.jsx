import React from "react"
import { Modal, Button, Form } from "react-bootstrap"
import {
  FaHome,
  FaCar,
  FaShoppingCart,
  FaMusic,
  FaUtensils,
  FaHeart,
  FaGift,
  FaGamepad,
  FaCoffee,
  FaBus,
  FaBook,
  FaLaptop,
  FaDog,
  FaFish,
  FaRunning,
  FaTv,
  FaLightbulb,
  FaPlane,
  FaPhone,
  FaTools
} from "react-icons/fa"

const colorOptions = [
  "#F44336","#E91E63","#9C27B0","#673AB7","#3F51B5","#2196F3","#03A9F4","#00BCD4",
  "#009688","#4CAF50","#8BC34A","#CDDC39","#FFC107","#FF9800","#FF5722","#795548",
  "#607D8B"
]

const iconOptions = [
  { name: "FaHome", component: <FaHome /> },
  { name: "FaCar", component: <FaCar /> },
  { name: "FaShoppingCart", component: <FaShoppingCart /> },
  { name: "FaMusic", component: <FaMusic /> },
  { name: "FaUtensils", component: <FaUtensils /> },
  { name: "FaHeart", component: <FaHeart /> },
  { name: "FaGift", component: <FaGift /> },
  { name: "FaGamepad", component: <FaGamepad /> },
  { name: "FaCoffee", component: <FaCoffee /> },
  { name: "FaBus", component: <FaBus /> },
  { name: "FaBook", component: <FaBook /> },
  { name: "FaLaptop", component: <FaLaptop /> },
  { name: "FaDog", component: <FaDog /> },
  { name: "FaFish", component: <FaFish /> },
  { name: "FaRunning", component: <FaRunning /> },
  { name: "FaTv", component: <FaTv /> },
  { name: "FaLightbulb", component: <FaLightbulb /> },
  { name: "FaPlane", component: <FaPlane /> },
  { name: "FaPhone", component: <FaPhone /> },
  { name: "FaTools", component: <FaTools /> }
]

function ModalEdicionCategoria({
  show,
  handleClose,
  categoriaEditada,
  setCategoriaEditada,
  handleChangeEditada,
  handleEditCategoria
}) {
  if (!categoriaEditada) return null

  function handleSelectColor(color) {
    setCategoriaEditada(prev => ({ ...prev, color }))
  }

  function handleSelectIcon(iconName) {
    setCategoriaEditada(prev => ({ ...prev, icono: iconName }))
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      style={{ marginTop: "70px", zIndex: 1400 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Categoría</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombre de la categoría"
            name="nombre"
            value={categoriaEditada.nombre}
            onChange={handleChangeEditada}
          />
        </Form.Group>
        <Form.Label>Color</Form.Label>
        <div className="color-grid">
          {colorOptions.map(col => (
            <div
              key={col}
              className={`color-circle ${categoriaEditada.color === col ? "selected" : ""}`}
              style={{ backgroundColor: col }}
              onClick={() => handleSelectColor(col)}
            />
          ))}
        </div>
        <Form.Label className="mt-3">Ícono</Form.Label>
        <div className="icon-grid">
          {iconOptions.map(icon => (
            <div
              key={icon.name}
              className={`icon-item ${categoriaEditada.icono === icon.name ? "selected" : ""}`}
              onClick={() => handleSelectIcon(icon.name)}
            >
              {icon.component}
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleEditCategoria}>
          Guardar cambios
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalEdicionCategoria
