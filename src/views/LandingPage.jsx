import React, { useEffect, useState } from "react";
import { Container, Row, Col, Navbar, Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";
import {
  FaUserFriends,
  FaTools,
  FaSignInAlt,
  FaTimes,
  FaChartLine,
  FaBoxes,
  FaRobot,
  FaQuestionCircle,
  FaClipboardList,
  FaBullseye,
  FaUsers,
} from "react-icons/fa";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
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
      {/* NAVBAR */}
      <Navbar expand="lg" fixed="top" className="lp-navbar">
        <Container>
          <Navbar.Brand className="lp-brand" onClick={() => scrollTo("hero")}>
            <img
              src="/logovertical.webp"
              alt="Logo APFINE - Aplicación de Finanzas Eficientes"
              className="lp-logo"
              loading="lazy"
            />
          </Navbar.Brand>
          <div className="d-none d-lg-block">
            <Nav className="lp-nav">
              <Nav.Link onClick={() => scrollTo("hero")}>Inicio</Nav.Link>
              <Nav.Link onClick={() => scrollTo("about")}>
                Quiénes Somos
              </Nav.Link>
              <Nav.Link onClick={() => scrollTo("services")}>
                Servicios
              </Nav.Link>
              {/* Se quita el botón de FAQ y se agrupa con Beneficios */}
              <Nav.Link onClick={() => scrollTo("benefitsFaq")}>
                Beneficios
              </Nav.Link>
              <Nav.Link onClick={() => navigate("/login")}>
                Iniciar Sesión
              </Nav.Link>
            </Nav>
          </div>
          <div className="d-lg-none">
            <Navbar.Toggle
              className="lp-toggle"
              onClick={() => setShowMenu(true)}
            >
              <HiOutlineMenuAlt1 size={24} />
            </Navbar.Toggle>
          </div>
        </Container>
      </Navbar>

      {/* MENU MÓVIL */}
      {showMenu && (
        <div className="lp-drawer-menu">
          <button
            className="lp-drawer-close"
            onClick={() => setShowMenu(false)}
          >
            <FaTimes size={20} />
          </button>
          <Nav className="lp-drawer-nav">
            <Nav.Link
              onClick={() => {
                scrollTo("hero");
                setShowMenu(false);
              }}
            >
              <AiFillHome /> Inicio
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                scrollTo("about");
                setShowMenu(false);
              }}
            >
              <FaUserFriends /> Quiénes Somos
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                scrollTo("services");
                setShowMenu(false);
              }}
            >
              <FaTools /> Servicios
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                scrollTo("benefitsFaq");
                setShowMenu(false);
              }}
            >
              <FaChartLine /> Beneficios
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/login")}>
              <FaSignInAlt /> Iniciar Sesión
            </Nav.Link>
          </Nav>
        </div>
      )}

      {/* HERO */}
      <section id="hero" className="lp-hero reveal">
        <div className="lp-hero-overlay"></div>
        <Container className="lp-hero-content text-center">
          <h1 className="lp-hero-title">
            APFINE: Aplicación de Finanzas Eficientes para Emprendedores en
            Nicaragua
          </h1>
          <p className="lp-hero-subtitle">
            Controlá ingresos, gastos, inventario y metas financieras de tu
            negocio con inteligencia artificial.
          </p>
          <Button className="lp-hero-btn" onClick={() => navigate("/login")}>
            Empieza ahora gratis
          </Button>
        </Container>
      </section>

      {/* QUIÉNES SOMOS */}
      <section id="about" className="lp-section lp-about reveal">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h2 className="lp-section-title">¿Quiénes Somos?</h2>
              <p className="lp-section-text">
                APFINE es una plataforma nicaragüense que ayuda a emprendedores
                a controlar sus finanzas sin necesidad de conocimientos
                contables. Ofrecemos soluciones para microempresas y negocios
                que desean automatizar el control de gastos, ingresos y
                presupuestos.
              </p>
            </Col>
            <Col
              md={6}
              className="d-flex align-items-center justify-content-center"
            >
              <div className="lp-img-switch">
                <img
                  src="/mujerazul_1.webp"
                  alt="Emprendedora usando APFINE"
                  className="lp-img-fit-text lp-img-light"
                  loading="lazy"
                />
                <img
                  src="/mujerverde_1.webp"
                  alt="Finanzas con IA en APFINE"
                  className="lp-img-fit-text lp-img-dark"
                  loading="lazy"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SERVICIOS */}
      <section id="services" className="lp-section lp-services reveal">
        <Container>
          <h2 className="lp-section-title text-center">Servicios Destacados</h2>
          <Row className="lp-services-cards">
            {/* TARJETAS DE ARRIBA (originales sin cambios) */}
            <Col xs={6} md={4} className="mb-4">
              <div className="lp-card compact-card">
                <FaChartLine className="lp-card-icon-top" />
                <h4 className="lp-card-title">Finanzas Inteligentes</h4>
                <p className="lp-card-text">
                  Administra ingresos, egresos y presupuesto mensual con
                  reportes automáticos.
                </p>
              </div>
            </Col>

            <Col xs={6} md={4} className="mb-4">
              <div className="lp-card compact-card">
                <FaBoxes className="lp-card-icon-top" />
                <h4 className="lp-card-title">Gestión de Inventario</h4>
                <p className="lp-card-text">
                  Controla productos y compras con alertas automáticas por
                  niveles bajos.
                </p>
              </div>
            </Col>

            <Col xs={6} md={4} className="mb-4">
              <div className="lp-card compact-card">
                <FaRobot className="lp-card-icon-top" />
                <h4 className="lp-card-title">Recomendaciones con IA</h4>
                <p className="lp-card-text">
                  La IA te sugiere cómo reducir gastos y mejorar ganancias.
                </p>
              </div>
            </Col>

            {/* TARJETAS DE ABAJO (texto corregido y balanceado) */}
            <Col xs={6} md={4} className="mb-4">
              <div className="lp-card compact-card">
                <FaClipboardList className="lp-card-icon-top" />
                <h4 className="lp-card-title">Órdenes de Producción</h4>
                <p className="lp-card-text">
                  Organizá y hacé seguimiento de pedidos, controlando el consumo
                  de materias primas por orden de producción.
                </p>
              </div>
            </Col>

            <Col xs={6} md={4} className="mb-4">
              <div className="lp-card compact-card">
                <FaBullseye className="lp-card-icon-top" />
                <h4 className="lp-card-title">Metas Financieras</h4>
                <p className="lp-card-text">
                  Establecé metas de ahorro o inversión, y visualizá tu progreso
                  con indicadores claros y recordatorios.
                </p>
              </div>
            </Col>

            <Col xs={6} md={4} className="mb-4">
              <div className="lp-card compact-card">
                <FaUsers className="lp-card-icon-top" />
                <h4 className="lp-card-title">Módulo Comunitario</h4>
                <p className="lp-card-text">
                  Conectate con otros emprendedores, compartí ideas,
                  experiencias y fortalecé tu red profesional.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SECCIÓN MERGE: BENEFICIOS E INFORMACIÓN (FAQ) */}
      <section id="benefitsFaq" className="lp-section lp-benefits-faq reveal">
        <Container>
          <h2 className="lp-section-title text-center">
            Beneficios e Información
          </h2>
          <Row className="gy-4 mt-4">
            <Col md={6}>
              <div className="lp-card-info">
                <h3>
                  <FaChartLine /> Beneficios
                </h3>
                <ul className="lp-check-list">
                  <li>Control de finanzas personales y empresariales.</li>
                  <li>Automatización de ingresos, gastos e inventario.</li>
                  <li>Integración con bancos como Banpro y Lafise.</li>
                </ul>
              </div>
            </Col>
            <Col md={6}>
              <div className="lp-card-info">
                <h3>
                  <FaQuestionCircle /> Preguntas Frecuentes
                </h3>
                <div className="lp-faq-item">
                  <strong>¿APFINE es gratis?</strong>
                  <p>Sí. Registrate y usá la app sin costos iniciales.</p>
                </div>
                <div className="lp-faq-item">
                  <strong>¿Puedo usarla sin saber contabilidad?</strong>
                  <p>
                    La app es intuitiva y pensada para cualquier emprendedor.
                  </p>
                </div>
                <div className="lp-faq-item">
                  <strong>¿Recibo recomendaciones personalizadas?</strong>
                  <p>
                    Nuestra IA te sugiere acciones para mejorar tus finanzas.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer reveal">
        <Container>
          <Row className="align-items-center">
            <Col xs={12} className="text-center">
              <h5>Contáctanos</h5>
              <p className="lp-footer-contact">
                <span>Email: contacto@apfine.com</span> |
                <span> Tel: +505 8825-7506</span> |
                <span> Juigalpa, Chontales, Nicaragua</span>
              </p>
              <p className="lp-footer-copy">
                © {new Date().getFullYear()} APFINE. Todos los derechos
                reservados.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
