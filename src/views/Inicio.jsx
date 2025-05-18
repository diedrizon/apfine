import React, { useState } from "react";
import "../styles/Inicio.css";
import { BsPaperclip, BsMicFill, BsSendFill } from "react-icons/bs";

const Inicio = () => {
  const [mensaje, setMensaje] = useState("");

  const handleInputChange = (e) => {
    setMensaje(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleEnviar = () => {
    if (mensaje.trim() !== "") {
      console.log("Mensaje enviado:", mensaje);
      setMensaje("");
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <div className="chat-messages">
          <p className="mensaje-placeholder">Bienvenido al chat. Inicia una conversación.</p>
        </div>

        <div className="chat-footer-container">
          <div className="chat-input-bar">
            <button className="icon-btn" title="Adjuntar archivo">
              <BsPaperclip />
            </button>

            <textarea
              className="chat-textarea"
              placeholder="Escribe tu mensaje..."
              value={mensaje}
              onChange={handleInputChange}
              rows={1}
            />

            <button className="icon-btn" title="Hablar">
              <BsMicFill />
            </button>

            <button className="icon-btn enviar" title="Enviar" onClick={handleEnviar}>
              <BsSendFill />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
