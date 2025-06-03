import React, { useEffect, useState } from "react";
import { Button, Form, Spinner, Card } from "react-bootstrap";
import { FaHeart, FaReply, FaArrowLeft } from "react-icons/fa";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    increment,
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
    getDoc
} from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { useAuth } from "../../database/authcontext";
import "../../styles/Comunidad.css";

export default function DetallePregunta({ pregunta, onVolver }) {
    const { user } = useAuth();
    const [respuestas, setRespuestas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [nuevaRespuesta, setNuevaRespuesta] = useState("");
    const [publicando, setPublicando] = useState(false);
    const [mostrarFormRespuesta, setMostrarFormRespuesta] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, "respuestasForo"),
            where("preguntaId", "==", pregunta.id),
            orderBy("createdAt", "asc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setRespuestas(data);
            setCargando(false);
        });

        return () => unsub();
    }, [pregunta.id]);

    const handlePublicarRespuesta = async () => {
        if (!nuevaRespuesta.trim()) return;

        setPublicando(true);

        try {
            await addDoc(collection(db, "respuestasForo"), {
                preguntaId: pregunta.id,
                contenidoRespuesta: nuevaRespuesta.trim(),
                userId: user.uid,
                userDisplayName: user.displayName || "Anónimo",
                userPhotoURL: user.photoURL || "",
                createdAt: serverTimestamp(),
                likesCount: 0,
            });

            const preguntaRef = doc(db, "preguntasForo", pregunta.id);
            await updateDoc(preguntaRef, {
                respuestasCount: increment(1),
            });

            setNuevaRespuesta("");
            setMostrarFormRespuesta(false);
        } catch (e) {
            console.error("Error publicando respuesta:", e);
        } finally {
            setPublicando(false);
        }
    };

    const handleToggleLike = async (respuestaId) => {
        const likeRef = doc(
            db,
            "respuestasForo",
            respuestaId,
            "likes",
            user.uid
        );

        const respuestaRef = doc(db, "respuestasForo", respuestaId);
        const likeDoc = await getDoc(likeRef);

        if (likeDoc.exists()) {
            await deleteDoc(likeRef);
            await updateDoc(respuestaRef, { likesCount: increment(-1) });
        } else {
            await setDoc(likeRef, {
                userId: user.uid,
                createdAt: serverTimestamp(),
            });
            await updateDoc(respuestaRef, { likesCount: increment(1) });
        }
    };

    return (
        <div className="detalle-pregunta">
            <Button variant="outline-secondary" className="mb-3" onClick={onVolver}>
                <FaArrowLeft /> Volver
            </Button>

            <Card className="mb-4 pregunta-detalle-card">
                <Card.Body>
                    <Card.Title>{pregunta.titulo}</Card.Title>
                    <Card.Text>{pregunta.descripcion}</Card.Text>
                </Card.Body>
            </Card>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Respuestas ({respuestas.length})</h5>
                <Button
                    variant={mostrarFormRespuesta ? "outline-danger" : "outline-success"}
                    onClick={() => setMostrarFormRespuesta(!mostrarFormRespuesta)}
                >
                    <FaReply /> {mostrarFormRespuesta ? "Cancelar" : "Dar respuesta"}
                </Button>
            </div>

            {mostrarFormRespuesta && (
                <div className="mb-4">
                    <Form.Group className="mb-2">
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={nuevaRespuesta}
                            onChange={(e) => setNuevaRespuesta(e.target.value)}
                            placeholder="Escribe tu respuesta aquí..."
                        />
                    </Form.Group>
                    <Button
                        variant="success"
                        onClick={handlePublicarRespuesta}
                        disabled={publicando || !nuevaRespuesta.trim()}
                    >
                        {publicando ? "Publicando..." : "Publicar respuesta"}
                    </Button>
                </div>
            )}

            {cargando ? (
                <Spinner animation="border" />
            ) : (
                <div className="respuestas-wrapper">
                    {respuestas.map((r) => (
                        <Card key={r.id} className="respuesta-card">
                            <Card.Body>
                                <Card.Text>{r.contenidoRespuesta}</Card.Text>
                                <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                        Por {r.userDisplayName}
                                    </small>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        className="like-button"
                                        onClick={() => handleToggleLike(r.id)}
                                    >
                                        <FaHeart /> {r.likesCount || 0}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
