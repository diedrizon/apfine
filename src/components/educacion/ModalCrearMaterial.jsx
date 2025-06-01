import React, { useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { useAuth } from "../../database/authcontext";

function ModalCrearMaterial({ show, handleClose, onMaterialCreado }) {
    const { user } = useAuth();

    const initialFormState = {
        nombreRecurso: "",
        tipo: "tutorial",
        linkRecurso: "",
        promptIA: "",
        contenidoGenerado: "",
        activo: "true",
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

    const handleGenerateIA = async () => {
        if (!form.promptIA?.trim()) {
            alert("El prompt para el artículo es obligatorio");
            return;
        }

        setCargando(true);
        setMensaje("Generando artículo con IA...");

        const systemPrompt =
            "IMPORTANTE: Usa **dobles asteriscos** para títulos, ***triples*** para secciones, y *simples* para listas.\n\n";

        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GOOGLE_AI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: systemPrompt + form.promptIA }],
                            },
                        ],
                    }),
                }
            );

            const data = await res.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedText) {
                alert("No se pudo generar el artículo");
                setMensaje("");
                return;
            }

            setForm((prev) => ({
                ...prev,
                contenidoGenerado: generatedText,
                promptIA: "",
            }));
            setMensaje("✅ Artículo generado exitosamente. Revisalo antes de guardar.");
        } catch (e) {
            console.error("Error generando artículo:", e);
            alert("Hubo un error al generar el artículo.");
        } finally {
            setCargando(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) return;

        if (form.tipo === "articuloIA" && !form.contenidoGenerado?.trim()) {
            alert("Primero generá el artículo con IA antes de guardar.");
            return;
        }

        if (form.tipo !== "articuloIA" && !form.linkRecurso?.trim()) {
            alert("El enlace del recurso es obligatorio");
            return;
        }

        setCargando(true);
        setMensaje("Guardando material...");

        try {
            await addDoc(collection(db, "educacion"), {
                userId: user.uid,
                nombreRecurso: form.nombreRecurso,
                isTutorial: form.tipo === "tutorial",
                isDocumento: form.tipo === "documento",
                isArticuloIA: form.tipo === "articuloIA",
                linkRecurso: form.linkRecurso,
                contenidoGenerado: form.contenidoGenerado,
                activo: form.activo === "true",
                createdAt: serverTimestamp(),
            });

            if (onMaterialCreado) onMaterialCreado();
            setMensaje("✅ Material guardado exitosamente.");
        } catch (e) {
            console.error("Error al crear material:", e);
            alert("Hubo un error al guardar el material.");
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
                <Modal.Title>Crear Material</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {mensaje && <Alert variant="info">{mensaje}</Alert>}

                <Form.Group className="modal-group mb-3">
                    <Form.Label>Nombre del Recurso</Form.Label>
                    <Form.Control
                        type="text"
                        name="nombreRecurso"
                        value={form.nombreRecurso}
                        onChange={handleChange}
                        placeholder="Ej: Cómo ahorrar dinero"
                    />
                </Form.Group>

                <Form.Group className="modal-group mb-3">
                    <Form.Label>Tipo</Form.Label>
                    <Form.Select
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                    >
                        <option value="tutorial">Tutorial</option>
                        {/* <option value="documento">Documento</option> */}
                        <option value="articuloIA">Artículo con IA</option>
                    </Form.Select>
                </Form.Group>

                {form.tipo === "articuloIA" && (
                    <>
                        {!form.contenidoGenerado ? (
                            <Form.Group className="modal-group mb-3">
                                <Form.Label>Describe qué artículo querés generar</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="promptIA"
                                    value={form.promptIA}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Ej: Cómo mejorar mis finanzas personales"
                                    disabled={cargando}
                                />
                                <Button
                                    variant="warning"
                                    onClick={handleGenerateIA}
                                    className="mt-2"
                                    disabled={cargando}
                                >
                                    {cargando ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />{" "}
                                            Generando...
                                        </>
                                    ) : (
                                        "Generar Artículo"
                                    )}
                                </Button>
                            </Form.Group>
                        ) : (
                            <Form.Group className="modal-group mb-3">
                                <Form.Label>Artículo Generado (podés editarlo antes de guardar)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="contenidoGenerado"
                                    value={form.contenidoGenerado}
                                    onChange={handleChange}
                                    rows={8}
                                />
                            </Form.Group>
                        )}
                    </>
                )}

                {form.tipo !== "articuloIA" && (
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
                )}

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
                <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                    Cerrar
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={cargando || (form.tipo === "articuloIA" && !form.contenidoGenerado)}
                >
                    {cargando ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />{" "}
                            Esperando...
                        </>
                    ) : (
                        "Guardar"
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalCrearMaterial;
