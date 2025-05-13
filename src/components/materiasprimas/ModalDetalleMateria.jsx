import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import { db } from "../../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { BiCube } from "react-icons/bi";
import ModalRegistroEntrada from "./ModalRegistroEntrada";
import ModalDetalleEntrada from "./ModalDetalleEntrada";
import ModalMensaje from "../ModalMensaje";

export default function ModalDetalleMateria({
  show,
  handleClose,
  materiaDetalle,
  actualizarVista,
}) {
  const [entradas, setEntradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showRegistro, setShowRegistro] = useState(false);
  const [showDetEntrada, setShowDetEntrada] = useState(false);
  const [entradaSeleccionada, setEntradaSeleccionada] = useState(null);
  const [msg, setMsg] = useState("");
  const [showMsg, setShowMsg] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const formatDateTime = (ts, fallback) => {
    let dateObj;
    if (ts?.toDate) {
      dateObj = ts.toDate();
    } else {
      dateObj = new Date(fallback || ts);
    }
    return dateObj.toLocaleString("es-NI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const cargarEntradas = useCallback(async () => {
    if (!materiaDetalle?.id) return;
    setCargando(true);
    const colRef = collection(
      db,
      "materias_primas",
      materiaDetalle.id,
      "entradas"
    );
    const snap = await getDocs(colRef);
    const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    setEntradas(lista);
    setCargando(false);
  }, [materiaDetalle?.id]);

  useEffect(() => {
    cargarEntradas();
  }, [materiaDetalle?.id, cargarEntradas]);

  const totalStock = entradas.reduce(
    (sum, e) => sum + parseFloat(e.cantidad),
    0
  );

  async function guardarEntrada(ent) {
    const nueva = {
      cantidad: parseFloat(ent.cantidad),
      proveedor: ent.proveedor || "",
      costo_unitario: parseFloat(ent.costo_unitario),
      fecha: ent.fecha,
      creada_en: serverTimestamp(),
    };

    if (isOffline) {
      setEntradas((prev) => [{ ...nueva, id: `temp_${Date.now()}` }, ...prev]);
      setMsg("Entrada guardada en modo offline.");
    } else {
      try {
        await addDoc(
          collection(db, "materias_primas", materiaDetalle.id, "entradas"),
          nueva
        );

        const nuevoStock = totalStock + parseFloat(ent.cantidad);
        await updateDoc(doc(db, "materias_primas", materiaDetalle.id), {
          stock_actual: nuevoStock,
          ultimo_precio: parseFloat(ent.costo_unitario),
          proveedor_reciente: ent.proveedor || "",
        });

        setMsg("Entrada registrada correctamente.");
        if (actualizarVista) actualizarVista();
      } catch (error) {
        console.error("Error al guardar entrada:", error);
        setMsg("Error al registrar la entrada.");
      }
    }

    setShowMsg(true);
    setShowRegistro(false);
    cargarEntradas();
  }

  const openDetalleEntrada = (e) => {
    setEntradaSeleccionada(e);
    setShowDetEntrada(true);
  };

  if (!materiaDetalle) return null;

  return (
    <>
      <Modal show={show} onHide={handleClose} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Detalle de {materiaDetalle.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="detalle-item">
            <span className="detalle-label">Unidad de medida:</span>
            <span className="detalle-value">
              {materiaDetalle.unidad_medida}
            </span>
          </div>

          <div className="detalle-item">
            <span className="detalle-label">Stock actual:</span>
            <span className="detalle-value">
              {totalStock} {materiaDetalle.unidad_medida}
            </span>
          </div>

          <div className="detalle-item">
            <span className="detalle-label">Stock mínimo:</span>
            <span className="detalle-value">{materiaDetalle.stock_minimo}</span>
          </div>

          <div className="detalle-item">
            <span className="detalle-label">Costo unitario (C$):</span>
            <span className="detalle-value">
              {materiaDetalle.costo_unitario}
            </span>
          </div>

          <div className="detalle-item">
            <span className="detalle-label">Proveedor:</span>
            <span className="detalle-value">
              {materiaDetalle.proveedor || "—"}
            </span>
          </div>

          <div className="detalle-item">
            <span className="detalle-label">Última compra:</span>
            <span className="detalle-value">
              {materiaDetalle.ultima_compra || "—"}
            </span>
          </div>

          <div className="detalle-item">
            <span className="detalle-label">Usuario ID:</span>
            <span className="detalle-value">
              {materiaDetalle.usuario_id || "—"}
            </span>
          </div>

          <div className="detalle-item">
            <span className="detalle-label">Historial de entradas:</span>
          </div>

          {cargando && <p>Cargando entradas…</p>}
          {!cargando && entradas.length === 0 && <p>No hay entradas.</p>}
          {!cargando && entradas.length > 0 && (
            <div className="entrada-list">
              {entradas.map((e) => (
                <div
                  key={e.id}
                  className="entrada-item"
                  onClick={() => openDetalleEntrada(e)}
                >
                  <div className="entrada-icon">
                    <BiCube />
                  </div>
                  <div className="entrada-content">
                    <div className="entrada-meta">
                      <span className="entrada-label">Fecha:</span>
                      <span className="entrada-value">
                        {formatDateTime(e.creada_en, e.fecha)}
                      </span>
                    </div>
                    <div className="entrada-meta">
                      <span className="entrada-label">Cantidad:</span>
                      <span className="entrada-value">{e.cantidad}</span>
                    </div>
                    <div className="entrada-meta">
                      <span className="entrada-label">Proveedor:</span>
                      <span className="entrada-value">
                        {e.proveedor || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={() => setShowRegistro(true)}>
            Nueva entrada
          </Button>
        </Modal.Footer>
      </Modal>

      {showRegistro && (
        <ModalRegistroEntrada
          show={showRegistro}
          handleClose={() => setShowRegistro(false)}
          materia={materiaDetalle}
          handleGuardarEntrada={guardarEntrada}
        />
      )}

      {showDetEntrada && entradaSeleccionada && (
        <ModalDetalleEntrada
          show={showDetEntrada}
          handleClose={() => setShowDetEntrada(false)}
          entradaDetalle={entradaSeleccionada}
        />
      )}

      <ModalMensaje
        show={showMsg}
        handleClose={() => setShowMsg(false)}
        message={msg}
      />
    </>
  );
}
