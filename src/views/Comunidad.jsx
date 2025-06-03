import React, { useState } from "react";
import { Container, Button } from "react-bootstrap";
import ModalCrearPregunta from "../components/comunidad/ModalCrearPregunta";
import ListaPreguntas from "../components/comunidad/ListaPreguntas";
import DetallePregunta from "../components/comunidad/DetallePregunta";
import "../styles/Comunidad.css";

const Comunidad = () => {
    const [showModal, setShowModal] = useState(false);
    const [preguntaActiva, setPreguntaActiva] = useState(null);

    return (
        <Container fluid className="comunidad-container">
            <div className="comunidad-header">
                <h2>Foro de Comunidad</h2>
                <Button variant="success" onClick={() => setShowModal(true)}>
                    Crear nueva pregunta
                </Button>
            </div>

            {preguntaActiva ? (
                <DetallePregunta
                    pregunta={preguntaActiva}
                    onVolver={() => setPreguntaActiva(null)}
                />
            ) : (
                <ListaPreguntas onSeleccionarPregunta={setPreguntaActiva} />
            )}

            <ModalCrearPregunta
                show={showModal}
                handleClose={() => setShowModal(false)}
                onPreguntaCreada={() => {
                    // Aquí podríamos refrescar si fuera necesario
                }}
            />
        </Container>
    );
};

export default Comunidad;
