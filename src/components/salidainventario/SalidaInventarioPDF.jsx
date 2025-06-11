// src/components/salidainventario/SalidaInventarioPDF.jsx

import { jsPDF } from "jspdf";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

/**
 * Genera el PDF de la factura de venta, lo sube a Firebase Storage
 * y devuelve la URL pública del comprobante.
 *
 * @param {Object} params
 * @param {string} params.ventaId — ID de la venta en Firestore
 * @param {string} params.cliente — Nombre o razón social
 * @param {Array}  params.carrito — Ítems [{ nombre, cantidad, precio }]
 * @param {number} params.total   — Monto total de la venta
 * @returns {Promise<string>} URL pública del PDF
 */
export async function generarComprobantePDF({
  ventaId,
  cliente,
  carrito,
  total
}) {
  const doc = new jsPDF();

  // 1) Obtener color primario de CSS (--primary)
  const styles = getComputedStyle(document.body);
  const primaryHex = styles.getPropertyValue("--primary").trim() || "#0033cc";
  const hexToRgb = (hex) => {
    let c = hex.replace("#", "");
    if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
    return [
      parseInt(c.slice(0, 2), 16),
      parseInt(c.slice(2, 4), 16),
      parseInt(c.slice(4, 6), 16)
    ];
  };
  const [pr, pg, pb] = hexToRgb(primaryHex);

  // 2) Cargar y colocar logo (35×35 mm)
  const logo = new Image();
  logo.src = "/Icono.png";
  await new Promise((resolve) => { logo.onload = resolve; });
  doc.addImage(logo, "PNG", 15, 10, 35, 35);

  // 3) Datos de la empresa
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(pr, pg, pb);
  doc.text("APFINE", 60, 20);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(0, 0, 0);
  doc.text("Juigalpa, Chontales", 60, 26);
  doc.text("Tel: 8825-7506   Email: contacto@apfine.com", 60, 32);

  // 4) Título “FACTURA” sobre fondo primario
  const pageWidth = doc.internal.pageSize.getWidth();
  const titleY = 48;
  const titleH = 12;
  doc.setFillColor(pr, pg, pb).rect(15, titleY, 180, titleH, "F");
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(255, 255, 255);
  doc.text("FACTURA", pageWidth / 2, titleY + 8, { align: "center" });

  // 5) Fecha y hora local
  const now = new Date();
  const fechaStr = now.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const horaStr = now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(0, 0, 0);
  doc.text(`Factura No: ${ventaId}`, 15, 65);
  doc.text(`Fecha: ${fechaStr} ${horaStr}`, 15, 72);
  doc.text(`Cliente: ${cliente}`, 15, 79);

  // 6) Tabla de ítems
  const startY = 90;
  const rowH = 8;

  // Cabecera
  doc.setFillColor(pr, pg, pb)
     .setTextColor(255, 255, 255)
     .setFont("helvetica", "bold");
  doc.rect(15, startY, 180, rowH, "F");
  doc.text("Producto", 17, startY + 6);
  doc.text("Cant.", 110, startY + 6, { align: "center" });
  doc.text("P. Unit.", 130, startY + 6, { align: "right" });
  doc.text("Subtotal", 190, startY + 6, { align: "right" });

  // Filas
  doc.setFont("helvetica", "normal");
  carrito.forEach((item, i) => {
    const y = startY + rowH + i * rowH;
    doc.setDrawColor(200).line(15, y, 195, y);
    doc.setTextColor(0, 0, 0);
    doc.text(item.nombre, 17, y + 6);
    doc.text(String(item.cantidad), 110, y + 6, { align: "center" });
    doc.text(item.precio.toFixed(2), 130, y + 6, { align: "right" });
    doc.text((item.cantidad * item.precio).toFixed(2), 190, y + 6, { align: "right" });
  });

  // Línea inferior de la tabla
  const tableEndY = startY + rowH + carrito.length * rowH;
  doc.line(15, tableEndY, 195, tableEndY);

  // 7) Total
  const totalY = tableEndY + 12;
  doc.setFont("helvetica", "bold").setTextColor(pr, pg, pb);
  doc.text("TOTAL:", 130, totalY);
  doc.text(total.toFixed(2), 190, totalY, { align: "right" });

  // 8) Pie de página
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(100);
  doc.text(
    "¡Gracias por su compra! Si tiene alguna consulta, contáctenos.",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // 9) Subir PDF a Firebase Storage y devolver URL pública
  const blob = doc.output("blob");
  const storage = getStorage();
  const pdfRef = storageRef(storage, `comprobantes/venta_${ventaId}.pdf`);
  await uploadBytes(pdfRef, blob);
  return await getDownloadURL(pdfRef);
}
