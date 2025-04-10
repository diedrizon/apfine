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
  TrendingUp,
  BadgeCheck,
  History,
  CalendarDays,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  TrendingUp as TrendingUpIcon,
  ShieldCheck,
} from "lucide-react";
import Paginacion from "../components/ordenamiento/Paginacion";
import "../styles/recomendador.css";

const iconList = [<Coins />, <TrendingUp />, <BadgeCheck />];

const Recomendador = () => {
  const { user } = useAuth();
  const [respuesta, setRespuesta] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [filtroMes, setFiltroMes] = useState("Todos");
  const [filtroAnio, setFiltroAnio] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [limiteDiarioAlcanzado, setLimiteDiarioAlcanzado] = useState(false);
  const [recomendacionesRestantes, setRecomendacionesRestantes] = useState(3);

  const formatoCordoba = (valor) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
      minimumFractionDigits: 2,
    }).format(valor);
  };

  // Calcula el día actual en formato "YYYY-MM-DD"
  const obtenerDiaActual = () => new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (user?.uid) {
      obtenerHistorial(user.uid);
      contarRecomendacionesDeHoy(user.uid);
    }
  });

  const sumarMontos = (docs) => {
    return docs.reduce((acc, item) => {
      const monto = Number(item.monto);
      return isNaN(monto) ? acc : acc + monto;
    }, 0);
  };

  const obtenerDatosFinancieros = async (uid) => {
    const ingresosSnap = await getDocs(
      query(collection(db, "ingresos"), where("userId", "==", uid))
    );
    const gastosSnap = await getDocs(
      query(collection(db, "gastos"), where("userId", "==", uid))
    );

    const ingresos = ingresosSnap.docs.map((doc) => doc.data());
    const gastos = gastosSnap.docs.map((doc) => doc.data());

    const totalIngresos = sumarMontos(ingresos);
    const totalGastos = sumarMontos(gastos);
    const excedente = totalIngresos - totalGastos;
    const fondoMin = totalGastos * 3;
    const fondoMax = totalGastos * 6;

    return {
      ingresos,
      gastos,
      totalIngresos,
      totalGastos,
      excedente,
      fondoMin,
      fondoMax,
    };
  };

  const obtenerHistorial = async (uid) => {
    try {
      const q = query(
        collection(db, "recomendaciones"),
        where("userId", "==", uid),
        orderBy("fecha", "desc")
      );
      const snapshot = await getDocs(q);
      const datosHistorial = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(Boolean);
      setHistorial(datosHistorial);
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  // Se usa el campo "dia" (cadena en formato YYYY-MM-DD) para contar recomendaciones de hoy
  const contarRecomendacionesDeHoy = async (uid) => {
    const diaActual = obtenerDiaActual();
    const q = query(
      collection(db, "recomendaciones"),
      where("userId", "==", uid),
      where("dia", "==", diaActual)
    );

    try {
      const snapshot = await getDocs(q);
      const conteo = snapshot.size;
      setRecomendacionesRestantes(Math.max(0, 3 - conteo));
      setLimiteDiarioAlcanzado(conteo >= 3);
    } catch (error) {
      console.error("Error contando recomendaciones de hoy:", error);
    }
  };

  const obtenerRecomendacion = async () => {
    if (limiteDiarioAlcanzado || !user) return;
    setCargando(true);

    try {
      const {
        totalIngresos,
        totalGastos,
        excedente,
        fondoMin,
        fondoMax,
        gastos,
      } = await obtenerDatosFinancieros(user.uid);

      // Si el usuario no tiene ingresos ni gastos registrados, se muestra una tarjeta de advertencia
      if (totalIngresos === 0 && totalGastos === 0) {
        setRespuesta([
          "No se puede generar una recomendación porque no has registrado ingresos ni gastos. Por favor, registra tus movimientos financieros para recibir asesoría personalizada.",
        ]);
        setCargando(false);
        return;
      }

      const categoriasGasto = [
        ...new Set(gastos.map((g) => g.categoria || "Sin categoría")),
      ];

      const prompt = `
Eres un asesor financiero que ayuda a emprendedores en Nicaragua.

Estos son los datos reales del usuario:
- Ingresos mensuales: ${formatoCordoba(totalIngresos)}
- Gastos mensuales: ${formatoCordoba(totalGastos)}
- Excedente mensual: ${formatoCordoba(excedente)}
- Fondo de emergencia recomendado: entre ${formatoCordoba(
        fondoMin
      )} y ${formatoCordoba(fondoMax)}

Basado en estos datos, genera 3 recomendaciones financieras CONECTADAS entre sí, como si estuvieras guiando al usuario paso a paso, pero SIN escribir "Paso 1" o "Paso 2".

El texto debe fluir como una breve conversación o consejo continuo. No repitas montos innecesariamente.

Responde en formato JSON así:
[
  "Recomendación 1 sin numerar...",
  "Recomendación 2 sin numerar...",
  "Recomendación 3 sin numerar..."
]
`;

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
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
        recomendaciones = JSON.parse(response.data.choices[0].message.content);
      } catch {
        recomendaciones = ["Error: No se pudo interpretar la respuesta."];
      }

      setRespuesta(recomendaciones);

      // Almacena la recomendación con el timestamp del servidor y el campo "dia"
      const diaActual = obtenerDiaActual();
      await addDoc(collection(db, "recomendaciones"), {
        userId: user.uid,
        fecha: serverTimestamp(),
        dia: diaActual,
        resumen: {
          ingresos: totalIngresos,
          gastos: totalGastos,
          exceso: excedente,
          categorias: categoriasGasto,
        },
        recomendaciones,
      });

      setRecomendacionesRestantes((prev) => {
        const nuevo = prev - 1;
        if (nuevo <= 0) setLimiteDiarioAlcanzado(true);
        return nuevo;
      });

      obtenerHistorial(user.uid);
    } catch (error) {
      console.error("Error generando recomendación:", error);
      setRespuesta(["⚠ Error al generar la recomendación."]);
    } finally {
      setCargando(false);
    }
  };

  const filtrarHistorial = () => {
    return historial.filter((item) => {
      // Si el documento tiene el campo "fecha", se convierte a Date para extraer mes y año
      const fecha = item.fecha?.toDate ? item.fecha.toDate() : null;
      const mes = fecha?.getMonth();
      const anio = fecha?.getFullYear();
      return (
        (filtroMes === "Todos" || mes === parseInt(filtroMes)) &&
        (filtroAnio === "Todos" || anio === parseInt(filtroAnio))
      );
    });
  };

  const historialFiltrado = filtrarHistorial();
  const paginado = historialFiltrado.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="recomendador-container">
      <button
        onClick={obtenerRecomendacion}
        disabled={cargando || !user || limiteDiarioAlcanzado}
        className="recomendador-boton"
      >
        {cargando ? "Generando..." : "Obtener Recomendación Financiera"}
      </button>

      <div className="estado-recomendacion">
        {limiteDiarioAlcanzado ? (
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
              Recomendaciones restantes hoy: {recomendacionesRestantes}
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
            {[
              ...new Set(
                historial.map((h) => h.fecha?.toDate?.().getFullYear())
              ),
            ].map((anio) => (
              <option key={anio} value={anio}>
                {anio}
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
