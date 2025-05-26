import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { useAuth } from "../../database/authcontext";

function ModalCrearMaterial({ show, handleClose, onMaterialCreado }) {
    const { user } = useAuth();

    const [form, setForm] = useState({
        nombreRecurso: "",
        tipo: "tutorial",
        linkRecurso: "",
        activo: "true",
    });
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        if (!user) return;

        const link = (form.linkRecurso ?? "").trim();
        if (!link) {
            alert("El enlace del recurso es obligatorio");
            return;
        }

        setCargando(true);
        try {
            await addDoc(collection(db, "educacion"), {
                userId: user.uid,
                nombreRecurso: form.nombreRecurso,
                isTutorial: form.tipo === "tutorial",
                isDocumento: form.tipo === "documento",
                linkRecurso: link,
                activo: form.activo === "true",
                createdAt: serverTimestamp(),
            });

            if (onMaterialCreado) onMaterialCreado();
            handleClose();
            setForm({ nombreRecurso: "", tipo: "tutorial", linkRecurso: "", activo: "true" });
        } catch (e) {
            console.error("Error al crear material:", e);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            backdrop="static"
            className="custom-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>Crear Material</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Nombre del recurso */}
                <Form.Group className="modal-group mb-3">
                    <Form.Label>Nombre del Recurso</Form.Label>
                    <Form.Control
                        type="text"
                        name="nombreRecurso"
                        value={form.nombreRecurso}
                        onChange={handleChange}
                        placeholder="Ej: Cómo usar la plataforma"
                    />
                </Form.Group>

                {/* Tipo */}
                <Form.Group className="modal-group mb-3">
                    <Form.Label>Tipo</Form.Label>
                    <Form.Select
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                    >
                        <option value="tutorial">Tutorial</option>
                        <option value="documento">Documento</option>
                    </Form.Select>
                </Form.Group>

                {/* Enlace del recurso */}
                <Form.Group className="modal-group mb-3">
                    <Form.Label>Enlace del Recurso</Form.Label>
                    <Form.Control
                        type="url"
                        name="linkRecurso"
                        value={form.linkRecurso}
                        onChange={handleChange}
                        placeholder="https://..."
                    />
                </Form.Group>

                {/* Estado */}
                <Form.Group className="modal-group mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                        name="activo"
                        value={form.activo}
                        onChange={handleChange}
                    >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                    </Form.Select>
                </Form.Group>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={cargando}
                >
                    {cargando ? "Guardando..." : "Guardar"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalCrearMaterial;
