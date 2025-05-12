// src/components/LoginForm.jsx

import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import codigosCedula from "../data/codigocedulacion.json";
import "../styles/login.css";

const ONLY_LETTERS = /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g;

// formatea la cédula en 001-000203-0001A y siempre conserva la letra
const formatCedula = (inputValue, cursorPos) => {
  const clean = inputValue.toUpperCase().replace(/[^0-9A-Z]/g, "");
  const numeros = clean.replace(/[^0-9]/g, "").slice(0, 13);
  const letra = clean.replace(/[0-9]/g, "").slice(0, 1);

  let result = "";
  if (numeros.length > 0) result += numeros.slice(0, 3);
  if (numeros.length > 3) result += "-" + numeros.slice(3, 9);
  if (numeros.length > 9) result += "-" + numeros.slice(9, 13);
  if (letra) result += letra;

  const cleanBeforeCursor = inputValue
    .slice(0, cursorPos)
    .replace(/[^0-9A-Z]/g, "");
  const rawBeforeCursor = cleanBeforeCursor.replace(/[^0-9]/g, "");
  let newCursor = rawBeforeCursor.length;
  if (newCursor > 3) newCursor += 1;
  if (newCursor > 9) newCursor += 1;
  if (newCursor > 13) newCursor += 1;
  if (letra && rawBeforeCursor.length >= 13) newCursor += 1;

  return { value: result, cursor: newCursor };
};

// formatea teléfono en 8888-1234
const formatTel = (inputValue, cursorPos) => {
  const clean = inputValue.replace(/\D/g, "").slice(0, 8);
  let result = "";
  if (clean.length > 0) result += clean.slice(0, 4);
  if (clean.length > 4) result += "-" + clean.slice(4);

  const cleanBeforeCursor = inputValue.slice(0, cursorPos).replace(/\D/g, "");
  let newCursor = cleanBeforeCursor.length;
  if (newCursor > 4) newCursor += 1;
  return { value: result, cursor: newCursor };
};

const validarCorreo = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
const validarNombre = v => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{3,}$/.test(v);
const validarTelefono = v => /^\d{4}-\d{4}$/.test(v);
const validarCedulaSintaxis = v => /^\d{3}-\d{6}-\d{4}[A-Z]$/.test(v);
const validarPassword = v =>
  /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d]{6,}$/.test(v);

// extrae los primeros 3 dígitos y verifica en el JSON
const validarCodigoCedulacion = v => {
  const tres = v.replace(/[^0-9]/g, "").slice(0, 3);
  return tres.length === 3 && Object.prototype.hasOwnProperty.call(codigosCedula, tres);
};

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
    if (esperandoAceptacion && localStorage.getItem("pendienteAceptarGoogle") === "true") {
      setWarnGoogle(true);
    }
  }, [esperandoAceptacion]);

  const onSubmit = e => {
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

  // condición combinada: sintaxis correcta y código existente
  const cedulaEsInvalida =
    regCedula &&
    (!validarCedulaSintaxis(regCedula) || !validarCodigoCedulacion(regCedula));

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
          {isLogin ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value.trim())}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <div className="input-with-eye">
                  <Form.Control
                    type={showPass ? "text" : "password"}
                    value={loginPass}
                    onChange={e =>
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
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Cédula</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="001-000203-0001A"
                  value={regCedula}
                  onFocus={e => (e.target.placeholder = "")}
                  onBlur={e => {
                    if (!e.target.value)
                      e.target.placeholder = "001-010203-0001A";
                  }}
                  onChange={e => {
                    const input = e.target;
                    const { value, selectionStart } = input;
                    const { value: newValue, cursor } = formatCedula(
                      value,
                      selectionStart
                    );
                    setRegCedula(newValue);
                    requestAnimationFrame(() =>
                      input.setSelectionRange(cursor, cursor)
                    );
                  }}
                  isInvalid={cedulaEsInvalida}
                  required
                />
                {regCedula && !validarCedulaSintaxis(regCedula) && (
                  <div className="invalid-feedback visible">
                    Formato de cédula inválido.
                  </div>
                )}
                {regCedula &&
                  validarCedulaSintaxis(regCedula) &&
                  !validarCodigoCedulacion(regCedula) && (
                    <div className="invalid-feedback visible">
                      Código de cedulación no existe.
                    </div>
                  )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  value={regNombre}
                  onChange={e =>
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
                  onFocus={e => (e.target.placeholder = "")}
                  onBlur={e => {
                    if (!e.target.value)
                      e.target.placeholder = "ejemplo@correo.com";
                  }}
                  onChange={e => setRegEmail(e.target.value.trim())}
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
                  onFocus={e => (e.target.placeholder = "")}
                  onBlur={e => {
                    if (!e.target.value) e.target.placeholder = "8888-1234";
                  }}
                  onChange={e => {
                    const input = e.target;
                    const { value, selectionStart } = input;
                    const { value: newValue, cursor } = formatTel(
                      value,
                      selectionStart
                    );
                    setRegTel(newValue);
                    requestAnimationFrame(() =>
                      input.setSelectionRange(cursor, cursor)
                    );
                  }}
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
                        onChange={e =>
                          setRegPass(e.target.value.replace(/\s/g, ""))
                        }
                        isInvalid={regPass && !validarPassword(regPass)}
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
                        onChange={e =>
                          setRegConfirm(e.target.value.replace(/\s/g, ""))
                        }
                        isInvalid={regConfirm && regConfirm !== regPass}
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
              onChange={e => {
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
            {warn && <div className="checkbox-warning">Debes aceptar para continuar.</div>}
          </div>
        )}

        {esperandoAceptacion && (
          <div
            id="checkbox-wrapper"
            className="text-center mt-4 checkbox-legal-bottom"
          >
            <Form.Check
              type="checkbox"
              onChange={e => {
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
            {warnGoogle && <div className="checkbox-warning">Debes aceptar para continuar.</div>}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default LoginForm;
