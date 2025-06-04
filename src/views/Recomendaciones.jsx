import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../database/authcontext";
import { db } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  Coins,
  TrendingUp as TrendingUpIcon,
  BadgeCheck,
  History,
  CalendarDays,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import Paginacion from "../components/ordenamiento/Paginacion";
import "../styles/recomendador.css";

/* ───── helpers ───── */
const iconList = [<Coins />, <TrendingUpIcon />, <BadgeCheck />];
const hoy = () => new Date();
const anioActual = () => hoy().getFullYear();
const mesActual = () => hoy().getMonth();
const diaISO = () => hoy().toISOString().slice(0, 10);
const esDelMes = (iso) =>
  iso &&
  new Date(iso).getFullYear() === anioActual() &&
  new Date(iso).getMonth() === mesActual();
const cordoba = (v) =>
  new Intl.NumberFormat("es-NI", { style: "currency", currency: "NIO" }).format(
    v
  );
const sumar = (arr) => arr.reduce((s, e) => s + (+e.monto || 0), 0);
const hash32 = (t) =>
  t.split("").reduce((h, c) => (h = (h << 5) - h + c.charCodeAt(0)), 0);

/* ══════════════════════════════════════════════════════ */

export default function Recomendaciones() {
  const { user } = useAuth();

  /* tarjetas */
  const [cards, setCards] = useState([]); // {txt,idx}
  const [aceptadas, setAceptadas] = useState([]);
  const [logId, setLogId] = useState(null);

  /* cfg */
  const [cfgG, setCfgG] = useState({
    temperature: 0.7,
    maxDaily: 3,
    model: "gpt-4o-mini",
  });
  const [cfgU, setCfgU] = useState({});
  const cfg = { ...cfgG, ...cfgU };

  /* límites */
  const [cargando, setCargando] = useState(false);
  const [restantes, setRestantes] = useState(0);
  const [limite, setLimite] = useState(false);

  /* historial UI */
  const [historial, setHistorial] = useState([]);
  const [mesSel, setMesSel] = useState("Todos");
  const [anioSel, setAnioSel] = useState("Todos");
  const [page, setPage] = useState(1);
  const porPagina = 3;

  /* listeners cfg */
  useEffect(() => {
    if (!user?.uid) return;
    const g = onSnapshot(
      doc(db, "ia_config", "global"),
      (d) => d.exists() && setCfgG(d.data())
    );
    const u = onSnapshot(doc(db, "ia_user_config", user.uid), (d) =>
      setCfgU(d.exists() ? d.data() : {})
    );
    cargarHistorial();
    return () => {
      g();
      u();
    };
  }, [user]);

  useEffect(() => {
    if (user?.uid) contarHoy();
  }, [cfg]); /* eslint-disable-line */

  async function cargarHistorial() {
    const q = query(
      collection(db, "recomendaciones"),
      where("userId", "==", user.uid),
      orderBy("fecha", "desc")
    );
    const s = await getDocs(q);
    setHistorial(s.docs.map((d) => ({ id: d.id, ...d.data() })));
  }
  async function contarHoy() {
    const q = query(
      collection(db, "recomendaciones"),
      where("userId", "==", user.uid),
      where("dia", "==", diaISO())
    );
    const n = (await getDocs(q)).size;
    setRestantes(Math.max(0, (cfg.maxDaily || 3) - n));
    setLimite(n >= (cfg.maxDaily || 3));
  }

  /* datos + prompt */
  async function datosFin(uid) {
    const [iS, gS, fS, mS] = await Promise.all([
      getDocs(query(collection(db, "ingresos"), where("userId", "==", uid))),
      getDocs(query(collection(db, "gastos"), where("userId", "==", uid))),
      getDocs(
        query(collection(db, "gastos_fijos"), where("userId", "==", uid))
      ),
      getDocs(query(collection(db, "metas"), where("userId", "==", uid))),
    ]);
    const iMes = iS.docs
      .map((d) => d.data())
      .filter((d) => esDelMes(d.fecha_ingreso));
    const gMes = gS.docs
      .map((d) => d.data())
      .filter((d) => esDelMes(d.fecha_gasto));
    const gFix = fS.docs.map((d) => d.data());
    const metas = mS.docs.map((d) => ({ id: d.id, ...d.data() }));

    const totalIng = sumar(iMes);
    const varMes = sumar(gMes);
    const fixMes = sumar(gFix.map((g) => ({ monto: g.monto_mensual })));
    const totalG = varMes + fixMes;

    return {
      totalIng,
      varMes,
      fixMes,
      excedente: totalIng - totalG,
      fondoMin: totalG * 3,
      fondoMax: totalG * 6,
      metas,
    };
  }

  function prompt(d) {
    const metasTxt = d.metas.length
      ? d.metas
          .map(
            (m) =>
              `«${m.nombre_meta}» ${Math.trunc(
                ((+m.monto_actual || 0) * 100) / (+m.monto_objetivo || 1)
              )}%`
          )
          .join("; ")
      : "Sin metas registradas";

    const prev = historial
      .filter((h) => h.mes === mesActual() && h.anio === anioActual())
      .flatMap((h) => h.recomendaciones)
      .slice(0, 6);

    return `
Eres asesor financiero para emprendedores nicaragüenses.

Datos del usuario (mes actual):
• Ingresos variables: ${cordoba(d.totalIng)}
• Gastos variables : ${cordoba(d.varMes)}
• Gastos fijos     : ${cordoba(d.fixMes)}
• Excedente        : ${cordoba(d.excedente)}
• Fondo ideal      : ${cordoba(d.fondoMin)} – ${cordoba(d.fondoMax)}
• Metas activas    : ${metasTxt}

Recomendaciones previas este mes (NO LAS REPITAS):
${prev.map((r) => `- ${r}`).join("\n") || "- Ninguna"}

Devuelve **únicamente** un array JSON de 3 strings, sin texto adicional.
`.trim();
  }

  /* obtener IA */
  async function obtener() {
    if (limite || !user) return;
    setCargando(true);
    try {
      const df = await datosFin(user.uid);
      if (df.totalIng === 0 && df.varMes + df.fixMes === 0) {
        setCards([
          { txt: "No has registrado ingresos ni gastos este mes.", idx: 0 },
        ]);
        setCargando(false);
        return;
      }

      const modelName = cfg.model || "gpt-4o-mini";
      const supportsJson = modelName.startsWith("gpt-4");

      const body = {
        model: modelName,
        messages: [{ role: "user", content: prompt(df) }],
        max_tokens: 300,
        temperature:
          cfg.temperature === "" || cfg.temperature === undefined
            ? 0.7
            : cfg.temperature,
      };
      if (supportsJson) {
        body.response_format = { type: "json_object" };
        body.messages.unshift({
          role: "system",
          content: "Devuelve solo JSON. Formato array de 3 strings.",
        });
      }

      const ai = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        body,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      /* ── normalizar ── */
      let raw = ai.data.choices[0].message.content;
      if (typeof raw === "string") {
        const a = raw.indexOf("[");
        const b = raw.lastIndexOf("]");
        const c = raw.indexOf("{");
        const d = raw.lastIndexOf("}");
        if (a !== -1 && b !== -1) raw = raw.slice(a, b + 1);
        else if (c !== -1 && d !== -1) raw = raw.slice(c, d + 1);
      }
      let recs;
      try {
        const parsed = JSON.parse(raw);
        recs = Array.isArray(parsed)
          ? parsed
          : Object.values(parsed).filter((v) => typeof v === "string");
        if (recs.length !== 3) throw new Error();
      } catch {
        console.warn("Respuesta IA no válida:", raw);
        recs = ["⚠ Error al interpretar la respuesta."];
      }

      setCards(recs.map((t, i) => ({ txt: t, idx: i })));

      const log = await addDoc(collection(db, "ia_logs"), {
        userId: user.uid,
        recomendaciones: recs,
        estados: recs.map(() => "pendiente"),
        createdAt: serverTimestamp(),
      });
      setLogId(log.id);
      setRestantes((r) => Math.max(0, r - 1));
      if (restantes - 1 <= 0) setLimite(true);
    } catch (e) {
      console.error(e);
      setCards([{ txt: "⚠ Error al generar la recomendación.", idx: 0 }]);
    } finally {
      setCargando(false);
    }
  }

  /* aceptar / rechazar */
  const marcar = (idx, estado) => {
    document.getElementById(`card-${idx}`)?.classList.add("fadeOut");
    setTimeout(() => setCards((c) => c.filter((x) => x.idx !== idx)), 300);
    if (estado === "aceptada")
      setAceptadas((a) => [...a, cards.find((c) => c.idx === idx).txt]);
    if (logId)
      updateDoc(doc(db, "ia_logs", logId), { [`estados.${idx}`]: estado });
  };

  /* persistir aceptadas */
  useEffect(() => {
    if (cards.length > 0 || !aceptadas.length) return;
    (async () => {
      await addDoc(collection(db, "recomendaciones"), {
        userId: user.uid,
        fecha: serverTimestamp(),
        dia: diaISO(),
        mes: mesActual(),
        anio: anioActual(),
        hash: hash32(aceptadas.join("|")),
        recomendaciones: aceptadas,
        estados: aceptadas.map(() => "aceptada"),
      });
      setAceptadas([]);
      setLogId(null);
      cargarHistorial();
    })();
  }, [cards]); /* eslint-disable-line */

  /* filtros historial */
  const filtrado = historial.filter((h) => {
    const f = h.fecha?.toDate();
    const m = f?.getMonth();
    const a = f?.getFullYear();
    return (
      (mesSel === "Todos" || m === +mesSel) &&
      (anioSel === "Todos" || a === +anioSel)
    );
  });
  const pag = filtrado.slice((page - 1) * porPagina, page * porPagina);

  /* UI */
  return (
    <div className="recomendador-container">
      <button
        className="recomendador-boton"
        onClick={obtener}
        disabled={cargando || !user || limite}
      >
        {cargando ? "Generando…" : "Obtener Recomendación Financiera"}
      </button>

      <div className="estado-recomendacion">
        {limite ? (
          <>
            <AlertTriangle color="#dc3545" size={18} />
            <span style={{ color: "#dc3545" }}>
              Ya alcanzaste el límite diario de {cfg.maxDaily} recomendaciones.
            </span>
          </>
        ) : (
          <>
            <CheckCircle color="#198754" size={18} />
            <span style={{ color: "#198754" }}>
              Recomendaciones restantes hoy: {restantes}
            </span>
          </>
        )}
      </div>

      {cards.length > 0 && (
        <div className="recomendaciones-lista">
          {cards.map((c, i) => (
            <div
              key={c.idx}
              id={`card-${c.idx}`}
              className="recomendacion-tarjeta"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <h4 className="recomendacion-titulo">
                {iconList[i % iconList.length]}
              </h4>
              <p className="recomendacion-texto">{c.txt}</p>
              <div className="reco-acciones">
                <button
                  className="btn-aceptar"
                  onClick={() => marcar(c.idx, "aceptada")}
                >
                  Aceptar
                </button>
                <button
                  className="btn-rechazar"
                  onClick={() => marcar(c.idx, "rechazada")}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="historial-recomendaciones">
        <h3>
          <History size={20} /> Historial de Recomendaciones
        </h3>
        <div className="filtros-historial">
          <select value={mesSel} onChange={(e) => setMesSel(e.target.value)}>
            <option value="Todos">Todos los meses</option>
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("es-NI", { month: "long" })}
              </option>
            ))}
          </select>
          <select value={anioSel} onChange={(e) => setAnioSel(e.target.value)}>
            <option value="Todos">Todos los años</option>
            {[...new Set(historial.map((h) => h.anio))].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>

        {filtrado.length === 0 ? (
          <p>No hay recomendaciones para ese filtro.</p>
        ) : (
          <>
            {pag.map((it, idx) => (
              <div
                key={it.id}
                className="historial-item"
                style={{
                  borderLeft: `5px solid hsl(${(idx * 55) % 360},85%,55%)`,
                  animationDelay: `${idx * 0.15}s`,
                }}
              >
                <div className="historial-fecha">
                  <CalendarDays size={16} />
                  {it.fecha?.toDate().toLocaleString("es-NI", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <ul className="historial-lista">
                  {it.recomendaciones.map((t, i) => (
                    <li key={i}>
                      <span className="historial-icono">
                        {i === 0 ? (
                          <Lightbulb size={16} />
                        ) : i === 1 ? (
                          <TrendingUpIcon size={16} />
                        ) : (
                          <ShieldCheck size={16} />
                        )}
                      </span>{" "}
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Paginacion
              itemsPerPage={porPagina}
              totalItems={filtrado.length}
              currentPage={page}
              setCurrentPage={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
