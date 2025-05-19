// src/views/OrdenesProduccion.jsx

import React, { useState, useEffect } from "react";
import { db, auth } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  runTransaction,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Container, Button, Card, ProgressBar, Badge } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";
import ModalRegistroOrden from "../components/ordenesproduccion/ModalRegistroOrden";
import ModalEdicionOrden from "../components/ordenesproduccion/ModalEdicionOrden";
import ModalEliminacionOrden from "../components/ordenesproduccion/ModalEliminacionOrden";
import ModalDetalleOrden from "../components/ordenesproduccion/ModalDetalleOrden";
import ModalMensaje from "../components/ModalMensaje";
import ToastFlotante from "../components/ui/ToastFlotante";
import "../styles/OrdenesProduccion.css";

export default function OrdenesProduccion() {
  const [uid, setUid] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [exp, setExp] = useState(null);
  const [off, setOff] = useState(!navigator.onLine);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [det, setDet] = useState(false);
  const [msg, setMsg] = useState("");
  const [smsg, setSmsg] = useState(false);
  const [newO, setNewO] = useState(null);
  const [edO, setEdO] = useState(null);
  const [rmO, setRmO] = useState(null);
  const [dtO, setDtO] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const col = collection(db, "ordenes_produccion");

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      if (u) setUid(u.uid);
    });
  }, []);

  useEffect(() => {
    const goOnline = () => setOff(false);
    const goOffline = () => setOff(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    if (uid) load();
  }, [uid]);

  async function load() {
    const snap = await getDocs(col);
    setOrdenes(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((o) => o.userId === uid)
    );
  }

  function idGen() {
    return `OP-${Date.now().toString().slice(-6)}`;
  }

  function openAdd() {
    setNewO({
      numero_orden: idGen(),
      producto: "",
      prioridad: "Media",
      proceso: "",
      responsable: "",
      cantidad_planeada: "",
      fecha_inicio: new Date().toISOString().split("T")[0],
      fecha_fin_estimada: "",
      estado: "Planificada",
      progreso: 0,
      materias_primas: [],
    });
    setAdd(true);
  }

  async function handleAdd(o) {
    setAdd(false);
    // Asegura convertir a número los campos numéricos
    o.costo_estimado = Number(o.costo_estimado) || 0;
    o.costo_real = Number(o.costo_real) || 0;
    o.horas_trabajadas = Number(o.horas_trabajadas) || 0;
    o.cantidad_planeada = Number(o.cantidad_planeada) || 0;
    o.cantidad_real = Number(o.cantidad_real) || 0;

    const stageProgress = {
      "Planificada": 0,
      "En proceso": 25,
      "Control calidad": 50,
      "Empaque": 75,
      "Completada": 100,
    };
    o.progreso = stageProgress[o.estado] || 0;

    const payload = {
      ...o,
      userId: uid,
      creada_en: serverTimestamp(),
      // se pueden mantener campos adicionales...
    };

    if (off) {
      setOrdenes((prev) => [...prev, { ...payload, id: `tmp_${Date.now()}` }]);
    } else {
      await addDoc(col, payload);
    }
    setMsg("Orden registrada");
    setSmsg(true);
    load();
  }

  async function stocks(o) {
    if (o.estado !== "Completada") return;
    await runTransaction(db, async (t) => {
      for (const m of o.materias_primas) {
        const refM = doc(db, "materias_primas", m.id);
        const snapM = await t.get(refM);
        if (!snapM.exists()) continue;
        t.update(refM, {
          stock_actual: (snapM.data().stock_actual || 0) - Number(m.cantidad_usada),
        });
      }
    });
    const q = query(
      collection(db, "inventario"),
      where("usuario_id", "==", uid),
      where("nombre_producto", "==", o.producto)
    );
    const ex = await getDocs(q);
    if (ex.empty) {
      await addDoc(collection(db, "inventario"), {
        usuario_id: uid,
        nombre_producto: o.producto,
        stock_actual: o.cantidad_real,
        stock_mínimo: 0,
        costo_unitario: o.costo_real / o.cantidad_real,
        precio_venta: 0,
      });
    } else {
      await updateDoc(ex.docs[0].ref, {
        stock_actual: (ex.docs[0].data().stock_actual || 0) + o.cantidad_real,
      });
    }
  }

  async function handleEdit(o) {
    setEdit(false);
    // Actualización inmediata en UI
    setOrdenes((prev) => prev.map((x) => (x.id === o.id ? o : x)));
    setMsg("Orden actualizada");
    setSmsg(true);

    if (!o.id.startsWith("tmp_")) {
      await updateDoc(doc(db, "ordenes_produccion", o.id), o);
      await stocks(o);
      // opcional: await load();
    }
  }

  async function handleDel() {
    setDel(false);
    if (!rmO) return;
    if (off) {
      setOrdenes((prev) => prev.filter((x) => x.id !== rmO.id));
    }
    setMsg("Orden eliminada");
    setSmsg(true);
    if (!rmO.id.startsWith("tmp_")) {
      await deleteDoc(doc(db, "ordenes_produccion", rmO.id));
    }
    load();
  }

  function handleCopyOrden(o) {
    const texto = `Orden: ${o.numero_orden}, Producto: ${o.producto}, Estado: ${o.estado}, Progreso: ${o.progreso}%`;
    navigator.clipboard.writeText(texto).then(() => {
      setToastMsg("Orden copiada");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    });
  }

  const etapas = [
    "Planificada",
    "En proceso",
    "Control calidad",
    "Empaque",
    "Completada",
  ];

  function next(o) {
    const idx = etapas.indexOf(o.estado);
    if (idx < 0 || idx === etapas.length - 1) return;
    const nuevoEstado = etapas[idx + 1];
    const nuevoProgreso = Math.min(o.progreso + 25, 100);
    handleEdit({ ...o, estado: nuevoEstado, progreso: nuevoProgreso });
  }

  function badge(c) {
    return c === "Alta" ? "danger" : c === "Baja" ? "secondary" : "warning";
  }

  return (
    <Container fluid className="ordenes-container">
      <div className="ordenes-header">
        <h5>Órdenes de Producción</h5>
        <Button onClick={openAdd}>Nueva</Button>
      </div>

      <div className="ordenes-content">
        <div className="ordenes-list">
          {ordenes.map((o) => {
            const expanded = exp === o.id;
            return (
              <div
                key={o.id}
                className={`orden-item ${expanded ? "expanded" : ""}`}
                onClick={() => setExp(expanded ? null : o.id)}
              >
                <div className="orden-top">
                  <Badge bg={badge(o.prioridad)} className="me-2">
                    {o.prioridad}
                  </Badge>
                  <span className="orden-num">{o.numero_orden}</span>
                  <span className="orden-producto flex-grow-1">
                    {o.producto}
                  </span>
                  <span className="orden-estado">{o.estado}</span>
                </div>

                <ProgressBar now={o.progreso} className="mb-1" />

                <div className="orden-subinfo">
                  <span>{o.proceso || "—"}</span>
                  <span className="mx-2">|</span>
                  <span>{o.responsable || "—"}</span>
                </div>

                {expanded && (
                  <div className="orden-actions-expanded">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyOrden(o);
                      }}
                    >
                      <FaIcons.FaClipboard />
                    </Button>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDtO(o);
                        setDet(true);
                      }}
                    >
                      <FaIcons.FaEye />
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        next(o);
                      }}
                    >
                      <FaIcons.FaForward />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEdO(o);
                        setEdit(true);
                      }}
                    >
                      <FaIcons.FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRmO(o);
                        setDel(true);
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

        <div className="ordenes-summary">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Órdenes</Card.Title>
              <Card.Text>{ordenes.length}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      {add && newO && (
        <ModalRegistroOrden
          show={add}
          close={() => setAdd(false)}
          data={newO}
          setData={setNewO}
          save={handleAdd}
          uid={uid}
        />
      )}

      {edit && edO && (
        <ModalEdicionOrden
          show={edit}
          close={() => setEdit(false)}
          data={edO}
          setData={setEdO}
          update={handleEdit}
          uid={uid}
        />
      )}

      {del && rmO && (
        <ModalEliminacionOrden
          show={del}
          close={() => setDel(false)}
          data={rmO}
          confirm={handleDel}
        />
      )}

      {det && dtO && (
        <ModalDetalleOrden
          show={det}
          close={() => setDet(false)}
          data={dtO}
          refresh={load}
        />
      )}

      <ModalMensaje
        show={smsg}
        handleClose={() => setSmsg(false)}
        message={msg}
      />

      <ToastFlotante mensaje={toastMsg} visible={toastVisible} />
    </Container>
  );
}
