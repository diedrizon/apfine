import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./database/authcontext"
import Encabezado from "./components/Encabezado"
import Panel from "./components/Panel"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./views/Login"
import Inicio from "./views/Inicio"
import Categorias from "./views/Categorias"
import "./App.css"

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [overlayActive, setOverlayActive] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode")
      document.body.classList.remove("light-mode")
    } else {
      document.body.classList.add("light-mode")
      document.body.classList.remove("dark-mode")
    }
  }, [isDarkMode])

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen)
  }

  function closeSidebar() {
    setIsSidebarOpen(false)
  }

  function toggleTheme() {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <AuthProvider>
      <Router>
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
                zIndex: 1350
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
                    element={<Categorias closeSidebar={closeSidebar} setOverlayActive={setOverlayActive} />}
                  />
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
