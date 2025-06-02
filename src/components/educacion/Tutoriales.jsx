import React, { useEffect, useState } from "react";
import { Card, Spinner, Button } from "react-bootstrap";
import ReactPlayer from "react-player";
import { BiTrash } from "react-icons/bi";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { useAuth } from "../../database/authcontext";
import ModalMensaje from "../../components/ModalMensaje";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import "../../styles/Tutoriales.css";

export default function Tutoriales() {
  const [tutoriales, setTutoriales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { isAdmin } = useAuth();
  const [modalMensaje, setModalMensaje] = useState({
    show: false,
    message: "",
    className: "",
  });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    tutorialId: null,
  });

  useEffect(() => {
    const q = query(
      collection(db, "educacion"),
      where("isTutorial", "==", true),
      where("activo", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTutoriales(data);
      setCargando(false);
    });

    return () => unsub();
  }, []);

  const handleDelete = async () => {
    setModalMensaje({
      show: true,
      message: "⏳ Eliminando tutorial...",
      className: "info",
    });

    try {
      await deleteDoc(doc(db, "educacion", confirmModal.tutorialId));
      setModalMensaje({
        show: true,
        message: "✅ Tutorial eliminado exitosamente.",
        className: "success",
      });
    } catch (error) {
      console.error("Error al eliminar tutorial:", error);
      setModalMensaje({
        show: true,
        message: "❌ Error al eliminar el tutorial.",
        className: "error",
      });
    } finally {
      setConfirmModal({ show: false, tutorialId: null });
    }
  };

  if (cargando) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!tutoriales.length) {
    return (
      <div className="text-center py-5">
        <h5>No hay tutoriales disponibles.</h5>
      </div>
    );
  }

  return (
    <>
      <div className="tutoriales-wrapper">
        {tutoriales.map((t) => (
          <Card key={t.id} className="tutorial-card">
            {isAdmin && (
              <Button
                variant="danger"
                size="sm"
                className="btn-eliminar"
                onClick={() =>
                  setConfirmModal({ show: true, tutorialId: t.id })
                }
              >
                <BiTrash />
              </Button>
            )}
            <div className="player-wrapper">
              <ReactPlayer
                url={t.linkRecurso}
                width="100%"
                height="100%"
                controls
                className="react-player"
              />
            </div>
            <Card.Body>
              <Card.Title>{t.nombreRecurso || "Sin título"}</Card.Title>
            </Card.Body>
          </Card>
        ))}
      </div>

      <ModalConfirmacion
        show={confirmModal.show}
        handleClose={() => setConfirmModal({ show: false, tutorialId: null })}
        titulo="Eliminar Tutorial"
        mensaje="¿Estás seguro de eliminar este tutorial?"
        onConfirm={handleDelete}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />

      <ModalMensaje
        show={modalMensaje.show}
        handleClose={() =>
          setModalMensaje({ show: false, message: "", className: "" })
        }
        message={modalMensaje.message}
        className={modalMensaje.className}
      />
    </>
  );
}
