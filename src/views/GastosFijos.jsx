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

import "../styles/GastosFijos.css";

function getIconFijo() {
  return <FaIcons.FaLock />;
}

function GastosFijos() {
  const [userId, setUserId] = useState(null);
  const [gastosFijos, setGastosFijos] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

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

  const colRef = collection(db, "gastos_fijos");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchGastosFijos();
  });

  async function fetchGastosFijos() {
    const snap = await getDocs(colRef);
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setGastosFijos(all.filter((g) => g.userId === userId));
  }

  async function handleAddGastoFijo(nuevo) {
    await addDoc(colRef, { ...nuevo, userId });
    setMensaje("Gasto fijo creado correctamente");
    setShowMsg(true);
    setShowAdd(false);
    fetchGastosFijos();
  }

  async function handleEditGastoFijo(editado) {
    const refDoc = doc(db, "gastos_fijos", editado.id);
    await updateDoc(refDoc, { ...editado });
    setMensaje("Gasto fijo actualizado");
    setShowMsg(true);
    setShowEdit(false);
    fetchGastosFijos();
  }

  async function handleDeleteGastoFijo() {
    const refDoc = doc(db, "gastos_fijos", gastoFijoAEliminar.id);
    await deleteDoc(refDoc);
    setMensaje("Gasto fijo eliminado");
    setShowMsg(true);
    setShowDel(false);
    fetchGastosFijos();
  }

  function openDetalleModal(g) {
    setGastoFijoDetalle(g);
    setShowDetalle(true);
  }

  return (
    <Container fluid className="gastos-fijos-container">
      <div className="section-header">
        <h4>Lista de Gastos Fijos</h4>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          Agregar
        </Button>
      </div>

      <div className="content">
        <div className="listado">
          {gastosFijos.map((g) => {
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
              <Card.Text>{gastosFijos.length}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

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
    </Container>
  );
}

export default GastosFijos;
