import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const LoginForm = ({
  email,
  password,
  confirmPassword,
  error,
  setEmail,
  setPassword,
  setConfirmPassword,
  handleSubmit,
  handleRegister,
  handleGoogleLogin,
  esperandoAceptacion,
  handleAceptarGoogle,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [aceptado, setAceptado] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showGoogleWarning, setShowGoogleWarning] = useState(false);

  const navigate = useNavigate();

  const handleClose = () => navigate("/");
  const goToRecover = () => navigate("/recuperar");

  useEffect(() => {
    const pendiente = localStorage.getItem("pendienteAceptarGoogle") === "true";
    if (esperandoAceptacion && pendiente) {
      setShowGoogleWarning(true);
    }
  }, [esperandoAceptacion]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!aceptado) {
      const wrapper = document.getElementById("checkbox-wrapper");
      setShowWarning(true);
      wrapper?.classList.add("shake");
      setTimeout(() => {
        wrapper?.classList.remove("shake");
      }, 600);
      return;
    }
    setShowWarning(false);
    isLogin ? handleSubmit(e) : handleRegister(e);
  };

  return (
    <Card className="login-card">
      <div className="login-header">
        <img src="/Horizontal.png" alt="APFINE Logo" className="logo-top-left" />
        <IoClose className="close-icon" onClick={handleClose} />
      </div>

      <Card.Body>
        <div className="toggle-buttons mb-3">
          <span
            className={`toggle-option ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Iniciar Sesión
          </span>
          <span
            className={`toggle-option ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Registrarse
          </span>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <div className="input-with-eye">
              <Form.Control
                type={showPass ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
          </Form.Group>

          {!isLogin && (
            <Form.Group className="mb-3">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <div className="input-with-eye">
                <Form.Control
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </span>
              </div>
            </Form.Group>
          )}

          <Button type="submit" className="login-btn">
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </Button>
        </Form>

        {isLogin && (
          <div className="text-center mb-2">
            <span className="recover-link" onClick={goToRecover}>
              ¿Olvidaste tu contraseña?
            </span>
          </div>
        )}

        <div className="separator">
          <span>O inicia sesión con</span>
        </div>

        <div className="text-center">
          <Button className="google-btn-icon" onClick={handleGoogleLogin}>
            <FcGoogle size={24} />
          </Button>
        </div>

        {!esperandoAceptacion && (
          <div
            id="checkbox-wrapper"
            className="text-center mt-4 checkbox-legal-bottom"
          >
            <Form.Check
              type="checkbox"
              id="acepta-politica"
              checked={aceptado}
              onChange={(e) => {
                setAceptado(e.target.checked);
                if (e.target.checked) setShowWarning(false);
              }}
              label={
                <>
                  He leído y acepto los{" "}
                  <a href="/terminos-condiciones" target="_blank">Términos</a> y la{" "}
                  <a href="/privacidad" target="_blank">Política de Privacidad</a>.
                </>
              }
            />
            {showWarning && (
              <div className="checkbox-warning">Debes aceptar para continuar.</div>
            )}
          </div>
        )}

        {esperandoAceptacion && (
          <div className="text-center mt-4 checkbox-legal-bottom" id="checkbox-wrapper">
            <Form.Check
              type="checkbox"
              id="acepta-google"
              onChange={(e) => {
                if (e.target.checked) {
                  setShowGoogleWarning(false);
                  handleAceptarGoogle();
                }
              }}
              label={
                <>
                  He leído y acepto los{" "}
                  <a href="/terminos-condiciones" target="_blank">Términos</a> y la{" "}
                  <a href="/privacidad" target="_blank">Política de Privacidad</a>.
                </>
              }
            />
            {showGoogleWarning && (
              <div className="checkbox-warning">Debes aceptar para continuar.</div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default LoginForm;
