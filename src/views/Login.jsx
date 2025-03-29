import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import LoginForm from "../components/LoginForm";
import { appfirebase } from "../database/firebaseconfig";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
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

  // Login con correo y contraseña (mantiene la lógica original)
  const handleSubmit = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Usuario autenticado:", userCredential.user);
        // Guardar las credenciales en localStorage
        localStorage.setItem("adminEmail", email);
        localStorage.setItem("adminPassword", password);
        navigate("/inicio");
      })
      .catch((error) => {
        setError("Error de autenticación. Verifica tus credenciales.");
        console.error(error);
      });
  };

  // Funciones para login social con popup
  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Google login successful:", result.user);
        // Puedes guardar datos adicionales en localStorage si lo requieres
        navigate("/inicio");
      })
      .catch((error) => {
        console.error("Error en el login con Google:", error);
        setError("Error en el login con Google.");
      });
  };

  const handleGithubLogin = () => {
    const provider = new GithubAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("GitHub login successful:", result.user);
        navigate("/inicio");
      })
      .catch((error) => {
        console.error("Error en el login con GitHub:", error);
        setError("Error en el login con GitHub.");
      });
  };

  const handleFacebookLogin = () => {
    const provider = new FacebookAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Facebook login successful:", result.user);
        navigate("/inicio");
      })
      .catch((error) => {
        console.error("Error en el login con Facebook:", error);
        setError("Error en el login con Facebook.");
      });
  };

  // Si el usuario ya está autenticado, redirigir automáticamente
  if (user) {
    navigate("/inicio");
  }

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
