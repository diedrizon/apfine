import React from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import "../styles/login.css";

const LoginForm = ({
  email,
  password,
  error,
  setEmail,
  setPassword,
  handleSubmit,
  handleGoogleLogin,
}) => {
  return (
    <Card className="login-card">
      <Card.Body>
        <div className="login-logo text-center mb-4">
        <img src="/LogoImg.png" alt="APFINE Logo" />
        </div>

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

          <Button variant="primary" type="submit" className="mb-3 login-btn">
            Iniciar Sesión
          </Button>
        </Form>

        <div className="text-center">
          <p>O inicia sesión con</p>
          <Button className="google-btn" onClick={handleGoogleLogin}>
            <FcGoogle size={22} />
            Iniciar con Google
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LoginForm;
