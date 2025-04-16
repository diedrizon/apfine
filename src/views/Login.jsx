import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { appfirebase } from "../database/firebaseconfig";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useAuth } from "../database/authcontext";
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [esperandoAceptacion, setEsperandoAceptacion] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth(appfirebase);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("adminEmail", email);
      localStorage.setItem("adminPassword", password);
      navigate("/inicio");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Credenciales inválidas.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        localStorage.setItem("adminEmail", email);
        localStorage.setItem("adminPassword", password);
        navigate("/inicio");
      }
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      setError("No se pudo completar el registro.");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        setEsperandoAceptacion(true);
        localStorage.setItem("pendienteAceptarGoogle", "true");
      }
    } catch (err) {
      console.error("Error con Google:", err.message);
      setError("No se pudo iniciar sesión con Google.");
    }
  };

  const handleAceptarGoogle = () => {
    localStorage.removeItem("pendienteAceptarGoogle");
    navigate("/inicio");
  };

  useEffect(() => {
    if (user && !esperandoAceptacion) {
      navigate("/inicio");
    }
  }, [user, esperandoAceptacion, navigate]);

  return (
    <div className="login-page">
      <LoginForm
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        error={error}
        setEmail={setEmail}
        setPassword={setPassword}
        setConfirmPassword={setConfirmPassword}
        handleSubmit={handleSubmit}
        handleRegister={handleRegister}
        handleGoogleLogin={handleGoogleLogin}
        esperandoAceptacion={esperandoAceptacion}
        handleAceptarGoogle={handleAceptarGoogle}
      />
    </div>
  );
};

export default Login;
