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
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Container, Button, Card } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";
import ModalRegistroMateria from "../components/materiasprimas/ModalRegistroMateria";
import ModalEdicionMateria from "../components/materiasprimas/ModalEdicionMateria";
import ModalEliminacionMateria from "../components/materiasprimas/ModalEliminacionMateria";
import ModalDetalleMateria from "../components/materiasprimas/ModalDetalleMateria";
import ModalMensaje from "../components/ModalMensaje";
import "../styles/MateriasPrimas.css";

export default function MateriasPrimas() {
  const [userId, setUserId] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [showDet, setShowDet] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [msg, setMsg] = useState("");
  const [nueva, setNueva] = useState(null);
  const [editada, setEditada] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const col = collection(db, "materias_primas");

  useEffect(() => {
    onAuthStateChanged(auth, (u) => u && setUserId(u.uid));
  }, []);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    if (userId) fetchMaterias();
  }, [userId]);

  async function fetchMaterias() {
    const snap = await getDocs(col);
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setMaterias(all.filter((m) => m.userId === userId));
  }

  const openAdd = () => {
    setNueva({
      nombre: "",
      unidad_medida: "",
      stock_minimo: "",
      costo_unitario: "",
      proveedor: "",
      ultima_compra: "",
    });
    setShowAdd(true);
  };

  async function handleAddMateria(data, esUpdate) {
    setShowAdd(false);
    if (esUpdate) {
      if (isOffline)
        setMaterias((p) => p.map((m) => (m.id === data.id ? data : m)));
      setMsg("Stock actualizado correctamente.");
      setShowMsg(true);
      if (!data.id.startsWith("temp_")) {
        await updateDoc(doc(db, "materias_primas", data.id), {
          nombre: data.nombre,
          unidad_medida: data.unidad_medida,
          stock_minimo: data.stock_minimo,
          costo_unitario: data.costo_unitario,
          proveedor: data.proveedor,
          ultima_compra: data.ultima_compra,
        });
      }
    } else {
      // Aseguramos que el stock_actual venga definido en el objeto data
      const initialStock = Number(data.stock_actual) || 0;
      const payload = { 
        ...data, 
        userId, 
        stock_actual: initialStock, 
        // para que en la vista se muestre el costo unitario de la última entrada
        ultimo_precio: initialStock > 0 ? parseFloat(data.costo_unitario) : "", 
        proveedor_reciente: data.proveedor || "" 
      };

      if (isOffline) {
        const tempId = `temp_${Date.now()}`;
        setMaterias((p) => [...p, { ...payload, id: tempId }]);
      } else {
        // Primero, registra el insumo principal con los datos iniciales
        const docRef = await addDoc(col, payload);
        // Luego, crea una entrada inicial que refleje el stock inicial
        if (initialStock > 0) {
          await addDoc(collection(db, "materias_primas", docRef.id, "entradas"), {
            cantidad: initialStock,
            proveedor: data.proveedor || "",
            costo_unitario: parseFloat(data.costo_unitario),
            fecha: data.ultima_compra || new Date().toISOString().split("T")[0],
            creada_en: serverTimestamp(),
          });
        }
      }
      setMsg("Insumo registrado correctamente.");
      setShowMsg(true);
    }
    fetchMaterias();
  }

  async function handleEditMateria(item) {
    setShowEdit(false);
    if (isOffline)
      setMaterias((p) => p.map((m) => (m.id === item.id ? item : m)));
    setMsg("Insumo actualizado correctamente.");
    setShowMsg(true);
    if (!item.id.startsWith("temp_")) {
      await updateDoc(doc(db, "materias_primas", item.id), item);
    }
    fetchMaterias();
  }

  async function handleDeleteMateria() {
    if (!aEliminar) return;
    setShowDel(false);
    if (isOffline) setMaterias((p) => p.filter((m) => m.id !== aEliminar.id));
    setMsg("Insumo eliminado correctamente.");
    setShowMsg(true);
    if (!aEliminar.id.startsWith("temp_")) {
      await deleteDoc(doc(db, "materias_primas", aEliminar.id));
    }
    fetchMaterias();
  }

  const toggleExpanded = (m) =>
    setExpandedId(expandedId === m.id ? null : m.id);

  return (
    <Container fluid className="materias-container">
      <div className="materias-header">
        <h5>Materias Primas / Insumos</h5>
        <Button onClick={openAdd}>Agregar</Button>
      </div>
      <div className="materias-content">
        <div className="materias-list">
          {materias.map((m) => {
            const exp = expandedId === m.id;
            return (
              <div
                key={m.id}
                className={`materia-item ${exp ? "expanded" : ""}`}
                onClick={() => toggleExpanded(m)}
              >
                <div className="materia-top">
                  <div className="materia-icon">
                    {m.stock_actual <= m.stock_minimo ? (
                      <FaIcons.FaExclamationTriangle color="#ff9800" />
                    ) : (
                      <FaIcons.FaCube />
                    )}
                  </div>
                  <span className="materia-nombre">{m.nombre}</span>
                  <span className="materia-stock">
                    {m.stock_actual} {m.unidad_medida}
                  </span>
                </div>
                <div className="materia-subinfo">
                  <span>C$ {m.ultimo_precio || m.costo_unitario}</span>
                  <span className="mx-2">|</span>
                  <span>{m.proveedor_reciente || m.proveedor || "—"}</span>
                </div>
                {exp && (
                  <div className="materia-actions-expanded">
                    <Button
                      size="sm"
                      variant="info"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetalle(m);
                        setShowDet(true);
                      }}
                    >
                      <FaIcons.FaEye />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditada(m);
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
                        setAEliminar(m);
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
        <div className="materias-summary">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>Total Insumos</Card.Title>
              <Card.Text>{materias.length}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      {showAdd && nueva && (
        <ModalRegistroMateria
          show={showAdd}
          handleClose={() => setShowAdd(false)}
          materiaNueva={nueva}
          setMateriaNueva={setNueva}
          handleAddMateria={handleAddMateria}
          setMensaje={setMsg}
          setShowModalMensaje={setShowMsg}
          materiasExistentes={materias}
        />
      )}
      {showEdit && editada && (
        <ModalEdicionMateria
          show={showEdit}
          handleClose={() => setShowEdit(false)}
          materiaEditada={editada}
          setMateriaEditada={setEditada}
          handleEditMateria={handleEditMateria}
          setMensaje={setMsg}
          setShowModalMensaje={setShowMsg}
        />
      )}
      {showDel && aEliminar && (
        <ModalEliminacionMateria
          show={showDel}
          handleClose={() => setShowDel(false)}
          materiaAEliminar={aEliminar}
          handleDeleteMateria={handleDeleteMateria}
        />
      )}
      {showDet && detalle && (
        <ModalDetalleMateria
          show={showDet}
          handleClose={() => setShowDet(false)}
          materiaDetalle={detalle}
          actualizarVista={fetchMaterias} // 🔄 Se actualiza la vista principal al guardar entrada
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
