// src/pages/Login.jsx

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
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../database/authcontext";
import codigosCedula from "../data/codigocedulacion.json";
import "../styles/login.css";

const CEDULA_RX = /^\d{3}-\d{6}-\d{4}[A-Z]$/;
const NOMBRE_RX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
const PHONE_RX = /^\d{4}-\d{4}$/;
const PASS_RX = /^[A-Za-z\d]{6,}$/;

const parseCedula = (raw) => {
  const clean = raw.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  const match = clean.match(/^(\d{3})(\d{6})(\d{4})([A-Z])$/);
  if (!match) return null;
  const cod3 = match[1];
  const nac6 = match[2];
  return { cod3, nac6 };
};

const fullYear = (yy) =>
  yy <= new Date().getFullYear() % 100 ? 2000 + yy : 1900 + yy;

const fechaNac = (nac6) =>
  new Date(
    fullYear(+nac6.slice(4, 6)),
    +nac6.slice(2, 4) - 1,
    +nac6.slice(0, 2)
  );

const edadDesde = (date) => {
  const h = new Date();
  let e = h.getFullYear() - date.getFullYear();
  if (
    h.getMonth() < date.getMonth() ||
    (h.getMonth() === date.getMonth() && h.getDate() < date.getDate())
  )
    e--;
  return e;
};

const lugarDesdeCodigo = (c3) =>
  codigosCedula[c3] || { municipio: "", departamento: "" };

