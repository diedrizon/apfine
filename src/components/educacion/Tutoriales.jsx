import React, { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import ReactPlayer from "react-player";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import "../../styles/Tutoriales.css";

export default function Tutoriales() {
    const [tutoriales, setTutoriales] = useState([]);
    const [cargando, setCargando] = useState(true);

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
        <div className="tutoriales-wrapper">
            {tutoriales.map((t) => (
                <Card key={t.id} className="tutorial-card">
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
    );
}
