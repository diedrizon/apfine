import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { appfirebase } from "../database/firebaseconfig";
import "../styles/login.css";
import { IoCloseSharp } from "react-icons/io5";

const Recuperar = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const auth = getAuth(appfirebase);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg(
        "Se envió un correo de recuperación. Revisa tu bandeja de entrada."
      );
    } catch (err) {
      console.error("Error al enviar correo de recuperación:", err);
      setError(
        "No se pudo enviar el correo. Verifica que el email esté registrado."
      );
    }
  };

  // Botón X para volver al home (o donde quieras)
  const handleClose = () => {
    navigate("/login");
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <h5 className="login-title">Recuperar Contraseña</h5>
          <button
            onClick={handleClose}
            className="close-btn"
            aria-label="Cerrar"
          >
            <IoCloseSharp className="close-icon" />
          </button>
        </div>
        <Card.Body>
          {msg && <Alert variant="success">{msg}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="emailRecover">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mb-3 login-btn">
              Enviar Correo de Recuperación
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Recuperar;
