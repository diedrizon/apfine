import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const LoginForm = ({
  startInRegister = false,
  esGoogleNuevo = false,
  loginEmail,
  setLoginEmail,
  loginPass,
  setLoginPass,
  regEmail,
  setRegEmail,
  regPass,
  setRegPass,
  regConfirm,
  setRegConfirm,
  regCedula,
  setRegCedula,
  regNombre,
  setRegNombre,
  regTel,
  setRegTel,
  handleLogin,
  handleRegister,
  handleGoogleLogin,
  esperandoAceptacion,
  handleAceptarGoogle,
  error,
}) => {
  /* ───── control de pestañas ───── */
  const [isLogin, setIsLogin] = useState(!startInRegister);

  useEffect(() => {
    // sincroniza el tab con la prop cada vez que cambie
    setIsLogin(!startInRegister);
  }, [startInRegister]);

  /* ───── estados auxiliares ───── */
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [aceptado, setAceptado] = useState(false);
  const [warn, setWarn] = useState(false);
  const [warnGoogle, setWarnGoogle] = useState(false);
  const nav = useNavigate();

  const cerrar = () => nav("/");
  const olvidar = () => nav("/recuperar");

  useEffect(() => {
    if (
      esperandoAceptacion &&
      localStorage.getItem("pendienteAceptarGoogle") === "true"
    ) {
      setWarnGoogle(true);
    }
  }, [esperandoAceptacion]);

  /* ───── envío del formulario ───── */
  const onSubmit = (e) => {
    e.preventDefault();
    if (!aceptado && !esperandoAceptacion) {
      setWarn(true);
      document.getElementById("checkbox-wrapper")?.classList.add("shake");
      setTimeout(() => {
        document.getElementById("checkbox-wrapper")?.classList.remove("shake");
      }, 600);
      return;
    }
    setWarn(false);
    isLogin ? handleLogin(e) : handleRegister(e);
  };

  return (
    <Card className="login-card">
      <div className="login-header">
        <img src="/Horizontal.png" alt="APFINE Logo" className="logo-top-left" />
        <IoClose className="close-icon" onClick={cerrar} />
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
          {/* ───── LOGIN ───── */}
          {isLogin && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <div className="input-with-eye">
                  <Form.Control
                    type={showPass ? "text" : "password"}
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
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
            </>
          )}

          {/* ───── REGISTRO ───── */}
          {!isLogin && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Cédula (###-######-#####)</Form.Label>
                <Form.Control
                  type="text"
                  value={regCedula}
                  onChange={(e) => setRegCedula(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  value={regEmail}
                  disabled={esGoogleNuevo}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  value={regTel}
                  onChange={(e) => setRegTel(e.target.value)}
                  required
                />
              </Form.Group>

              {!esGoogleNuevo && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <div className="input-with-eye">
                      <Form.Control
                        type={showPass ? "text" : "password"}
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        required
                      />
                      <span
                        className="eye-icon"
                        onClick={() => setShowPass(!showPass)}
                      >
                        {showPass ? (
                          <AiOutlineEyeInvisible />
                        ) : (
                          <AiOutlineEye />
                        )}
                      </span>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirmar contraseña</Form.Label>
                    <div className="input-with-eye">
                      <Form.Control
                        type={showConfirm ? "text" : "password"}
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        required
                      />
                      <span
                        className="eye-icon"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? (
                          <AiOutlineEyeInvisible />
                        ) : (
                          <AiOutlineEye />
                        )}
                      </span>
                    </div>
                  </Form.Group>
                </>
              )}
            </>
          )}

          <Button type="submit" className="login-btn">
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </Button>
        </Form>

        {isLogin && (
          <div className="text-center mb-2">
            <span className="recover-link" onClick={olvidar}>
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

        {/* ───── LEGAL ───── */}
        {!esperandoAceptacion && (
          <div
            id="checkbox-wrapper"
            className="text-center mt-4 checkbox-legal-bottom"
          >
            <Form.Check
              type="checkbox"
              checked={aceptado}
              onChange={(e) => {
                setAceptado(e.target.checked);
                if (e.target.checked) setWarn(false);
              }}
              label={
                <>
                  He leído y acepto los{" "}
                  <a href="/terminos-condiciones" target="_blank">
                    Términos
                  </a>{" "}
                  y la{" "}
                  <a href="/privacidad" target="_blank">
                    Política de Privacidad
                  </a>
                  .
                </>
              }
            />
            {warn && (
              <div className="checkbox-warning">
                Debes aceptar para continuar.
              </div>
            )}
          </div>
        )}

        {esperandoAceptacion && (
          <div
            className="text-center mt-4 checkbox-legal-bottom"
            id="checkbox-wrapper"
          >
            <Form.Check
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  setWarnGoogle(false);
                  handleAceptarGoogle();
                }
              }}
              label={
                <>
                  He leído y acepto los{" "}
                  <a href="/terminos-condiciones" target="_blank">
                    Términos
                  </a>{" "}
                  y la{" "}
                  <a href="/privacidad" target="_blank">
                    Política de Privacidad
                  </a>
                  .
                </>
              }
            />
            {warnGoogle && (
              <div className="checkbox-warning">
                Debes aceptar para continuar.
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default LoginForm;
