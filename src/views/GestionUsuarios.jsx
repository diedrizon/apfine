import React, { useState, useEffect } from "react";
import { db, auth } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Container, Button, Card } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";

import "../styles/GestionUsuario.css";

function getIconFijo() {
  return <FaIcons.FaLock />;
}

function GestionUsuario() {
  const [userId, setUserId] = useState(null);
  const [usuarios, setUsuarios] = useState([]);

    const [mensaje, setMensaje] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const usuariosCollection = collection(db, "usuario");

      useEffect(
        () => onAuthStateChanged(auth, (user) => user && setUserId(user.uid)),
        []
      );
    
      useEffect(() => {
        const online = () => setIsOffline(false);
        const offline = () => setIsOffline(true);
        window.addEventListener("online", online);
        window.addEventListener("offline", offline);
        setIsOffline(!navigator.onLine);
        return () => {
          window.removeEventListener("online", online);
          window.removeEventListener("offline", offline);
        };
      }, []);

      useEffect(() => {
         if (userId) fetchUsuarios();
      });

      async function fetchUsuarios() {
        try {
          const snap = await getDocs(usuariosCollection);
          const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setUsuarios(all.filter((u) => u.id !== userId));
          //console.log(all);
        } catch (error) {
          console.error("Error fetching usuarios:", error);
        }
      }
    return (
        <Container fluid className="usuario-container">
          <div className="usuario-header">
            <h5>Gestión de Usuarios</h5>
          </div>

          <div className="usuario-content">
            <div className="usuarios-list">
              {usuarios.map((usuarios) => {
                const isExpanded = expandedId === usuarios.id;
              })}
            </div>
          </div>
        </Container>  
    )
}

export default GestionUsuario;