import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../database/authcontext";
import { db } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
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

const iconList = [<Coins />, <TrendingUpIcon />, <BadgeCheck />];

const hoy = () => new Date();
const anioActual = () => hoy().getFullYear();
const mesActual = () => hoy().getMonth(); // 0-11
const diaISO = () => hoy().toISOString().slice(0, 10);
const esDelMes = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  return d.getFullYear() === anioActual() && d.getMonth() === mesActual();
};

const formatoCordoba = (v) =>
  new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
    minimumFractionDigits: 2,
  }).format(v);

const sumarMontos = (arr) =>
  arr.reduce((acc, el) => acc + (parseFloat(el.monto) || 0), 0);

const hash32 = (txt) =>
  txt.split("").reduce((h, c) => (h = (h << 5) - h + c.charCodeAt(0)), 0);

const Recomendador = () => {
  const { user } = useAuth();

  const [respuesta, setRespuesta] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [filtroMes, setFiltroMes] = useState("Todos");
  const [filtroAnio, setFiltroAnio] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [limiteDiario, setLimiteDiario] = useState(false);
  const [restantes, setRestantes] = useState(3);

  useEffect(() => {
    if (!user?.uid) return;
    cargarHistorial();
    contarRecomendacionesHoy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function cargarHistorial() {
    const q = query(
      collection(db, "recomendaciones"),
      where("userId", "==", user.uid),
      orderBy("fecha", "desc")
    );
    const snap = await getDocs(q);
    setHistorial(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function contarRecomendacionesHoy() {
    const q = query(
      collection(db, "recomendaciones"),
      where("userId", "==", user.uid),
      where("dia", "==", diaISO())
    );
    const snap = await getDocs(q);
    const n = snap.size;
    setRestantes(Math.max(0, 3 - n));
    setLimiteDiario(n >= 3);
  }

  async function obtenerDatosFinancieros(uid) {
    const [ingSnap, gasSnap, fixSnap, metaSnap] = await Promise.all([
      getDocs(query(collection(db, "ingresos"), where("userId", "==", uid))),
      getDocs(query(collection(db, "gastos"), where("userId", "==", uid))),
      getDocs(
        query(collection(db, "gastos_fijos"), where("userId", "==", uid))
      ),
      getDocs(query(collection(db, "metas"), where("userId", "==", uid))),
    ]);

    const ingresosMes = ingSnap.docs
      .map((d) => d.data())
      .filter((i) => esDelMes(i.fecha_ingreso));

    const gastosMes = gasSnap.docs
      .map((d) => d.data())
      .filter((g) => esDelMes(g.fecha_gasto));

    const gastosFijos = fixSnap.docs.map((d) => d.data());
    const metas = metaSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const totalIngresos = sumarMontos(ingresosMes);
    const totalVar = sumarMontos(gastosMes);
    const totalFijos = sumarMontos(
      gastosFijos.map((g) => ({ monto: g.monto_mensual }))
    );
    const totalGastos = totalVar + totalFijos;
    const excedente = totalIngresos - totalGastos;
    const fondoMin = totalGastos * 3;
    const fondoMax = totalGastos * 6;

    return {
      ingresosMes,
      gastosMes,
      gastosFijos,
      metas,
      totalIngresos,
      totalGastos,
      excedente,
      fondoMin,
      fondoMax,
      totalVar,
      totalFijos,
    };
  }

  function construirPrompt(datos) {
    const {
      totalIngresos,
      totalVar,
      totalFijos,
      excedente,
      fondoMin,
      fondoMax,
      metas,
    } = datos;

    const metasTxt = metas.length
      ? metas
          .map((m) => {
            const prog =
              ((parseFloat(m.monto_actual || 0) /
                parseFloat(m.monto_objetivo || 1)) *
                100) |
              0;
            return `«${m.nombre_meta}» ${prog}% (objetivo C$${m.monto_objetivo})`;
          })
          .join("; ")
      : "Sin metas registradas";

    const prevMes = historial
      .filter((h) => h.mes === mesActual() && h.anio === anioActual())
      .flatMap((h) => h.recomendaciones)
      .slice(0, 6);

    return `
Eres asesor financiero para emprendedores nicaragüenses.

Datos del usuario (mes actual):
• Ingresos variables: ${formatoCordoba(totalIngresos)}
• Gastos variables:  ${formatoCordoba(totalVar)}
• Gastos fijos:      ${formatoCordoba(totalFijos)}
• Excedente:         ${formatoCordoba(excedente)}
• Fondo de emergencia ideal: de ${formatoCordoba(fondoMin)} a ${formatoCordoba(
      fondoMax
    )}
• Metas activas:     ${metasTxt}

Recomendaciones previas este mes (NO LAS REPITAS):
${prevMes.map((r) => `- ${r}`).join("\n") || "- Ninguna"}

Genera **3 recomendaciones nuevas, conectadas** (sin numerar).  
Sé concreto y accionable; usa cifras solo cuando aporte valor.  
Devuelve SOLO el JSON:

[
  "Recomendación 1...",
  "Recomendación 2...",
  "Recomendación 3..."
]
`;
  }

  async function obtenerRecomendacion() {
    if (limiteDiario || !user) return;
    setCargando(true);

    try {
      const datos = await obtenerDatosFinancieros(user.uid);

      if (datos.totalIngresos === 0 && datos.totalGastos === 0) {
        setRespuesta([
          "No has registrado ingresos ni gastos este mes. Ingresa tus movimientos para recibir recomendaciones personalizadas.",
        ]);
        setCargando(false);
        return;
      }

      const prompt = construirPrompt(datos);

      const aiRes = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      let recomendaciones = [];
      try {
        recomendaciones = JSON.parse(aiRes.data.choices[0].message.content);
      } catch {
        recomendaciones = [
          "⚠ No se pudo interpretar la respuesta de la IA. Intenta de nuevo.",
        ];
      }

      setRespuesta(recomendaciones);

      await addDoc(collection(db, "recomendaciones"), {
        userId: user.uid,
        fecha: serverTimestamp(),
        dia: diaISO(),
        mes: mesActual(),
        anio: anioActual(),
        hash: hash32(recomendaciones.join("|")),
        resumen: {
          ingresos: datos.totalIngresos,
          gastos: datos.totalGastos,
          excedente: datos.excedente,
        },
        recomendaciones,
      });

      setRestantes((p) => Math.max(0, p - 1));
      if (restantes - 1 <= 0) setLimiteDiario(true);
      cargarHistorial();
    } catch (e) {
      console.error(e);
      setRespuesta(["⚠ Error al generar la recomendación."]);
    } finally {
      setCargando(false);
    }
  }

  const historialFiltrado = historial.filter((item) => {
    const fecha = item.fecha?.toDate ? item.fecha.toDate() : null;
    const mes = fecha?.getMonth();
    const anio = fecha?.getFullYear();
    return (
      (filtroMes === "Todos" || mes === parseInt(filtroMes)) &&
      (filtroAnio === "Todos" || anio === parseInt(filtroAnio))
    );
  });

  const paginado = historialFiltrado.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="recomendador-container">
      <button
        onClick={obtenerRecomendacion}
        disabled={cargando || !user || limiteDiario}
        className="recomendador-boton"
      >
        {cargando ? "Generando..." : "Obtener Recomendación Financiera"}
      </button>

      <div className="estado-recomendacion">
        {limiteDiario ? (
          <>
            <AlertTriangle color="#dc3545" size={18} />
            <span style={{ color: "#dc3545" }}>
              Ya alcanzaste el límite diario de 3 recomendaciones.
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

      {Array.isArray(respuesta) && respuesta.length > 0 && (
        <div className="recomendaciones-lista">
          {respuesta.map((reco, index) => (
            <div
              key={index}
              className="recomendacion-tarjeta"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <h4 className="recomendacion-titulo">
                {iconList[index % iconList.length]}
              </h4>
              <p className="recomendacion-texto">{reco}</p>
            </div>
          ))}
        </div>
      )}

      <div className="historial-recomendaciones">
        <h3>
          <History size={20} /> Historial de Recomendaciones
        </h3>

        <div className="filtros-historial">
          <select
            onChange={(e) => setFiltroMes(e.target.value)}
            value={filtroMes}
          >
            <option value="Todos">Todos los meses</option>
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("es-NI", { month: "long" })}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => setFiltroAnio(e.target.value)}
            value={filtroAnio}
          >
            <option value="Todos">Todos los años</option>
            {[...new Set(historial.map((h) => h.anio))].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {historialFiltrado.length === 0 ? (
          <p>No hay recomendaciones guardadas para ese filtro.</p>
        ) : (
          <>
            {paginado.map((item, idx) => (
              <div
                key={item.id}
                className="historial-item"
                style={{
                  borderLeft: `5px solid hsl(${(idx * 55) % 360}, 85%, 55%)`,
                  animationDelay: `${idx * 0.15}s`,
                }}
              >
                <div className="historial-fecha">
                  <CalendarDays size={16} />
                  {item.fecha?.toDate().toLocaleString("es-NI", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <ul className="historial-lista">
                  {item.recomendaciones.map((r, i) => (
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
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <Paginacion
              itemsPerPage={itemsPerPage}
              totalItems={historialFiltrado.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Recomendador;
