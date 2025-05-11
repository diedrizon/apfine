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
import ModalMensaje from "../components/ModalMensaje";

import "../styles/Ingresos.css";

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
  const [categorias, setCategorias] = useState([]);

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);

  const [ingresoNuevo, setIngresoNuevo] = useState(null);
  const [ingresoEditado, setIngresoEditado] = useState(null);
  const [ingresoAEliminar, setIngresoAEliminar] = useState(null);
  const [ingresoDetalle, setIngresoDetalle] = useState(null);

  const [showModalMensaje, setShowModalMensaje] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [expandedId, setExpandedId] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const ingresosCollection = collection(db, "ingresos");
  const categoriasCollection = collection(db, "categorias");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (userId) {
      fetchIngresos();
      fetchCategorias();
    }
  });

  async function fetchIngresos() {
    try {
      const snapshot = await getDocs(ingresosCollection);
      const all = snapshot.docs.map((docu) => ({
        ...docu.data(),
        id: docu.id,
      }));
      const filtered = all.filter((ing) => ing.userId === userId);
      setIngresos(filtered);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchCategorias() {
    try {
      const snapshot = await getDocs(categoriasCollection);
      const allCategorias = snapshot.docs.map((docu) => ({
        ...docu.data(),
        id: docu.id,
      }));
      const userCategorias = allCategorias.filter(
        (cat) =>
          cat.usuarioId === userId &&
          (cat.aplicacion === "Ingreso" || cat.aplicacion === "Ambos")
      );
      setCategorias(userCategorias);
    } catch (error) {
      console.error(error);
    }
  }

  const openAddModal = () => {
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

  async function handleAddIngreso(nuevo) {
    closeAddModal();

    const tempId = `temp_${Date.now()}`;
    const nuevoIngreso = { ...nuevo, userId };

    if (isOffline) {
      setIngresos((prev) => [...prev, { ...nuevoIngreso, id: tempId }]);
    }

    setMensaje("Ingreso registrado correctamente.");
    setShowModalMensaje(true);

    try {
      await addDoc(ingresosCollection, nuevoIngreso);
    } catch (error) {
      console.error(error);
    }

    fetchIngresos();
  }

  async function handleEditIngreso(editado) {
    closeEditModal();

    if (isOffline) {
      setIngresos((prev) =>
        prev.map((ing) => (ing.id === editado.id ? { ...editado } : ing))
      );
    }

    setMensaje("Ingreso actualizado correctamente.");
    setShowModalMensaje(true);

    if (!editado.id.startsWith("temp_")) {
      try {
        const refDoc = doc(db, "ingresos", editado.id);
        await updateDoc(refDoc, { ...editado });
      } catch (error) {
        console.error(error);
      }
    }

    fetchIngresos();
  }

  async function handleDeleteIngreso() {
    if (!ingresoAEliminar) return;

    closeDeleteModal();

    if (isOffline) {
      setIngresos((prev) =>
        prev.filter((ing) => ing.id !== ingresoAEliminar.id)
      );
    }

    setMensaje("Ingreso eliminado correctamente.");
    setShowModalMensaje(true);

    if (!ingresoAEliminar.id.startsWith("temp_")) {
      try {
        const refDoc = doc(db, "ingresos", ingresoAEliminar.id);
        await deleteDoc(refDoc);
      } catch (error) {
        console.error(error);
      }
    }

    fetchIngresos();
  }

  function toggleExpanded(ingreso) {
    setExpandedId(expandedId === ingreso.id ? null : ingreso.id);
  }

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

        <div className="ingresos-summary">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Ingresos</Card.Title>
              <Card.Text>{totalIngresos}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      {ingresoNuevo && (
        <ModalRegistroIngreso
          show={showModalAdd}
          handleClose={closeAddModal}
          ingresoNuevo={ingresoNuevo}
          setIngresoNuevo={setIngresoNuevo}
          handleAddIngreso={handleAddIngreso}
          setMensaje={setMensaje}
          setShowModalMensaje={setShowModalMensaje}
          categorias={categorias}
        />
      )}

      {ingresoEditado && (
        <ModalEdicionIngreso
          show={showModalEdit}
          handleClose={closeEditModal}
          ingresoEditado={ingresoEditado}
          setIngresoEditado={setIngresoEditado}
          handleEditIngreso={handleEditIngreso}
          setMensaje={setMensaje}
          setShowModalMensaje={setShowModalMensaje}
          categorias={categorias}
        />
      )}

      {ingresoAEliminar && (
        <ModalEliminacionIngreso
          show={showModalDelete}
          handleClose={closeDeleteModal}
          ingresoAEliminar={ingresoAEliminar}
          handleDeleteIngreso={handleDeleteIngreso}
        />
      )}

      {ingresoDetalle && (
        <ModalDetalleIngreso
          show={showModalDetalle}
          handleClose={closeDetalleModal}
          ingresoDetalle={ingresoDetalle}
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

export default Ingresos;
