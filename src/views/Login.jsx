import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { appfirebase } from "../database/firebaseconfig";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";
import { useAuth } from "../database/authcontext";

import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth(appfirebase);

  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  // Recupera resultado del redirect (importante en producción y móvil)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          navigate("/inicio");
        }
      })
      .catch(() => {
        setError("Error al iniciar sesión con Google.");
      });
  }, [auth, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        localStorage.setItem("adminEmail", email);
        localStorage.setItem("adminPassword", password);
        navigate("/inicio");
      })
      .catch(() => {
        setError("Credenciales inválidas.");
      });
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      if (isMobile || !isLocal) {
        await signInWithRedirect(auth, provider);
      } else {
        const result = await signInWithPopup(auth, provider);
        if (result?.user) {
          navigate("/inicio");
        }
      }
    } catch (error) {
      console.error("Error Google:", error.code, error.message);
      setError("No se pudo iniciar sesión con Google.");
    }
  };

  // Redirige si ya está logueado
  useEffect(() => {
    if (user) {
      navigate("/inicio");
    }
  }, [user, navigate]);

  return (
    <div className="login-page">
      <LoginForm
        email={email}
        password={password}
        error={error}
        setEmail={setEmail}
        setPassword={setPassword}
        handleSubmit={handleSubmit}
        handleGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
};

export default Login;
