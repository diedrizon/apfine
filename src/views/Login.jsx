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

/* ───── utilidades cédula ───── */
const parseCedula = (raw) => {
  const clean = raw.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  const match = clean.match(/^(\d{3})(\d{6})(\d{4})([A-J])$/);
  if (!match) return null;
  const [, cod3, nac6] = match;
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
  codigosCedula[c3] ?? { municipio: "", departamento: "" };

/* ───── componente ───── */
const Login = () => {
  /* ───── estados login ───── */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  /* ───── estados registro ───── */
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regCedula, setRegCedula] = useState("");
  const [regNombre, setRegNombre] = useState("");
  const [regTel, setRegTel] = useState("");

  /* ───── flags de control ───── */
  const [error, setError] = useState(null);
  const [esperandoAceptacion, setEsperandoAceptacion] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [esGoogleNuevo, setEsGoogleNuevo] = useState(false);
  const [requierePerfil, setRequierePerfil] = useState(false);

  /* ───── firebase ───── */
  const { user } = useAuth();
  const nav = useNavigate();
  const auth = getAuth(appfirebase);
  const db = getFirestore(appfirebase);

  /* ───── LOGIN ───── */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPass
      );
      const perfilSnap = await getDoc(doc(db, "usuario", cred.user.uid));
      const perfil = perfilSnap.data();

      localStorage.setItem("userDisplayName", perfil.nombre || "Usuario");
      localStorage.setItem("userEmail", perfil.correo || "");
      localStorage.setItem("userPhotoURL", perfil.photoURL || "");

      nav("/inicio");
    } catch {
      setError("Credenciales inválidas.");
    }
  };

  /* ───── REGISTRO ───── */
  const handleRegister = async (e) => {
    e.preventDefault();
    const parsed = parseCedula(regCedula);
    if (!parsed) return setError("Cédula inválida.");

    const { cod3, nac6 } = parsed;
    const { municipio, departamento } = lugarDesdeCodigo(cod3);
    const fNac = fechaNac(nac6);
    const edad = edadDesde(fNac);

    let uid = auth.currentUser?.uid;

    /* ── registro clásico ── */
    if (!esGoogleNuevo) {
      if (regPass !== regConfirm) return setError("Las contraseñas no coinciden.");
      if (regPass.length < 6) return setError("Contraseña mínimo 6 caracteres.");
      uid = (await createUserWithEmailAndPassword(auth, regEmail, regPass)).user
        .uid;
    }

    const perfil = {
      cedula: regCedula,
      nombre: regNombre,
      correo: regEmail,
      telefono: regTel,
      municipio,
      departamento,
      fechaNacimiento: fNac.toISOString().split("T")[0],
      edad,
      rol: "Beneficiario",
      activo: true,
      photoURL: auth.currentUser?.photoURL ?? "",
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "usuario", uid), perfil);

    localStorage.setItem("userDisplayName", regNombre);
    localStorage.setItem("userEmail", regEmail);
    localStorage.setItem("userPhotoURL", auth.currentUser?.photoURL ?? "");

    localStorage.removeItem("pendienteAceptarGoogle");
    localStorage.removeItem("requiereCompletarPerfil");

    /* ── flujo posterior ── */
    if (esGoogleNuevo) {
      nav("/inicio"); // Google: pasa directo al dashboard
    } else {
      // Email/contraseña: vuelve al tab de Inicio de Sesión
      setMostrarRegistro(false);
      setEsGoogleNuevo(false);
      setLoginEmail(regEmail); // auto‑rellena el login
      setRegPass("");
      setRegConfirm("");
      setError("Registro exitoso. Inicia sesión con tus credenciales.");
    }
  };

  /* ───── GOOGLE ───── */
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
        localStorage.setItem("userPhotoURL", perfil.photoURL || gUser.photoURL);

        localStorage.setItem("pendienteAceptarGoogle", "true");
        setEsperandoAceptacion(true);
      } else {
        localStorage.setItem("requiereCompletarPerfil", "true");
        setRequierePerfil(true);
        setMostrarRegistro(true);
        setEsGoogleNuevo(true);

        setRegNombre(gUser.displayName ?? "");
        setRegEmail(gUser.email ?? "");
      }
    } catch (err) {
      console.error("Error con Google:", err.message);
      setError("No se pudo iniciar sesión con Google.");
    }
  };

  const handleAceptarGoogle = () => {
    localStorage.removeItem("pendienteAceptarGoogle");
    nav("/inicio");
  };

  /* ───── verificación inicial ───── */
  useEffect(() => {
    const validarPerfil = async () => {
      if (!user) return;

      const ref = doc(db, "usuario", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const perfil = snap.data();
        localStorage.setItem("userDisplayName", perfil.nombre || "");
        localStorage.setItem("userEmail", perfil.correo || "");
        localStorage.setItem("userPhotoURL", perfil.photoURL || "");
        if (!esperandoAceptacion && !mostrarRegistro && !requierePerfil) {
          nav("/inicio");
        }
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
