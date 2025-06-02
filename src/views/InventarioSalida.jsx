import React, { useState, useEffect } from "react";
import { db, auth } from "../database/firebaseconfig";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { Container, Button, Card } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";

import ModalRegistroVenta from "../components/salidainventario/ModalRegistroVenta";
import ModalEdicionVenta from "../components/salidainventario/ModalEdicionVenta";
import ModalEliminarVenta from "../components/salidainventario/ModalEliminarVenta";
import ModalMensaje from "../components/ModalMensaje";
import ToastFlotante from "../components/ui/ToastFlotante";
import { generarComprobantePDF } from "../components/salidainventario/SalidaInventarioPDF";

import "../styles/SalidaInventario.css";

function VentasInventario() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriasIngreso, setCategoriasIngreso] = useState([]);
  const [medioOpciones] = useState([
    { label: "Efectivo" },
    { label: "Transferencia" },
    { label: "Otro" },
  ]);
  const [usuarioId, setUsuarioId] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [ventaEditada, setVentaEditada] = useState(null);
  const [ventaAEliminar, setVentaAEliminar] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [showMensaje, setShowMensaje] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const ventasCollection = collection(db, "ventas");

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUsuarioId(user.uid);
        cargarVentas(user.uid);
        cargarProductos(user.uid);
        cargarCategorias(user.uid);
      }
    });
  }, []);

  function cargarVentas(uid) {
    const unsubscribe = onSnapshot(ventasCollection, (snapshot) => {
      const fetched = snapshot.docs
        .map((docu) => ({ ...docu.data(), id: docu.id }))
        .filter((v) => v.userId === uid);
      setVentas(fetched);
    });
    return unsubscribe;
  }

  async function cargarProductos(uid) {
    const snap = await getDocs(collection(db, "inventario"));
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => p.userId === uid);
    setProductos(data);
  }

  async function cargarCategorias(uid) {
    const snap = await getDocs(collection(db, "categorias"));
    const cats = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter(
        (c) =>
          c.usuarioId === uid &&
          (c.aplicacion === "Ingreso" || c.aplicacion === "Ambos")
      );
    setCategoriasIngreso(cats);
  }

  function handleOpenAddModal() {
    setShowAddModal(true);
  }

  function handleOpenEditModal(venta) {
    setVentaEditada({
      ...venta,
      items: (venta.items || []).map((item) => ({
        id: item.id || item.productoId,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio ?? item.precio_unitario ?? 0,
        stock_actual: item.stock_actual ?? 0,
      })),
      categoria: venta.categoria ? { nombre: venta.categoria } : null,
      medio_pago: venta.medio_pago || "",
    });
    setShowEditModal(true);
  }

  function handleOpenDeleteModal(venta) {
    setVentaAEliminar(venta);
    setShowDeleteModal(true);
  }

  async function handleAddVenta({ cliente, carrito, total, categoria, medio_pago }) {
    try {
      const ts = Timestamp.fromDate(new Date());
      const ventaData = {
        fecha: new Date().toISOString().slice(0, 10),
        cliente,
        items: carrito.map((c) => ({
          productoId: c.id,
          nombre: c.nombre,
          cantidad: c.cantidad,
          precio_unitario: Number(c.precio || 0),
        })),
        total,
        userId: usuarioId,
        timestamp: ts,
        categoria: categoria.nombre,
        medio_pago,
      };

      const ventaRef = await addDoc(ventasCollection, ventaData);

      await Promise.all(
        carrito.map(async (c) => {
          const invRef = doc(db, "inventario", c.id);
          await updateDoc(invRef, {
            stock_actual: c.stock_actual - c.cantidad,
          });
          await addDoc(
            collection(db, "inventario", c.id, "movimientos"),
            {
              tipo: "salida",
              ventaId: ventaRef.id,
              cantidad: c.cantidad,
              fecha: ventaData.fecha,
              userId: usuarioId,
              timestamp: ts,
            }
          );
        })
      );

      const comprobanteURL = await generarComprobantePDF({
        ventaId: ventaRef.id,
        fecha: ventaData.fecha,
        cliente,
        carrito,
        total,
      });

      await updateDoc(ventaRef, {
        comprobanteURL,
      });

      await addDoc(collection(db, "ingresos"), {
        fecha_ingreso: ventaData.fecha,
        monto: total,
        tipo_ingreso: "Venta",
        categoria: categoria.nombre,
        fuente: cliente,
        medio_pago,
        descripcion: null,
        comprobanteURL,
        ventaId: ventaRef.id,
        userId: usuarioId,
        timestamp: ts,
      });

      cargarProductos(usuarioId);
      setMensaje("Venta registrada correctamente.");
      setShowMensaje(true);
    } catch (error) {
      console.error("Error al agregar venta:", error);
      setMensaje("Hubo un error al agregar la venta.");
      setShowMensaje(true);
    }
  }

  async function handleEditVenta(ventaEditada) {
    try {
      const ventaRef = doc(db, "ventas", ventaEditada.id);
      const ventaSnap = await getDoc(ventaRef);

      if (!ventaSnap.exists()) {
        throw new Error("Venta original no encontrada.");
      }

      const ventaAnterior = ventaSnap.data();
      const ts = Timestamp.fromDate(new Date());

      const anteriorMap = new Map();
      ventaAnterior.items.forEach((item) => {
        anteriorMap.set(item.productoId, Number(item.cantidad));
      });

      for (const item of ventaEditada.items) {
        const productoId = item.id;
        const cantidadFinal = Number(item.cantidad);
        const cantidadAnterior = anteriorMap.get(productoId) || 0;

        const invRef = doc(db, "inventario", productoId);
        const invSnap = await getDoc(invRef);
        const stockActual = Number(invSnap.data().stock_actual || 0);

        if (cantidadFinal !== cantidadAnterior) {
          const diferencia = cantidadFinal - cantidadAnterior;
          if (diferencia > 0 && stockActual < diferencia) {
            throw new Error(`Stock insuficiente para ${item.nombre}`);
          }
          await updateDoc(invRef, {
            stock_actual: stockActual - diferencia,
          });
        }

        anteriorMap.delete(productoId);

        const movsQ = query(
          collection(db, "inventario", productoId, "movimientos"),
          where("ventaId", "==", ventaEditada.id)
        );
        const movsSnap = await getDocs(movsQ);
        for (const m of movsSnap.docs) {
          await deleteDoc(
            doc(db, "inventario", productoId, "movimientos", m.id)
          );
        }

        await addDoc(
          collection(db, "inventario", productoId, "movimientos"),
          {
            tipo: "salida",
            ventaId: ventaEditada.id,
            cantidad: cantidadFinal,
            fecha: ventaAnterior.fecha,
            userId: ventaAnterior.userId,
            timestamp: ts,
          }
        );
      }

      for (const [productoId, cantidadAnterior] of anteriorMap.entries()) {
        const invRef = doc(db, "inventario", productoId);
        const invSnap = await getDoc(invRef);
        const stockActual = Number(invSnap.data().stock_actual || 0);
        await updateDoc(invRef, {
          stock_actual: stockActual + cantidadAnterior,
        });

        const movsQ = query(
          collection(db, "inventario", productoId, "movimientos"),
          where("ventaId", "==", ventaEditada.id)
        );
        const movsSnap = await getDocs(movsQ);
        for (const m of movsSnap.docs) {
          await deleteDoc(
            doc(db, "inventario", productoId, "movimientos", m.id)
          );
        }
      }

      const nuevoTotal = ventaEditada.items.reduce(
        (sum, item) =>
          sum + item.cantidad * Number(item.precio || item.precio_unitario || 0),
        0
      );

      const comprobanteURL = await generarComprobantePDF({
        ventaId: ventaEditada.id,
        fecha: ventaAnterior.fecha,
        cliente: ventaEditada.cliente,
        carrito: ventaEditada.items,
        total: nuevoTotal,
      });

      await updateDoc(ventaRef, {
        cliente: ventaEditada.cliente,
        items: ventaEditada.items.map((c) => ({
          productoId: c.id,
          nombre: c.nombre,
          cantidad: c.cantidad,
          precio_unitario: Number(c.precio || 0),
        })),
        total: Number(nuevoTotal),
        categoria: ventaEditada.categoria.nombre,
        medio_pago: ventaEditada.medio_pago,
        comprobanteURL,
      });

      const ingQ = query(
        collection(db, "ingresos"),
        where("ventaId", "==", ventaEditada.id),
        where("userId", "==", usuarioId)
      );
      const ingSnap = await getDocs(ingQ);
      for (const ing of ingSnap.docs) {
        await updateDoc(doc(db, "ingresos", ing.id), {
          monto: Number(nuevoTotal),
          comprobanteURL,
        });
      }

      const gastoQ = query(
        collection(db, "gastos"),
        where("ventaId", "==", ventaEditada.id),
        where("userId", "==", usuarioId)
      );
      const gastoSnap = await getDocs(gastoQ);
      for (const gasto of gastoSnap.docs) {
        await updateDoc(doc(db, "gastos", gasto.id), {
          monto: Number(nuevoTotal),
          comprobanteURL,
        });
      }

      setMensaje("Venta, ingreso, gasto y comprobante actualizados correctamente.");
      setShowMensaje(true);
      cargarProductos(usuarioId);
    } catch (error) {
      console.error("Error al editar venta:", error);
      setMensaje(`Hubo un error al editar la venta: ${error.message}`);
      setShowMensaje(true);
    }
  }

  async function handleDeleteVenta() {
    try {
      const refDoc = doc(db, "ventas", ventaAEliminar.id);
      const ventaSnap = await getDoc(refDoc);
      if (ventaSnap.exists()) {
        const data = ventaSnap.data();
        for (const item of data.items) {
          const invRef = doc(db, "inventario", item.productoId);
          const invSnap = await getDoc(invRef);
          const stock = Number(invSnap.data().stock_actual || 0);
          await updateDoc(invRef, {
            stock_actual: stock + Number(item.cantidad),
          });

          const movsQ = query(
            collection(db, "inventario", item.productoId, "movimientos"),
            where("ventaId", "==", ventaAEliminar.id)
          );
          const movsSnap = await getDocs(movsQ);
          for (const m of movsSnap.docs) {
            await deleteDoc(
              doc(db, "inventario", item.productoId, "movimientos", m.id)
            );
          }
        }
      }

      const ingQ = query(
        collection(db, "ingresos"),
        where("ventaId", "==", ventaAEliminar.id),
        where("userId", "==", usuarioId)
      );
      const ingSnap = await getDocs(ingQ);
      for (const ing of ingSnap.docs) {
        await deleteDoc(doc(db, "ingresos", ing.id));
      }

      const gastoQ = query(
        collection(db, "gastos"),
        where("ventaId", "==", ventaAEliminar.id),
        where("userId", "==", usuarioId)
      );
      const gastoSnap = await getDocs(gastoQ);
      for (const gasto of gastoSnap.docs) {
        await deleteDoc(doc(db, "gastos", gasto.id));
      }

      await deleteDoc(refDoc);
      setMensaje("Venta eliminada, stock restaurado.");
      setShowMensaje(true);
    } catch (error) {
      console.error("Error al eliminar venta:", error);
      setMensaje("Hubo un error al eliminar la venta.");
      setShowMensaje(true);
    }
  }

  const handleCopy = (texto, mensaje) => {
    navigator.clipboard.writeText(texto).then(() => {
      setToastMsg(mensaje);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    });
  };

  const totalVentas = ventas.length;
  const montoTotal = ventas.reduce((sum, v) => sum + Number(v.total), 0);
  const ultimaVenta = ventas.length > 0 ? ventas[ventas.length - 1].cliente : "N/A";

  return (
    <Container fluid className="si-container">
      <div className="si-header d-flex justify-content-between align-items-center mb-3">
        <h4>Ventas Inventario</h4>
        <Button variant="primary" onClick={handleOpenAddModal}>
          <FaIcons.FaPlus /> Agregar Venta
        </Button>
      </div>

      <div className="categorias-content">
        <div className="categorias-list">
          {ventas.map((v) => (
            <div
              className="categoria-item"
              key={v.id}
              style={{ borderColor: "#007bff" }}
            >
              <div className="categoria-top">
                <div className="categoria-icon" style={{ backgroundColor: "#007bff" }}>
                  <FaIcons.FaReceipt />
                </div>
                <span className="categoria-nombre">
                  {v.fecha} – {v.cliente}
                </span>
              </div>
              <div className="categoria-actions-expanded mt-2">
                <p>
                  <strong>Total:</strong> C${Number(v.total).toFixed(2)} <br />
                  <strong>Medio:</strong> {v.medio_pago || "No especificado"}
                </p>
                {v.comprobanteURL && (
                  <Button
                    variant="link"
                    href={v.comprobanteURL}
                    target="_blank"
                    title="Ver comprobante PDF"
                  >
                    <FaIcons.FaFilePdf /> Ver PDF
                  </Button>
                )}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    handleCopy(`Cliente: ${v.cliente}, Total: C$${v.total}`, "Venta copiada")
                  }
                >
                  <FaIcons.FaClipboard />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenEditModal(v)}
                >
                  <FaIcons.FaEdit />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleOpenDeleteModal(v)}
                >
                  <FaIcons.FaTrash />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="categorias-summary">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>
                <span>Total Ventas</span>
                <FaIcons.FaListUl />
              </Card.Title>
              <Card.Text>{totalVentas}</Card.Text>
            </Card.Body>
          </Card>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>
                <span>Monto Total</span>
                <FaIcons.FaMoneyBillAlt />
              </Card.Title>
              <Card.Text>C${montoTotal.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>
                <span>Última Venta</span>
                <FaIcons.FaUser />
              </Card.Title>
              <Card.Text>{ultimaVenta}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      <ModalRegistroVenta
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        productos={productos}
        categoriasIngreso={categoriasIngreso}
        medioOpciones={medioOpciones}
        handleAddVenta={handleAddVenta}
      />
      <ModalEdicionVenta
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        productos={productos}
        categoriasIngreso={categoriasIngreso}
        medioOpciones={medioOpciones}
        ventaEditada={ventaEditada}
        setVentaEditada={setVentaEditada}
        handleEditVenta={handleEditVenta}
      />
      <ModalEliminarVenta
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        venta={ventaAEliminar}
        handleConfirmDelete={handleDeleteVenta}
      />
      <ModalMensaje
        show={showMensaje}
        handleClose={() => setShowMensaje(false)}
        message={mensaje}
      />
      <ToastFlotante mensaje={toastMsg} visible={toastVisible} />
    </Container>
  );
}

export default VentasInventario;
