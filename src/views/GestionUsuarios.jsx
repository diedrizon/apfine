// GestionUsuario.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Container, Button, Modal, Form, Card } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";
import ModalEliminacionUsuario from "../components/gestionusuario/ModalElimacionUsuario";
import ModalEdicionUsuario from "../components/gestionusuario/ModalEdicionUsuario";
import ModalMensaje from "../components/ModalMensaje";

import "../styles/GestionUsuario.css";

function getIconFijo() {
  return <FaIcons.FaLock />;
}

function GestionUsuario() {
  // === Estados ===
  const [userId, setUserId] = useState(null);
  const [usuarios, setUsuarios] = useState([]);

  const [expandedId, setExpandedId] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const usuariosCollection = collection(db, "usuario");

  // Modal de edición
  const [showEdit, setShowEdit] = useState(false);
  const [usuarioEditado, setUsuarioEditado] = useState(null);

  // Modal de eliminación
  const [showDelete, setShowDelete] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  // Mensajes
  const [mensaje, setMensaje] = useState("");

  // === Efectos ===
  useEffect(
    () =>
      onAuthStateChanged(auth, (user) =>
        user ? setUserId(user.uid) : setUserId(null)
      ),
    []
  );

  useEffect(() => {
    const online = () => setIsOffline(false);
    const offline = () => setIsOffline(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    if (userId) fetchUsuarios();
  }, [userId]);

  // === Funciones Firestore ===
  async function fetchUsuarios() {
    try {
      const snap = await getDocs(usuariosCollection);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Excluimos al usuario actual
      setUsuarios(all.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Error fetching usuarios:", error);
    }
  }

  async function handleEditUsuario(editado) {
    setShowEdit(false);
    if (isOffline) {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === editado.id ? editado : u))
      );
    }
    setMensaje("Usuario actualizado correctamente.");
    if (!editado.id.startsWith("temp_")) {
      try {
        await updateDoc(doc(db, "usuario", editado.id), editado);
      } catch (e) {
        console.error(e);
      }
    }
    fetchUsuarios();
  }

  async function handleDeleteUsuario() {
    setShowDelete(false);
    if (isOffline) {
      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioAEliminar.id));
    }
    setMensaje("Usuario eliminado correctamente.");
    if (!usuarioAEliminar.id.startsWith("temp_")) {
      try {
        await deleteDoc(doc(db, "usuario", usuarioAEliminar.id));
      } catch (e) {
        console.error(e);
      }
    }
    fetchUsuarios();
  }

  const toggleExpanded = (u) =>
    setExpandedId(expandedId === u.id ? null : u.id);

  // === Render ===
  return (
    <Container fluid className="usuario-container">
      <div className="usuario-header">
        <h5>Gestión de Usuarios</h5>
      </div>

      <div className="usuario-content">
        <div className="usuarios-list">
          {usuarios.map((u) => {
            const isExpanded = expandedId === u.id;
            return (
              <div
                key={u.id}
                className={`usuario-item ${isExpanded ? "expanded" : ""}`}
                onClick={() => toggleExpanded(u)}
              >
                <div className="usuario-top">
                  <div className="usuario-icon">{getIconFijo()}</div>
                  <span className="usuario-nombre">{u.nombre}</span>
                  <span className="usuario-email">{u.correo}</span>
                </div>
                <div className="usuario-subinfo">
                  <span>{u.telefono || "Sin teléfono"}</span>
                  <span className="mx-2">|</span>
                  <span>{u.rol}</span>
                </div>

                {isExpanded && (
                  <div className="usuario-actions-expanded">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUsuarioEditado({ ...u });
                        setShowEdit(true);
                      }}
                    >
                      <FaIcons.FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUsuarioAEliminar(u);
                        setShowDelete(true);
                      }}
                    >
                      <FaIcons.FaTrash />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Edición Usuario */}
      {usuarioEditado && (
        <ModalEdicionUsuario
          show={showEdit}
          handleClose={() => setShowEdit(false)}
          usuarioEditado={usuarioEditado}
          setUsuarioEditado={setUsuarioEditado}
          handleEditUsuario={handleEditUsuario}
        />
      )}

      {/* Modal Eliminación */}
      {usuarioAEliminar && (
        <ModalEliminacionUsuario
          show={showDelete}
          handleClose={() => setShowDelete(false)}
          usuarioAEliminar={usuarioAEliminar}
          handleDeleteUsuario={handleDeleteUsuario}
        />
      )}

      {/* Modal Mensaje */}
      <ModalMensaje
        show={!!mensaje}
        message={mensaje}
        handleClose={() => setMensaje("")}
      />
    </Container>
  );
}

export default GestionUsuario;
