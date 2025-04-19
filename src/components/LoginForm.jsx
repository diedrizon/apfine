import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const ONLY_DIGITS = /[^0-9]/g;
const ONLY_LETTERS = /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g;

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
  const [isLogin, setIsLogin] = useState(!startInRegister);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [aceptado, setAceptado] = useState(false);
  const [warn, setWarn] = useState(false);
  const [warnGoogle, setWarnGoogle] = useState(false);
  const nav = useNavigate();

  useEffect(() => setIsLogin(!startInRegister), [startInRegister]);

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

  const formatCedula = (value) => {
    const clean = value.toUpperCase().replace(/[^0-9A-J]/g, "");
    const soloNumeros = clean.replace(/[^0-9]/g, "").slice(0, 13);
    const letraFinal = clean.replace(/[0-9]/g, "").slice(0, 1);
    let formateado = "";
    if (soloNumeros.length >= 3) {
      formateado += soloNumeros.slice(0, 3);
      if (soloNumeros.length >= 9) {
        formateado += "-" + soloNumeros.slice(3, 9);
        formateado += "-" + soloNumeros.slice(9, 13);
      } else if (soloNumeros.length > 3) {
        formateado += "-" + soloNumeros.slice(3);
      }
    } else {
      formateado = soloNumeros;
    }
    if (soloNumeros.length === 13 && letraFinal) {
      formateado += letraFinal;
    }
    return formateado;
  };

  const formatTel = (v) => {
    let digits = v.replace(ONLY_DIGITS, "").slice(0, 8);
    return digits.length > 4
      ? `${digits.slice(0, 4)}-${digits.slice(4, 8)}`
      : digits;
  };

  const validarCorreo = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
  const validarNombre = (v) => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{3,}$/.test(v);
  const validarTelefono = (v) => /^\d{4}-\d{4}$/.test(v);
  const validarCedula = (v) => /^\d{3}-\d{6}-\d{4}[A-J]$/.test(v);
  const validarPassword = (v) =>
    /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d]{6,}$/.test(v);

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
          {isLogin && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value.trim())}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <div className="input-with-eye">
                  <Form.Control
                    type={showPass ? "text" : "password"}
                    value={loginPass}
                    onChange={(e) =>
                      setLoginPass(e.target.value.replace(/\s/g, ""))
                    }
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

          {!isLogin && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Cédula</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="001-000203-0001A"
                  value={regCedula}
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.placeholder = "001-010203-0001A";
                  }}
                  onChange={(e) => setRegCedula(formatCedula(e.target.value))}
                  isInvalid={regCedula && !validarCedula(regCedula)}
                  required
                />
                {regCedula && !validarCedula(regCedula) && (
                  <div className="invalid-feedback visible">
                    Cédula inválida.
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  value={regNombre}
                  onChange={(e) =>
                    setRegNombre(e.target.value.replace(ONLY_LETTERS, ""))
                  }
                  isInvalid={regNombre && !validarNombre(regNombre)}
                  required
                />
                {regNombre && !validarNombre(regNombre) && (
                  <div className="invalid-feedback visible">
                    Solo letras. Mínimo 3 caracteres.
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={regEmail}
                  disabled={esGoogleNuevo}
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.placeholder = "ejemplo@correo.com";
                  }}
                  onChange={(e) => setRegEmail(e.target.value.trim())}
                  isInvalid={regEmail && !validarCorreo(regEmail)}
                  required
                />
                {regEmail && !validarCorreo(regEmail) && (
                  <div className="invalid-feedback visible">
                    Formato de correo inválido.
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="8888-1234"
                  value={regTel}
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.placeholder = "8888-1234";
                  }}
                  onChange={(e) => setRegTel(formatTel(e.target.value))}
                  isInvalid={regTel && !validarTelefono(regTel)}
                  required
                />
                {regTel && !validarTelefono(regTel) && (
                  <div className="invalid-feedback visible">
                    Teléfono inválido. Formato correcto: 8888-1234
                  </div>
                )}
              </Form.Group>

              {!esGoogleNuevo && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <div className="input-with-eye">
                      <Form.Control
                        type={showPass ? "text" : "password"}
                        placeholder="Ej: MiClave2024"
                        value={regPass}
                        onFocus={(e) => (e.target.placeholder = "")}
                        onBlur={(e) => {
                          if (!e.target.value)
                            e.target.placeholder = "Ej: MiClave2024";
                        }}
                        onChange={(e) =>
                          setRegPass(e.target.value.replace(/\s/g, ""))
                        }
                        isInvalid={regPass && !validarPassword(regPass)}
                        required
                      />
                      <span className="eye-icon" onClick={() => setShowPass(!showPass)}>
                        {showPass ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                      </span>
                    </div>
                    {regPass && !validarPassword(regPass) && (
                      <div className="invalid-feedback visible">
                        Mínimo 6 caracteres con mayúsculas y minúsculas.
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirmar contraseña</Form.Label>
                    <div className="input-with-eye">
                      <Form.Control
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repite la contraseña"
                        value={regConfirm}
                        onFocus={(e) => (e.target.placeholder = "")}
                        onBlur={(e) => {
                          if (!e.target.value)
                            e.target.placeholder = "Repite la contraseña";
                        }}
                        onChange={(e) =>
                          setRegConfirm(e.target.value.replace(/\s/g, ""))
                        }
                        isInvalid={regConfirm && regConfirm !== regPass}
                        required
                      />
                      <span className="eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                      </span>
                    </div>
                    {regConfirm && regConfirm !== regPass && (
                      <div className="invalid-feedback visible">
                        Las contraseñas no coinciden.
                      </div>
                    )}
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
