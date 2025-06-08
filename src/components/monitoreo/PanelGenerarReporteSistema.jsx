import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BiPrinter } from "react-icons/bi";

export default function PanelGenerarReporteSistema() {
  const [lastGen, setLastGen] = useState(null);
  const metaRef = doc(db, "monitor_config", "report_metadata");
  const logoUrl = "/Icono.png";

  useEffect(() => {
    (async () => {
      const snap = await getDoc(metaRef);
      if (snap.exists()) setLastGen(snap.data().lastGenerated.toDate());
    })();
  }, [metaRef]);

  const generarReporte = async () => {
    // 1) capturar pantalla
    const elemento = document.getElementById("monitoreo-root");
    const canvas = await html2canvas(elemento, {
      scale: window.devicePixelRatio,
      scrollY: -window.scrollY,
    });
    const imgData = canvas.toDataURL("image/png");

    // 2) crear PDF
    const pdf = new jsPDF("p", "pt", "a4");
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
      pdf.addImage(img, "PNG", 40, 40, 100, 30);
      pdf.setFontSize(16);
      pdf.text("Reporte Monitoreo & Configuración", 40, 90);

      const pageWidth = pdf.internal.pageSize.getWidth() - 80;
      const pageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 40, 110, pageWidth, pageHeight);

      // 3) generar nombre con fecha y hora
      const now = new Date();
      const fecha = now
        .toLocaleDateString("es-VE")
        .replace(/\//g, "-"); // 08-06-2025
      const hora = now
        .toLocaleTimeString("es-VE")
        .replace(/:/g, "-"); // 13-46-50
      const nombrePDF = `Reporte del sistema ${fecha} ${hora}.pdf`;

      pdf.save(nombrePDF);
    };

    // 4) actualizar metadata
    await setDoc(metaRef, { lastGenerated: serverTimestamp() }, { merge: true });
    setLastGen(new Date());
  };

  return (
    <div className="monitoreo-panel">
      <div className="panel-titulo">
        <BiPrinter className="panel-icono" /> Generar Reporte
      </div>
      <div className="panel-contenido">
        <button onClick={generarReporte} className="ms-button">
          Generar PDF
        </button>
        {lastGen && (
          <p style={{ marginTop: 8, fontSize: "0.85rem" }}>
            Último reporte: <strong>{lastGen.toLocaleString()}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
