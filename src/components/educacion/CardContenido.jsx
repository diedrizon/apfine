import { Card } from 'react-bootstrap';

const CardContenido = ({ title, description, imageSrc, onClick }) => {
    return (
        <Card
            onClick={onClick}
            className="card-contenido"
            style={{ cursor: 'pointer' }}
        >
            <div className="card-contenido-img-wrapper">
                <Card.Img variant="top" src={imageSrc} className="card-contenido-img" />
            </div>
            <Card.Body className="card-contenido-body">
                <Card.Title className="card-contenido-title">{title}</Card.Title>
                <Card.Text className="card-contenido-text">{description}</Card.Text>
            </Card.Body>
        </Card>
    );
};

export default CardContenido;
