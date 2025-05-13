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
import ModalInstalacionIOS from "../components/inicio/ModalInstalacionIOS";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  // === PWA states ===
  const [solicitudInstalacion, setSolicitudInstalacion] = useState(null);
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);
  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(false);

  // Detectar iOS
  useEffect(() => {
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setEsDispositivoIOS(esIOS);
  }, []);

  // Capturar beforeinstallprompt
  useEffect(() => {
    const manejarSolicitud = (e) => {
      e.preventDefault();
      setSolicitudInstalacion(e);
    };
    window.addEventListener("beforeinstallprompt", manejarSolicitud);
    return () => {
      window.removeEventListener("beforeinstallprompt", manejarSolicitud);
    };
  }, []);

  // Lanzar prompt instalación
  const instalacion = async () => {
    if (!solicitudInstalacion) {
      alert("La instalación aún no está disponible. Intenta de nuevo en unos segundos.");
      return;
    }
    try {
      await solicitudInstalacion.prompt();
      const { outcome } = await solicitudInstalacion.userChoice;
      console.log(outcome === "accepted" ? "Instalación aceptada" : "Instalación rechazada");
    } catch (err) {
      console.error("Error al intentar instalar la PWA:", err);
    } finally {
      setSolicitudInstalacion(null);
    }
  };

  // Modal instrucciones iOS
  const abrirModalInstrucciones = () => setMostrarModalInstrucciones(true);
  const cerrarModalInstrucciones = () => setMostrarModalInstrucciones(false);

  // Smooth scroll
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Reveal animations
  useEffect(() => {
    const els = document.querySelectorAll(".landing-page .reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("active")),
      { threshold: 0.2 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    // Agregar timestamp para asegurarnos de forzar la carga cada vez que se monta el componente
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1&ts=" + Date.now();
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Remover el script al desmontar
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      // Remover el componente df-messenger si existe
      const messenger = document.querySelector("df-messenger");
      if (messenger) {
        messenger.remove();
      }
    };
  }, []);

  return (
    <div className="landing-page">
      {/* NAVBAR */}
      <Navbar expand="lg" fixed="top" className="lp-navbar">
        <Container>
          <Navbar.Brand className="lp-brand" onClick={() => scrollTo("hero")}>
            <img src="/logovertical.webp" alt="Logo APFINE" className="lp-logo" loading="lazy" />
          </Navbar.Brand>
          <div className="d-none d-lg-block">
            <Nav className="lp-nav">
              <Nav.Link onClick={() => scrollTo("hero")}>Inicio</Nav.Link>
              <Nav.Link onClick={() => scrollTo("about")}>Quiénes Somos</Nav.Link>
              <Nav.Link onClick={() => scrollTo("services")}>Servicios</Nav.Link>
              <Nav.Link onClick={() => scrollTo("benefitsFaq")}>Beneficios</Nav.Link>
              <Nav.Link onClick={() => (esDispositivoIOS ? abrirModalInstrucciones() : instalacion())}>
                Instalar app APFINE
              </Nav.Link>
              <Nav.Link onClick={() => navigate("/login")}>Iniciar Sesión</Nav.Link>
            </Nav>
          </div>
          <div className="d-lg-none">
            <Navbar.Toggle className="lp-toggle" onClick={() => setShowMenu(true)}>
              <HiOutlineMenuAlt1 size={24} />
            </Navbar.Toggle>
          </div>
        </Container>
      </Navbar>

      {/* MENÚ MÓVIL */}
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
            <Nav.Link onClick={() => { scrollTo("benefitsFaq"); setShowMenu(false); }}>
              <FaChartLine /> Beneficios
            </Nav.Link>
            <Nav.Link onClick={() => { setShowMenu(false); (esDispositivoIOS ? abrirModalInstrucciones() : instalacion()); }}>
              Instalar app APFINE
            </Nav.Link>
            <Nav.Link onClick={() => { setShowMenu(false); navigate("/login"); }}>
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
            APFINE: Aplicación de Finanzas Eficientes para Emprendedores en Nicaragua
          </h1>
          <p className="lp-hero-subtitle">
            Controlá ingresos, gastos, inventario y metas financieras de tu negocio con inteligencia artificial.
          </p>
          <Button className="lp-hero-btn" onClick={() => navigate("/login")}>
            Empieza ahora gratis
          </Button>
          {esDispositivoIOS && (
            <Button variant="info" onClick={abrirModalInstrucciones} className="lp-install-btn mt-3">
              Instalar app APFINE <i className="bi bi-download"></i>
            </Button>
          )}
        </Container>
      </section>

      {/* QUIÉNES SOMOS */}
      <section id="about" className="lp-section lp-about reveal">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h2 className="lp-section-title">¿Quiénes Somos?</h2>
              <p className="lp-section-text">
                APFINE es una plataforma nicaragüense que ayuda a emprendedores a controlar sus finanzas sin necesidad de conocimientos contables.
              </p>
            </Col>
            <Col md={6} className="d-flex align-items-center justify-content-center">
              <div className="lp-img-switch">
                <img src="/mujerazul_1.webp" alt="Emprendedora usando APFINE" className="lp-img-fit-text lp-img-light" loading="lazy" />
                <img src="/mujerverde_1.webp" alt="Finanzas con IA en APFINE" className="lp-img-fit-text lp-img-dark" loading="lazy" />
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
            <Col xs={6} md={4} className="mb-4">
              <div className="lp-card compact-card">
                <FaChartLine className="lp-card-icon-top" />
                <h4 className="lp-card-title">Finanzas Inteligentes</h4>
                <p className="lp-card-text">Administra ingresos, egresos y presupuesto mensual con reportes automáticos.</p>
              </div>
            </Col>
            <Col xs={6} md={4} className="mb-4">
              <div className="lp-card compact-card">
                <FaBoxes className="lp-card-icon-top" />
                <h4 className="lp-card-title">Gestión de Inventario</h4>
                <p className="lp-card-text">Controla productos y compras con alertas automáticas por niveles bajos.</p>
              </div>
            </Col>
            <Col xs={6} md={4} className="mb-4">
              <div className="lp-card compact-card">
                <FaRobot className="lp-card-icon-top" />
                <h4 className="lp-card-title">Recomendaciones con IA</h4>
                <p className="lp-card-text">La IA te sugiere cómo reducir gastos y mejorar ganancias.</p>
              </div>
            </Col>
            <Col xs={6} md={4} className="mb-4">
              <div className="lp-card compact-card">
                <FaClipboardList className="lp-card-icon-top" />
                <h4 className="lp-card-title">Órdenes de Producción</h4>
                <p className="lp-card-text">Organizá y hacé seguimiento de pedidos, controlando el consumo de materias primas.</p>
              </div>
            </Col>
            <Col xs={6} md={4} className="mb-4">
              <div className="lp-card compact-card">
                <FaBullseye className="lp-card-icon-top" />
                <h4 className="lp-card-title">Metas Financieras</h4>
                <p className="lp-card-text">Establecé metas de ahorro o inversión, y visualizá tu progreso.</p>
              </div>
            </Col>
            <Col xs={6} md={4} className="mb-4">
              <div className="lp-card compact-card">
                <FaUsers className="lp-card-icon-top" />
                <h4 className="lp-card-title">Módulo Comunitario</h4>
                <p className="lp-card-text">Conectate con otros emprendedores y fortalecé tu red profesional.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* BENEFICIOS Y FAQ */}
      <section id="benefitsFaq" className="lp-section lp-benefits-faq reveal">
        <Container>
          <h2 className="lp-section-title text-center">Beneficios e Información</h2>
          <Row className="gy-4 mt-4">
            <Col md={6}>
              <div className="lp-card-info">
                <h3><FaChartLine /> Beneficios</h3>
                <ul className="lp-check-list">
                  <li>Control de finanzas personales y empresariales.</li>
                  <li>Automatización de ingresos, gastos e inventario.</li>
                  <li>Integración con bancos como Banpro y Lafise.</li>
                </ul>
              </div>
            </Col>
            <Col md={6}>
              <div className="lp-card-info">
                <h3><FaQuestionCircle /> Preguntas Frecuentes</h3>
                <div className="lp-faq-item"><strong>¿APFINE es gratis?</strong><p>Sí. Registrate y usá la app sin costos iniciales.</p></div>
                <div className="lp-faq-item"><strong>¿Puedo usarla sin saber contabilidad?</strong><p>La app es intuitiva y pensada para cualquier emprendedor.</p></div>
                <div className="lp-faq-item"><strong>¿Recibo recomendaciones personalizadas?</strong><p>Nuestra IA te sugiere acciones para mejorar tus finanzas.</p></div>
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
                <span>Email: contacto@apfine.com</span> | <span>Tel: +505 8825-7506</span> | <span>Juigalpa, Chontales, Nicaragua</span>
              </p>
              <p className="lp-footer-copy">© {new Date().getFullYear()} APFINE. Todos los derechos reservados.</p>
            </Col>
          </Row>
        </Container>
      </footer>

      <ModalInstalacionIOS mostrar={mostrarModalInstrucciones} cerrar={cerrarModalInstrucciones} />
      {/* CHATBOT DE APFINE */}
      <df-messenger
        intent="WELCOME"
        chat-title="APFINE_CHATBOT"
        agent-id="73db900f-9907-48a0-8768-6ff3a52fb1b3"
        language-code="es"
      ></df-messenger>
    </div>
  );
};

export default LandingPage;
