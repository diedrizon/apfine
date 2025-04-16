import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PoliticaPrivacidad.css";

const Privacidad = () => {
  const navigate = useNavigate();
  const [aceptado, setAceptado] = useState(false);

  return (
    <div className="politica-container">
      <h1>Política de Privacidad – APFINE</h1>

      <p>
        Esta política aplica al uso de la aplicación APFINE, una herramienta educativa para la gestión financiera personal y operativa de emprendedores en Nicaragua. No gestionamos ni procesamos pagos reales. Al utilizar esta plataforma, aceptás esta política.
      </p>

      <h3>1. Qué datos recopilamos</h3>
      <ul>
        <li>Correo electrónico para autenticación y acceso seguro.</li>
        <li>Datos financieros ingresados voluntariamente: ingresos, egresos, inventarios, etc.</li>
        <li>Historial de uso y comportamiento dentro de la app.</li>
      </ul>

      <h3>2. Cómo usamos tu información</h3>
      <p>Los datos recopilados tienen como único fin:</p>
      <ul>
        <li>Proveer recomendaciones automáticas mediante IA.</li>
        <li>Generar gráficos, métricas y reportes de gestión.</li>
        <li>Mejorar tu experiencia en la aplicación.</li>
      </ul>

      <h3>3. Con quién compartimos tu información</h3>
      <p>APFINE no comparte, vende ni transfiere tu información a terceros.</p>

      <h3>4. Servicios de terceros utilizados</h3>
      <p>Utilizamos Firebase (Google) y herramientas de IA para funcionalidades internas. Tu información se aloja en servidores seguros bajo estándares de protección de datos.</p>

      <h3>5. Responsabilidad del usuario</h3>
      <p>La aplicación no reemplaza asesoría financiera profesional. Las decisiones que tomés son bajo tu propio criterio. No nos hacemos responsables por pérdidas derivadas del uso de nuestras recomendaciones.</p>

      <h3>6. Eliminación de datos</h3>
      <p>Podés solicitar la eliminación de tu cuenta y datos escribiendo a: <a href="mailto:soporte@apfine.com">soporte@apfine.com</a>.</p>

      <h3>7. Cambios a esta política</h3>
      <p>Esta política puede ser modificada en cualquier momento. Si los cambios son significativos, te lo notificaremos dentro de la aplicación.</p>

      <div className="checkbox-container">
        <input
          type="checkbox"
          id="acepto-privacidad"
          checked={aceptado}
          onChange={(e) => setAceptado(e.target.checked)}
        />
        <label htmlFor="acepto-privacidad">
          He leído y acepto la Política de Privacidad
        </label>
      </div>

      <button
        className="btn-volver"
        onClick={() => navigate("/login")}
        disabled={!aceptado}
      >
        Volver al inicio de sesión
      </button>
    </div>
  );
};

export default Privacidad;
