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
  GithubAuthProvider,
  FacebookAuthProvider,
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

  // 🔄 Manejar login social después del redirect
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Login con redirect exitoso:", result.user);
          navigate("/inicio");
        }
      })
      .catch((error) => {
        console.error("Error al recuperar login redirect:", error);
        setError("Error al iniciar sesión. Intenta nuevamente.");
      });
  }, [auth, navigate]);

  // 🔐 Login con correo y contraseña
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
        setError("Error de autenticación. Verifica tus credenciales.");
      });
  };

  // 🌐 Login con Google
  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    if (isMobile || !isLocal) {
      signInWithRedirect(auth, provider).catch((error) => {
        console.error("Error en login Google (redirect):", error);
        setError("Error en el login con Google.");
      });
    } else {
      signInWithPopup(auth, provider)
        .then((result) => {
          console.log("Login Google exitoso:", result.user);
          navigate("/inicio");
        })
        .catch((error) => {
          console.error("Error en login Google (popup):", error);
          setError("Error en el login con Google.");
        });
    }
  };

  // 🐙 Login con GitHub
  const handleGithubLogin = () => {
    const provider = new GithubAuthProvider();
    signInWithRedirect(auth, provider).catch((error) => {
      console.error("Error en login GitHub (redirect):", error);
      setError("Error en el login con GitHub.");
    });
  };

  // 📘 Login con Facebook
  const handleFacebookLogin = () => {
    const provider = new FacebookAuthProvider();
    if (isMobile || !isLocal) {
      signInWithRedirect(auth, provider).catch((error) => {
        console.error("Error en login Facebook (redirect):", error);
        setError("Error en el login con Facebook.");
      });
    } else {
      signInWithPopup(auth, provider)
        .then((result) => {
          console.log("Login Facebook exitoso:", result.user);
          navigate("/inicio");
        })
        .catch((error) => {
          console.error("Error en login Facebook (popup):", error);
          setError("Error en el login con Facebook.");
        });
    }
  };

  // Si ya está logueado, redirigir automáticamente
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
        handleGithubLogin={handleGithubLogin}
        handleFacebookLogin={handleFacebookLogin}
      />
    </Container>
  );
};

export default Login;
