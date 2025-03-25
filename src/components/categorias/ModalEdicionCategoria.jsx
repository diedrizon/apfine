import React from "react"
import { Modal, Button, Form } from "react-bootstrap"
import * as FaIcons from "react-icons/fa"

const colorOptions = [
  "#F44336","#E91E63","#9C27B0","#673AB7","#3F51B5","#2196F3","#03A9F4","#00BCD4",
  "#009688","#4CAF50","#8BC34A","#CDDC39","#FFC107","#FF9800","#FF5722","#795548",
  "#607D8B","#9E9E9E","#FFCDD2","#C8E6C9"
]
const iconOptions = [
  { name: "FaHome", component: <FaIcons.FaHome /> },
  { name: "FaCar", component: <FaIcons.FaCar /> },
  { name: "FaShoppingCart", component: <FaIcons.FaShoppingCart /> },
  { name: "FaMusic", component: <FaIcons.FaMusic /> },
  { name: "FaUtensils", component: <FaIcons.FaUtensils /> },
  { name: "FaHeart", component: <FaIcons.FaHeart /> },
  { name: "FaGift", component: <FaIcons.FaGift /> },
  { name: "FaGamepad", component: <FaIcons.FaGamepad /> },
  { name: "FaCoffee", component: <FaIcons.FaCoffee /> },
  { name: "FaBus", component: <FaIcons.FaBus /> },
  { name: "FaBook", component: <FaIcons.FaBook /> },
  { name: "FaLaptop", component: <FaIcons.FaLaptop /> },
  { name: "FaDog", component: <FaIcons.FaDog /> },
  { name: "FaFish", component: <FaIcons.FaFish /> },
  { name: "FaRunning", component: <FaIcons.FaRunning /> },
  { name: "FaTv", component: <FaIcons.FaTv /> },
  { name: "FaLightbulb", component: <FaIcons.FaLightbulb /> },
  { name: "FaPlane", component: <FaIcons.FaPlane /> },
  { name: "FaPhone", component: <FaIcons.FaPhone /> },
  { name: "FaTools", component: <FaIcons.FaTools /> },
  { name: "FaBicycle", component: <FaIcons.FaBicycle /> },
  { name: "FaAppleAlt", component: <FaIcons.FaAppleAlt /> },
  { name: "FaCamera", component: <FaIcons.FaCamera /> },
  { name: "FaCloud", component: <FaIcons.FaCloud /> },
  { name: "FaCocktail", component: <FaIcons.FaCocktail /> },
  { name: "FaDollarSign", component: <FaIcons.FaDollarSign /> },
  { name: "FaFeather", component: <FaIcons.FaFeather /> },
  { name: "FaFutbol", component: <FaIcons.FaFutbol /> },
  { name: "FaHamburger", component: <FaIcons.FaHamburger /> },
  { name: "FaIceCream", component: <FaIcons.FaIceCream /> },
  { name: "FaLeaf", component: <FaIcons.FaLeaf /> },
  { name: "FaLock", component: <FaIcons.FaLock /> },
  { name: "FaMagic", component: <FaIcons.FaMagic /> },
  { name: "FaMoneyBillAlt", component: <FaIcons.FaMoneyBillAlt /> },
  { name: "FaMotorcycle", component: <FaIcons.FaMotorcycle /> },
  { name: "FaNewspaper", component: <FaIcons.FaNewspaper /> },
  { name: "FaPaintBrush", component: <FaIcons.FaPaintBrush /> },
  { name: "FaPaperPlane", component: <FaIcons.FaPaperPlane /> },
  { name: "FaPepperHot", component: <FaIcons.FaPepperHot /> },
  { name: "FaPiggyBank", component: <FaIcons.FaPiggyBank /> },
  { name: "FaPizzaSlice", component: <FaIcons.FaPizzaSlice /> },
  { name: "FaSeedling", component: <FaIcons.FaSeedling /> },
  { name: "FaShoppingBag", component: <FaIcons.FaShoppingBag /> },
  { name: "FaShoePrints", component: <FaIcons.FaShoePrints /> },
  { name: "FaSnowflake", component: <FaIcons.FaSnowflake /> },
  { name: "FaSpa", component: <FaIcons.FaSpa /> },
  { name: "FaStar", component: <FaIcons.FaStar /> },
  { name: "FaSubway", component: <FaIcons.FaSubway /> },
  { name: "FaSun", component: <FaIcons.FaSun /> },
  { name: "FaWind", component: <FaIcons.FaWind /> }
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
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} centered dialogClassName="custom-modal">
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
            <div key={col} className={`color-circle ${categoriaEditada.color === col ? "selected" : ""}`} style={{ backgroundColor: col }} onClick={() => handleSelectColor(col)} />
          ))}
        </div>
        <Form.Label className="mt-3">Ícono</Form.Label>
        <div className="icon-grid">
          {iconOptions.map(icon => (
            <div key={icon.name} className={`icon-item ${categoriaEditada.icono === icon.name ? "selected" : ""}`} onClick={() => handleSelectIcon(icon.name)}>
              {icon.component}
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleEditCategoria}>Guardar cambios</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalEdicionCategoria
