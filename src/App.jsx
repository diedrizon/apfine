import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import Encabezado from "./components/Encabezado";
import Panel from "./components/Panel";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./views/Login";
import Inicio from "./views/Inicio";
import Categorias from "./views/Categorias";
import "./App.css";
import ReactGA from "react-ga4";

// Componente para rastrear cambios de ruta y enviar pageviews a GA4
const RouteChangeTracker = () => {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);
  return null;
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 1) useState con función inicial para cargar el tema desde localStorage o prefers-color-scheme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme"); // 'dark' o 'light'
    if (savedTheme) {
      // Si en localStorage está 'dark' o 'light', lo usamos
      return savedTheme === "dark";
    } else {
      // Si no está en localStorage, revisamos la preferencia del sistema
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
  });

  // 2) Cada vez que cambie isDarkMode, guardar en localStorage y cambiar clases en <body>
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

  // Ajustar estado de isMobile según el ancho de la ventana
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  // 3) Función para alternar el tema al pulsar el botón
  function toggleTheme() {
    setIsDarkMode((prevMode) => !prevMode);
  }

  return (
    <AuthProvider>
      <Router>
        <RouteChangeTracker />
        <div className="App">
          <Encabezado
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
          <Panel isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

          {overlayActive && (
            <div
              className="modal-overlay"
              onClick={() => setOverlayActive(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                zIndex: 1350,
              }}
            />
          )}

          <main className={`main ${isSidebarOpen && !isMobile ? "sidebar-open" : ""}`}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
              <Route
                path="/categorias"
                element={
                  <ProtectedRoute
                    element={
                      <Categorias
                        closeSidebar={closeSidebar}
                        setOverlayActive={setOverlayActive}
                      />
                    }
                  />
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
