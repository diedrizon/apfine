import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { BiCube } from "react-icons/bi";
import ModalRegistroEntradaInventario from "./ModalRegistroEntradaInventario";
import ModalDetalleEntradaInventario from "./ModalDetalleEntradaInventario";
import ModalMensaje from "../ModalMensaje";

const RowDetalle = ({ l, v }) => (
  <div className="detalle-item">
    <span className="detalle-label">{l}</span>
    <span className="detalle-value">{v || "—"}</span>
  </div>
);

export default function ModalDetalleInventario({
  show,
  handleClose,
  item,
  actualizarVista
}) {
  const [entradas, setEntradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showEntrada, setShowEntrada] = useState(false);
  const [detalleEntrada, setDetalleEntrada] = useState(null);
  const [showDetalleEntrada, setShowDetalleEntrada] = useState(false);
  const [msg, setMsg] = useState("");
  const [showMsg, setShowMsg] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

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
    if (!item?.id) return;
    setCargando(true);
    const colRef = collection(db, "inventario", item.id, "entradas");
    const snap = await getDocs(colRef);
    const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    setEntradas(lista);
    setCargando(false);
  }, [item?.id]);

  useEffect(() => {
    cargarEntradas();
  }, [item?.id, cargarEntradas]);

  const totalStock = entradas.reduce((sum, e) => sum + parseFloat(e.cantidad), 0);

  const guardarEntrada = async (ent) => {
    const nueva = {
      cantidad: parseFloat(ent.cantidad),
      costo_unitario: parseFloat(ent.costo_unitario),
      precio_venta: parseFloat(ent.precio_venta),
      fecha: ent.fecha,
      creada_en: serverTimestamp()
    };

    if (isOffline) {
      setEntradas((prev) => [{ ...nueva, id: `temp_${Date.now()}` }, ...prev]);
      setMsg("Entrada guardada en modo offline.");
    } else {
      try {
        await addDoc(collection(db, "inventario", item.id, "entradas"), nueva);

        const nuevoStock = totalStock + parseFloat(ent.cantidad);
        await updateDoc(doc(db, "inventario", item.id), {
          stock_actual: nuevoStock,
          costo_unitario: parseFloat(ent.costo_unitario),
          precio_venta: parseFloat(ent.precio_venta)
        });

        setMsg("Entrada registrada correctamente.");
        if (actualizarVista) actualizarVista();
      } catch (error) {
        console.error("Error al guardar entrada:", error);
        setMsg("Error al registrar la entrada.");
      }
    }

    setShowEntrada(false);
    setShowMsg(true);
    cargarEntradas();
  };

  const abrirDetalleEntrada = (e) => {
    setDetalleEntrada(e);
    setShowDetalleEntrada(true);
  };

  const formatDateTime = (ts, fallback) => {
    let d = ts?.toDate ? ts.toDate() : new Date(fallback || ts);
    return d.toLocaleString("es-NI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  if (!item) return null;

  return (
    <>
      <Modal show={show} onHide={handleClose} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Detalle de {item.nombre_producto}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RowDetalle l="SKU" v={item.SKU} />
          <RowDetalle l="Stock mínimo" v={item.stock_minimo} />
          <RowDetalle l="Stock actual" v={totalStock} />
          <RowDetalle l="Precio venta" v={`C$ ${item.precio_venta}`} />
          <RowDetalle l="Ubicación" v={item.ubicacion} />

          <div className="detalle-item">
            <strong>Historial de entradas:</strong>
          </div>

          {cargando && <p>Cargando entradas…</p>}
          {!cargando && entradas.length === 0 && <p>No hay entradas.</p>}
          {!cargando && entradas.length > 0 && (
            <div className="entrada-list">
              {entradas.map((e) => (
                <div
                  key={e.id}
                  className="entrada-item"
                  onClick={() => abrirDetalleEntrada(e)}
                >
                  <div className="entrada-icon">
                    <BiCube />
                  </div>
                  <div className="entrada-content">
                    <div className="entrada-meta">
                      <span className="entrada-label">Fecha y hora:</span>
                      <span className="entrada-value">
                        {formatDateTime(e.creada_en, e.fecha)}
                      </span>
                    </div>
                    <div className="entrada-meta">
                      <span className="entrada-label">Cantidad:</span>
                      <span className="entrada-value">{e.cantidad}</span>
                    </div>
                    <div className="entrada-meta">
                      <span className="entrada-label">Costo unitario:</span>
                      <span className="entrada-value">
                        {e.costo_unitario ? `C$ ${e.costo_unitario}` : "—"}
                      </span>
                    </div>
                    <div className="entrada-meta">
                      <span className="entrada-label">Precio de venta:</span>
                      <span className="entrada-value">
                        {e.precio_venta ? `C$ ${e.precio_venta}` : "—"}
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
          <Button variant="primary" onClick={() => setShowEntrada(true)}>
            Nueva entrada
          </Button>
        </Modal.Footer>
      </Modal>

      {showEntrada && (
        <ModalRegistroEntradaInventario
          show={showEntrada}
          handleClose={() => setShowEntrada(false)}
          producto={item}
          handleGuardarEntrada={guardarEntrada}
        />
      )}

      {showDetalleEntrada && detalleEntrada && (
        <ModalDetalleEntradaInventario
          show={showDetalleEntrada}
          handleClose={() => setShowDetalleEntrada(false)}
          entrada={detalleEntrada}
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
