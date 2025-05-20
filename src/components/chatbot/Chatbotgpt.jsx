import React, { useState, useEffect, useRef } from "react";
import "../../styles/Inicio.css";
import { BsPaperclip, BsMicFill, BsSendFill } from "react-icons/bs";
import { useAuth } from "../../../src/database/authcontext";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";
import { getIconGasto } from "../../views/Gastos";

export default function Chatbotgpt() {
  const { user, perfil } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // ⬇️ ESTE USEEFFECT ES EL AGREGADO PARA DETECTAR TECLADO EN MÓVILES
  useEffect(() => {
    const originalHeight = window.innerHeight;
    const wrapper = document.querySelector(".chat-wrapper");

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const isKeyboardOpen = currentHeight < originalHeight;

      if (isKeyboardOpen) {
        wrapper.style.height = `${currentHeight - 50}px`;
      } else {
        wrapper.style.height = `calc(100dvh - 50px)`;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // ⬆️ FIN DEL USEEFFECT AGREGADO

  const parseExpenseData = (text, fileURL) => {
    const parts = text.split(",").map((s) => s.trim());
    if (parts.length < 7) return null;
    return {
      monto: parts[0],
      tipo_gasto: parts[1],
      fecha_gasto: parts[2],
      categoria: parts[3],
      proveedor: parts[4],
      medio_pago: parts[5],
      descripcion: parts[6],
      comprobanteURL: parts[7] || fileURL,
    };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("image") ? "image" : "document";
    setUploadedFile({ name: file.name, url, type });
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const sendMessage = async () => {
    if (!input.trim() && !uploadedFile) return;

    const expenseData = input.includes(",")
      ? parseExpenseData(input, uploadedFile?.url)
      : null;

    const userMessage = {
      role: "user",
      content: input,
      file: uploadedFile,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (expenseData) {
      try {
        await addDoc(collection(db, "gastos"), {
          ...expenseData,
          userId: user.uid,
        });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", type: "gasto", gasto: expenseData },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "❌ Error al registrar el gasto." },
        ]);
      }
      setUploadedFile(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
Eres un asistente para gestión de gastos.
Cuando el usuario quiera agregar un gasto, si todos los campos necesarios (monto, tipo_gasto, fecha_gasto, categoria, proveedor, medio_pago, descripcion y comprobanteURL) están presentes, responde con un JSON así:
{"accion":"registrar_gasto","gasto":{...}}
Si faltan campos, responde:
{"accion":"solicitar_campos","faltantes":[...]}
Cuando el usuario salude o realice otras consultas, responde con {"accion":"saludo","mensaje":"..."}
`,
            },
            ...messages,
            userMessage,
          ],
          temperature: 0.3,
        }),
      });

      const data = await res.json();
      const content = data.choices[0].message.content;

      try {
        const parsed = JSON.parse(content);

        if (parsed.accion === "registrar_gasto" && parsed.gasto) {
          await addDoc(collection(db, "gastos"), {
            ...parsed.gasto,
            userId: user.uid,
          });
          setMessages((prev) => [
            ...prev,
            { role: "assistant", type: "gasto", gasto: parsed.gasto },
          ]);
        } else if (parsed.accion === "solicitar_campos") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Por favor indícame los campos faltantes: ${parsed.faltantes.join(
                ", "
              )}`,
            },
          ]);
        } else if (parsed.mensaje) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: parsed.mensaje },
          ]);
        } else {
          setMessages((prev) => [...prev, { role: "assistant", content }]);
        }
      } catch {
        setMessages((prev) => [...prev, { role: "assistant", content }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Error al procesar la solicitud." },
      ]);
    }

    setUploadedFile(null);
    setIsLoading(false);
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <p className="mensaje-placeholder">
              Bienvenido al chat. Inicia una conversación.
            </p>
          )}
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div key={i} className={`msg ${isUser ? "user" : "assistant"}`}>
                <img
                  src={isUser ? perfil?.photoURL || "/user.svg" : "/Icono.png"}
                  alt="avatar"
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
                        <p>
                          <strong>Fecha:</strong> {msg.gasto.fecha_gasto}
                        </p>
                        <p>
                          <strong>Categoría:</strong> {msg.gasto.categoria}
                        </p>
                        <p>
                          <strong>Proveedor:</strong>{" "}
                          {msg.gasto.proveedor || "N/A"}
                        </p>
                        <p>
                          <strong>Medio de pago:</strong>{" "}
                          {msg.gasto.medio_pago || "N/A"}
                        </p>
                        <p>
                          <strong>Descripción:</strong>{" "}
                          {msg.gasto.descripcion || "N/A"}
                        </p>
                        {msg.gasto.comprobanteURL &&
                          (msg.gasto.comprobanteURL.endsWith(".pdf") ? (
                            <a
                              href={msg.gasto.comprobanteURL}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              📄 Ver documento adjunto
                            </a>
                          ) : (
                            <img
                              src={msg.gasto.comprobanteURL}
                              alt="Comprobante"
                              style={{ maxWidth: "100%" }}
                              onClick={() =>
                                setModalImage(msg.gasto.comprobanteURL)
                              }
                              className="clickable-preview"
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
                            alt={msg.file.name}
                            className="clickable-preview"
                            style={{
                              maxWidth: "100%",
                              marginTop: "8px",
                              borderRadius: "6px",
                            }}
                            onClick={() => setModalImage(msg.file.url)}
                          />
                        ) : (
                          <a
                            href={msg.file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            📄 {msg.file.name}
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

        <div className={`chat-footer-container`}>
  <div className={`chat-input-bar ${uploadedFile ? "con-archivo" : ""}`}>
    {uploadedFile && (
      <div className="file-preview-inside">
        {uploadedFile.type === "image" ? (
          <img
            src={uploadedFile.url}
            alt="preview"
            onClick={() => setModalImage(uploadedFile.url)}
            className="clickable-preview"
          />
        ) : (
          <div className="file-doc">
            <span className="file-doc-icon">📄</span>
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
      <button className="icon-btn" onClick={triggerFileInput}>
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
        onChange={(e) => {
  setInput(e.target.value);
  e.target.style.height = "auto";
  e.target.style.height = `${e.target.scrollHeight}px`;
}}

        onKeyDown={(e) => {
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
        <div
          className="image-modal-overlay"
          onClick={() => setModalImage(null)}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={modalImage} alt="ampliada" />
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
