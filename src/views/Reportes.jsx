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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

/* Chart.js set-up */
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
);

const cssVar = (v) =>
  getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export default function Reportes() {
  /* ---------- auth ---------- */
  const [uid, setUid] = useState(null);
  useEffect(() => auth.onAuthStateChanged((u) => u && setUid(u.uid)), []);

  /* ---------- data ---------- */
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
        (snap) => {
          setRegistros((prev) => {
            const otros = prev.filter((x) => x.tipo !== tipo);
            const nuevos = snap.docs.map((d) => ({
              id: d.id,
              tipo,
              monto: Number(d.data().monto),
              fecha: d.data()[fecha],
              categoria: d.data().categoria || "Sin categoría",
            }));
            return [...otros, ...nuevos];
          });
        }
      );

    const u1 = listen("ingresos", "ingreso", "fecha_ingreso");
    const u2 = listen("gastos", "gasto", "fecha_gasto");
    return () => {
      u1();
      u2();
    };
  }, [uid]);

  /* ---------- filtros ---------- */
  const [desde, setDesde] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [hasta, setHasta] = useState(new Date());
  const [catSel, setCatSel] = useState("Todas");

  const categorias = useMemo(
    () =>
      Array.from(
        new Set(registros.map((r) => r.categoria).filter(Boolean))
      ).sort(),
    [registros]
  );

  const filtrados = useMemo(
    () =>
      registros.filter((r) => {
        const f = parseISO(r.fecha);
        const okFecha = !isBefore(f, desde) && !isAfter(f, hasta);
        const okCat = catSel === "Todas" || r.categoria === catSel;
        return okFecha && okCat;
      }),
    [registros, desde, hasta, catSel]
  );

  /* ---------- agregaciones por mes ---------- */
  const porMes = useMemo(() => {
    const map = {};
    filtrados.forEach((r) => {
      const key = format(parseISO(r.fecha), "yyyy-MM");
      if (!map[key]) map[key] = { ing: 0, gas: 0 };
      r.tipo === "ingreso"
        ? (map[key].ing += r.monto)
        : (map[key].gas += r.monto);
    });
    const labels = Object.keys(map).sort();
    return {
      labels,
      ing: labels.map((l) => map[l].ing),
      gas: labels.map((l) => map[l].gas),
      saldo: labels.map((l) => map[l].ing - map[l].gas),
    };
  }, [filtrados]);

  /* ---------- pie por categoría ---------- */
  const pie = useMemo(() => {
    const map = {};
    filtrados
      .filter((r) => r.tipo === "gasto")
      .forEach((r) => (map[r.categoria] = (map[r.categoria] || 0) + r.monto));
    const labels = Object.keys(map);
    return { labels, valores: labels.map((l) => map[l]) };
  }, [filtrados]);

  /* ---------- refs para pdf ---------- */
  const refIngresosGastos = useRef(null);
  const refSaldo = useRef(null);
  const refPie = useRef(null);

  const descargarPDF = async (ref, nombre, datosResumen = []) => {
    const node = ref.current;

    const canvas = await html2canvas(node, {
      backgroundColor: null,
      scale: 2, // mejor calidad sin aumentar tamaño físico
    });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let y = 20;

    // Título principal
    pdf.setFontSize(16);
    pdf.setTextColor(40);
    pdf.text(`Reporte: ${nombre.replace(/-/g, " ")}`, 20, y);
    y += 10;

    // Datos resumen (si hay)
    if (datosResumen.length) {
      pdf.setFontSize(11);
      datosResumen.forEach((linea) => {
        pdf.text(linea, 20, y);
        y += 7;
      });
      y += 5;
    }

    // Imagen más pequeña
    const imgWidth = 160;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(img, "PNG", 20, y, imgWidth, imgHeight);

    pdf.save(`${nombre}-${format(new Date(), "yyyyMMdd-HHmm")}.pdf`);
  };

  /* ---------- datasets ---------- */
  const barDataGroup = {
    labels: porMes.labels,
    datasets: [
      {
        label: "Ingresos",
        data: porMes.ing,
        backgroundColor: cssVar("--primary") || "#0033cc",
      },
      {
        label: "Gastos",
        data: porMes.gas,
        backgroundColor: cssVar("--icon-error") || "#ff4d4f",
      },
    ],
  };

  const saldoDataBar = {
    labels: porMes.labels,
    datasets: [
      {
        label: "Saldo neto",
        data: porMes.saldo,
        backgroundColor: cssVar("--icon-active") || "#39d65c",
      },
    ],
  };

  const pieData = {
    labels: pie.labels,
    datasets: [
      {
        data: pie.valores,
        backgroundColor: [
          cssVar("--primary"),
          cssVar("--icon-active"),
          cssVar("--icon-warning"),
          cssVar("--icon-error"),
          cssVar("--icon-inactive"),
          "#673ab7",
          "#00bcd4",
        ].filter(Boolean),
      },
    ],
  };

  /* ---------- UI ---------- */
  return (
    <Container fluid className="vg-container">
      <h4 className="vg-title">Datos y Reporte </h4>

      {/* Filtros */}
      <Card className="vg-filtros mb-4">
        <Card.Body>
          <Row className="gy-3">
            <Col xs={12} md={4}>
              <Form.Label>Desde</Form.Label>
              <DatePicker
                selected={desde}
                onChange={setDesde}
                dateFormat="yyyy-MM-dd"
                className="form-control"
              />
            </Col>
            <Col xs={12} md={4}>
              <Form.Label>Hasta</Form.Label>
              <DatePicker
                selected={hasta}
                onChange={setHasta}
                dateFormat="yyyy-MM-dd"
                className="form-control"
              />
            </Col>
            <Col xs={12} md={4}>
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
        {/* INGRESOS vs GASTOS */}
        <Col xs={12} lg={4}>
          <Card className="vg-card" ref={refIngresosGastos}>
            <Card.Body>
              <div className="vg-header-card">
                <Card.Title className="vg-card-title">
                  Ingresos vs&nbsp;Gastos
                </Card.Title>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() =>
                    descargarPDF(refIngresosGastos, "ingresos-gastos", [
                      `Total ingresos: C$ ${porMes.ing.reduce((a, b) => a + b, 0).toFixed(2)}`,
                      `Total gastos: C$ ${porMes.gas.reduce((a, b) => a + b, 0).toFixed(2)}`,
                    ])
                  }
                >
                  PDF
                </Button>
              </div>
              <Bar
                data={barDataGroup}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* SALDO */}
        <Col xs={12} lg={4}>
          <Card className="vg-card" ref={refSaldo}>
            <Card.Body>
              <div className="vg-header-card">
                <Card.Title className="vg-card-title">
                  Saldo neto
                </Card.Title>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() =>
                    descargarPDF(refSaldo, "saldo-neto", [
                      `Saldo acumulado: C$ ${porMes.saldo.reduce((a, b) => a + b, 0).toFixed(2)}`,
                    ])
                  }
                >
                  PDF
                </Button>
              </div>
              <Bar
                data={saldoDataBar}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* PIE GASTOS */}
        <Col xs={12} lg={4}>
          <Card className="vg-card" ref={refPie}>
            <Card.Body>
              <div className="vg-header-card">
                <Card.Title className="vg-card-title">
                  Gastos por categoría
                </Card.Title>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => descargarPDF(refPie, "gastos-por-categoria")}
                >
                  PDF
                </Button>
              </div>
              <Pie
                data={pieData}
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
