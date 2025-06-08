import React, { useState } from "react";
import { db, storage } from "../../database/firebaseconfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { BiUpload } from "react-icons/bi";

export default function SubirReporteManual() {
  const [nombreReporte, setNombreReporte] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  const handleArchivoChange = (e) => {
    if (e.target.files.length > 0) setArchivo(e.target.files[0]);
  };

  const handleSubmitReporte = async () => {
    if (!nombreReporte.trim() || !archivo) {
      setMensaje("Debes poner nombre y seleccionar archivo.");
      return;
    }
    setSubiendo(true);
    setMensaje("");

    try {
      const ext = archivo.name.split(".").pop();
      const safeName = nombreReporte
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^\w-]/g, "");
      const fileName = `${safeName}.${ext}`;

      const archivoRef = ref(storage, `reportes/${fileName}`);
      await uploadBytes(archivoRef, archivo);
      const url = await getDownloadURL(archivoRef);

      await addDoc(collection(db, "reportes_manual"), {
        nombre: nombreReporte,
        fileName,
        url,
        timestamp: serverTimestamp(),
      });

      setMensaje("Reporte subido correctamente.");
      setNombreReporte("");
      setArchivo(null);
    } catch {
      setMensaje("Error al subir reporte.");
    }

    setSubiendo(false);
  };

  const colorTexto = () =>
    document.body.classList.contains("dark-mode") ? "#fff" : "#333";

  return (
    <div className="monitoreo-panel">
      <div className="panel-titulo">
        <BiUpload className="panel-icono" /> Subir Reporte Manual
      </div>
      <div className="panel-contenido">
        <input
          className="ms-form-control"
          type="text"
          placeholder="Nombre del reporte"
          value={nombreReporte}
          onChange={(e) => setNombreReporte(e.target.value)}
        />
        <input
          className="ms-form-control archivo-input"
          type="file"
          onChange={handleArchivoChange}
        />
        <button
          className="ms-button"
          onClick={handleSubmitReporte}
          disabled={subiendo}
        >
          {subiendo ? "Enviando..." : "Enviar Reporte"}
        </button>
        {mensaje && (
          <p style={{ marginTop: 10, color: colorTexto(), fontSize: "0.9rem" }}>
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}
