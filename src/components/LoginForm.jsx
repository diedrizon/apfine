import React from "react";
import { Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import "../styles/login.css"; 
const LoginForm = ({
  email,
  password,
  error,
  setEmail,
  setPassword,
  handleSubmit,
  handleGoogleLogin,
  handleGithubLogin,
  handleFacebookLogin,
}) => {
  return (
    <Row className="w-100 justify-content-center">
      <Col md={6} lg={5} xl={4}>
        <Card className="p-4 shadow-lg login-card">
          <Card.Body>
            <h3 className="text-center mb-4">Iniciar Sesión</h3>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="emailUsuario">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="contraseñaUsuario">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 mb-3">
                Iniciar Sesión
              </Button>
            </Form>

            {/* Botones de login social */}
            <div className="text-center">
              <p>O inicia sesión con</p>
              <div className="d-flex justify-content-between">
                <Button variant="outline-danger" className="mx-1" onClick={handleGoogleLogin}>
                  Google
                </Button>
                <Button variant="outline-dark" className="mx-1" onClick={handleGithubLogin}>
                  GitHub
                </Button>
                <Button variant="outline-primary" className="mx-1" onClick={handleFacebookLogin}>
                  Facebook
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginForm;
