import React, { useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { useAuth } from "../../database/authcontext";

export default function ModalCrearPregunta({
  show,
  handleClose,
  onPreguntaCreada,
}) {
  const { user } = useAuth();

  const initialFormState = {
    titulo: "",
    descripcion: "",
    categoria: "general",
  };

  const [form, setForm] = useState(initialFormState);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetModal = () => {
    setForm(initialFormState);
    setMensaje("");
    setCargando(false);
  };

  const handleSubmit = async () => {
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      setMensaje("❌ El título y la descripción son obligatorios.");
      return;
    }

    setCargando(true);
    setMensaje("Publicando pregunta...");

    try {
      await addDoc(collection(db, "foropreguntas"), {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        categoria: form.categoria,
        userId: user.uid,
        userDisplayName: user.displayName || "",
        userPhotoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
        respuestasCount: 0,
        vistasCount: 0,
      });

      setMensaje("✅ Pregunta publicada exitosamente.");
      setForm(initialFormState);
      if (onPreguntaCreada) onPreguntaCreada();
    } catch (e) {
      console.error("Error creando pregunta:", e);
      setMensaje("❌ Hubo un error al publicar la pregunta.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      onExited={resetModal}
      centered
      backdrop="static"
      className="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>¿De qué querés discutir?</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {mensaje && <Alert variant="info">{mensaje}</Alert>}

        <Form.Group className="modal-group mb-3">
          <Form.Label>Título</Form.Label>
          <Form.Control
            type="text"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            maxLength={140}
            placeholder="Ej: ¿Cómo mejorar mis hábitos financieros?"
          />
        </Form.Group>

        <Form.Group className="modal-group mb-3">
          <Form.Label>Describe tu mensaje (solo texto y enlaces)</Form.Label>
          <Form.Control
            as="textarea"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={6}
            placeholder="Explicá tu problema o pregunta..."
          />
        </Form.Group>

        <Form.Group className="modal-group mb-3">
          <Form.Label>Categoría</Form.Label>
          <Form.Select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
          >
            <option value="general">General</option>
            <option value="finanzas">Finanzas</option>
            <option value="educacion">Educación</option>
            <option value="tecnologia">Tecnología</option>
          </Form.Select>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={cargando}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={cargando}>
          {cargando ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />{" "}
              Publicando...
            </>
          ) : (
            "Publicar"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
