import { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import Tutoriales from '../components/educacion/Tutoriales';
import Documentos from '../components/educacion/Documentos';
import CardContenido from '../components/educacion/CardContenido';

import '../styles/Educacion.css';


const Educacion = () => {
    const [componenteActual, setComponenteActual] = useState(null);

    const renderComponente = () => {
        switch (componenteActual) {
            case 'tutoriales':
                return <Tutoriales />;
            case 'documentos':
                return <Documentos />;
            default:
                return null;
        }
    };

    return (
        <Container fluid className="educacion-container">
            <div className="educacion-header">
                <h1>Educación</h1>
            </div>

            {componenteActual ? (
                <div className="educacion-content">
                    <Button
                        variant="secondary"
                        onClick={() => setComponenteActual(null)}
                        style={{ marginBottom: '15px' }}
                    >
                        Volver a las tarjetas
                    </Button>
                    <div>{renderComponente()}</div>
                </div>
            ) : (
                <div className="educacion-content">
                    <CardContenido
                        title="Tutoriales"
                        description="Accede a tutoriales paso a paso para aprender."
                        imageSrc="/icons/tutorial.png"
                        onClick={() => setComponenteActual('tutoriales')}
                    />
                    <CardContenido
                        title="Documentos"
                        description="Consulta documentos y material de referencia."
                        imageSrc="/icons/documentos.png"
                        onClick={() => setComponenteActual('documentos')}
                    />
                </div>
            )}
        </Container>
    );
};

export default Educacion;
