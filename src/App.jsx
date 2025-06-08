// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./database/authcontext";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  increment,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./database/firebaseconfig";
import ReactGA from "react-ga4";

import Encabezado from "./components/Encabezado";
import Panel from "./components/Panel";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./views/Login";
import LandingPage from "./views/LandingPage";
import Inicio from "./views/Inicio";
import Categorias from "./views/Categorias";
import Ingresos from "./views/Ingresos";
import Gastos from "./views/Gastos";
import Recuperar from "./views/Recuperar";
import Recomendaciones from "./views/Recomendaciones";
import NotFound from "./views/NotFound";
import Privacidad from "./views/Privacidad";
import Terminos from "./views/Terminos";
import Gastofijos from "./views/GastosFijos";
import Metas from "./views/Metas";
import MateriasPrimas from "./views/MateriasPrimas";
import GestionUsuario from "./views/GestionUsuarios";
import Inventario from "./views/Inventario";
import OrdenesProduccion from "./views/OrdenesProduccion";
import Educacion from "./views/Educacion";
import Comunidad from "./views/Comunidad";
import VistaGeneralProduccion from "./views/VistaGeneralProduccion";
import InventarioSalida from "./views/InventarioSalida";
import Reportess from "./views/Reportes";
import IASupervision from "./views/IASupervision";
import MonitoreoSistema from "./views/MonitoreoSistema";

import "./App.css";

function RouteChangeTracker() {
  const location = useLocation();
  const { user, perfil } = useAuth();
  const [monitorEnabled, setMonitorEnabled] = useState(true);

  useEffect(() => {
    const cfgRef = doc(db, "config", "system_settings");
    const unsub = onSnapshot(cfgRef, (snap) => {
      if (snap.exists()) setMonitorEnabled(snap.data().monitoringEnabled);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });

    if (
      user &&
      perfil?.rol === "Beneficiario" &&
      monitorEnabled &&
      location.pathname
    ) {
      const mainRef = doc(db, "logs_uso", user.uid);
      const subRutaRef = collection(mainRef, "routes");
      const metaRef = doc(db, "monitor_config", "last_beneficiario");

      (async () => {
        try {
          await setDoc(
            mainRef,
            {
              userId: user.uid,
              userEmail: user.email,
              role: perfil.rol,
              lastRoute: location.pathname,
              lastTimestamp: serverTimestamp(),
              totalRoutes: increment(1),
            },
            { merge: true }
          );

          await addDoc(subRutaRef, {
            route: location.pathname,
            timestamp: serverTimestamp(),
          });

          await setDoc(
            metaRef,
            {
              userEmail: user.email,
              lastRoute: location.pathname,
              timestamp: serverTimestamp(),
            },
            { merge: true }
          );

          console.log("Monitoreo sincronizado correctamente.");
        } catch (error) {
          console.warn("Monitoreo guardado localmente:", error);
        }
      })();
    }
  }, [location, user, perfil, monitorEnabled]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const { cargando } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarState");
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");
    if (justLoggedIn === "true") {
      sessionStorage.removeItem("justLoggedIn");
      localStorage.setItem("sidebarState", "open");
      return true;
    }
    if (saved === null) {
      localStorage.setItem("sidebarState", "open");
      return true;
    }
    return saved === "open";
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const t = localStorage.getItem("theme");
    return t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    const next = !isSidebarOpen;
    setIsSidebarOpen(next);
    localStorage.setItem("sidebarState", next ? "open" : "closed");
  };

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const sinEncabezado = [
    "/",
    "/login",
    "/recuperar",
    "/privacidad",
    "/terminos-condiciones",
    "/404",
  ];

  if (cargando) return null;

  return (
    <div className="App">
      {!sinEncabezado.includes(location.pathname) && (
        <>
          <Encabezado
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
          <Panel isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </>
      )}
      <main
        className={`main ${
          isSidebarOpen && !isMobile && !sinEncabezado.includes(location.pathname)
            ? "sidebar-open"
            : ""
        } ${
          sinEncabezado.includes(location.pathname) ? "sin-encabezado" : ""
        }`}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<Recuperar />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/terminos-condiciones" element={<Terminos />} />

          <Route path="/educacion" element={<ProtectedRoute element={<Educacion />} />} />
          <Route path="/comunidad" element={<ProtectedRoute element={<Comunidad />} />} />
          <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
          <Route path="/categorias" element={<ProtectedRoute element={<Categorias />} />} />
          <Route path="/ingresos" element={<ProtectedRoute element={<Ingresos />} />} />
          <Route path="/gastos" element={<ProtectedRoute element={<Gastos />} />} />
          <Route path="/gastofijos" element={<ProtectedRoute element={<Gastofijos />} />} />
          <Route path="/metas" element={<ProtectedRoute element={<Metas />} />} />
          <Route path="/recomendaciones" element={<ProtectedRoute element={<Recomendaciones />} />} />
          <Route path="/reportes" element={<ProtectedRoute element={<Reportess />} />} />

          <Route
            path="/vista-general-produccion"
            element={<ProtectedRoute element={<VistaGeneralProduccion />} />}
          />
          <Route path="/materias-primas" element={<ProtectedRoute element={<MateriasPrimas />} />} />
          <Route path="/inventario" element={<ProtectedRoute element={<Inventario />} />} />
          <Route path="/ordenes-produccion" element={<ProtectedRoute element={<OrdenesProduccion />} />} />
          <Route path="/inventario-salida" element={<ProtectedRoute element={<InventarioSalida />} />} />

          <Route path="/gestion-usuarios" element={<ProtectedRoute element={<GestionUsuario />} />} />
          <Route path="/ia-supervision" element={<ProtectedRoute element={<IASupervision />} />} />
          <Route path="/monitoreo-sistema" element={<ProtectedRoute element={<MonitoreoSistema />} />} />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteChangeTracker />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
