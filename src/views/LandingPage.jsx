import React, { useEffect, useState } from "react";
import { Container, Row, Col, Navbar, Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";
import { FaUserFriends, FaTools, FaSignInAlt, FaTimes, FaChartLine, FaBoxes, FaRobot } from "react-icons/fa";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Observador para efecto de aparición en secciones
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
      {/* Encabezado */}
      <Navbar expand="lg" fixed="top" className="lp-navbar">
        <Container>
          <Navbar.Brand className="lp-brand" onClick={() => scrollTo("hero")}>
            <img
              src="/LogoImg.png"
              alt="Logo"
              className="lp-logo"
              loading="lazy"
            />
          </Navbar.Brand>
          {/* Menú para pantallas grandes */}
          <div className="d-none d-lg-block">
            <Nav className="lp-nav">
              <Nav.Link onClick={() => scrollTo("hero")}>Inicio</Nav.Link>
              <Nav.Link onClick={() => scrollTo("about")}>Quiénes Somos</Nav.Link>
              <Nav.Link onClick={() => scrollTo("services")}>Servicios</Nav.Link>
              <Nav.Link onClick={() => navigate("/login")}>Iniciar Sesión</Nav.Link>
            </Nav>
          </div>
          {/* Toggle para móvil */}
          <div className="d-lg-none">
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              className="lp-toggle"
              onClick={() => setShowMenu(true)}
            >
              <HiOutlineMenuAlt1 size={24} />
            </Navbar.Toggle>
          </div>
        </Container>
      </Navbar>

      {/* Menú Drawer Mobile */}
      {showMenu && (
        <div className="lp-drawer-menu">
          <button className="lp-drawer-close" onClick={() => setShowMenu(false)}>
            <FaTimes size={20} />
          </button>
          <Nav className="lp-drawer-nav">
            <Nav.Link onClick={() => { scrollTo("hero"); setShowMenu(false); }}>
              <AiFillHome /> Inicio
            </Nav.Link>
            <Nav.Link onClick={() => { scrollTo("about"); setShowMenu(false); }}>
              <FaUserFriends /> Quiénes Somos
            </Nav.Link>
            <Nav.Link onClick={() => { scrollTo("services"); setShowMenu(false); }}>
              <FaTools /> Servicios
            </Nav.Link>
            <Nav.Link onClick={() => { navigate("/login"); setShowMenu(false); }}>
              <FaSignInAlt /> Iniciar Sesión
            </Nav.Link>
          </Nav>
        </div>
      )}

      {/* Sección Héroe */}
      <section id="hero" className="lp-hero reveal">
        <div className="lp-hero-overlay"></div>
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

      {/* Sección "Quiénes Somos" */}
      <section id="about" className="lp-section lp-about reveal">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h2 className="lp-section-title">¿Quiénes Somos?</h2>
              <p className="lp-section-text">
                APFINE es una plataforma que fusiona tecnología, diseño y análisis inteligente
                para ayudar a los emprendedores nicaragüenses a tomar decisiones informadas
                y escalar sus negocios.
              </p>
            </Col>
            <Col md={6} className="d-flex align-items-center justify-content-center">
              <img
                src="/mujer.webp"
                alt="Nosotros"
                className="lp-img-fit-text"
                loading="lazy"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Sección Servicios */}
      <section id="services" className="lp-section lp-services reveal">
        <Container>
          <h2 className="lp-section-title text-center">Servicios Destacados</h2>
          <Row className="lp-services-cards">
            <Col md={4} className="mb-4">
              <div className="lp-card">
                <FaChartLine size={40} className="lp-card-icon" />
                <h4>Finanzas Inteligentes</h4>
                <p>
                  Administra tus ingresos y egresos en tiempo real con análisis personalizados.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="lp-card">
                <FaBoxes size={40} className="lp-card-icon" />
                <h4>Gestión de Inventario</h4>
                <p>
                  Controla tus insumos y productos con alertas automáticas y reportes gráficos.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="lp-card">
                <FaRobot size={40} className="lp-card-icon" />
                <h4>IA para Decisiones</h4>
                <p>
                  Recibe recomendaciones inteligentes para reducir costos y aumentar tus ganancias.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="lp-footer reveal">
        <Container>
          <Row className="align-items-center">
            <Col xs={12} className="text-center">
              <h5>Contáctanos</h5>
              <p className="lp-footer-contact">
                <span>Email: diedrinzonfargas.com</span>
                <span> | Tel: +505 8825-7506</span>
                <span> | Juigalpa, Chontales, Nicaragua</span>
              </p>
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
