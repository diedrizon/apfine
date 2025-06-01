import React, { useEffect, useState } from "react";
import { Card, Spinner, Button } from "react-bootstrap";
import { BiFile } from "react-icons/bi";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import "../../styles/ArticulosIA.css";

export default function ArticulosIA() {
    const [articulos, setArticulos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [articuloActivo, setArticuloActivo] = useState(null);

    useEffect(() => {
        const q = query(
            collection(db, "educacion"),
            where("isArticuloIA", "==", true),
            where("activo", "==", true),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setArticulos(data);
            setCargando(false);
        });

        return () => unsub();
    }, []);

    const renderContenidoFormateado = (texto) => {
        const bloques = texto.split(/(\n|\r)/).filter((p) => p.trim() !== "");
        return bloques.map((linea, idx) => {
            const cleanLine = linea.trim();

            if (/^\*\*\*(.+)\*\*\*$/.test(cleanLine)) {
                return (
                    <h4 key={idx} className="articulo-seccion">
                        {cleanLine.replace(/\*\*\*/g, "").trim()}
                    </h4>
                );
            }
            if (/^\*\*(.+)\*\*$/.test(cleanLine)) {
                return (
                    <h5 key={idx} className="articulo-titulo">
                        {cleanLine.replace(/\*\*/g, "").trim()}
                    </h5>
                );
            }
            if (/^\* (.+)/.test(cleanLine)) {
                return (
                    <li key={idx} className="articulo-item">
                        {cleanLine.replace("* ", "").trim()}
                    </li>
                );
            }
            return (
                <p key={idx} className="articulo-parrafo">
                    {cleanLine}
                </p>
            );
        });
    };

    const limpiarTextoResumen = (texto) => {
        return texto.replace(/\*{1,3}/g, "").trim();
    };


    if (cargando) {
        return (
            <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" />
            </div>
        );
    }

    if (articuloActivo) {
        return (
            <div className="articulo-leer">
                <h3>{articuloActivo.nombreRecurso}</h3>
                <div className="articulo-contenido">
                    {renderContenidoFormateado(
                        articuloActivo.contenidoGenerado || "Sin contenido"
                    )}
                </div>
                <div className="d-flex justify-content-center mt-4">
                    <Button
                        className="btn-salir"
                        onClick={() => setArticuloActivo(null)}
                    >
                        Salir del artículo
                    </Button>
                </div>
            </div>
        );
    }

    if (!articulos.length) {
        return (
            <div className="text-center py-5">
                <h5>No hay artículos disponibles.</h5>
            </div>
        );
    }

    return (
        <div className="articulos-wrapper">
            {articulos.map((a) => (
                <Card
                    key={a.id}
                    className="articulo-card"
                    onClick={() => setArticuloActivo(a)}
                >
                    <div className="icon-wrapper">
                        <BiFile size={48} />
                    </div>
                    <Card.Body>
                        <Card.Title>{a.nombreRecurso || "Sin título"}</Card.Title>
                        <Card.Text>
                            {a.contenidoGenerado
                                ? limpiarTextoResumen(a.contenidoGenerado).slice(0, 150) + "..."
                                : "Sin contenido disponible."}
                        </Card.Text>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
}
