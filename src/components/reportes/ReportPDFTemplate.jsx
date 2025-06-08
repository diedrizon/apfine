// src/components/reportes/ReportPDFTemplate.jsx
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";

export async function generateReportPDF({
  logoUrl,
  title,
  summary,
  chartRefs = [], // [{ ref, label }, …]
  fileName = `reporte-${format(new Date(), "yyyyMMdd-HHmm")}`,
}) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // —— Header con color y logo ——
  pdf.setFillColor(0, 51, 204);
  pdf.rect(0, 0, w, 30, "F");
  pdf.addImage(logoUrl, "PNG", 10, 5, 20, 20, "FAST");
  pdf.setFont("helvetica", "bold").setFontSize(22).setTextColor(255, 255, 255);
  pdf.text(title, 40, 16);

  // —— Tarjetas resumen ——
  const cardW = (w - 40) / summary.length;
  let y = 35;
  summary.forEach((item, i) => {
    const x = 10 + i * (cardW + 5);
    pdf.setFillColor(245, 245, 245).roundedRect(x, y, cardW, 18, 2, 2, "F");
    pdf.setDrawColor(200).roundedRect(x, y, cardW, 18, 2, 2, "S");
    pdf.setFont("helvetica", "normal").setFontSize(10).setTextColor(0, 51, 204);
    pdf.text(item.label, x + 4, y + 6);
    pdf.setFont("helvetica", "bold").setFontSize(12).setTextColor(0);
    pdf.text(item.value, x + 4, y + 14);
  });

  // —— Gráficos en fila, altura = 22% de la página ——
  y += 30;
  const chartH = h * 0.22;
  const gapX = 5;
  // calcular ancho total de imágenes para centrar
  const widths = await Promise.all(
    chartRefs.map(async ({ ref }) => {
      const canvas = await html2canvas(ref.current, { scale: 2 });
      return (canvas.width * chartH) / canvas.height;
    })
  );
  const totalW = widths.reduce((a, b) => a + b, 0) + gapX * (widths.length - 1);
  let x = (w - totalW) / 2;

  for (let i = 0; i < chartRefs.length; i++) {
    const { ref, label } = chartRefs[i];
    const canvas = await html2canvas(ref.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const imgW = widths[i];
    pdf.setFont("helvetica", "bold").setFontSize(14).setTextColor(0, 51, 204);
    pdf.text(label, x, y);
    pdf.addImage(imgData, "PNG", x, y + 4, imgW, chartH);
    x += imgW + gapX;
  }

  // —— Footer ——
  const fecha = format(new Date(), "yyyy-MM-dd HH:mm");
  pdf.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
  pdf.text(`Generado: ${fecha}`, 10, h - 10);
  pdf.save(`${fileName}.pdf`);
}
