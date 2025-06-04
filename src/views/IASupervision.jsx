import { useEffect, useState } from "react";
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
import "../styles/iaPanel.css";

/* mini KPI */
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
  const [cfgG, setCfgG] = useState({
    temperature: 0.7,
    maxDaily: 3,
    model: "gpt-4o-mini",
  });
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState({}); // uid→perfil
  const [searchCed, setSearchCed] = useState("");

  /* cfg global */
  useEffect(
    () =>
      onSnapshot(doc(db, "ia_config", "global"), (d) =>
        d.exists() && setCfgG(d.data())
      ),
    []
  );

  /* logs */
  useEffect(() => {
    const q = query(collection(db, "ia_logs"), orderBy("createdAt", "desc"));
    return onSnapshot(q, async (snap) => {
      const arr = snap.docs.map((d) => {
        const data = d.data();
        if (!Array.isArray(data.estados))
          data.estados = data.recomendaciones.map(() => "generada");
        return { id: d.id, ...data };
      });
      setLogs(arr);

      const uids = [...new Set(arr.map((l) => l.userId))];
      const fetch = uids.filter((uid) => !users[uid]);
      if (fetch.length) {
        const fetched = {};
        await Promise.all(
          fetch.map(async (uid) => {
            const p = await getDoc(doc(db, "usuario", uid));
            if (p.exists()) fetched[uid] = p.data();
          })
        );
        setUsers((u) => ({ ...u, ...fetched }));
      }
    });
  }, [users]);

  /* métricas */
  const total = logs.reduce((n, l) => n + l.estados.length, 0);
  const acept = logs.reduce(
    (n, l) => n + l.estados.filter((e) => e === "aceptada").length,
    0
  );
  const rech = logs.reduce(
    (n, l) => n + l.estados.filter((e) => e === "rechazada").length,
    0
  );
  const prec = total ? `${((acept / total) * 100).toFixed(1)}%` : "-";

  /* agrupar por cedula */
  const agrup = logs.reduce((acc, l) => {
    const perfil = users[l.userId] || {};
    const ced = perfil.cedula || "SIN-CED";
    if (!acc[ced]) acc[ced] = { uid: l.userId, nombre: perfil.nombre || "", lista: [] };
    acc[ced].lista.push(l);
    return acc;
  }, {});

  const visibles = Object.entries(agrup).filter(([c]) =>
    searchCed ? c.toLowerCase() === searchCed.toLowerCase() : true
  );
  const unico = visibles.length === 1 ? visibles[0] : null;
  const uidSel = unico?.[1].uid;
  const [cfgU, setCfgU] = useState(null);

  useEffect(() => {
    if (!uidSel) {
      setCfgU(null);
      return;
    }
    return onSnapshot(doc(db, "ia_user_config", uidSel), (d) =>
      setCfgU(d.exists() ? d.data() : { temperature: "", maxDaily: "", model: "" })
    );
  }, [uidSel]);

  const guardarUser = async () => {
    if (!uidSel || !cfgU) return;
    await setDoc(doc(db, "ia_user_config", uidSel), cfgU, { merge: true });
    setSearchCed("");
  };

  return (
    <div className="ia-panel">
      <h2 className="ia-title">
        <Settings size={20} /> Centro de Supervisión IA
      </h2>

      <div className="kpi-grid">
        <Kpi icon={<Gauge />} label="Precisión" value={prec} />
        <Kpi icon={<TrendingUp />} label="Generadas" value={total} />
        <Kpi icon={<CheckCircle2 />} label="Aceptadas" value={acept} />
        <Kpi icon={<XCircle />} label="Rechazadas" value={rech} />
      </div>

      {/* filtro */}
      <div className="filtro-box">
        <input
          placeholder="001-120389-0000A"
          value={searchCed}
          onChange={(e) => setSearchCed(e.target.value)}
        />
        <button className="btn-buscar" onClick={() => setSearchCed(searchCed.trim())}>
          <Search size={14} /> Buscar
        </button>
      </div>

      {/* config usuario */}
      {uidSel && cfgU && (
        <section className="user-config-box">
          <h3>
            <Eye size={16} /> Configuración para {unico[0]} – {unico[1].nombre}
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
                    temperature: e.target.value === "" ? "" : +e.target.value,
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

      {/* logs */}
      <section className="logs-box">
        <h3>
          <Eye size={16} /> Registros por Cédula
        </h3>

        {visibles.map(([ced, data]) => (
          <div key={ced} className="cedula-block">
            <h4>
              {ced}
              {data.nombre ? ` – ${data.nombre}` : ""}
            </h4>
            <ul>
              {data.lista.flatMap((l) =>
                l.recomendaciones.map((rec, i) => (
                  <li key={`${l.id}-${i}`}>
                    <span className={`tag ${l.estados[i]}`}>
                      {l.estados[i]}
                    </span>
                    {l.createdAt?.toDate().toLocaleString("es-NI", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    <br />
                    {rec}
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
