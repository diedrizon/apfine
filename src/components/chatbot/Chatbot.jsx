import { useEffect } from "react";
import "../chatbot/Chatbot";

const Chatbot = () => {
  useEffect(() => {
    // Cargar el script de Dialogflow si aún no está cargado
    if (!document.querySelector('script[src*="dialogflow-console"]')) {
      const s = document.createElement("script");
      s.src =
        "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
      s.async = true;
      document.body.appendChild(s);
    }

    const updateChatStyles = () => {
      const df = document.querySelector("df-messenger");
      if (!df) return;
      const chatEl = df.shadowRoot.querySelector("df-messenger-chat");
      if (!chatEl) return;

      // Obtener los colores definidos en .landing-page (modo claro/oscuro)
      const landingPageEl = document.querySelector(".landing-page");
      if (!landingPageEl) return;
      const computedStyles = getComputedStyle(landingPageEl);

      const buttonPrimary = computedStyles
        .getPropertyValue("--button-primary")
        .trim();
      const cardBg = computedStyles.getPropertyValue("--card-bg").trim();
      const textGeneral = computedStyles
        .getPropertyValue("--text-general")
        .trim();
      const textSecondary = computedStyles
        .getPropertyValue("--text-secondary")
        .trim();

      // Determinamos si está activo el modo oscuro (puede definirse en el body o según requieras)
      const isDark = document.body.classList.contains("dark-mode");

      const sheet = new CSSStyleSheet();
      sheet.replaceSync(`
        :host {
          --df-messenger-font-color: ${isDark ? "#e5e7eb" : "#1f2937"};
          --df-messenger-font-family: 'Inter', sans-serif;
          --df-messenger-chat-background-color: ${
            isDark ? "#1c1f2a" : "#ffffff"
          };
          --df-messenger-button-titlebar-color: ${
            isDark ? "#39d65c" : "#0033cc"
          };
          --df-messenger-titlebar-font-color: white;
          --df-messenger-send-icon: ${isDark ? "#39d65c" : "#0033cc"};
          --df-messenger-user-message: ${isDark ? "#2eb14f" : "#0033cc"};
          --df-messenger-bot-message: ${isDark ? "#333" : "#f1f1f1"};
        }
  
        .chat-wrapper {
          max-height: 400px !important;
          max-width: 320px !important;
        }
  
        .message.user {
          background-color: ${buttonPrimary} !important;
          color: white !important;
        }
  
        .message.bot {
          background-color: ${cardBg} !important;
          color: ${textGeneral} !important;
        }
  
        .chat-title-bar {
          background-color: ${buttonPrimary} !important;
          color: white !important;
        }
  
        .chat-wrapper ::placeholder {
          color: ${textSecondary} !important;
        }
  
        /* Ajuste de dimensiones en pantallas grandes para que no se vea tan alto */
        @media (min-width: 992px) {
          :host {
            width: 300px;
            height: 380px;
          }
        }
      `);

      // Actualiza la hoja de estilos inyectada en el shadow DOM
      chatEl.shadowRoot.adoptedStyleSheets = [
        ...chatEl.shadowRoot.adoptedStyleSheets.filter(
          (sheet) => sheet.ownerNode !== "chat-stylesheet"
        ),
        sheet,
      ];
    };

    const onLoaded = () => {
      updateChatStyles();

      // Observar cambios en la clase de .landing-page para detectar modo oscuro/claro
      const landingPageEl = document.querySelector(".landing-page");
      if (!landingPageEl) return;
      const observer = new MutationObserver(() => {
        updateChatStyles();
      });
      observer.observe(landingPageEl, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    };

    window.addEventListener("dfMessengerLoaded", onLoaded);
    return () => {
      window.removeEventListener("dfMessengerLoaded", onLoaded);
    };
  }, []);

  return (
    <df-messenger
      intent="WELCOME"
      chat-title="APFINE"
      agent-id="73db900f-9907-48a0-8768-6ff3a52fb1b3"
      language-code="es"
      chat-icon="/Icono.png"
    />
  );
};

export default Chatbot;
