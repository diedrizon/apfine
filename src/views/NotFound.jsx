import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const getCSSVar = (name) =>
      getComputedStyle(document.body).getPropertyValue(name).trim();

    let colorPrimary = getCSSVar("--primary");
    let textTitle = getCSSVar("--text-title");
    let bgBody = getCSSVar("--bg-body");

    const updateColors = () => {
      colorPrimary = getCSSVar("--primary");
      textTitle = getCSSVar("--text-title");
      bgBody = getCSSVar("--bg-body");
    };

    const particles = Array.from({ length: 100 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      pulse: Math.random() * Math.PI * 2,
    }));

    let animationId;
    let isAnimating = true;

    const draw = () => {
      if (!isAnimating) return;

      animationId = requestAnimationFrame(draw);
      updateColors();

      ctx.fillStyle = bgBody;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.1;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const glow = (Math.sin(p.pulse) + 1) * 0.5 * 6 + 2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = colorPrimary;
        ctx.shadowBlur = glow;
        ctx.shadowColor = colorPrimary;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `${colorPrimary}14`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      const closest = particles
        .map((p) => ({
          ...p,
          dist: Math.hypot(p.x - mouseRef.current.x, p.y - mouseRef.current.y),
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 8);

      closest.forEach((p, i) => {
        const cp1x = mouseRef.current.x + (p.x - mouseRef.current.x) / 2 + Math.sin(i * 2) * 30;
        const cp1y = mouseRef.current.y + (p.y - mouseRef.current.y) / 2 + Math.cos(i * 2) * 30;

        ctx.beginPath();
        ctx.moveTo(mouseRef.current.x, mouseRef.current.y);
        ctx.quadraticCurveTo(cp1x, cp1y, p.x, p.y);
        ctx.strokeStyle = colorPrimary;
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 10;
        ctx.shadowColor = colorPrimary;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = colorPrimary;
        ctx.shadowBlur = 5;
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = textTitle;
      ctx.shadowBlur = 15;
      ctx.shadowColor = colorPrimary;
      ctx.fill();
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationId = requestAnimationFrame(draw);

    const timeoutId = setTimeout(() => {
      isAnimating = false;
      cancelAnimationFrame(animationId);
    }, 5000); // ⏱️ Detiene la animación tras 5 segundos

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
      clearTimeout(timeoutId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  return (
    <div className="notfound-epic">
      <canvas ref={canvasRef} className="notfound-canvas" />
      <div className="notfound-number-row">
        <span className="notfound-num" data-text="4">4</span>
        <div className="notfound-ghost-wrapper">
          <svg
            className="notfound-ghost"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            width="90"
            height="90"
            fill="var(--text-title)"
          >
            <path d="M32 4c-13 0-24 9-24 20v24c0 1 1 2 2 2s2-1 2-2c0-1 2-1 2 0s1 2 2 2 2-1 2-2 2-1 2 0 1 2 2 2 2-1 2-2 2-1 2 0 1 2 2 2 2-1 2-2 2-1 2 0 1 2 2 2 2-1 2-2 2-1 2 0 1 2 2 2 2-1 2-2V24c0-11-11-20-24-20zm-8 20a4 4 0 110 8 4 4 0 010-8zm16 0a4 4 0 110 8 4 4 0 010-8z" />
          </svg>
        </div>
        <span className="notfound-num" data-text="4">4</span>
      </div>
      <p className="notfound-message">La página que buscás no existe en esta dimensión.</p>
      <button className="notfound-button" onClick={() => navigate("/")}>
        Volver al inicio
      </button>
    </div>
  );
};

export default NotFound;
