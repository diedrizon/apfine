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
import {
  FaPiggyBank,
  FaChartLine,
  FaPercent,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import ModalRegistroMeta from "../components/metas/ModalRegistroMeta";
import ModalEdicionMeta from "../components/metas/ModalEdicionMeta";
import ModalEliminacionMeta from "../components/metas/ModalEliminacionMeta";
import ModalDetalleMeta from "../components/metas/ModalDetalleMeta";
import ModalMensaje from "../components/ModalMensaje";

import "../styles/Metas.css";

function iconoPorTipo(tipo) {
  if (tipo === "Ahorro") return <FaPiggyBank />;
  if (tipo === "Inversión") return <FaChartLine />;
  return <FaPercent />;
}

function Metas() {
  const [userId, setUserId] = useState(null);
  const [metas, setMetas] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [showDet, setShowDet] = useState(false);

  const [metaNueva, setMetaNueva] = useState({
    nombre_meta: "",
    tipo: "",
    monto_objetivo: "",
    fecha_limite: "",
    monto_actual: "",
  });

  const [metaEditada, setMetaEditada] = useState(null);
  const [metaAEliminar, setMetaAEliminar] = useState(null);
  const [metaDetalle, setMetaDetalle] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [showMsg, setShowMsg] = useState(false);

  const colRef = collection(db, "metas");

  useEffect(() => {
    onAuthStateChanged(auth, (u) => u && setUserId(u.uid));
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchMetas();
  });

  async function fetchMetas() {
    const snap = await getDocs(colRef);
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((m) => m.userId === userId);
    setMetas(list);
  }

  async function handleAddMeta(n) {
    await addDoc(colRef, { ...n, userId });
    setMensaje("Meta creada");
    setShowMsg(true);
    setShowAdd(false);
    fetchMetas();
  }

  async function handleEditMeta(e) {
    await updateDoc(doc(db, "metas", e.id), { ...e });
    setMensaje("Meta actualizada");
    setShowMsg(true);
    setShowEdit(false);
    fetchMetas();
  }

  async function handleDeleteMeta() {
    await deleteDoc(doc(db, "metas", metaAEliminar.id));
    setMensaje("Meta eliminada");
    setShowMsg(true);
    setShowDel(false);
    fetchMetas();
  }

  function toggleExpanded(meta) {
    setExpandedId(expandedId === meta.id ? null : meta.id);
  }

  return (
    <Container fluid className="metas-container">
      <div className="section-header">
        <h4>Lista de Metas</h4>
        <Button onClick={() => setShowAdd(true)}>Agregar</Button>
      </div>

      <div className="content">
        <div className="listado">
          {metas.map((m) => {
            const actual = parseFloat(m.monto_actual || 0);
            const objetivo = parseFloat(m.monto_objetivo || 1);
            const porcentaje = ((actual / objetivo) * 100).toFixed(0);
            const hoy = new Date().toISOString().slice(0, 10);
            let estado = "Activa";
            if (actual >= objetivo) estado = "Cumplida";
            else if (hoy > m.fecha_limite) estado = "Vencida";

            const isExpanded = expandedId === m.id;

            return (
              <div
                key={m.id}
                className={`meta-item item ${isExpanded ? "expanded" : ""}`}
                onClick={() => toggleExpanded(m)}
              >
                <div className="top">
                  <div className="icon">{iconoPorTipo(m.tipo)}</div>
                  <span className="nombre">
                    {m.nombre_meta} ({porcentaje}%)
                  </span>
                </div>
                <div className="subinfo">
                  <span>
                    C${actual} / C${objetivo}
                  </span>
                  <span className="mx-2">|</span>
                  <span>{m.fecha_limite}</span>
                  <span className="mx-2">|</span>
                  <span className={`badge-${estado.toLowerCase()}`}>
                    {estado}
                  </span>
                </div>

                {isExpanded && (
                  <div className="acciones">
                    <Button
                      size="sm"
                      variant="info"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMetaDetalle(m);
                        setShowDet(true);
                      }}
                    >
                      <FaEye />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMetaEditada(m);
                        setShowEdit(true);
                      }}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMetaAEliminar(m);
                        setShowDel(true);
                      }}
                    >
                      <FaTrash />
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
              <Card.Title>Total Metas</Card.Title>
              <Card.Text>{metas.length}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      <ModalRegistroMeta
        show={showAdd}
        handleClose={() => setShowAdd(false)}
        metaNueva={metaNueva}
        setMetaNueva={setMetaNueva}
        handleAddMeta={handleAddMeta}
        setMensaje={setMensaje}
        setShowModalMensaje={setShowMsg}
      />
      <ModalEdicionMeta
        show={showEdit}
        handleClose={() => setShowEdit(false)}
        metaEditada={metaEditada}
        setMetaEditada={setMetaEditada}
        handleEditMeta={handleEditMeta}
        setMensaje={setMensaje}
        setShowModalMensaje={setShowMsg}
      />
      <ModalEliminacionMeta
        show={showDel}
        handleClose={() => setShowDel(false)}
        metaAEliminar={metaAEliminar}
        handleDeleteMeta={handleDeleteMeta}
      />
      <ModalDetalleMeta
        show={showDet}
        handleClose={() => setShowDet(false)}
        metaDetalle={metaDetalle}
      />
      <ModalMensaje
        show={showMsg}
        handleClose={() => setShowMsg(false)}
        message={mensaje}
      />
    </Container>
  );
}

export default Metas;
