// src/components/salidainventario/SalidaInventarioPDF.jsx

import { jsPDF } from "jspdf";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

/**
 * Genera el PDF de la venta, lo sube a Firebase Storage
 * y devuelve la URL pública del comprobante.
 *
 * @param {Object} params
 * @param {string} params.ventaId — ID de la venta en Firestore
 * @param {string} params.fecha    — Fecha de la venta (ISO yyyy-MM-dd)
 * @param {string} params.cliente  — Nombre o razón social
 * @param {Array}  params.carrito  — Ítems [{ nombre, cantidad, precio }]
 * @param {number} params.total    — Monto total de la venta
 * @returns {Promise<string>} URL pública del PDF
 */
export async function generarComprobantePDF({
  ventaId,
  fecha,
  cliente,
  carrito,
  total
}) {
  // 1) Montar el PDF con jsPDF
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Comprobante de Venta", 20, 20);
  doc.setFontSize(12);
  doc.text(`Venta ID: ${ventaId}`, 20, 30);
  doc.text(`Fecha: ${fecha}`, 20, 36);
  doc.text(`Cliente: ${cliente}`, 20, 42);

  // Encabezado de tabla
  const startY = 52;
  doc.text("Producto", 20, startY);
  doc.text("Cant.", 100, startY);
  doc.text("Precio U.", 120, startY);
  doc.text("Subtotal", 160, startY);

  // Filas de ítems
  carrito.forEach((c, i) => {
    const y = startY + 8 + i * 8;
    doc.text(c.nombre, 20, y);
    doc.text(String(c.cantidad), 100, y);
    doc.text(c.precio.toFixed(2), 120, y);
    doc.text((c.cantidad * c.precio).toFixed(2), 160, y);
  });

  // Total al final
  const finalY = startY + 8 + carrito.length * 8 + 12;
  doc.setFontSize(14);
  doc.text(`TOTAL: ${total.toFixed(2)}`, 20, finalY);

  // 2) Subir PDF a Firebase Storage
  const blob = doc.output("blob");
  const storage = getStorage();
  const path = `comprobantes/venta_${ventaId}.pdf`;
  const pdfRef = storageRef(storage, path);
  await uploadBytes(pdfRef, blob);

  // 3) Obtener URL pública
  return await getDownloadURL(pdfRef);
}
