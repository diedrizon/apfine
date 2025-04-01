import React, { useState, useEffect } from "react";
import { db } from "../database/firebaseconfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Container, Button, Card } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";
import { FaArrowUp, FaTrash, FaEdit, FaListUl, FaMoneyBillAlt } from "react-icons/fa";
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import ModalMensaje from "../components/ModalMensaje";
import "../styles/Categorias.css";
import ReactGA from "react-ga4";

function getIconComponent(iconName) {
  const IconComponent = FaIcons[iconName];
  return IconComponent ? <IconComponent /> : <FaIcons.FaQuestion />;
}

function Categorias({ closeSidebar, setOverlayActive }) {
  const [categorias, setCategorias] = useState([]);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [categoriaNueva, setCategoriaNueva] = useState({ nombre: "", color: "", icono: "" });
  const [categoriaEditada, setCategoriaEditada] = useState(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  // Estados para el modal de mensaje
  const [showModalMensaje, setShowModalMensaje] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const categoriasCollection = collection(db, "categorias");

  useEffect(() => {
    fetchCategorias();
  },);

  async function fetchCategorias() {
    const data = await getDocs(categoriasCollection);
    const fetched = data.docs.map(docu => ({ ...docu.data(), id: docu.id }));
    setCategorias(fetched);
  }

  function handleOpenAddModal() {
    if (closeSidebar) closeSidebar();
    if (setOverlayActive) setOverlayActive(true);
    setShowModalAdd(true);
  }

  function handleCloseAddModal() {
    if (setOverlayActive) setOverlayActive(false);
    setShowModalAdd(false);
  }

  function handleOpenEditModal(categoria) {
    if (closeSidebar) closeSidebar();
    if (setOverlayActive) setOverlayActive(true);
    setCategoriaEditada({ ...categoria });
    setShowModalEdit(true);
  }

  function handleCloseEditModal() {
    if (setOverlayActive) setOverlayActive(false);
    setShowModalEdit(false);
  }

  function handleOpenDeleteModal(categoria) {
    if (closeSidebar) closeSidebar();
    if (setOverlayActive) setOverlayActive(true);
    setCategoriaAEliminar(categoria);
    setShowModalDelete(true);
  }

  function handleCloseDeleteModal() {
    if (setOverlayActive) setOverlayActive(false);
    setShowModalDelete(false);
  }

  function handleChangeNueva(e) {
    const { name, value } = e.target;
    setCategoriaNueva(prev => ({ ...prev, [name]: value }));
  }

  function handleChangeEditada(e) {
    const { name, value } = e.target;
    setCategoriaEditada(prev => ({ ...prev, [name]: value }));
  }

  async function handleAddCategoria() {
    if (!categoriaNueva.nombre || !categoriaNueva.color || !categoriaNueva.icono) {
      alert("Completa todos los campos");
      return;
    }
    await addDoc(categoriasCollection, categoriaNueva);
    ReactGA.event({
      category: "Categoría",
      action: "Categoría agregada",
      label: categoriaNueva.nombre || "Sin nombre"
    });
    // Mostrar mensaje de éxito
    setMensaje(`La categoría "${categoriaNueva.nombre}" se creó exitosamente.`);
    setShowModalMensaje(true);
    setCategoriaNueva({ nombre: "", color: "", icono: "" });
    handleCloseAddModal();
    fetchCategorias();
  }

  async function handleEditCategoria() {
    if (!categoriaEditada.nombre || !categoriaEditada.color || !categoriaEditada.icono) {
      alert("Completa todos los campos");
      return;
    }
    const ref = doc(db, "categorias", categoriaEditada.id);
    await updateDoc(ref, {
      nombre: categoriaEditada.nombre,
      color: categoriaEditada.color,
      icono: categoriaEditada.icono
    });
    ReactGA.event({
      category: "Categoría",
      action: "Categoría editada",
      label: categoriaEditada.nombre || "Sin nombre"
    });
    setMensaje(`La categoría "${categoriaEditada.nombre}" se editó correctamente.`);
    setShowModalMensaje(true);
    handleCloseEditModal();
    fetchCategorias();
  }

  async function handleDeleteCategoria() {
    if (!categoriaAEliminar) return;
    const ref = doc(db, "categorias", categoriaAEliminar.id);
    await deleteDoc(ref);
    ReactGA.event({
      category: "Categoría",
      action: "Categoría eliminada",
      label: categoriaAEliminar.nombre || "Sin nombre"
    });
    setMensaje(`La categoría "${categoriaAEliminar.nombre}" se eliminó exitosamente.`);
    setShowModalMensaje(true);
    handleCloseDeleteModal();
    fetchCategorias();
  }

  function toggleExpandedCategory(categoria) {
    setExpandedCategory(expandedCategory === categoria.id ? null : categoria.id);
  }

  // Cálculos de resumen
  const totalCategorias = categorias.length;
  const mayorGasto = categorias[0] ? categorias[0].nombre : "N/A";

  return (
    <Container fluid className="categorias-container">
      <div className="categorias-header">
        <h5>Lista de Categorías</h5>
        <Button variant="primary" onClick={handleOpenAddModal}>
          Agregar
        </Button>
      </div>

      <div className="categorias-content">
        {/* Lista de Categorías */}
        <div className="categorias-list">
          {categorias.map(cat => {
            const isExpanded = expandedCategory === cat.id;
            return (
              <div
                className={`categoria-item ${isExpanded ? "expanded" : ""}`}
                key={cat.id}
                style={{ borderColor: cat.color }}
                onClick={() => toggleExpandedCategory(cat)}
              >
                <div className="categoria-top">
                  <div className="categoria-icon" style={{ backgroundColor: cat.color }}>
                    {getIconComponent(cat.icono)}
                  </div>
                  <span className="categoria-nombre">{cat.nombre}</span>
                </div>

                {isExpanded && (
                  <div className="categoria-actions-expanded">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleOpenDeleteModal(cat);
                      }}
                    >
                      <FaTrash />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleOpenEditModal(cat);
                      }}
                    >
                      <FaEdit />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tarjetas de Resumen */}
        <div className="categorias-summary">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title className="summary-title">
                <span>Total Categorías</span>
                <FaListUl className="summary-icon" />
              </Card.Title>
              <Card.Text className="summary-value">
                {totalCategorias}
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="summary-card">
            <Card.Body>
              <Card.Title className="summary-title">
                <span>Mayor Gasto</span>
                <FaMoneyBillAlt className="summary-icon" />
              </Card.Title>
              <Card.Text className="summary-value">
                <FaArrowUp style={{ marginRight: 5 }} />
                {mayorGasto}
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modales */}
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
      <ModalMensaje
        show={showModalMensaje}
        handleClose={() => setShowModalMensaje(false)}
        message={mensaje}
      />
    </Container>
  );
}

export default Categorias;
