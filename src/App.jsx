import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import Encabezado from "./components/Encabezado";
import Panel from "./components/Panel";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./views/Login";
import Inicio from "./views/Inicio";
import Categorias from "./views/Categorias";
import Ingresos from "./views/Ingresos";
import "./App.css";
import ReactGA from "react-ga4";
const RouteChangeTracker = () => {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);
  return null;
};
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    } else {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
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
  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }
  function toggleTheme() {
    setIsDarkMode((prev) => !prev);
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
          <main
            className={`main ${
              isSidebarOpen && !isMobile ? "sidebar-open" : ""
            }`}
          >
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="/inicio"
                element={<ProtectedRoute element={<Inicio />} />}
              />
              <Route
                path="/categorias"
                element={<ProtectedRoute element={<Categorias />} />}
              />
              <Route
                path="/ingresos"
                element={<ProtectedRoute element={<Ingresos />} />}
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;
