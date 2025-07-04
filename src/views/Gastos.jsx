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

import ModalRegistroGasto from "../components/gastos/ModalRegistroGasto";
import ModalEdicionGasto from "../components/gastos/ModalEdicionGasto";
import ModalEliminacionGasto from "../components/gastos/ModalEliminacionGasto";
import ModalDetalleGasto from "../components/gastos/ModalDetalleGasto";
import ModalMensaje from "../components/ModalMensaje";
import ToastFlotante from "../components/ui/ToastFlotante";
import Paginacion from "../components/ordenamiento/Paginacion";

import "../styles/Gastos.css";

export function getIconGasto(tipo_gasto) {
  const clase =
    tipo_gasto === "Personal"
      ? "personal"
      : tipo_gasto === "Operativo"
      ? "operativo"
      : "default";
  const estilo = { fontSize: "1.5rem" };

  const icon =
    tipo_gasto === "Personal" ? (
      <FaIcons.FaUser />
    ) : tipo_gasto === "Operativo" ? (
      <FaIcons.FaTools />
    ) : (
      <FaIcons.FaInbox />
    );

  return (
    <div className={`gasto-icon ${clase}`} style={estilo}>
      {icon}
    </div>
  );
}

function Gastos() {
  const [userId, setUserId] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [showModalMensaje, setShowModalMensaje] = useState(false);

  const [mensaje, setMensaje] = useState("");

  const [gastoNuevo, setGastoNuevo] = useState(null);
  const [gastoEditado, setGastoEditado] = useState(null);
  const [gastoAEliminar, setGastoAEliminar] = useState(null);
  const [gastoDetalle, setGastoDetalle] = useState(null);

  const [expandedId, setExpandedId] = useState(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(3);

  const handleCopy = (texto, mensaje) => {
    navigator.clipboard.writeText(texto).then(() => {
      setToastMsg(mensaje);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    });
  };

  const gastosCollection = collection(db, "gastos");
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
      fetchGastos();
      fetchCategorias();
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

  async function fetchGastos() {
    try {
      const snapshot = await getDocs(gastosCollection);
      const all = snapshot.docs.map((docu) => ({
        ...docu.data(),
        id: docu.id,
      }));
      const filtered = all.filter((g) => g.userId === userId);
      setGastos(filtered);
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
          (cat.aplicacion === "Gasto" || cat.aplicacion === "Ambos")
      );
      setCategorias(userCategorias);
    } catch (error) {
      console.error(error);
    }
  }

  function openAddModal() {
    setGastoNuevo({
      fecha_gasto: "",
      monto: "",
      tipo_gasto: "",
      categoria: "",
      proveedor: "",
      medio_pago: "",
      descripcion: "",
      comprobanteURL: "",
    });
    setShowModalAdd(true);
  }

  function closeAddModal() {
    setShowModalAdd(false);
  }

  function openEditModal(g) {
    setGastoEditado({ ...g });
    setShowModalEdit(true);
  }

  function closeEditModal() {
    setShowModalEdit(false);
  }

  function openDeleteModal(g) {
    setGastoAEliminar(g);
    setShowModalDelete(true);
  }

  function closeDeleteModal() {
    setShowModalDelete(false);
  }

  function openDetalleModal(g) {
    setGastoDetalle(g);
    setShowModalDetalle(true);
  }

  function closeDetalleModal() {
    setShowModalDetalle(false);
  }

  async function handleAddGasto(nuevo) {
    closeAddModal();

    const tempId = `temp_${Date.now()}`;
    const nuevoGasto = { ...nuevo, userId };

    if (isOffline) {
      setGastos((prev) => [...prev, { ...nuevoGasto, id: tempId }]);
    }

    setMensaje("Gasto registrado con éxito.");
    setShowModalMensaje(true);

    try {
      await addDoc(gastosCollection, nuevoGasto);
    } catch (error) {
      console.error(error);
    }

    fetchGastos();
  }

  async function handleEditGasto(editado) {
    if (!editado.id) return;

    closeEditModal();

    if (isOffline) {
      setGastos((prev) =>
        prev.map((g) => (g.id === editado.id ? { ...editado } : g))
      );
    }

    setMensaje("Gasto actualizado con éxito.");
    setShowModalMensaje(true);

    if (!editado.id.startsWith("temp_")) {
      try {
        const refDoc = doc(db, "gastos", editado.id);
        await updateDoc(refDoc, { ...editado });
      } catch (error) {
        console.error(error);
      }
    }

    fetchGastos();
  }

  async function handleDeleteGasto() {
    if (!gastoAEliminar) return;

    closeDeleteModal();

    if (isOffline) {
      setGastos((prev) => prev.filter((g) => g.id !== gastoAEliminar.id));
    }

    setMensaje("Gasto eliminado con éxito.");
    setShowModalMensaje(true);

    if (!gastoAEliminar.id.startsWith("temp_")) {
      try {
        const refDoc = doc(db, "gastos", gastoAEliminar.id);
        await deleteDoc(refDoc);
      } catch (error) {
        console.error(error);
      }
    }

    fetchGastos();
  }

  function toggleExpanded(g) {
    setExpandedId(expandedId === g.id ? null : g.id);
  }

  const totalGastos = gastos.length;

  const gastosFiltrados = gastos.filter((g) =>
    (g.tipo_gasto || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (g.categoria || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (g.descripcion || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const gastosPaginados = gastosFiltrados.slice(indexPrimero, indexUltimo);


  return (
    <Container fluid className="gastos-container">
      <div className="gastos-header">
        <h5>Lista de Gastos</h5>
        <Button variant="primary" onClick={openAddModal}>
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
        <label>Buscar gasto</label>
      </div>

      <div className="gastos-content">
        <div className="gastos-list">
          {gastosPaginados.map((g) => {
            const isExpanded = expandedId === g.id;
            return (
              <div
                key={g.id}
                className={`gasto-item ${isExpanded ? "expanded" : ""}`}
                onClick={() => toggleExpanded(g)}
              >
                <div className="gasto-top">
                  {getIconGasto(g.tipo_gasto)}
                  <span className="gasto-nombre">
                    {g.tipo_gasto || "—"} (C${g.monto})
                  </span>
                </div>
                <div className="gasto-subinfo">
                  <span>{g.fecha_gasto}</span>
                  <span className="mx-2">|</span>
                  <span>{g.categoria}</span>
                </div>

                {isExpanded && (
                  <div className="gasto-actions-expanded">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(
                          `Tipo: ${g.tipo_gasto}, Monto: C$${g.monto}, Fecha: ${g.fecha_gasto}, Categoría: ${g.categoria}`,
                          "Gasto copiado"
                        );
                      }}
                    >
                      <FaIcons.FaClipboard />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(g);
                      }}
                    >
                      <FaIcons.FaTrash />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(g);
                      }}
                    >
                      <FaIcons.FaEdit />
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetalleModal(g);
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

        <div className="gastos-summary">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Gastos</Card.Title>
              <Card.Text>{totalGastos}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Paginacion
        itemsPerPage={itemsPorPagina} // Cambiado para usar el nombre correcto
        totalItems={gastosFiltrados.length}
        currentPage={paginaActual}
        setCurrentPage={setPaginaActual}
      />

      {/* Modales */}
      {gastoNuevo && (
        <ModalRegistroGasto
          show={showModalAdd}
          handleClose={closeAddModal}
          gastoNuevo={gastoNuevo}
          setGastoNuevo={setGastoNuevo}
          handleAddGasto={handleAddGasto}
          setMensaje={setMensaje}
          setShowModalMensaje={setShowModalMensaje}
          categorias={categorias}
        />
      )}

      {gastoEditado && (
        <ModalEdicionGasto
          show={showModalEdit}
          handleClose={closeEditModal}
          gastoEditado={gastoEditado}
          setGastoEditado={setGastoEditado}
          handleEditGasto={handleEditGasto}
          setMensaje={setMensaje}
          setShowModalMensaje={setShowModalMensaje}
          categorias={categorias}
        />
      )}

      {gastoAEliminar && (
        <ModalEliminacionGasto
          show={showModalDelete}
          handleClose={closeDeleteModal}
          gastoAEliminar={gastoAEliminar}
          handleDeleteGasto={handleDeleteGasto}
        />
      )}

      {gastoDetalle && (
        <ModalDetalleGasto
          show={showModalDetalle}
          handleClose={closeDetalleModal}
          gastoDetalle={gastoDetalle}
        />
      )}

      <ModalMensaje
        show={showModalMensaje}
        handleClose={() => setShowModalMensaje(false)}
        message={mensaje}
      />

      <ToastFlotante mensaje={toastMsg} visible={toastVisible} />
    </Container>
  );
}

export default Gastos;
