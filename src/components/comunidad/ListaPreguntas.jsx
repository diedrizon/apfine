import React, { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import { FaQuestionCircle } from "react-icons/fa";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import "../../styles/Comunidad.css";

export default function ListaPreguntas({ onSeleccionarPregunta }) {
    const [preguntas, setPreguntas] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "foropreguntas"),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setPreguntas(data);
            setCargando(false);
        });

        return () => unsub();
    }, []);

    const recortarTexto = (texto, maxLength = 150) => {
        if (texto.length <= maxLength) return texto;
        return texto.slice(0, maxLength) + "...";
    };

    if (cargando) {
        return (
            <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" />
            </div>
        );
    }

    if (!preguntas.length) {
        return (
            <div className="text-center py-5">
                <h5>No hay preguntas en la comunidad.</h5>
            </div>
        );
    }

    return (
        <div className="preguntas-wrapper">
            {preguntas.map((p) => (
                <Card
                    key={p.id}
                    className="pregunta-card"
                    onClick={() => onSeleccionarPregunta(p)}
                >
                    <Card.Body className="d-flex align-items-start">
                        <FaQuestionCircle size={24} className="me-2 icono-pregunta" />
                        <div>
                            <Card.Title>{p.titulo || "Sin título"}</Card.Title>
                            <Card.Text>
                                {recortarTexto(p.descripcion || "Sin descripción")}
                            </Card.Text>
                        </div>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
}
