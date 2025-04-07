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
import ModalMensaje from "../components/ModalMensaje"; // si ya lo tienes en tu proyecto

import "../styles/Gastos.css";

/**
 * Dado el tipo_gasto (Personal u Operativo), selecciona un ícono.
 * Ajusta a tu gusto.
 */
function getIconGasto(tipo_gasto) {
  if (!tipo_gasto) return <FaIcons.FaQuestion />;
  const lower = tipo_gasto.toLowerCase();
  if (lower === "personal") return <FaIcons.FaUser />;
  if (lower === "operativo") return <FaIcons.FaTools />;
  return <FaIcons.FaInbox />;
}

function Gastos() {
  const [userId, setUserId] = useState(null);
  const [gastos, setGastos] = useState([]);

  // Modales
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);

  // Objetos manipulados
  const [gastoNuevo, setGastoNuevo] = useState(null);
  const [gastoEditado, setGastoEditado] = useState(null);
  const [gastoAEliminar, setGastoAEliminar] = useState(null);
  const [gastoDetalle, setGastoDetalle] = useState(null);

  // Modal Mensaje
  const [showModalMensaje, setShowModalMensaje] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Para expandir tarjetas
  const [expandedId, setExpandedId] = useState(null);

  // Referencia a la colección "gastos"
  const gastosCollection = collection(db, "gastos");

  // Detectar el user.uid
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
  }, []);

  // Cargar gastos
  useEffect(() => {
    if (userId) fetchGastos();
  },);

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

  // Abrir/cerrar modales
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

  // CRUD
  async function handleAddGasto(nuevo) {
    try {
      // Insertar con userId
      await addDoc(gastosCollection, { ...nuevo, userId });
      setMensaje("Gasto registrado con éxito.");
      setShowModalMensaje(true);
      closeAddModal();
      fetchGastos();
    } catch (error) {
      console.error(error);
      setMensaje("Error al registrar el gasto.");
      setShowModalMensaje(true);
    }
  }

  async function handleEditGasto(editado) {
    if (!editado.id) return;
    try {
      const refDoc = doc(db, "gastos", editado.id);
      await updateDoc(refDoc, { ...editado });
      setMensaje("Gasto actualizado con éxito.");
      setShowModalMensaje(true);
      closeEditModal();
      fetchGastos();
    } catch (error) {
      console.error(error);
      setMensaje("Error al editar el gasto.");
      setShowModalMensaje(true);
    }
  }

  async function handleDeleteGasto() {
    if (!gastoAEliminar) return;
    try {
      const refDoc = doc(db, "gastos", gastoAEliminar.id);
      await deleteDoc(refDoc);
      setMensaje("Gasto eliminado con éxito.");
      setShowModalMensaje(true);
      closeDeleteModal();
      fetchGastos();
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar el gasto.");
      setShowModalMensaje(true);
    }
  }

  // Expandir tarjetas
  function toggleExpanded(g) {
    setExpandedId(expandedId === g.id ? null : g.id);
  }

  // Ejemplo: total de gastos
  const totalGastos = gastos.length;

  return (
    <Container fluid className="gastos-container">
      <div className="gastos-header">
        <h5>Lista de Gastos</h5>
        <Button variant="primary" onClick={openAddModal}>
          Agregar
        </Button>
      </div>

      <div className="gastos-content">
        <div className="gastos-list">
          {gastos.map((g) => {
            const isExpanded = expandedId === g.id;
            return (
              <div
                key={g.id}
                className={`gasto-item ${isExpanded ? "expanded" : ""}`}
                onClick={() => toggleExpanded(g)}
              >
                <div className="gasto-top">
                  <div className="gasto-icon">{getIconGasto(g.tipo_gasto)}</div>
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

      {/* Modal Registro */}
      {gastoNuevo && (
        <ModalRegistroGasto
          show={showModalAdd}
          handleClose={closeAddModal}
          gastoNuevo={gastoNuevo}
          setGastoNuevo={setGastoNuevo}
          handleAddGasto={handleAddGasto}
          setMensaje={setMensaje}
          setShowModalMensaje={setShowModalMensaje}
        />
      )}

      {/* Modal Edición */}
      {gastoEditado && (
        <ModalEdicionGasto
          show={showModalEdit}
          handleClose={closeEditModal}
          gastoEditado={gastoEditado}
          setGastoEditado={setGastoEditado}
          handleEditGasto={handleEditGasto}
          setMensaje={setMensaje}
          setShowModalMensaje={setShowModalMensaje}
        />
      )}

      {/* Modal Eliminación */}
      {gastoAEliminar && (
        <ModalEliminacionGasto
          show={showModalDelete}
          handleClose={closeDeleteModal}
          gastoAEliminar={gastoAEliminar}
          handleDeleteGasto={handleDeleteGasto}
        />
      )}

      {/* Modal Detalle */}
      {gastoDetalle && (
        <ModalDetalleGasto
          show={showModalDetalle}
          handleClose={closeDetalleModal}
          gastoDetalle={gastoDetalle}
        />
      )}

      {/* Modal mensaje */}
      <ModalMensaje
        show={showModalMensaje}
        handleClose={() => setShowModalMensaje(false)}
        message={mensaje}
      />
    </Container>
  );
}

export default Gastos;
