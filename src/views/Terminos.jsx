import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PoliticaPrivacidad.css";

const Terminos = () => {
  const navigate = useNavigate();
  const [aceptado, setAceptado] = useState(false);

  return (
    <div className="politica-container">
      <h1>Términos y Condiciones – APFINE</h1>

      <p>Al registrarte en APFINE, aceptás los siguientes términos y condiciones. Si no estás de acuerdo, no utilices la plataforma.</p>

      <h3>1. Finalidad de la aplicación</h3>
      <p>APFINE es una aplicación educativa y de apoyo a la gestión financiera personal. No procesa pagos ni actúa como un sistema contable oficial o bancario.</p>

      <h3>2. Acceso y uso</h3>
      <ul>
        <li>El acceso es voluntario y gratuito.</li>
        <li>El uso indebido o fraudulento del sistema está prohibido.</li>
        <li>Los datos ingresados son responsabilidad exclusiva del usuario.</li>
      </ul>

      <h3>3. Limitaciones de responsabilidad</h3>
      <p>APFINE no garantiza exactitud en todas sus recomendaciones ni se responsabiliza por pérdidas económicas derivadas del uso de la app.</p>

      <h3>4. Propiedad intelectual</h3>
      <p>Todo el contenido, código fuente y diseño pertenece al equipo de desarrollo de APFINE. Está prohibida su reproducción sin autorización.</p>

      <h3>5. Modificaciones del servicio</h3>
      <p>Nos reservamos el derecho de modificar, suspender o eliminar cualquier funcionalidad sin previo aviso.</p>

      <h3>6. Legislación aplicable</h3>
      <p>Este acuerdo se rige por las leyes de la República de Nicaragua. Cualquier disputa será resuelta en el marco legal correspondiente.</p>

      <div className="checkbox-container">
        <input
          type="checkbox"
          id="acepto-terminos"
          checked={aceptado}
          onChange={(e) => setAceptado(e.target.checked)}
        />
        <label htmlFor="acepto-terminos">
          He leído y acepto los Términos y Condiciones
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

export default Terminos;
