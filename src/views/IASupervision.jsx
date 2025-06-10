// src/views/IASupervision.jsx

import { useEffect, useState, useMemo } from "react";
import { db } from "../database/firebaseconfig";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import {
  Gauge,
  TrendingUp,
  XCircle,
  CheckCircle2,
  Settings,
  Eye,
  Search,
} from "lucide-react";
import "../styles/IAPanel.css";

/* ——— Tarjeta KPI ——— */
const Kpi = ({ icon, label, value }) => (
  <div className="kpi-card">
    {icon}
    <div className="kpi-text">
      <h4>{value}</h4>
      <small>{label}</small>
    </div>
  </div>
);

export default function IASupervision() {
  /* ——— Estados ——— */
  const [cfgG, setCfgG] = useState({});
  const [logs, setLogs] = useState([]);
  const [recoDocs, setRecoDocs] = useState([]);
  const [users, setUsers] = useState({});
  const [searchCed, setSearchCed] = useState("");
  const [cfgU, setCfgU] = useState(null);

  /* ——— 1. Configuración global ——— */
  useEffect(
    () =>
      onSnapshot(doc(db, "ia_config", "global"), (s) =>
        s.exists() && setCfgG(s.data())
      ),
    []
  );

  /* ——— 2. Listener ia_logs ——— */
  useEffect(() => {
    const q = query(collection(db, "ia_logs"), orderBy("createdAt", "desc"));
    return onSnapshot(q, async (snap) => {
      const arr = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          let estados = data.estados;
          // Normalizar a array
          if (!Array.isArray(estados)) {
            const temp = Array(data.recomendaciones.length).fill("pendiente");
            if (estados && typeof estados === "object") {
              Object.keys(estados).forEach((k) => {
                const idx = Number(k);
                if (!Number.isNaN(idx) && idx < temp.length)
                  temp[idx] = estados[k];
              });
            }
            estados = temp;
          }
          // Sanitizar
          estados = estados.map((v) =>
            (v ?? "pendiente").toString().trim().toLowerCase()
          );
          return { id: d.id, ...data, estados };
        })
      );
      setLogs(arr);

      // Traer perfiles faltantes
      const uids = [...new Set(arr.map((l) => l.userId))];
      const faltan = uids.filter((u) => !users[u]);
      if (faltan.length) {
        const nuevos = {};
        await Promise.all(
          faltan.map(async (uid) => {
            const p = await getDoc(doc(db, "usuario", uid));
            if (p.exists()) nuevos[uid] = p.data();
          })
        );
        setUsers((u) => ({ ...u, ...nuevos }));
      }
    });
  }, [users]);

  /* ——— 3. Listener recomendaciones ——— */
  useEffect(
    () =>
      onSnapshot(collection(db, "recomendaciones"), (snap) =>
        setRecoDocs(
          snap.docs.map((d) => {
            const data = d.data();
            const estados =
              Array.isArray(data.estados) && data.estados.length
                ? data.estados.map((e) => e.toString().trim().toLowerCase())
                : data.recomendaciones.map(() => "aceptada");
            return { id: d.id, ...data, estados };
          })
        )
      ),
    []
  );

  /* ——— 4. Texto aceptadas ——— */
  const aceptadasSet = useMemo(() => {
    const set = new Set();
    recoDocs.forEach((d) =>
      d.recomendaciones.forEach((rec, i) => {
        if ((d.estados[i] || "aceptada") === "aceptada") set.add(rec);
      })
    );
    return set;
  }, [recoDocs]);

  /* ——— 5. KPIs globales ——— */
  const { totalGen, totalAcc, totalRej } = useMemo(() => {
    let gen = 0,
      acc = 0,
      rej = 0;
    logs.forEach((l) =>
      l.recomendaciones.forEach((rec, i) => {
        gen++;
        const estado = l.estados[i];
        if (estado?.startsWith("rechaz")) {
          rej++;
        } else if (estado === "aceptada" || aceptadasSet.has(rec)) {
          acc++;
        }
      })
    );
    return { totalGen: gen, totalAcc: acc, totalRej: rej };
  }, [logs, aceptadasSet]);

  const precision = totalGen
    ? `${((totalAcc / totalGen) * 100).toFixed(1)}%`
    : "-";

  /* ——— 6. Agrupar por cédula ——— */
  const agrup = useMemo(() => {
    return logs.reduce((acc, l) => {
      const u = users[l.userId] || {};
      const ced = (u.cedula || "").trim().toLowerCase();
      if (!acc[ced])
        acc[ced] = { uid: l.userId, nombre: u.nombre || "", lista: [] };
      acc[ced].lista.push(l);
      return acc;
    }, {});
  }, [logs, users]);

  const clave = searchCed.trim().toLowerCase();
  const bloque = agrup[clave] || null;

  /* ——— 7. Configuración individual ——— */
  useEffect(() => {
    if (!bloque) {
      setCfgU(null);
      return;
    }
    return onSnapshot(doc(db, "ia_user_config", bloque.uid), (s) =>
      setCfgU(
        s.exists() ? s.data() : { temperature: "", maxDaily: "", model: "" }
      )
    );
  }, [bloque]);

  const guardarUser = async () => {
    if (!bloque || !cfgU) return;
    await setDoc(doc(db, "ia_user_config", bloque.uid), cfgU, { merge: true });
    setSearchCed("");
  };

  /* ——— Helper estado final ——— */
  const estadoFinal = (raw, rec) => {
    const v = (raw || "").toString().trim().toLowerCase();
    if (v.startsWith("rechaz")) return "rechazada";
    if (v === "aceptada" || aceptadasSet.has(rec)) return "aceptada";
    return "generada";
  };

  /* ——— Renderizado ——— */
  return (
    <div id="iasupervision">
      <div className="ia-panel">
        <h2 className="ia-title">
          <Settings size={20} /> Centro de Supervisión IA
        </h2>

        {/* KPIs globales */}
        <div className="kpi-grid">
          <Kpi icon={<Gauge />} label="Precisión" value={precision} />
          <Kpi icon={<TrendingUp />} label="Generadas" value={totalGen} />
          <Kpi icon={<CheckCircle2 />} label="Aceptadas" value={totalAcc} />
          <Kpi icon={<XCircle />} label="Rechazadas" value={totalRej} />
        </div>

        {/* Filtro por cédula */}
        <div className="filtro-box">
          <input
            placeholder="001-120389-0000A"
            value={searchCed}
            onChange={(e) => setSearchCed(e.target.value)}
          />
          <button className="btn-buscar" onClick={() => setSearchCed(clave)}>
            <Search size={14} /> Buscar
          </button>
        </div>

        {/* Configuración de usuario */}
        {bloque && cfgU && (
          <section className="user-config-box">
            <h3>
              <Eye size={16} /> Configuración para {bloque.nombre}
            </h3>
            <div className="user-config-row">
              <label>
                Temperature
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={cfgU.temperature === "" ? "" : cfgU.temperature}
                  placeholder={cfgG.temperature}
                  onChange={(e) =>
                    setCfgU((c) => ({
                      ...c,
                      temperature:
                        e.target.value === "" ? "" : +e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Límite diario
                <input
                  type="number"
                  min="1"
                  value={cfgU.maxDaily === "" ? "" : cfgU.maxDaily}
                  placeholder={cfgG.maxDaily}
                  onChange={(e) =>
                    setCfgU((c) => ({
                      ...c,
                      maxDaily: e.target.value === "" ? "" : +e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Modelo
                <select
                  value={cfgU.model || ""}
                  onChange={(e) =>
                    setCfgU((c) => ({ ...c, model: e.target.value }))
                  }
                >
                  <option value="">(global: {cfgG.model})</option>
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                </select>
              </label>
              <button className="btn-guardar-user" onClick={guardarUser}>
                Guardar usuario
              </button>
            </div>
          </section>
        )}

        {/* Lista de registros */}
        <section className="logs-box">
          <h3>
            <Eye size={16} /> Registros por Cédula
          </h3>
          {!clave && (
            <p className="info-text">Introduce una cédula y pulsa “Buscar”.</p>
          )}
          {clave && !bloque && (
            <p className="info-text">No se encontraron registros.</p>
          )}
          {bloque && (
            <>
              <h4 className="user-name">{bloque.nombre}</h4>
              <div className="records-list">
                {bloque.lista.flatMap((l) =>
                  l.recomendaciones.map((rec, i) => {
                    const est = estadoFinal(l.estados[i], rec);
                    return (
                      <div key={`${l.id}-${i}`} className="record-item">
                        <span className={`tag ${est}`}>
                          {est.charAt(0).toUpperCase() + est.slice(1)}
                        </span>
                        <span className="record-date">
                          {l.createdAt
                            ?.toDate()
                            .toLocaleString("es-NI", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </span>
                        <p className="record-text">{rec}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
