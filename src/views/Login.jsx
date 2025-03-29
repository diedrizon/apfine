import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
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
  const isLocal = window.location.hostname === "localhost";

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Google login exitoso:", result.user);
          navigate("/inicio");
        }
      })
      .catch((error) => {
        console.error("Error en login con redirect:", error);
        setError("Error al iniciar sesión con Google.");
      });
  }, [auth, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Usuario autenticado:", userCredential.user);
        localStorage.setItem("adminEmail", email);
        localStorage.setItem("adminPassword", password);
        navigate("/inicio");
      })
      .catch((error) => {
        console.error("Error en login con email:", error);
        setError("Credenciales inválidas.");
      });
  };

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    if (isMobile || !isLocal) {
      signInWithRedirect(auth, provider).catch((error) => {
        console.error("Google redirect error:", error);
        setError("No se pudo iniciar sesión con Google.");
      });
    } else {
      signInWithPopup(auth, provider)
        .then((result) => {
          console.log("Login Google exitoso:", result.user);
          navigate("/inicio");
        })
        .catch((error) => {
          console.error("Google popup error:", error);
          setError("No se pudo iniciar sesión con Google.");
        });
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/inicio");
    }
  }, [user, navigate]);

  return (
    <Container className="d-flex vh-100 justify-content-center align-items-center">
      <LoginForm
        email={email}
        password={password}
        error={error}
        setEmail={setEmail}
        setPassword={setPassword}
        handleSubmit={handleSubmit}
        handleGoogleLogin={handleGoogleLogin}
      />
    </Container>
  );
};

export default Login;
