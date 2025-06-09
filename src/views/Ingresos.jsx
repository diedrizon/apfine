// src/pages/Ingresos.jsx

import React, { useState, useEffect } from "react";
import { db, auth } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Container, Button, Card } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";

import ModalRegistroIngreso from "../components/ingresos/ModalRegistroIngreso";
import ModalEdicionIngreso from "../components/ingresos/ModalEdicionIngreso";
import ModalEliminacionIngreso from "../components/ingresos/ModalEliminacionIngreso";
import ModalDetalleIngreso from "../components/ingresos/ModalDetalleIngreso";
import ModalMensaje from "../components/ModalMensaje";
import ToastFlotante from "../components/ui/ToastFlotante";
import Paginacion from "../components/ordenamiento/Paginacion";

import "../styles/Ingresos.css";

function getIconComponent(tipo_ingreso) {
  if (!tipo_ingreso) return <FaIcons.FaQuestion />;
  const lower = tipo_ingreso.toLowerCase();
  if (lower.includes("venta")) return <FaIcons.FaDollarSign />;
  if (lower.includes("préstamo")) return <FaIcons.FaHandHoldingUsd />;
  if (lower.includes("donación")) return <FaIcons.FaGift />;
  return <FaIcons.FaInbox />;
}

export default function Ingresos() {
  const [userId, setUserId] = useState(null);
  const [ingresos, setIngresos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const esPantallaPequena = window.innerWidth <= 768;
  const elementosPorPagina = esPantallaPequena ? 5 : 3;

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

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const ingresosCollection = collection(db, "ingresos");
  const categoriasCollection = collection(db, "categorias");

  // Auth listener
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
  }, []);

  // Online/offline detector
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Fetch on userId change
  useEffect(() => {
    if (userId) {
      fetchIngresos();
      fetchCategorias();
    }
  }, [userId]);

  async function fetchIngresos() {
    const snap = await getDocs(ingresosCollection);
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setIngresos(all.filter(i => i.userId === userId));
  }

  async function fetchCategorias() {
    const snap = await getDocs(categoriasCollection);
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setCategorias(
      all.filter(
        c =>
          c.usuarioId === userId &&
          (c.aplicacion === "Ingreso" || c.aplicacion === "Ambos")
      )
    );
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
      ventaId: ""
    });
    setShowModalAdd(true);
  };
  const closeAddModal = () => setShowModalAdd(false);

  const openEditModal = ing => {
    setIngresoEditado({ ...ing });
    setShowModalEdit(true);
  };
  const closeEditModal = () => setShowModalEdit(false);

  const openDeleteModal = ing => {
    setIngresoAEliminar(ing);
    setShowModalDelete(true);
  };
  const closeDeleteModal = () => setShowModalDelete(false);

  const openDetalleModal = ing => {
    setIngresoDetalle(ing);
    setShowModalDetalle(true);
  };
  const closeDetalleModal = () => setShowModalDetalle(false);

  async function handleAddIngreso(nuevo) {
    closeAddModal();
    const tempId = `temp_${Date.now()}`;
    const toSave = { ...nuevo, userId };
    if (isOffline) {
      setIngresos(prev => [...prev, { ...toSave, id: tempId }]);
    }
    setMensaje("Ingreso registrado correctamente.");
    setShowModalMensaje(true);
    await addDoc(ingresosCollection, toSave);
    fetchIngresos();
  }

  async function handleEditIngreso(editado) {
    closeEditModal();
    if (isOffline) {
      setIngresos(prev =>
        prev.map(i => (i.id === editado.id ? editado : i))
      );
    }
    setMensaje("Ingreso actualizado correctamente.");
    setShowModalMensaje(true);
    if (!editado.id.startsWith("temp_")) {
      await updateDoc(doc(db, "ingresos", editado.id), editado);
    }
    fetchIngresos();
  }

  async function handleDeleteIngreso() {
    if (!ingresoAEliminar) return;
    closeDeleteModal();

    if (isOffline) {
      setIngresos(prev =>
        prev.filter(i => i.id !== ingresoAEliminar.id)
      );
      setMensaje("Ingreso eliminado (offline).");
      setShowModalMensaje(true);
      return;
    }

    const { id: ingresoId, ventaId } = ingresoAEliminar;
    try {
      if (ventaId) {
        // Restore stock & delete sale
        const ventaRef = doc(db, "ventas", ventaId);
        const ventaSnap = await getDoc(ventaRef);
        if (ventaSnap.exists()) {
          const { items } = ventaSnap.data();
          for (const { productoId, cantidad } of items) {
            const invRef = doc(db, "inventario", productoId);
            const invSnap = await getDoc(invRef);
            const prevStock = Number(invSnap.data().stock_actual || 0);
            await updateDoc(invRef, {
              stock_actual: prevStock + Number(cantidad)
            });
            // delete movimientos
            const movQ = query(
              collection(db, "inventario", productoId, "movimientos"),
              where("ventaId", "==", ventaId)
            );
            const movSnap = await getDocs(movQ);
            for (const m of movSnap.docs) {
              await deleteDoc(
                doc(db, "inventario", productoId, "movimientos", m.id)
              );
            }
          }
          await deleteDoc(ventaRef);
        }
      }

      // Delete ingreso
      await deleteDoc(doc(db, "ingresos", ingresoId));
      setMensaje("Ingreso y venta eliminados, stock restaurado.");
      setShowModalMensaje(true);
      fetchIngresos();
    } catch (err) {
      console.error(err);
      setMensaje("Error al eliminar ingreso.");
      setShowModalMensaje(true);
    }
  }

  const toggleExpanded = id =>
    setExpandedId(expandedId === id ? null : id);

  const handleCopyIngreso = ing => {
    const txt = `Tipo: ${ing.tipo_ingreso}, Monto: C$${ing.monto}, Fecha: ${ing.fecha_ingreso}, Categoría: ${ing.categoria}`;
    navigator.clipboard.writeText(txt).then(() => {
      setToastMsg("Ingreso copiado");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    });
  };

  const ingresosFiltrados = ingresos.filter((ing) =>
    ing.tipo_ingreso?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexInicio = (paginaActual - 1) * elementosPorPagina;
  const ingresosPaginados = ingresosFiltrados.slice(
    indexInicio,
    indexInicio + elementosPorPagina
  );

  return (
    <Container fluid className="ingresos-container">
      <div className="ingresos-header">
        <h5>Lista de Ingresos</h5>
        <Button onClick={openAddModal}>Agregar</Button>
      </div>

      <div className="floating-label-input">
        <input
          type="text"
          placeholder=" "
          className="search-input"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <label>Buscar Ingreso</label>
      </div>

      <div className="ingresos-content">
        <div className="ingresos-list">
          {ingresosPaginados.map(ing => {
            const expanded = expandedId === ing.id;
            return (
              <div
                key={ing.id}
                className={`ingreso-item ${expanded ? "expanded" : ""}`}
                onClick={() => toggleExpanded(ing.id)}
              >
                <div className="ingreso-top">
                  <div className="ingreso-icon">
                    {getIconComponent(ing.tipo_ingreso)}
                  </div>
                  <span className="ingreso-nombre">
                    {ing.tipo_ingreso} (C${ing.monto})
                  </span>
                </div>
                <div className="ingreso-subinfo">
                  <span>{ing.fecha_ingreso}</span>
                  <span className="mx-2">|</span>
                  <span>{ing.categoria}</span>
                </div>
                {expanded && (
                  <div className="ingreso-actions-expanded">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        openDeleteModal(ing);
                      }}
                    >
                      <FaIcons.FaTrash />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        openEditModal(ing);
                      }}
                    >
                      <FaIcons.FaEdit />
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        openDetalleModal(ing);
                      }}
                    >
                      <FaIcons.FaEye /> Ver
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleCopyIngreso(ing);
                      }}
                    >
                      <FaIcons.FaClipboard />
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
              <Card.Text>{ingresos.length}</Card.Text>
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
      <ToastFlotante mensaje={toastMsg} visible={toastVisible} />
      <Paginacion
        paginaActual={paginaActual}
        totalItems={ingresosFiltrados.length}
        itemsPorPagina={elementosPorPagina}
        onPageChange={setPaginaActual}
      />
    </Container>
  );
}
