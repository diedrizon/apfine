import { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../database/authcontext';

import Tutoriales from '../components/educacion/Tutoriales';
import ArticulosIA from '../components/educacion/ArticulosIA';
import CardContenido from '../components/educacion/CardContenido';
import ModalCrearMaterial from '../components/educacion/ModalCrearMaterial';

import '../styles/Educacion.css';


const Educacion = () => {
    const [componenteActual, setComponenteActual] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { isAdmin } = useAuth();

    const handleCreateClick = () => setShowCreateModal(true);
    const handleCloseModal = () => setShowCreateModal(false);

    return (
        <Container fluid className="educacion-container">
            <div className="educacion-header">
                {componenteActual ? (
                    <div className="d-flex align-items-center">
                        <Button
                            variant="link"
                            className="back-button px-0"
                            onClick={() => setComponenteActual(null)}
                        >
                            <FiArrowLeft size={20} />
                            <span className="ms-1">Volver a Recursos</span>
                        </Button>
                        {/* <h1 className="mb-0 ms-3">Educación</h1> */}
                    </div>
                ) : (
                    <div className="d-flex align-items-center justify-content-between w-100">
                        <h1 className="mb-0">Educación</h1>
                        {isAdmin && (
                            <Button variant="success" onClick={handleCreateClick}>
                                Crear Material
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* CONTENIDO */}
            {componenteActual ? (
                <div className="educacion-content">
                    {componenteActual === 'tutoriales' && <Tutoriales />}
                    {componenteActual === 'articulos' && <ArticulosIA />}
                </div>
            ) : (
                <div className="educacion-content">
                    <CardContenido
                        title="Tutoriales"
                        description="Accede a tutoriales paso a paso."
                        imageSrc="/icons/tutorial.png"
                        onClick={() => setComponenteActual('tutoriales')}
                    />
                    <CardContenido
                        title="Articulos con IA"
                        description="Consulta artículos generados con IA."
                        imageSrc="/icons/articulo.png"
                        onClick={() => setComponenteActual('articulos')}
                    />
                </div>
            )}

            {/* MODAL placeholder para “Crear Material” */}
            <ModalCrearMaterial
                show={showCreateModal}
                handleClose={handleCloseModal}
            />

        </Container>
    );
};

export default Educacion;
