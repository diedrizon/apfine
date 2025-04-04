import React, { useState, useEffect } from "react";
import { db, auth } from "../database/firebaseconfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Container, Button, Card } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import ModalMensaje from "../components/ModalMensaje";
import "../styles/Categorias.css";
import { onAuthStateChanged } from "firebase/auth";
import ReactGA from "react-ga4";

function getIconComponent(iconName) {
  const IconComponent = FaIcons[iconName];
  return IconComponent ? <IconComponent /> : <FaIcons.FaQuestion />;
}

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [categoriaNueva, setCategoriaNueva] = useState({ nombre: "", color: "", icono: "" });
  const [categoriaEditada, setCategoriaEditada] = useState(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showModalMensaje, setShowModalMensaje] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const categoriasCollection = collection(db, "categorias");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioId(user.uid);
      }
    });
  }, []);

  useEffect(() => {
    if (usuarioId) {
      fetchCategorias();
    }
  }, [usuarioId]);

  async function fetchCategorias() {
    const data = await getDocs(categoriasCollection);
    const fetched = data.docs.map(docu => ({ ...docu.data(), id: docu.id })).filter(cat => cat.usuarioId === usuarioId);
    setCategorias(fetched);
  }

  function handleOpenAddModal() {
    setShowModalAdd(true);
  }

  function handleCloseAddModal() {
    setShowModalAdd(false);
  }

  function handleOpenEditModal(categoria) {
    setCategoriaEditada({ ...categoria });
    setShowModalEdit(true);
  }

  function handleCloseEditModal() {
    setShowModalEdit(false);
  }

  function handleOpenDeleteModal(categoria) {
    setCategoriaAEliminar(categoria);
    setShowModalDelete(true);
  }

  function handleCloseDeleteModal() {
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
    if (!categoriaNueva.nombre) {
      setMensaje("Te hace falta llenar el campo Nombre");
      setShowModalMensaje(true);
      return;
    }
    if (!categoriaNueva.color) {
      setMensaje("Te hace falta llenar el campo Color");
      setShowModalMensaje(true);
      return;
    }
    if (!categoriaNueva.icono) {
      setMensaje("Te hace falta llenar el campo Ícono");
      setShowModalMensaje(true);
      return;
    }
    const nuevaCategoria = { ...categoriaNueva, usuarioId };
    await addDoc(categoriasCollection, nuevaCategoria);
    ReactGA.event({
      category: "Categoría",
      action: "Categoría agregada",
      label: categoriaNueva.nombre || "Sin nombre"
    });
    setMensaje(`La categoría "${categoriaNueva.nombre}" se creó exitosamente.`);
    setShowModalMensaje(true);
    setCategoriaNueva({ nombre: "", color: "", icono: "" });
    handleCloseAddModal();
    fetchCategorias();
  }

  async function handleEditCategoria() {
    if (!categoriaEditada.nombre) {
      setMensaje("Te hace falta llenar el campo Nombre");
      setShowModalMensaje(true);
      return;
    }
    if (!categoriaEditada.color) {
      setMensaje("Te hace falta llenar el campo Color");
      setShowModalMensaje(true);
      return;
    }
    if (!categoriaEditada.icono) {
      setMensaje("Te hace falta llenar el campo Ícono");
      setShowModalMensaje(true);
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

  const totalCategorias = categorias.length;
  const mayorGasto = categorias[0] ? categorias[0].nombre : "N/A";

  return (
    <Container fluid className="categorias-container">
      <div className="categorias-header">
        <h5>Lista de Categorías</h5>
        <Button variant="primary" onClick={handleOpenAddModal}>Agregar</Button>
      </div>
      <div className="categorias-content">
        <div className="categorias-list">
          {categorias.map(cat => {
            const isExpanded = expandedCategory === cat.id;
            return (
              <div className={`categoria-item ${isExpanded ? "expanded" : ""}`} key={cat.id} style={{ borderColor: cat.color }} onClick={() => toggleExpandedCategory(cat)}>
                <div className="categoria-top">
                  <div className="categoria-icon" style={{ backgroundColor: cat.color }}>{getIconComponent(cat.icono)}</div>
                  <span className="categoria-nombre">{cat.nombre}</span>
                </div>
                {isExpanded && (
                  <div className="categoria-actions-expanded">
                    <Button variant="danger" size="sm" onClick={e => { e.stopPropagation(); handleOpenDeleteModal(cat); }}><FaIcons.FaTrash /></Button>
                    <Button variant="secondary" size="sm" onClick={e => { e.stopPropagation(); handleOpenEditModal(cat); }}><FaIcons.FaEdit /></Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="categorias-summary">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title className="summary-title">
                <span>Total Categorías</span>
                <FaIcons.FaListUl className="summary-icon" />
              </Card.Title>
              <Card.Text className="summary-value">{totalCategorias}</Card.Text>
            </Card.Body>
          </Card>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title className="summary-title">
                <span>Mayor Gasto</span>
                <FaIcons.FaMoneyBillAlt className="summary-icon" />
              </Card.Title>
              <Card.Text className="summary-value">
                <FaIcons.FaArrowUp style={{ marginRight: 5 }} />
                {mayorGasto}
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>
      <ModalRegistroCategoria show={showModalAdd} handleClose={handleCloseAddModal} categoriaNueva={categoriaNueva} setCategoriaNueva={setCategoriaNueva} handleChangeNueva={handleChangeNueva} handleAddCategoria={handleAddCategoria} />
      <ModalEdicionCategoria show={showModalEdit} handleClose={handleCloseEditModal} categoriaEditada={categoriaEditada} setCategoriaEditada={setCategoriaEditada} handleChangeEditada={handleChangeEditada} handleEditCategoria={handleEditCategoria} />
      <ModalEliminacionCategoria show={showModalDelete} handleClose={handleCloseDeleteModal} handleDeleteCategoria={handleDeleteCategoria} />
      <ModalMensaje show={showModalMensaje} handleClose={() => setShowModalMensaje(false)} message={mensaje} />
    </Container>
  );
}

export default Categorias;
