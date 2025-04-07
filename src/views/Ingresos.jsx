// src/views/Ingresos.jsx
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

import ModalRegistroIngreso from "../components/ingresos/ModalRegistroIngreso";
import ModalEdicionIngreso from "../components/ingresos/ModalEdicionIngreso";
import ModalEliminacionIngreso from "../components/ingresos/ModalEliminacionIngreso";
import ModalDetalleIngreso from "../components/ingresos/ModalDetalleIngreso";
import ModalMensaje from "../components/ModalMensaje"; // asumes que ya lo tienes

import "../styles/Ingresos.css";

/**
 * Según el tipo_ingreso, asigna un ícono distinto.
 * Puedes personalizar más si deseas.
 */
function getIconComponent(tipo_ingreso) {
  if (!tipo_ingreso) return <FaIcons.FaQuestion />;
  const lower = tipo_ingreso.toLowerCase();
  if (lower.includes("venta")) return <FaIcons.FaDollarSign />;
  if (lower.includes("préstamo")) return <FaIcons.FaHandHoldingUsd />;
  if (lower.includes("donación")) return <FaIcons.FaGift />;
  return <FaIcons.FaInbox />;
}

function Ingresos() {
  const [userId, setUserId] = useState(null);
  const [ingresos, setIngresos] = useState([]);

  // Modales
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);

  // Objetos a manipular
  const [ingresoNuevo, setIngresoNuevo] = useState(null);
  const [ingresoEditado, setIngresoEditado] = useState(null);
  const [ingresoAEliminar, setIngresoAEliminar] = useState(null);
  const [ingresoDetalle, setIngresoDetalle] = useState(null);

  // Modal de mensaje genérico
  const [showModalMensaje, setShowModalMensaje] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Para expandir tarjetas
  const [expandedId, setExpandedId] = useState(null);

  // Referencia a la colección "ingresos"
  const ingresosCollection = collection(db, "ingresos");

  // Detectar user.uid
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
  }, []);

  // Cargar ingresos cuando tengamos el userId
  useEffect(() => {
    if (userId) {
      fetchIngresos();
    }
  },);

  async function fetchIngresos() {
    try {
      const snapshot = await getDocs(ingresosCollection);
      const all = snapshot.docs.map((docu) => ({
        ...docu.data(),
        id: docu.id,
      }));
      // Filtrar por userId
      const filtered = all.filter((ing) => ing.userId === userId);
      setIngresos(filtered);
    } catch (error) {
      console.error(error);
    }
  }

  // ========== ABRIR / CERRAR MODALES ==========
  const openAddModal = () => {
    // Inicializamos ingreso nuevo con campos vacíos
    setIngresoNuevo({
      fecha_ingreso: "",
      monto: "",
      tipo_ingreso: "",
      categoria: "",
      fuente: "",
      medio_pago: "",
      descripcion: "",
      comprobanteURL: "",
    });
    setShowModalAdd(true);
  };
  const closeAddModal = () => setShowModalAdd(false);

  const openEditModal = (ing) => {
    setIngresoEditado({ ...ing });
    setShowModalEdit(true);
  };
  const closeEditModal = () => setShowModalEdit(false);

  const openDeleteModal = (ing) => {
    setIngresoAEliminar(ing);
    setShowModalDelete(true);
  };
  const closeDeleteModal = () => setShowModalDelete(false);

  const openDetalleModal = (ing) => {
    setIngresoDetalle(ing);
    setShowModalDetalle(true);
  };
  const closeDetalleModal = () => setShowModalDetalle(false);

  // ========== CRUD ==========
  async function handleAddIngreso(nuevo) {
    try {
      // Guardar en Firestore, añadiendo userId
      await addDoc(ingresosCollection, { ...nuevo, userId });
      setMensaje("Ingreso registrado correctamente.");
      setShowModalMensaje(true);
      closeAddModal();
      fetchIngresos();
    } catch (error) {
      console.error(error);
      setMensaje("Error al registrar el ingreso.");
      setShowModalMensaje(true);
    }
  }

  async function handleEditIngreso(editado) {
    if (!editado.id) return;
    try {
      const refDoc = doc(db, "ingresos", editado.id);
      await updateDoc(refDoc, { ...editado });
      setMensaje("Ingreso actualizado correctamente.");
      setShowModalMensaje(true);
      closeEditModal();
      fetchIngresos();
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar el ingreso.");
      setShowModalMensaje(true);
    }
  }

  async function handleDeleteIngreso() {
    if (!ingresoAEliminar) return;
    try {
      const refDoc = doc(db, "ingresos", ingresoAEliminar.id);
      await deleteDoc(refDoc);
      setMensaje("Ingreso eliminado correctamente.");
      setShowModalMensaje(true);
      closeDeleteModal();
      fetchIngresos();
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar el ingreso.");
      setShowModalMensaje(true);
    }
  }

  // Expandir/cerrar tarjeta
  function toggleExpanded(ingreso) {
    setExpandedId(expandedId === ingreso.id ? null : ingreso.id);
  }

  // Ejemplo de cálculo rápido
  const totalIngresos = ingresos.length;

  return (
    <Container fluid className="ingresos-container">
      <div className="ingresos-header">
        <h5>Lista de Ingresos</h5>
        <Button variant="primary" onClick={openAddModal}>
          Agregar
        </Button>
      </div>

      <div className="ingresos-content">
        {/* Sección principal: las tarjetas */}
        <div className="ingresos-list">
          {ingresos.map((ing) => {
            const isExpanded = expandedId === ing.id;
            return (
              <div
                key={ing.id}
                className={`ingreso-item ${isExpanded ? "expanded" : ""}`}
                onClick={() => toggleExpanded(ing)}
              >
                <div className="ingreso-top">
                  <div className="ingreso-icon">
                    {getIconComponent(ing.tipo_ingreso)}
                  </div>
                  <span className="ingreso-nombre">
                    {ing.tipo_ingreso || "—"} (C${ing.monto})
                  </span>
                </div>
                <div className="ingreso-subinfo">
                  <span>{ing.fecha_ingreso}</span>
                  <span className="mx-2">|</span>
                  <span>{ing.categoria}</span>
                </div>

                {isExpanded && (
                  <div className="ingreso-actions-expanded">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(ing);
                      }}
                    >
                      <FaIcons.FaTrash />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(ing);
                      }}
                    >
                      <FaIcons.FaEdit />
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetalleModal(ing);
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

        {/* Sección derecha con resumen */}
        <div className="ingresos-summary">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Ingresos</Card.Title>
              <Card.Text>{totalIngresos}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modal de Registro */}
      {ingresoNuevo && (
        <ModalRegistroIngreso
          show={showModalAdd}
          handleClose={closeAddModal}
          ingresoNuevo={ingresoNuevo}
          setIngresoNuevo={setIngresoNuevo}
          handleAddIngreso={handleAddIngreso}
          setMensaje={setMensaje}
          setShowModalMensaje={setShowModalMensaje}
        />
      )}

      {/* Modal de Edición */}
      {ingresoEditado && (
        <ModalEdicionIngreso
          show={showModalEdit}
          handleClose={closeEditModal}
          ingresoEditado={ingresoEditado}
          setIngresoEditado={setIngresoEditado}
          handleEditIngreso={handleEditIngreso}
          setMensaje={setMensaje}
          setShowModalMensaje={setShowModalMensaje}
        />
      )}

      {/* Modal de Eliminación */}
      {ingresoAEliminar && (
        <ModalEliminacionIngreso
          show={showModalDelete}
          handleClose={closeDeleteModal}
          ingresoAEliminar={ingresoAEliminar}
          handleDeleteIngreso={handleDeleteIngreso}
        />
      )}

      {/* Modal de Detalle */}
      {ingresoDetalle && (
        <ModalDetalleIngreso
          show={showModalDetalle}
          handleClose={closeDetalleModal}
          ingresoDetalle={ingresoDetalle}
        />
      )}

      {/* Modal de Mensajes */}
      <ModalMensaje
        show={showModalMensaje}
        handleClose={() => setShowModalMensaje(false)}
        message={mensaje}
      />
    </Container>
  );
}

export default Ingresos;
