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

import ModalRegistroGastoFijo from "../components/gastosfijos/ModalRegistroGastoFijo";
import ModalEdicionGastoFijo from "../components/gastosfijos/ModalEdicionGastoFijo";
import ModalEliminacionGastoFijo from "../components/gastosfijos/ModalEliminacionGastoFijo";
import ModalDetalleGastoFijo from "../components/gastosfijos/ModalDetalleGastoFijo";
import ModalMensaje from "../components/ModalMensaje";
import ToastFlotante from "../components/ui/ToastFlotante";
import Paginacion from "../components/ordenamiento/Paginacion";

import "../styles/GastosFijos.css";

function getIconFijo() {
  return <FaIcons.FaLock />;
}

function GastosFijos() {
  const [userId, setUserId] = useState(null);
  const [gastosFijos, setGastosFijos] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);

  const [gastoFijoNuevo, setGastoFijoNuevo] = useState({
    nombre_gasto: "",
    monto_mensual: "",
    frecuencia: "",
    proximo_pago: "",
    recordatorio_activado: false,
  });
  const [gastoFijoEditado, setGastoFijoEditado] = useState(null);
  const [gastoFijoAEliminar, setGastoFijoAEliminar] = useState(null);
  const [gastoFijoDetalle, setGastoFijoDetalle] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [showMsg, setShowMsg] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(3);

  const colRef = collection(db, "gastos_fijos");

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
      fetchGastosFijos();
    }
  });

  useEffect(() => {
    const actualizarItemsPorPantalla = () => {
      setItemsPorPagina(window.innerWidth < 768 ? 5 : 3);
    };
    actualizarItemsPorPantalla();
    window.addEventListener("resize", actualizarItemsPorPantalla);
    return () => window.removeEventListener("resize", actualizarItemsPorPantalla);
  }, []);

  async function fetchGastosFijos() {
    try {
      const snap = await getDocs(colRef);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setGastosFijos(all.filter((g) => g.userId === userId));
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAddGastoFijo(nuevo) {
    setShowAdd(false); // Cerrar modal inmediatamente

    const tempId = `temp_${Date.now()}`;
    const nuevoGastoFijo = { ...nuevo, userId };

    if (isOffline) {
      setGastosFijos((prev) => [...prev, { ...nuevoGastoFijo, id: tempId }]);
    }

    setMensaje("Gasto fijo creado correctamente.");
    setShowMsg(true);

    try {
      await addDoc(colRef, nuevoGastoFijo);
    } catch (error) {
      console.error(error);
    }

    fetchGastosFijos();
  }

  async function handleEditGastoFijo(editado) {
    setShowEdit(false); // Cerrar modal inmediatamente

    if (isOffline) {
      setGastosFijos((prev) =>
        prev.map((g) => (g.id === editado.id ? { ...editado } : g))
      );
    }

    setMensaje("Gasto fijo actualizado correctamente.");
    setShowMsg(true);

    if (!editado.id.startsWith("temp_")) {
      try {
        const refDoc = doc(db, "gastos_fijos", editado.id);
        await updateDoc(refDoc, { ...editado });
      } catch (error) {
        console.error(error);
      }
    }

    fetchGastosFijos();
  }

  async function handleDeleteGastoFijo() {
    if (!gastoFijoAEliminar) return;

    setShowDel(false); // Cerrar modal inmediatamente

    if (isOffline) {
      setGastosFijos((prev) =>
        prev.filter((g) => g.id !== gastoFijoAEliminar.id)
      );
    }

    setMensaje("Gasto fijo eliminado correctamente.");
    setShowMsg(true);

    if (!gastoFijoAEliminar.id.startsWith("temp_")) {
      try {
        const refDoc = doc(db, "gastos_fijos", gastoFijoAEliminar.id);
        await deleteDoc(refDoc);
      } catch (error) {
        console.error(error);
      }
    }

    fetchGastosFijos();
  }

  function handleCopy(texto, mensaje) {
    navigator.clipboard.writeText(texto).then(() => {
      setToastMsg(mensaje);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    });
  }

  function openDetalleModal(g) {
    setGastoFijoDetalle(g);
    setShowDetalle(true);
  }


  const gastosFiltrados = gastosFijos.filter((g) =>
    g.nombre_gasto.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexInicio = (paginaActual - 1) * itemsPorPagina;
  const gastosPaginados = gastosFiltrados.slice(
    indexInicio,
    indexInicio + itemsPorPagina
  );

  return (
    <Container fluid className="gastos-fijos-container">
      <div className="section-header">
        <h4>Lista de Gastos Fijos</h4>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          Agregar
        </Button>
      </div>

      <div className="floating-label-input">
        <input
          type="text"
          placeholder=" "
          className="search-input"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <label>Buscar gasto fijo</label>
      </div>

      <div className="content">
        <div className="listado">
          {gastosPaginados.map((g) => {
            const isExpanded = expandedId === g.id;
            return (
              <div
                key={g.id}
                className={`item ${isExpanded ? "expanded" : ""}`}
                onClick={() =>
                  setExpandedId((prev) => (prev === g.id ? null : g.id))
                }
              >
                <div className="top">
                  <div className="icon">{getIconFijo()}</div>
                  <span className="nombre">
                    {g.nombre_gasto} (C${g.monto_mensual})
                  </span>
                </div>
                <div className="subinfo">
                  <span>{g.frecuencia}</span>
                  <span className="mx-2">|</span>
                  <span>{g.proximo_pago}</span>
                </div>

                {isExpanded && (
                  <div className="acciones">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(
                          `Nombre: ${g.nombre_gasto}, Monto: C$${g.monto_mensual}, Frecuencia: ${g.frecuencia}, Próximo pago: ${g.proximo_pago}`,
                          "Gasto fijo copiado"
                        );
                      }}
                    >
                      <FaIcons.FaClipboard />
                    </Button>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetalleModal(g);
                      }}
                    >
                      <FaIcons.FaEye />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGastoFijoEditado(g);
                        setShowEdit(true);
                      }}
                    >
                      <FaIcons.FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGastoFijoAEliminar(g);
                        setShowDel(true);
                      }}
                    >
                      <FaIcons.FaTrash />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="resumen">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Fijos</Card.Title>
              <Card.Text>{gastosFiltrados.length}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Paginacion
        itemsPerPage={itemsPorPagina}
        totalItems={gastosFiltrados.length}
        currentPage={paginaActual}
        setCurrentPage={setPaginaActual}
      />

      {/* Modales */}
      <ModalRegistroGastoFijo
        show={showAdd}
        handleClose={() => setShowAdd(false)}
        gastoFijoNuevo={gastoFijoNuevo}
        setGastoFijoNuevo={setGastoFijoNuevo}
        handleAddGastoFijo={handleAddGastoFijo}
        setMensaje={setMensaje}
        setShowModalMensaje={setShowMsg}
      />
      <ModalEdicionGastoFijo
        show={showEdit}
        handleClose={() => setShowEdit(false)}
        gastoFijoEditado={gastoFijoEditado}
        setGastoFijoEditado={setGastoFijoEditado}
        handleEditGastoFijo={handleEditGastoFijo}
        setMensaje={setMensaje}
        setShowModalMensaje={setShowMsg}
      />
      <ModalEliminacionGastoFijo
        show={showDel}
        handleClose={() => setShowDel(false)}
        gastoFijoAEliminar={gastoFijoAEliminar}
        handleDeleteGastoFijo={handleDeleteGastoFijo}
      />
      <ModalDetalleGastoFijo
        show={showDetalle}
        handleClose={() => setShowDetalle(false)}
        gastoFijoDetalle={gastoFijoDetalle}
      />
      <ModalMensaje
        show={showMsg}
        handleClose={() => setShowMsg(false)}
        message={mensaje}
      />
      <ToastFlotante mensaje={toastMsg} visible={toastVisible} />
    </Container>
  );
}

export default GastosFijos;
