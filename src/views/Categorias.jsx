import React, { useState, useEffect } from "react"
import { db } from "../database/firebaseconfig"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { Container, Button, Card } from "react-bootstrap"
import * as FaIcons from "react-icons/fa"
import { FaArrowUp, FaTrash, FaEdit } from "react-icons/fa"
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria"
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria"
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria"
import "../styles/Categorias.css"

function getIconComponent(iconName) {
  const IconComponent = FaIcons[iconName]
  return IconComponent ? <IconComponent /> : <FaIcons.FaQuestion />
}

function Categorias({ closeSidebar, setOverlayActive }) {
  const [categorias, setCategorias] = useState([])
  const [showModalAdd, setShowModalAdd] = useState(false)
  const [showModalEdit, setShowModalEdit] = useState(false)
  const [showModalDelete, setShowModalDelete] = useState(false)
  const [categoriaNueva, setCategoriaNueva] = useState({ nombre: "", color: "", icono: "" })
  const [categoriaEditada, setCategoriaEditada] = useState(null)
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null)
  const categoriasCollection = collection(db, "categorias")

  useEffect(() => {
    fetchCategorias()
  }, [])

  async function fetchCategorias() {
    const data = await getDocs(categoriasCollection)
    const fetched = data.docs.map(docu => ({ ...docu.data(), id: docu.id }))
    setCategorias(fetched)
  }

  function handleOpenAddModal() {
    if (closeSidebar) {
      closeSidebar()
    }
    if (setOverlayActive) {
      setOverlayActive(true)
    }
    setShowModalAdd(true)
  }

  function handleCloseAddModal() {
    if (setOverlayActive) {
      setOverlayActive(false)
    }
    setShowModalAdd(false)
  }

  function handleOpenEditModal(categoria) {
    if (closeSidebar) {
      closeSidebar()
    }
    if (setOverlayActive) {
      setOverlayActive(true)
    }
    setCategoriaEditada({ ...categoria })
    setShowModalEdit(true)
  }

  function handleCloseEditModal() {
    if (setOverlayActive) {
      setOverlayActive(false)
    }
    setShowModalEdit(false)
  }

  function handleOpenDeleteModal(categoria) {
    if (closeSidebar) {
      closeSidebar()
    }
    if (setOverlayActive) {
      setOverlayActive(true)
    }
    setCategoriaAEliminar(categoria)
    setShowModalDelete(true)
  }

  function handleCloseDeleteModal() {
    if (setOverlayActive) {
      setOverlayActive(false)
    }
    setShowModalDelete(false)
  }

  function handleChangeNueva(e) {
    const { name, value } = e.target
    setCategoriaNueva(prev => ({ ...prev, [name]: value }))
  }

  function handleChangeEditada(e) {
    const { name, value } = e.target
    setCategoriaEditada(prev => ({ ...prev, [name]: value }))
  }

  async function handleAddCategoria() {
    if (!categoriaNueva.nombre || !categoriaNueva.color || !categoriaNueva.icono) {
      alert("Completa todos los campos")
      return
    }
    await addDoc(categoriasCollection, categoriaNueva)
    setCategoriaNueva({ nombre: "", color: "", icono: "" })
    handleCloseAddModal()
    fetchCategorias()
  }

  async function handleEditCategoria() {
    if (!categoriaEditada.nombre || !categoriaEditada.color || !categoriaEditada.icono) {
      alert("Completa todos los campos")
      return
    }
    const ref = doc(db, "categorias", categoriaEditada.id)
    await updateDoc(ref, {
      nombre: categoriaEditada.nombre,
      color: categoriaEditada.color,
      icono: categoriaEditada.icono
    })
    handleCloseEditModal()
    fetchCategorias()
  }

  async function handleDeleteCategoria() {
    if (!categoriaAEliminar) return
    const ref = doc(db, "categorias", categoriaAEliminar.id)
    await deleteDoc(ref)
    handleCloseDeleteModal()
    fetchCategorias()
  }

  const totalCategorias = categorias.length
  const mayorGasto = categorias[0] ? categorias[0].nombre : "N/A"

  return (
    <Container fluid className="categorias-container">
      <div className="categorias-header">
        <h5>Lista de Categorías</h5>
        <Button variant="primary" onClick={handleOpenAddModal}>
          Agregar
        </Button>
      </div>
      <div className="categorias-content">
        <div className="categorias-list">
          {categorias.map(cat => (
            <div className="categoria-item" key={cat.id} style={{ borderColor: cat.color }}>
              <div className="categoria-icon" style={{ backgroundColor: cat.color }}>
                {getIconComponent(cat.icono)}
              </div>
              <span className="categoria-nombre">{cat.nombre}</span>
              <div className="categoria-actions">
                <Button variant="danger" size="sm" onClick={() => handleOpenDeleteModal(cat)}>
                  <FaTrash />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(cat)}>
                  <FaEdit />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="categorias-summary">
          <Card>
            <Card.Body>
              <Card.Title>Total Categorías</Card.Title>
              <Card.Text style={{ fontSize: "2rem" }}>{totalCategorias}</Card.Text>
            </Card.Body>
          </Card>
          <Card className="mt-3">
            <Card.Body>
              <Card.Title>Mayor Gasto</Card.Title>
              <Card.Text>
                <FaArrowUp style={{ marginRight: 5 }} />
                {mayorGasto}
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>
      <ModalRegistroCategoria
        show={showModalAdd}
        handleClose={handleCloseAddModal}
        categoriaNueva={categoriaNueva}
        setCategoriaNueva={setCategoriaNueva}
        handleChangeNueva={handleChangeNueva}
        handleAddCategoria={handleAddCategoria}
      />
      <ModalEdicionCategoria
        show={showModalEdit}
        handleClose={handleCloseEditModal}
        categoriaEditada={categoriaEditada}
        setCategoriaEditada={setCategoriaEditada}
        handleChangeEditada={handleChangeEditada}
        handleEditCategoria={handleEditCategoria}
      />
      <ModalEliminacionCategoria
        show={showModalDelete}
        handleClose={handleCloseDeleteModal}
        handleDeleteCategoria={handleDeleteCategoria}
      />
    </Container>
  )
}

export default Categorias
