import React, { useState, useEffect } from "react";
import { db, auth } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Container, Button, Card } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";
import { BiCube } from "react-icons/bi";
import ModalRegistroMateria from "../components/materiasprimas/ModalRegistroMateria";
import ModalEdicionMateria from "../components/materiasprimas/ModalEdicionMateria";
import ModalEliminacionMateria from "../components/materiasprimas/ModalEliminacionMateria";
import ModalDetalleMateria from "../components/materiasprimas/ModalDetalleMateria";
import ModalMensaje from "../components/ModalMensaje";

import "../styles/MateriasPrimas.css";

function getIcon(stock, minimo) {
  if (stock <= minimo) return <FaIcons.FaExclamationTriangle color="#ff9800" />;
  return <FaIcons.FaCube />;
}

function MateriasPrimas() {
  const [userId, setUserId] = useState(null);
  const [materias, setMaterias] = useState([]);

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [showModalMensaje, setShowModalMensaje] = useState(false);

  const [materiaNueva, setMateriaNueva] = useState(null);
  const [materiaEditada, setMateriaEditada] = useState(null);
  const [materiaAEliminar, setMateriaAEliminar] = useState(null);
  const [materiaDetalle, setMateriaDetalle] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const materiasCollection = collection(db, "materias_primas");

  useEffect(
    () => onAuthStateChanged(auth, (user) => user && setUserId(user.uid)),
    []
  );

  useEffect(() => {
    const online = () => setIsOffline(false);
    const offline = () => setIsOffline(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    if (userId) fetchMaterias();
  });

  async function fetchMaterias() {
    try {
      const snap = await getDocs(materiasCollection);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMaterias(all.filter((m) => m.userId === userId));
    } catch (err) {
      console.error(err);
    }
  }

  const openAddModal = () => {
    setMateriaNueva({
      nombre: "",
      unidad_medida: "",
      stock_actual: "",
      stock_minimo: "",
      costo_unitario: "",
      proveedor: "",
      ultima_compra: "",
    });
    setShowModalAdd(true);
  };
  const closeAddModal = () => setShowModalAdd(false);

  const openEditModal = (m) => {
    setMateriaEditada({ ...m });
    setShowModalEdit(true);
  };
  const closeEditModal = () => setShowModalEdit(false);

  const openDeleteModal = (m) => {
    setMateriaAEliminar(m);
    setShowModalDelete(true);
  };
  const closeDeleteModal = () => setShowModalDelete(false);

  const openDetalleModal = (m) => {
    setMateriaDetalle(m);
    setShowModalDetalle(true);
  };
  const closeDetalleModal = () => setShowModalDetalle(false);

  async function handleAddMateria(nueva) {
    closeAddModal();
    const tempId = `temp_${Date.now()}`;
    const data = { ...nueva, userId };

    if (isOffline) setMaterias((prev) => [...prev, { ...data, id: tempId }]);

    setMensaje("Insumo registrado correctamente.");
    setShowModalMensaje(true);

    try {
      await addDoc(materiasCollection, data);
    } catch (e) {
      console.error(e);
    }
    fetchMaterias();
  }

  async function handleEditMateria(editada) {
    closeEditModal();
    if (isOffline) {
      setMaterias((prev) =>
        prev.map((m) => (m.id === editada.id ? editada : m))
      );
    }

    setMensaje("Insumo actualizado correctamente.");
    setShowModalMensaje(true);

    if (!editada.id.startsWith("temp_")) {
      try {
        await updateDoc(doc(db, "materias_primas", editada.id), editada);
      } catch (e) {
        console.error(e);
      }
    }
    fetchMaterias();
  }

  async function handleDeleteMateria() {
    if (!materiaAEliminar) return;
    closeDeleteModal();

    if (isOffline) {
      setMaterias((prev) => prev.filter((m) => m.id !== materiaAEliminar.id));
    }

    setMensaje("Insumo eliminado correctamente.");
    setShowModalMensaje(true);

    if (!materiaAEliminar.id.startsWith("temp_")) {
      try {
        await deleteDoc(doc(db, "materias_primas", materiaAEliminar.id));
      } catch (e) {
        console.error(e);
      }
    }
    fetchMaterias();
  }

  const toggleExpanded = (m) =>
    setExpandedId(expandedId === m.id ? null : m.id);

  const totalMaterias = materias.length;

  return (
    <Container fluid className="materias-container">
      <div className="materias-header">
        <h5>Lista de Materias Primas / Insumos</h5>
        <Button variant="primary" onClick={openAddModal}>
          Agregar
        </Button>
      </div>

      <div className="materias-content">
        <div className="materias-list">
          {materias.map((mat) => {
            const isExpanded = expandedId === mat.id;
            return (
              <div
                key={mat.id}
                className={`materia-item ${isExpanded ? "expanded" : ""}`}
                onClick={() => toggleExpanded(mat)}
              >
                <div className="materia-top">
                  <div className="materia-icon">
                    {getIcon(mat.stock_actual, mat.stock_minimo)}
                  </div>
                  <span className="materia-nombre">{mat.nombre}</span>
                  <span className="materia-stock">
                    {mat.stock_actual} {mat.unidad_medida}
                  </span>
                </div>
                <div className="materia-subinfo">
                  <span>C$ {mat.costo_unitario}</span>
                  <span className="mx-2">|</span>
                  <span>{mat.proveedor || "Sin proveedor"}</span>
                </div>

                {isExpanded && (
                  <div className="materia-actions-expanded">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(mat);
                      }}
                    >
                      <FaIcons.FaTrash />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(mat);
                      }}
                    >
                      <FaIcons.FaEdit />
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetalleModal(mat);
                      }}
                    >
                      <FaIcons.FaEye /> Ver
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="materias-summary">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Insumos</Card.Title>
              <Card.Text>{totalMaterias}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* MODALES */}
      {showModalAdd && materiaNueva && (
        <ModalRegistroMateria
          show={showModalAdd}
          handleClose={closeAddModal}
          materiaNueva={materiaNueva}
          setMateriaNueva={setMateriaNueva}
          handleAddMateria={handleAddMateria}
          setMensaje={setMensaje}
          setShowModalMensaje={setShowModalMensaje}
        />
      )}

      {materiaEditada && (
        <ModalEdicionMateria
          show={showModalEdit}
          handleClose={closeEditModal}
          materiaEditada={materiaEditada}
          setMateriaEditada={setMateriaEditada}
          handleEditMateria={handleEditMateria}
          setMensaje={setMensaje}
          setShowModalMensaje={setShowModalMensaje}
        />
      )}

      {materiaAEliminar && (
        <ModalEliminacionMateria
          show={showModalDelete}
          handleClose={closeDeleteModal}
          materiaAEliminar={materiaAEliminar}
          handleDeleteMateria={handleDeleteMateria}
        />
      )}

      {materiaDetalle && (
        <ModalDetalleMateria
          show={showModalDetalle}
          handleClose={closeDetalleModal}
          materiaDetalle={materiaDetalle}
        />
      )}

      <ModalMensaje
        show={showModalMensaje}
        handleClose={() => setShowModalMensaje(false)}
        message={mensaje}
      />
    </Container>
  );
}

export default MateriasPrimas;
