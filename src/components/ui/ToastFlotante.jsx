import React from "react";
import "../../styles/ToastFlotante.css";
import { FaClipboardCheck } from "react-icons/fa";

const ToastFlotante = ({ mensaje, visible }) => {
  return (
    <div className={`toast-flotante ${visible ? "visible" : ""}`}>
      <FaClipboardCheck style={{ marginRight: 8 }} />
      {mensaje}
    </div>
  );
};

export default ToastFlotante;
