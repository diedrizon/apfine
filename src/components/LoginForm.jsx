import React, { useState } from "react";
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
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Mostrar/ocultar password
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClose = () => {
    navigate("/");
  };

  const goToRecover = () => {
    navigate("/recuperar");
  };

  return (
    <Card className="login-card">
      {/* Cabecera: logo + botón X */}
      <div className="login-header">
        <img src="/Horizontal.png" alt="APFINE Logo" className="logo-top-left" />
        <IoClose className="close-icon" onClick={handleClose} />
      </div>

      <Card.Body>
        {/* Toggle */}
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

        {/* Error Firebase */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Formulario */}
        <Form onSubmit={isLogin ? handleSubmit : handleRegister}>
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

          {/* Contraseña con ojito */}
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

          {/* Confirmar contraseña si estamos registrando */}
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

        {/* Link recuperar contraseña */}
        {isLogin && (
          <div className="text-center mb-2">
            <span className="recover-link" onClick={goToRecover}>
              ¿Olvidaste tu contraseña?
            </span>
          </div>
        )}

        {/* Separador: O INICIA SESIÓN CON */}
        <div className="separator">
          <span>O inicia sesión con</span>
        </div>

        {/* Botón Google (solo ícono) */}
        <div className="text-center">
          <Button className="google-btn-icon" onClick={handleGoogleLogin}>
            <FcGoogle size={24} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LoginForm;