const Login = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regCedula, setRegCedula] = useState("");
  const [regNombre, setRegNombre] = useState("");
  const [regTel, setRegTel] = useState("");
  const [error, setError] = useState(null);
  const [esperandoAceptacion, setEsperandoAceptacion] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [esGoogleNuevo, setEsGoogleNuevo] = useState(false);
  const [requierePerfil, setRequierePerfil] = useState(false);

  const { user } = useAuth();
  const nav = useNavigate();
  const auth = getAuth(appfirebase);
  const db = getFirestore(appfirebase);

  const validarDatosRegistro = () => {
    if (!CEDULA_RX.test(regCedula)) return "Cédula inválida.";
    const cod3 = regCedula.replace(/[^0-9]/g, "").slice(0, 3);
    if (!codigosCedula[cod3]) return "Cédula inválida, por favor revisala.";
    if (!NOMBRE_RX.test(regNombre.trim())) return "Nombre inválido.";
    if (!regEmail.includes("@")) return "Correo inválido.";
    if (!PHONE_RX.test(regTel)) return "Teléfono inválido.";
    if (!esGoogleNuevo) {
      if (!PASS_RX.test(regPass)) return "Contraseña inválida.";
      if (regPass !== regConfirm) return "Las contraseñas no coinciden.";
    }
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        loginEmail.trim(),
        loginPass
      );
      const perfilSnap = await getDoc(doc(db, "usuario", cred.user.uid));
      const perfil = perfilSnap.data();
      localStorage.setItem("userDisplayName", perfil.nombre || "Usuario");
      localStorage.setItem("userEmail", perfil.correo || "");
      localStorage.setItem("userPhotoURL", perfil.photoURL || "");
      sessionStorage.setItem("justLoggedIn", "true");
      nav("/inicio");
    } catch {
      setError("Credenciales inválidas.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const campoInvalido = validarDatosRegistro();
    if (campoInvalido) return setError(campoInvalido);

    const parsed = parseCedula(regCedula);
    if (!parsed) return setError("Cédula inválida.");
    const { cod3, nac6 } = parsed;
    if (!codigosCedula[cod3])
      return setError("Cédula inválida, por favor revisala.");

    const { municipio, departamento } = lugarDesdeCodigo(cod3);
    const fNac = fechaNac(nac6);
    const edad = edadDesde(fNac);
    let uid = auth.currentUser?.uid;

    if (!esGoogleNuevo) {
      const { user: newUser } = await createUserWithEmailAndPassword(
        auth,
        regEmail.trim(),
        regPass
      );
      uid = newUser.uid;
    }

    const perfil = {
      cedula: regCedula,
      nombre: regNombre.trim(),
      correo: regEmail.trim(),
      telefono: regTel,
      municipio,
      departamento,
      fechaNacimiento: fNac.toISOString().split("T")[0],
      edad,
      rol: "Beneficiario",
      activo: true,
      photoURL: auth.currentUser?.photoURL || "",
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "usuario", uid), perfil);
    localStorage.setItem("userDisplayName", regNombre.trim());
    localStorage.setItem("userEmail", regEmail.trim());
    localStorage.setItem("userPhotoURL", auth.currentUser?.photoURL || "");
    localStorage.removeItem("pendienteAceptarGoogle");
    localStorage.removeItem("requiereCompletarPerfil");

    if (esGoogleNuevo) {
      sessionStorage.setItem("justLoggedIn", "true");
      nav("/inicio");
    } else {
      setMostrarRegistro(false);
      setEsGoogleNuevo(false);
      setLoginEmail(regEmail.trim());
      setRegPass("");
      setRegConfirm("");
      setError(null);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { user: gUser } = await signInWithPopup(
        auth,
        new GoogleAuthProvider()
      );
      const perfilSnap = await getDoc(doc(db, "usuario", gUser.uid));
      const existePerfil = perfilSnap.exists();

      if (existePerfil) {
        const perfil = perfilSnap.data();
        localStorage.setItem(
          "userDisplayName",
          perfil.nombre || gUser.displayName
        );
        localStorage.setItem("userEmail", perfil.correo || gUser.email);
        localStorage.setItem(
          "userPhotoURL",
          perfil.photoURL || gUser.photoURL
        );
        localStorage.setItem("pendienteAceptarGoogle", "true");
        sessionStorage.setItem("justLoggedIn", "true");
        setEsperandoAceptacion(true);
      } else {
        localStorage.setItem("requiereCompletarPerfil", "true");
        setRequierePerfil(true);
        setMostrarRegistro(true);
        setEsGoogleNuevo(true);
        setRegNombre(gUser.displayName || "");
        setRegEmail(gUser.email || "");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo iniciar sesión con Google.");
    }
  };

  const handleAceptarGoogle = () => {
    localStorage.removeItem("pendienteAceptarGoogle");
    sessionStorage.setItem("justLoggedIn", "true");
    nav("/inicio");
  };

  useEffect(() => {
    if (!user) return;
    const validarPerfil = async () => {
      const ref = doc(db, "usuario", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const perfil = snap.data();
        localStorage.setItem("userDisplayName", perfil.nombre || "");
        localStorage.setItem("userEmail", perfil.correo || "");
        localStorage.setItem("userPhotoURL", perfil.photoURL || "");
        if (!esperandoAceptacion && !mostrarRegistro && !requierePerfil)
          nav("/inicio");
      } else {
        localStorage.setItem("requiereCompletarPerfil", "true");
        setRequierePerfil(true);
        setMostrarRegistro(true);
        setEsGoogleNuevo(true);
      }
    };
    validarPerfil();
  }, [user, esperandoAceptacion, mostrarRegistro, requierePerfil, nav, db]);

  return (
    <div className="login-page">
      <LoginForm
        startInRegister={mostrarRegistro}
        esGoogleNuevo={esGoogleNuevo}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPass={loginPass}
        setLoginPass={setLoginPass}
        regEmail={regEmail}
        setRegEmail={setRegEmail}
        regPass={regPass}
        setRegPass={setRegPass}
        regConfirm={regConfirm}
        setRegConfirm={setRegConfirm}
        regCedula={regCedula}
        setRegCedula={setRegCedula}
        regNombre={regNombre}
        setRegNombre={setRegNombre}
        regTel={regTel}
        setRegTel={setRegTel}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleGoogleLogin={handleGoogleLogin}
        esperandoAceptacion={esperandoAceptacion}
        handleAceptarGoogle={handleAceptarGoogle}
        error={error}
      />
    </div>
  );
};

export default Login;
