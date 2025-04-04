import React, { useEffect } from "react";
import { Container, Row, Col, Navbar, Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // No forzamos el modo; se respeta la elección del usuario
    const elements = document.querySelectorAll(".landing-page .reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.2 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <Navbar expand="lg" fixed="top" className="lp-navbar">
        <Container>
          <Navbar.Brand className="lp-brand" onClick={() => scrollTo("hero")}>
            <img src="/LogoImg.png" alt="Logo" className="lp-logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="lp-toggle">
            <HiOutlineMenuAlt1 size={24} />
          </Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav" className="lp-modal-menu">
            <Nav className="ms-auto lp-nav">
              <Nav.Link onClick={() => scrollTo("hero")}>Inicio</Nav.Link>
              <Nav.Link onClick={() => scrollTo("about")}>Quiénes Somos</Nav.Link>
              <Nav.Link onClick={() => scrollTo("services")}>Servicios</Nav.Link>
              <Nav.Link onClick={() => navigate("/login")}>Iniciar Sesión</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <section id="hero" className="lp-hero reveal">
        <Container className="lp-hero-content text-center">
          <h1 className="lp-hero-title">Impulsa tu emprendimiento</h1>
          <p className="lp-hero-subtitle">
            Una solución integral para finanzas, inventarios y producción inteligente.
          </p>
          <Button className="lp-hero-btn" onClick={() => navigate("/login")}>
            Comienza Gratis
          </Button>
        </Container>
      </section>

      <section id="about" className="lp-section lp-about reveal">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h2 className="lp-section-title">¿Quiénes Somos?</h2>
              <p className="lp-section-text">
                APFINE es una plataforma que fusiona tecnología, diseño y análisis inteligente
                para ayudar a los emprendedores nicaragüenses a tomar decisiones informadas y escalar sus negocios.
              </p>
            </Col>
            <Col md={6}>
              <img src="/LogoImg.png" alt="Nosotros" className="lp-section-img" />
            </Col>
          </Row>
        </Container>
      </section>

      <section id="services" className="lp-section lp-services reveal">
        <Container>
          <h2 className="lp-section-title text-center">Servicios Destacados</h2>
          <Row className="lp-services-cards">
            <Col md={4} className="mb-4">
              <div className="lp-card">
                <h4>Finanzas Inteligentes</h4>
                <p>
                  Administra tus ingresos y egresos en tiempo real con análisis personalizados.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="lp-card">
                <h4>Gestión de Inventario</h4>
                <p>
                  Controla tus insumos y productos con alertas automáticas y reportes gráficos.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="lp-card">
                <h4>IA para Decisiones</h4>
                <p>
                  Recibe recomendaciones inteligentes para reducir costos y aumentar tus ganancias.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <footer className="lp-footer reveal">
        <Container>
          <Row className="align-items-center">
            <Col xs={12} md={6} className="lp-footer-contact text-center text-md-start">
              <h5>Contáctanos</h5>
              <p>Email: diedrinzonfargas.com</p>
              <p>Tel: +505 8825-7506</p>
              <p>Juigalpa,Chontales, Nicaragua</p>
            </Col>
            <Col xs={12} md={6} className="text-center text-md-end">
              <Nav className="lp-footer-nav justify-content-center justify-content-md-end">
                <Nav.Link onClick={() => scrollTo("about")}>Quiénes Somos</Nav.Link>
                <Nav.Link onClick={() => scrollTo("services")}>Servicios</Nav.Link>
                <Nav.Link onClick={() => navigate("/login")}>Iniciar Sesión</Nav.Link>
              </Nav>
              <p className="lp-footer-copy">
                © {new Date().getFullYear()} APFINE. Todos los derechos reservados.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
