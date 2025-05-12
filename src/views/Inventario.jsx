import React, { useState, useEffect } from "react";
import { db, auth } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Container, Button, Card } from "react-bootstrap";
import * as Fa from "react-icons/fa";
import ModalRegistroInventario from "../components/inventario/ModalRegistroInventario";
import ModalEdicionInventario from "../components/inventario/ModalEdicionInventario";
import ModalEliminacionInventario from "../components/inventario/ModalEliminacionInventario";
import ModalDetalleInventario from "../components/inventario/ModalDetalleInventario";
import ModalMensaje from "../components/ModalMensaje";
import "../styles/Inventario.css";

const icono = (s, m) =>
  s <= m ? <Fa.FaExclamationTriangle color="#ff9800" /> : <Fa.FaBox />;

export default function Inventario() {
  const [userId, setUserId] = useState(null);
  const [productos, setProductos] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [showDet, setShowDet] = useState(false);
  const [msg, setMsg] = useState("");
  const [showMsg, setShowMsg] = useState(false);
  const [nuevo, setNuevo] = useState(null);
  const [editado, setEditado] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const col = collection(db, "inventario");

  useEffect(() => onAuthStateChanged(auth, (u) => u && setUserId(u.uid)), []);
  useEffect(() => {
    if (userId) cargar();
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

  const cargar = async () => {
    try {
      const snap = await getDocs(col);
      const arr = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.userId === userId);
      setProductos(arr);
    } catch (e) {
      console.error(e);
    }
  };

  const add = async (item) => {
    setShowAdd(false);
    const initialStock = Number(item.stock_actual) || 0;

    if (offline) {
      const tempId = `temp_${Date.now()}`;
      setProductos((p) => [...p, { ...item, id: tempId, userId }]);
      setMsg("Producto registrado en modo offline.");
      setShowMsg(true);
    } else {
      // Registra el producto principal incluyendo el stock_actual
      const docRef = await addDoc(col, {
        ...item,
        userId,
        stock_actual: initialStock
      });
      // Si se registró stock inicial mayor a 0, crea una entrada inicial
      if (initialStock > 0) {
        await addDoc(collection(db, "inventario", docRef.id, "entradas"), {
          cantidad: initialStock,
          costo_unitario: Number(item.costo_unitario),
          proveedor: item.proveedor || "",
          fecha: item.fecha || new Date().toISOString().split("T")[0],
          creada_en: serverTimestamp()
        });
      }
      setMsg("Producto registrado.");
      setShowMsg(true);
    }
    cargar();
  };

  const edit = async (item) => {
    setShowEdit(false);
    if (offline)
      setProductos((p) => p.map((i) => (i.id === item.id ? item : i)));
    setMsg("Producto actualizado.");
    setShowMsg(true);
    if (!item.id.startsWith("temp_")) {
      try {
        await updateDoc(doc(db, "inventario", item.id), item);
      } catch (e) {
        console.error(e);
      }
    }
    cargar();
  };

  const del = async () => {
    if (!aEliminar) return;
    setShowDel(false);
    if (offline) setProductos((p) => p.filter((i) => i.id !== aEliminar.id));
    setMsg("Producto eliminado.");
    setShowMsg(true);
    if (!aEliminar.id.startsWith("temp_")) {
      try {
        await deleteDoc(doc(db, "inventario", aEliminar.id));
      } catch (e) {
        console.error(e);
      }
    }
    cargar();
  };

  const openAdd = () => {
    setNuevo({
      nombre_producto: "",
      SKU: "",
      stock_actual: "",
      stock_minimo: "",
      costo_unitario: "",
      precio_venta: "",
      ubicacion: ""
    });
    setShowAdd(true);
  };

  return (
    <Container fluid className="inv-container">
      <div className="inv-header">
        <h4>Inventario de Productos</h4>
        <Button onClick={openAdd}>Agregar</Button>
      </div>

      <div className="inv-content">
        <div className="inv-list">
          {productos.map((p) => {
            const open = expandedId === p.id;
            return (
              <div
                key={p.id}
                className={`inv-item ${open ? "expanded" : ""}`}
                onClick={() => setExpandedId(open ? null : p.id)}
              >
                <div className="inv-top">
                  <div className="inv-icon">
                    {icono(p.stock_actual, p.stock_minimo)}
                  </div>
                  <span className="inv-name">{p.nombre_producto}</span>
                  <span className="inv-stock">{p.stock_actual}</span>
                </div>
                <div className="inv-sub">
                  {`SKU ${p.SKU}`}
                  <span className="mx-2">|</span>
                  {`C$ ${p.precio_venta}`}
                </div>
                {open && (
                  <div className="inv-actions">
                    <Button
                      size="sm"
                      variant="info"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetalle(p);
                        setShowDet(true);
                      }}
                    >
                      <Fa.FaEye />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditado(p);
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
                        setAEliminar(p);
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
        </div>

        <div className="inv-summary">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total</Card.Title>
              <Card.Text>{productos.length}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      {nuevo && (
        <ModalRegistroInventario
          show={showAdd}
          handleClose={() => setShowAdd(false)}
          item={nuevo}
          setItem={setNuevo}
          handleAdd={add}
          setMensaje={setMsg}
          setShowModalMensaje={setShowMsg}
        />
      )}
      {editado && (
        <ModalEdicionInventario
          show={showEdit}
          handleClose={() => setShowEdit(false)}
          item={editado}
          setItem={setEditado}
          handleEdit={edit}
          setMensaje={setMsg}
          setShowModalMensaje={setShowMsg}
        />
      )}
      {aEliminar && (
        <ModalEliminacionInventario
          show={showDel}
          handleClose={() => setShowDel(false)}
          item={aEliminar}
          handleDelete={del}
        />
      )}
      {detalle && (
        <ModalDetalleInventario
          show={showDet}
          handleClose={() => setShowDet(false)}
          item={detalle}
          actualizarVista={cargar} // ✅ Importante: actualizar al guardar entrada
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
