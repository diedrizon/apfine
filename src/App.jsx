import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./views/Login";
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import Panel from "./components/Panel";
import "./App.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Encabezado isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          {/* Panel siempre renderizado para sincronizar la transición */}
          <Panel isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <main className={isSidebarOpen ? "main sidebar-open" : "main"}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
