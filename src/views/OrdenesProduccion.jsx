import React, { useState, useEffect } from "react";
import { db, auth } from "../database/firebaseconfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Container, Button, Card } from "react-bootstrap";
import * as Fa from "react-icons/fa";
import ModalRegistroOrden from "../components/ordenesproduccion/ModalRegistroOrden";
import ModalEdicionOrden from "../components/ordenesproduccion/ModalEdicionOrden";
import ModalEliminacionOrden from "../components/ordenesproduccion/ModalEliminacionOrden";
import ModalDetalleOrden from "../components/ordenesproduccion/ModalDetalleOrden";
import ModalRegistroAvance from "../components/ordenesproduccion/ModalRegistroAvance";
import ModalMensaje from "../components/ModalMensaje";
import Paginacion from "../components/ordenamiento/Paginacion";
import "../styles/OrdenesProduccion.css";

export default function OrdenesProduccion() {
  const [userId, setUserId] = useState(null);
  const [productosList, setProductosList] = useState([]);
  const [materiasList, setMateriasList] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [showDet, setShowDet] = useState(false);
  const [showAvance, setShowAvance] = useState(false);
  const [nueva, setNueva] = useState(null);
  const [editada, setEditada] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [avOrden, setAvOrden] = useState(null);
  const [msg, setMsg] = useState("");
  const [showMsg, setShowMsg] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(3);

  const colOrdenes = collection(db, "ordenes_produccion");
  const colInventario = collection(db, "inventario");
  const colMaterias = collection(db, "materias_primas");

  useEffect(() => onAuthStateChanged(auth, (u) => u && setUserId(u.uid)), []);
  useEffect(() => {
    if (!userId) return;
    loadProductos();
    loadMaterias();
    loadOrdenes();
  }, [userId]);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  useEffect(() => {
    const ajustarCantidad = () => {
      setItemsPorPagina(window.innerWidth < 768 ? 5 : 3);
    };
    ajustarCantidad();
    window.addEventListener("resize", ajustarCantidad);
    return () => window.removeEventListener("resize", ajustarCantidad);
  }, []);

  const loadProductos = async () => {
    const s = await getDocs(colInventario);
    setProductosList(
      s.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.userId === userId)
    );
  };
  const loadMaterias = async () => {
    const s = await getDocs(colMaterias);
    setMateriasList(
      s.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((m) => m.userId === userId)
    );
  };
  const loadOrdenes = async () => {
    const s = await getDocs(colOrdenes);
    setOrdenes(
      s.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((o) => o.userId === userId)
    );
  };

  async function ajustarStocks(nuevaOrden, ordenPrev = null, tipo = "crear") {
    const factor = tipo === "eliminar" ? -1 : 1;
    const lista =
      tipo === "editar" && ordenPrev
        ? [
            { ...ordenPrev, signo: -1 },
            { ...nuevaOrden, signo: 1 },
          ]
        : [{ ...nuevaOrden, signo: factor }];
    for (const ord of lista) {
      if (ord.estado !== "Completada") continue;
      const q = Number(ord.cantidad_real || 0) * ord.signo;
      if (q) {
        const qs = await getDocs(colInventario);
        const pSnap = qs.docs.find(
          (d) => d.data().nombre_producto === ord.producto
        );
        if (pSnap) {
          const ref = doc(db, "inventario", pSnap.id);
          const stockActual = Number(pSnap.data().stock_actual || 0);
          await updateDoc(ref, { stock_actual: stockActual + q });
        }
      }
      for (const mp of ord.materias_primas || []) {
        const qs = await getDocs(colMaterias);
        const mpSnap = qs.docs.find((d) => d.data().nombre === mp.nombre);
        if (mpSnap) {
          const ref = doc(db, "materias_primas", mpSnap.id);
          const stockMp = Number(mpSnap.data().stock_actual || 0);
          await updateDoc(ref, {
            stock_actual: stockMp - mp.cantidad_utilizada * ord.signo,
          });
        }
      }
    }
  }

  const add = async (item) => {
    setShowAdd(false);
    if (offline) {
      setOrdenes((o) => [...o, { ...item, id: `temp_${Date.now()}`, userId }]);
      setMsg("Orden registrada offline");
      setShowMsg(true);
      return;
    }
    const ref = await addDoc(colOrdenes, { ...item, userId });
    await ajustarStocks({ ...item, id: ref.id }, null, "crear");
    setMsg("Orden registrada");
    setShowMsg(true);
    loadOrdenes();
  };

  const edit = async (item) => {
    setShowEdit(false);
    const prev = ordenes.find((o) => o.id === item.id);
    if (offline) {
      setOrdenes((o) => o.map((i) => (i.id === item.id ? item : i)));
      setMsg("Orden actualizada offline");
      setShowMsg(true);
      return;
    }
    await updateDoc(doc(db, "ordenes_produccion", item.id), item);
    await ajustarStocks(item, prev, "editar");
    setMsg("Orden actualizada");
    setShowMsg(true);
    loadOrdenes();
  };

  const del = async () => {
    if (!aEliminar) return;
    setShowDel(false);
    if (offline) {
      setOrdenes((o) => o.filter((i) => i.id !== aEliminar.id));
      setMsg("Orden eliminada offline");
      setShowMsg(true);
      return;
    }
    await deleteDoc(doc(db, "ordenes_produccion", aEliminar.id));
    await ajustarStocks(aEliminar, null, "eliminar");
    setMsg("Orden eliminada");
    setShowMsg(true);
    loadOrdenes();
  };

  const guardarAvance = async (av) => {
    setShowAvance(false);
    if (!avOrden) return;
    const sub = collection(db, "ordenes_produccion", avOrden.id, "avances");
    await addDoc(sub, av);
    const cant = Number(av.cantidad_producida);
    if (cant) {
      const prevCantidad = Number(avOrden.cantidad_real || 0);
      const nuevaCantidad = prevCantidad + cant;
      await updateDoc(doc(db, "ordenes_produccion", avOrden.id), {
        cantidad_real: nuevaCantidad,
      });
      if (avOrden.estado === "Completada") {
        await ajustarStocks(
          { ...avOrden, cantidad_real: nuevaCantidad },
          { ...avOrden, cantidad_real: prevCantidad },
          "editar"
        );
      }
    }
    setMsg("Avance registrado");
    setShowMsg(true);
    loadOrdenes();
  };

  const iconoEstado = (e) =>
    e === "Completada" ? (
      <Fa.FaCheckCircle className="completed" />
    ) : e === "En proceso" ? (
      <Fa.FaCog />
    ) : e === "Cancelada" ? (
      <Fa.FaBan color="#f44336" />
    ) : (
      <Fa.FaClipboardList />
    );
  const openAdd = () => {
    setNueva({
      producto: "",
      cantidad_planeada: "",
      fecha_inicio: new Date().toISOString().split("T")[0],
      fecha_fin_estimada: "",
      estado: "Planificada",
      materias_primas: [],
    });
    setShowAdd(true);
  };

  const ordenesFiltradas = ordenes.filter((op) =>
    op.producto.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexFinal = paginaActual * itemsPorPagina;
  const indexInicio = indexFinal - itemsPorPagina;
  const ordenesPaginadas = ordenesFiltradas.slice(indexInicio, indexFinal);

  return (
    <Container fluid className="op-container">
      <header className="op-header">
        <h4>Órdenes de Producción</h4>
        <Button onClick={openAdd}>Agregar</Button>
      </header>

      <div className="floating-label-input">
        <input
          type="text"
          placeholder="Buscar producto"
          className="search-input"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <label>Buscar producto</label>
      </div>

      <div className="op-content">
        <section className="op-list">
          {ordenesPaginadas.map((op) => {
            const open = expandedId === op.id;
            return (
              <div
                key={op.id}
                className={`op-item ${open ? "expanded" : ""}`}
                onClick={() => setExpandedId(open ? null : op.id)}
              >
                <div className="op-top">
                  <div className="op-icon">{iconoEstado(op.estado)}</div>
                  <span className="op-name">{op.producto}</span>
                  <span className="op-state">{op.estado}</span>
                </div>
                <div className="op-sub">
                  {`${op.cantidad_planeada} plan | ${
                    op.cantidad_real || 0
                  } real`}
                  <span className="mx-2">|</span>
                  {`Inicio ${op.fecha_inicio}`}
                </div>
                {open && (
                  <div className="op-actions">
                    <Button
                      size="sm"
                      variant="info"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetalle(op);
                        setShowDet(true);
                      }}
                    >
                      <Fa.FaEye />
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvOrden(op);
                        setShowAvance(true);
                      }}
                    >
                      <Fa.FaPlus />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditada(op);
                        setShowEdit(true);
                      }}
                    >
                      <Fa.FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAEliminar(op);
                        setShowDel(true);
                      }}
                    >
                      <Fa.FaTrash />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
        <aside className="op-summary">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total</Card.Title>
              <Card.Text>{ordenes.length}</Card.Text>
            </Card.Body>
          </Card>
        </aside>
      </div>

      <Paginacion
        itemsPerPage={itemsPorPagina}
        totalItems={ordenesFiltradas.length}
        currentPage={paginaActual}
        setCurrentPage={setPaginaActual}
      />

      {/* Modales */}
      {showAdd && (
        <ModalRegistroOrden
          show={showAdd}
          handleClose={() => setShowAdd(false)}
          handleAdd={add}
          nueva={nueva}
          setNueva={setNueva}
          setMsg={setMsg}
          setShowMsg={setShowMsg}
          productosList={productosList}
          materiasList={materiasList}
        />
      )}
      {showEdit && editada && (
        <ModalEdicionOrden
          show={showEdit}
          handleClose={() => setShowEdit(false)}
          orden={editada}
          setOrden={setEditada}
          handleEdit={edit}
          setMsg={setMsg}
          setShowMsg={setShowMsg}
          productosList={productosList}
          materiasList={materiasList}
        />
      )}
      {showDel && aEliminar && (
        <ModalEliminacionOrden
          show={showDel}
          handleClose={() => setShowDel(false)}
          orden={aEliminar}
          handleDelete={del}
        />
      )}
      {showDet && detalle && (
        <ModalDetalleOrden
          show={showDet}
          handleClose={() => setShowDet(false)}
          orden={detalle}
        />
      )}
      {showAvance && avOrden && (
        <ModalRegistroAvance
          show={showAvance}
          handleClose={() => setShowAvance(false)}
          orden={avOrden}
          handleGuardarAvance={guardarAvance}
        />
      )}
      <ModalMensaje
        show={showMsg}
        handleClose={() => setShowMsg(false)}
        message={msg}
      />
    </Container>
  );
}
