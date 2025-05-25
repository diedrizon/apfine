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
  runTransaction,
  serverTimestamp,
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
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [det, setDet] = useState(false);
  const [msg, setMsg] = useState("");
  const [smsg, setSmsg] = useState(false);
  const [edO, setEdO] = useState(null);
  const [rmO, setRmO] = useState(null);
  const [dtO, setDtO] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const col = collection(db, "ordenes_produccion");
  const etapas = [
    "Planificada",
    "En proceso",
    "Control calidad",
    "Empaque",
    "Completada",
  ];

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      if (u) setUid(u.uid);
    });
  }, []);

  useEffect(() => {
    if (uid) loadOrders();
  }, [uid]);

  async function loadOrders() {
    const snap = await getDocs(col);
    setOrdenes(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((o) => o.userId === uid)
    );
  }

  function calcularProgreso(estado) {
    const idx = etapas.indexOf(estado);
    return idx >= 0 ? idx * 25 : 0;
  }

  async function adjustMateriaPrima(order, mode, prevOrder = null) {
    await runTransaction(db, async (t) => {
      for (const m of order.materias_primas) {
        const ref = doc(db, "materias_primas", m.id);
        const snap = await t.get(ref);
        if (snap.exists()) {
          let stock = snap.data().stock_actual || 0;
          let newQty = Number(m.cantidad_usada);

          if (mode === "create") {
            stock -= newQty;
          } else if (mode === "edit") {
            const prev = prevOrder?.materias_primas.find(
              (pm) => pm.id === m.id
            );
            const prevQty = prev ? Number(prev.cantidad_usada) : 0;
            stock -= newQty - prevQty;
          } else if (mode === "delete") {
            stock += newQty;
          }

          t.update(ref, { stock_actual: stock });
        }
      }
    });
  }

  async function adjustInventario(order, mode, prevOrder = null) {
    const q = query(
      collection(db, "inventario"),
      where("userId", "==", uid),
      where("nombre_producto", "==", order.producto)
    );
    const ex = await getDocs(q);
    if (!ex.empty) {
      const ref = ex.docs[0].ref;
      const current = ex.docs[0].data().stock_actual || 0;
      let qty = Number(order.cantidad_real);
      const prevQty = prevOrder ? Number(prevOrder.cantidad_real) : 0;

      let finalStock = current;
      if (mode === "create" && order.estado === "Completada") {
        finalStock += qty;
      } else if (mode === "edit") {
        if (
          order.estado === "Completada" &&
          prevOrder.estado !== "Completada"
        ) {
          finalStock += qty;
        } else if (
          order.estado === "Completada" &&
          prevOrder.estado === "Completada"
        ) {
          finalStock += qty - prevQty;
        }
      } else if (mode === "delete" && order.estado === "Completada") {
        finalStock -= qty;
      }

      await updateDoc(ref, { stock_actual: finalStock });
    }
  }

  async function handleOrder(order, mode) {
    order.progreso = calcularProgreso(order.estado);
    order.cantidad_planeada = Number(order.cantidad_planeada) || 0;
    order.cantidad_real = Number(order.cantidad_real) || 0;
    order.horas_trabajadas = Number(order.horas_trabajadas) || 0;
    order.costo_real = Number(order.costo_real) || 0;

    if (mode === "create") {
      const id = (
        await addDoc(col, {
          ...order,
          userId: uid,
          creada_en: serverTimestamp(),
        })
      ).id;

      const fullOrderSnap = await getDoc(doc(db, "ordenes_produccion", id));
      const fullOrder = fullOrderSnap.data();

      await adjustMateriaPrima({ id, ...fullOrder }, "create");
      await adjustInventario({ id, ...fullOrder }, "create");
      setAdd(false);
    } else if (mode === "edit") {
      const prevSnap = await getDoc(doc(db, "ordenes_produccion", order.id));
      const prevOrder = prevSnap.data();

      await updateDoc(doc(db, "ordenes_produccion", order.id), order);
      await adjustMateriaPrima(order, "edit", prevOrder);
      await adjustInventario(order, "edit", prevOrder);
      setEdit(false);
    } else if (mode === "delete") {
      const snap = await getDoc(doc(db, "ordenes_produccion", order.id));
      const data = snap.data();

      await adjustMateriaPrima(data, "delete");
      await adjustInventario(data, "delete");
      await deleteDoc(doc(db, "ordenes_produccion", order.id));
      setDel(false);
    }

    loadOrders();
    setMsg(
      `Orden ${
        mode === "delete"
          ? "eliminada"
          : mode === "edit"
          ? "actualizada"
          : "registrada"
      }`
    );
    setSmsg(true);
  }

  async function advanceStage(order) {
    const idx = etapas.indexOf(order.estado);
    if (idx < 0 || idx >= etapas.length - 1) return;

    const newEstado = etapas[idx + 1];
    const newProgreso = (idx + 1) * 25;

    const updatedOrder = { ...order, estado: newEstado, progreso: newProgreso };
    await handleOrder(updatedOrder, "edit");
  }

  function handleCopyOrden(o) {
    const texto = `Orden: ${o.numero_orden}, Producto: ${o.producto}, Estado: ${o.estado}, Progreso: ${o.progreso}%`;
    navigator.clipboard.writeText(texto).then(() => {
      setToastMsg("Orden copiada");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    });
  }

  return (
    <Container fluid className="ordenes-container">
      <div className="ordenes-header">
        <h5>Órdenes de Producción</h5>
        <Button onClick={() => setAdd(true)}>Nueva</Button>
      </div>
      <div className="ordenes-content">
        <div className="ordenes-list">
          {ordenes.map((o) => (
            <div
              key={o.id}
              className={`orden-item ${exp === o.id ? "expanded" : ""}`}
              onClick={() => setExp(exp === o.id ? null : o.id)}
            >
              <div className="orden-top">
                <Badge
                  bg={
                    o.prioridad === "Alta"
                      ? "danger"
                      : o.prioridad === "Baja"
                      ? "secondary"
                      : "warning"
                  }
                  className="me-2"
                >
                  {o.prioridad}
                </Badge>
                <span className="orden-num">{o.numero_orden}</span>
                <span className="orden-producto flex-grow-1">{o.producto}</span>
                <span className="orden-estado">{o.estado}</span>
              </div>
              <ProgressBar now={o.progreso} className="mb-1" />
              <div className="orden-subinfo">
                <span>{o.proceso || "—"}</span>
                <span className="mx-2">|</span>
                <span>{o.responsable || "—"}</span>
              </div>
              {exp === o.id && (
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
                      advanceStage(o);
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
          ))}
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
      {add && (
        <ModalRegistroOrden
          show={add}
          close={() => setAdd(false)}
          save={(o) => handleOrder(o, "create")}
          uid={uid}
        />
      )}
      {edit && edO && (
        <ModalEdicionOrden
          show={edit}
          close={() => setEdit(false)}
          data={edO}
          setData={setEdO}
          update={(o) => handleOrder(o, "edit")}
          uid={uid}
        />
      )}
      {del && rmO && (
        <ModalEliminacionOrden
          show={del}
          close={() => setDel(false)}
          data={rmO}
          confirm={() => handleOrder(rmO, "delete")}
        />
      )}
      {det && dtO && (
        <ModalDetalleOrden
          show={det}
          close={() => setDet(false)}
          data={dtO}
          refresh={loadOrders}
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
