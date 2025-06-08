import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { generateReportPDF } from "../components/reportes/ReportPDFTemplate";
import { generateReportExcel } from "../components/reportes/ReportExcelTemplate";
import { db, auth } from "../database/firebaseconfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { parseISO, format, isBefore, isAfter } from "date-fns";
import "../styles/Reporte.css";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
);

const cssVar = (v, f) => {
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(v)
    .trim();
  return val || f;
};

export default function Reportes() {
  const [uid, setUid] = useState(null);
  useEffect(() => auth.onAuthStateChanged((u) => u && setUid(u.uid)), []);

  const [registros, setRegistros] = useState([]);
  useEffect(() => {
    if (!uid) return;
    const listen = (col, tipo, fecha) =>
      onSnapshot(
        query(
          collection(db, col),
          where("userId", "==", uid),
          orderBy(fecha, "asc")
        ),
        (snap) =>
          setRegistros((prev) => [
            ...prev.filter((x) => x.tipo !== tipo),
            ...snap.docs.map((d) => ({
              id: d.id,
              tipo,
              monto: Number(d.data().monto),
              fecha: d.data()[fecha],
              categoria: d.data().categoria || "Sin categoría",
            })),
          ])
      );
    const u1 = listen("ingresos", "ingreso", "fecha_ingreso");
    const u2 = listen("gastos", "gasto", "fecha_gasto");
    return () => {
      u1();
      u2();
    };
  }, [uid]);

  const [metas, setMetas] = useState([]);
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      query(collection(db, "metas"), where("userId", "==", uid)),
      (snap) =>
        setMetas(
          snap.docs.map((d) => ({
            id: d.id,
            obj: Number(d.data().monto_objetivo),
            actual: Number(d.data().monto_actual),
            fecha_limite: d.data().fecha_limite,
          }))
        )
    );
  }, [uid]);

  const metasVig = useMemo(() => {
    const hoy = new Date();
    return metas.filter((m) => !isBefore(parseISO(m.fecha_limite), hoy));
  }, [metas]);
  const countV = metasVig.length;

  const [filtroTipo, setFiltroTipo] = useState("Gasto");
  const [desde, setDesde] = useState(new Date(new Date().getFullYear(), 0, 1));
  const hoy = new Date();
  const [hasta, setHasta] = useState(
    new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  );
  const [catSel, setCatSel] = useState("Todas");

  const categorias = useMemo(
    () =>
      Array.from(
        new Set(
          registros
            .filter((r) =>
              filtroTipo === "Ambos"
                ? true
                : r.tipo === filtroTipo.toLowerCase()
            )
            .map((r) => r.categoria)
        )
      ).sort(),
    [registros, filtroTipo]
  );

  const filtrados = useMemo(
    () =>
      registros.filter((r) => {
        const f = parseISO(r.fecha);
        const okFecha = !isBefore(f, desde) && !isAfter(f, hasta);
        const okTipo =
          filtroTipo === "Ambos" ? true : r.tipo === filtroTipo.toLowerCase();
        const okCat = catSel === "Todas" ? true : r.categoria === catSel;
        return okFecha && okTipo && okCat;
      }),
    [registros, filtroTipo, desde, hasta, catSel]
  );

  const mesKey = format(hoy, "yyyy-MM");
  const ingresosMes = useMemo(
    () =>
      filtrados
        .filter(
          (r) =>
            r.tipo === "ingreso" &&
            format(parseISO(r.fecha), "yyyy-MM") === mesKey
        )
        .reduce((s, r) => s + r.monto, 0),
    [filtrados, mesKey]
  );
  const gastosMes = useMemo(
    () =>
      filtrados
        .filter(
          (r) =>
            r.tipo === "gasto" &&
            format(parseISO(r.fecha), "yyyy-MM") === mesKey
        )
        .reduce((s, r) => s + r.monto, 0),
    [filtrados, mesKey]
  );
  const gastosFijosMes = useMemo(
    () =>
      filtrados
        .filter(
          (r) =>
            r.tipo === "gasto" &&
            r.categoria === "Fijo" &&
            format(parseISO(r.fecha), "yyyy-MM") === mesKey
        )
        .reduce((s, r) => s + r.monto, 0),
    [filtrados, mesKey]
  );
  const saldoMes = ingresosMes - gastosMes - gastosFijosMes;

  const porMes = useMemo(() => {
    const m = {};
    filtrados.forEach((r) => {
      const k = format(parseISO(r.fecha), "yyyy-MM");
      if (!m[k]) m[k] = { ing: 0, gas: 0 };
      m[k][r.tipo === "ingreso" ? "ing" : "gas"] += r.monto;
    });
    const labels = Object.keys(m).sort();
    return {
      labels,
      ing: labels.map((l) => m[l].ing),
      gas: labels.map((l) => m[l].gas),
      saldo: labels.map((l) => m[l].ing - m[l].gas),
    };
  }, [filtrados]);

  const pie = useMemo(() => {
    const m = {};
    filtrados
      .filter((r) => r.tipo === "gasto")
      .forEach((r) => (m[r.categoria] = (m[r.categoria] || 0) + r.monto));
    const labels = Object.keys(m);
    return { labels, valores: labels.map((l) => m[l]) };
  }, [filtrados]);

  const refIG = useRef(null),
    refS = useRef(null),
    refP = useRef(null);

  const handlePDF = () =>
    generateReportPDF({
      logoUrl: "/Icono.png",
      title: "Reporte Financiero APFINE",
      summary: [
        { label: "Ingresos mes", value: `C$ ${ingresosMes.toFixed(2)}` },
        { label: "Gastos mes", value: `C$ ${gastosMes.toFixed(2)}` },
        { label: "Gastos fijos mes", value: `C$ ${gastosFijosMes.toFixed(2)}` },
        { label: "Saldo neto mes", value: `C$ ${saldoMes.toFixed(2)}` },
        { label: "Metas vigentes", value: `${countV}` },
      ],
      chartRefs: [
        { ref: refIG, label: "Ingresos vs Gastos" },
        { ref: refS, label: "Saldo neto" },
        { ref: refP, label: "Gastos por categoría" },
      ],
    });

  const handleExcel = () =>
    generateReportExcel({
      logoUrl: "/Icono.png",
      title: "Reporte Financiero APFINE",
      summary: [
        { label: "Ingresos mes", value: ingresosMes },
        { label: "Gastos mes", value: gastosMes },
        { label: "Gastos fijos mes", value: gastosFijosMes },
        { label: "Saldo neto mes", value: saldoMes },
        { label: "Metas vigentes", value: countV },
      ],
      rowsDetalle: filtrados.map((r) => ({
        Fecha: r.fecha,
        Tipo: r.tipo,
        Categoría: r.categoria,
        Monto: r.monto,
      })),
    });

  return (
    <Container fluid className="vg-container">
      <h4 className="vg-title">Datos y Reporte</h4>
      <Row className="row-cols-2 row-cols-lg-6 g-3 mb-4">
        <Col>
          <Card className="vg-card text-center h-100">
            <Card.Body>
              <strong>Metas actuales:</strong>
              <br />
              {countV}
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="vg-card text-center h-100">
            <Card.Body>
              <strong>Ingresos mes:</strong>
              <br />
              C${ingresosMes.toFixed(2)}
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="vg-card text-center h-100">
            <Card.Body>
              <strong>Gastos mes:</strong>
              <br />
              C${gastosMes.toFixed(2)}
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="vg-card text-center h-100">
            <Card.Body>
              <strong>Gastos fijos:</strong>
              <br />
              C${gastosFijosMes.toFixed(2)}
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="vg-card text-center h-100">
            <Card.Body>
              <strong>Saldo neto:</strong>
              <br />
              C${saldoMes.toFixed(2)}
            </Card.Body>
          </Card>
        </Col>
        <Col className="d-flex align-items-center justify-content-center">
          <Button size="sm" variant="outline-success" onClick={handleExcel}>
            Excel
          </Button>
          <Button
            size="sm"
            variant="outline-primary"
            className="ms-2"
            onClick={handlePDF}
          >
            PDF
          </Button>
        </Col>
      </Row>
      <Card className="vg-filtros mb-4">
        <Card.Body>
          <Row className="gy-3">
            <Col xs={6} md={3}>
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option>Gasto</option>
                <option>Ingreso</option>
                <option>Ambos</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label>Desde</Form.Label>
              <DatePicker
                selected={desde}
                onChange={setDesde}
                dateFormat="yyyy-MM-dd"
                className="form-control"
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Label>Hasta</Form.Label>
              <DatePicker
                selected={hasta}
                onChange={setHasta}
                dateFormat="yyyy-MM-dd"
                className="form-control"
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={catSel}
                onChange={(e) => setCatSel(e.target.value)}
              >
                <option>Todas</option>
                {categorias.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Row className="gy-4">
        <Col xs={12} lg={4}>
          <Card className="vg-card" ref={refIG}>
            <Card.Body>
              <div className="vg-header-card">
                <Card.Title className="vg-card-title">
                  Ingresos vs Gastos
                </Card.Title>
              </div>
              <Bar
                data={{
                  labels: porMes.labels,
                  datasets: [
                    {
                      label: "Ingresos",
                      data: porMes.ing,
                      backgroundColor: cssVar("--primary", "#0033cc"),
                    },
                    {
                      label: "Gastos",
                      data: porMes.gas,
                      backgroundColor: cssVar("--icon-error", "#ff4d4f"),
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="vg-card" ref={refS}>
            <Card.Body>
              <div className="vg-header-card">
                <Card.Title className="vg-card-title">Saldo neto</Card.Title>
              </div>
              <Bar
                data={{
                  labels: porMes.labels,
                  datasets: [
                    {
                      label: "Saldo neto",
                      data: porMes.saldo,
                      backgroundColor: cssVar("--icon-active", "#39d65c"),
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="vg-card" ref={refP}>
            <Card.Body>
              <div className="vg-header-card">
                <Card.Title className="vg-card-title">
                  Gastos por categoría
                </Card.Title>
              </div>
              <Pie
                data={{
                  labels: pie.labels,
                  datasets: [
                    {
                      data: pie.valores,
                      backgroundColor: [
                        cssVar("--primary", "#0033cc"),
                        cssVar("--icon-active", "#39d65c"),
                        cssVar("--icon-warning", "#faad14"),
                        cssVar("--icon-error", "#ff4d4f"),
                        cssVar("--icon-inactive", "#d9d9d9"),
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
