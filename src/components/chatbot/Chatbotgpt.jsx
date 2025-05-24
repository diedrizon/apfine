import React, { useState, useEffect, useRef } from "react";
import "../../styles/Inicio.css";
import {
  BsPaperclip,
  BsMicFill,
  BsSendFill,
  BsFileEarmarkText
} from "react-icons/bs";
import { useAuth } from "../../../src/database/authcontext";
import { db } from "../../database/firebaseconfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { getIconGasto } from "../../views/Gastos";

const TIPOS_GASTO = ["Personal", "Operativo"];
const MEDIOS_PAGO = ["Efectivo", "Transferencia", "Otro"];
const PALABRAS_VACIAS = ["vacío", "vacio", "ninguno", "no", "no tengo", "n/a"];

export default function Chatbotgpt() {
  const { user, perfil } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [gastosHistorial, setGastosHistorial] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [contexto, setContexto] = useState("inicio");
  const [nuevoGasto, setNuevoGasto] = useState({});
  const [camposFaltantes, setCamposFaltantes] = useState([]);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const displayName =
    localStorage.getItem("userDisplayName") || user?.displayName || "usuario";
  const storage = getStorage();
  const obligatorios = ["fecha_gasto", "monto", "tipo_gasto", "categoria"];

  /* ─────── cargar gastos + categorías de GASTO del usuario ─────── */
  useEffect(() => {
    if (!user) return;
    const qG = query(collection(db, "gastos"), where("userId", "==", user.uid));
    const qC = query(
      collection(db, "categorias"),
      where("usuarioId", "==", user.uid), // Cambiado de userId a usuarioId
      where("aplicacion", "in", ["Gasto", "Ambos"]) // Incluye categorías para Gasto o Ambos
    );
    Promise.all([getDocs(qG), getDocs(qC)]).then(([g, c]) => {
      setGastosHistorial(g.docs.map(d => ({ ...d.data() })));
      setCategorias(c.docs.map(d => d.data().nombre));
    });
  }, [user]);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [
    messages
  ]);

  /* ─────── helpers ─────── */
  const promptCampo = f => {
    switch (f) {
      case "fecha_gasto":
        return "Indica la fecha (YYYY-MM-DD / hoy / ayer):";
      case "monto":
        return "Indica el monto:";
      case "tipo_gasto":
        return `Selecciona tipo (acepto abreviaturas): ${TIPOS_GASTO.join(" / ")}`;
      case "categoria":
        return `Elige categoría (puedes abreviar): ${categorias.join(" / ")}`;
      case "proveedor":
        return "Proveedor (puede quedar vacío):";
      case "medio_pago":
        return `Medio de pago: ${MEDIOS_PAGO.join(" / ")}`;
      case "descripcion":
        return "Descripción (opcional):";
      case "comprobanteURL":
        return "Adjunta comprobante o escribe 'no tengo':";
      default:
        return "";
    }
  };

  const interpretarGPT = async (campo, texto) => {
    const opciones =
      campo === "tipo_gasto"
        ? TIPOS_GASTO
        : campo === "medio_pago"
        ? MEDIOS_PAGO
        : campo === "categoria"
        ? categorias
        : [];
    const prompt = `
Eres un asistente de gastos.
Campo: ${campo}
Lista válida (si aplica): ${opciones.join(", ") || "libre"}
Palabras que significan NULL: ${PALABRAS_VACIAS.join(", ")}
Si el usuario escribe una abreviación o error ortográfico que claramente corresponde
a una opción válida, corrígelo y úsalo.

Entrada del usuario: "${texto}"

Devuelve SOLO un JSON:
{ "ok": true|false, "valor": null|valorInterpretado, "error": "" }

Reglas:
• Para fecha admite "hoy", "ayer" o una fecha; devuelve ISO (YYYY-MM-DD).
• Para monto solo número (punto o coma).
• Si es NULL usa null.
`.trim();
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [{ role: "system", content: prompt }]
      })
    });
    const raw = (await r.json()).choices?.[0]?.message?.content || "{}";
    try {
      return JSON.parse(raw);
    } catch {
      return { ok: false, valor: null, error: "No entendí, intenta de nuevo." };
    }
  };

  const resumenConsultaGPT = async pregunta => {
    const prompt = `
Eres APFINE.
Historial (JSON):
${JSON.stringify(gastosHistorial)}
Responde en español, brevemente, usando esos datos.
Pregunta: "${pregunta}"
`.trim();
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [{ role: "system", content: prompt }]
      })
    });
    return (
      (await r.json()).choices?.[0]?.message?.content ||
      "No tengo datos suficientes."
    );
  };

  const subirComprobante = async f => {
    const r = ref(storage, `comprobantes/${user.uid}/${Date.now()}_${f.name}`);
    await uploadBytes(r, f);
    return await getDownloadURL(r);
  };

  /* ───── flujo registro ───── */
  const continuarRegistro = async texto => {
    const campo = camposFaltantes[0];
    let valorEntrada = texto;
    if (campo === "comprobanteURL" && uploadedFile) {
      valorEntrada = await subirComprobante(uploadedFile.file);
      setUploadedFile(null);
    }
    const resp = await interpretarGPT(campo, valorEntrada);
    if (!resp.ok) {
      setMessages(m => [...m, { role: "assistant", content: resp.error }]);
      setIsLoading(false);
      return;
    }
    nuevoGasto[campo] = resp.valor;
    const restantes = camposFaltantes.slice(1);
    setCamposFaltantes(restantes);

    if (restantes.length === 0) {
      /* asegurar requeridos */
      const falta = obligatorios.find(k => !nuevoGasto[k] && nuevoGasto[k] !== 0);
      if (falta) {
        setCamposFaltantes([falta]);
        setMessages(m => [...m, { role: "assistant", content: promptCampo(falta) }]);
        setIsLoading(false);
        return;
      }
      await addDoc(collection(db, "gastos"), { ...nuevoGasto, userId: user.uid });
      setGastosHistorial(h => [...h, nuevoGasto]);
      setMessages(m => [
        ...m,
        { role: "assistant", type: "gasto", gasto: nuevoGasto }
      ]);
      setContexto("inicio");
      setNuevoGasto({});
    } else {
      setMessages(m => [
        ...m,
        { role: "assistant", content: promptCampo(restantes[0]) }
      ]);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() && !uploadedFile) return;
    const userMsg = { role: "user", content: input.trim(), file: uploadedFile };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setIsLoading(true);

    if (contexto === "registro") {
      await continuarRegistro(userMsg.content);
      return;
    }

    if (/registrar|agregar/.test(userMsg.content.toLowerCase())) {
      setContexto("registro");
      setCamposFaltantes([
        "fecha_gasto",
        "monto",
        "tipo_gasto",
        "categoria",
        "proveedor",
        "medio_pago",
        "descripcion",
        "comprobanteURL"
      ]);
      setMessages(m => [
        ...m,
        { role: "assistant", content: promptCampo("fecha_gasto") }
      ]);
      setIsLoading(false);
      return;
    }

    const resp = await resumenConsultaGPT(userMsg.content);
    setMessages(m => [...m, { role: "assistant", content: resp }]);
    setUploadedFile(null);
    setIsLoading(false);
  };

  /* ───── input file helper ───── */
  const handleFileUpload = e => {
    const f = e.target.files[0];
    if (!f) return;
    setUploadedFile({
      file: f,
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type.startsWith("image") ? "image" : "document"
    });
  };

  /* ───── interface ───── */
  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <p className="mensaje-placeholder">
              Hola {displayName}, ¿en qué puedo ayudarte con tus gastos?
            </p>
          )}
          {messages.map((msg, i) => {
            const esUser = msg.role === "user";
            return (
              <div key={i} className={`msg ${esUser ? "user" : "assistant"}`}>
                <img
                  src={esUser ? perfil?.photoURL || "/user.svg" : "/Icono.png"}
                  alt=""
                  className="avatar"
                />
                <div className="text">
                  {msg.type === "gasto" ? (
                    <div className="gasto-card">
                      <div className="gasto-header">
                        {getIconGasto(msg.gasto.tipo_gasto)}
                        <span className="gasto-titulo">
                          {msg.gasto.tipo_gasto} (C${msg.gasto.monto})
                        </span>
                      </div>
                      <div className="gasto-body">
                        <p>Fecha: {msg.gasto.fecha_gasto}</p>
                        <p>Categoría: {msg.gasto.categoria}</p>
                        <p>Proveedor: {msg.gasto.proveedor || "N/A"}</p>
                        <p>Medio: {msg.gasto.medio_pago || "N/A"}</p>
                        <p>Descripción: {msg.gasto.descripcion || "N/A"}</p>
                        {msg.gasto.comprobanteURL &&
                          (msg.gasto.comprobanteURL.endsWith(".pdf") ? (
                            <a
                              href={msg.gasto.comprobanteURL}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <BsFileEarmarkText
                                style={{ verticalAlign: "middle", marginRight: 4 }}
                              />
                              Ver documento
                            </a>
                          ) : (
                            <img
                              src={msg.gasto.comprobanteURL}
                              alt=""
                              className="clickable-preview"
                              style={{ maxWidth: "100%" }}
                              onClick={() => setModalImage(msg.gasto.comprobanteURL)}
                            />
                          ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>{msg.content}</p>
                      {msg.file &&
                        (msg.file.type === "image" ? (
                          <img
                            src={msg.file.url}
                            alt=""
                            className="clickable-preview"
                            style={{
                              maxWidth: "100%",
                              marginTop: 8,
                              borderRadius: 6
                            }}
                            onClick={() => setModalImage(msg.file.url)}
                          />
                        ) : (
                          <a
                            href={msg.file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <BsFileEarmarkText
                              style={{ verticalAlign: "middle", marginRight: 4 }}
                            />
                            {msg.file.name}
                          </a>
                        ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-footer-container">
          <div className={`chat-input-bar ${uploadedFile ? "con-archivo" : ""}`}>
            {uploadedFile && (
              <div className="file-preview-inside">
                {uploadedFile.type === "image" ? (
                  <img
                    src={uploadedFile.url}
                    alt=""
                    className="clickable-preview"
                    onClick={() => setModalImage(uploadedFile.url)}
                  />
                ) : (
                  <div className="file-doc">
                    <BsFileEarmarkText className="file-doc-icon" />
                    <span className="file-doc-name">{uploadedFile.name}</span>
                  </div>
                )}
                <button
                  className="remove-file-btn"
                  onClick={() => setUploadedFile(null)}
                >
                  ×
                </button>
              </div>
            )}
            <div className="input-row">
              <button
                className="icon-btn"
                onClick={() => fileInputRef.current.click()}
              >
                <BsPaperclip />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <textarea
                className="chat-textarea"
                placeholder="Escribe tu mensaje..."
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
              />
              <button className="icon-btn">
                <BsMicFill />
              </button>
              <button
                className="icon-btn enviar"
                onClick={sendMessage}
                disabled={isLoading}
              >
                {isLoading ? "..." : <BsSendFill />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalImage && (
        <div className="image-modal-overlay" onClick={() => setModalImage(null)}>
          <div
            className="image-modal-content"
            onClick={e => e.stopPropagation()}
          >
            <img src={modalImage} alt="" />
            <button
              className="modal-close-btn"
              onClick={() => setModalImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
