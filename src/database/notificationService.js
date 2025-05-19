import { collection, query, where, getDocs } from "firebase/firestore";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { db } from "./firebaseconfig";

export async function fetchUserNotifications(userId) {
  const today = new Date();
  const notifs = [];

  // 1) Gastos fijos con recordatorio activado
  const gastosQ = query(
    collection(db, "gastos_fijos"),
    where("userId", "==", userId),
    where("recordatorio_activado", "==", true)
  );
  const gastosSnap = await getDocs(gastosQ);
  gastosSnap.forEach((doc) => {
    const d = doc.data();
    const pagoDate = parseISO(d.proximo_pago);
    const diff = differenceInCalendarDays(pagoDate, today);
    if (diff === 0 || diff === 2) {
      notifs.push({
        title: "Gasto fijo",
        message:
          diff === 0
            ? `Tu gasto de "${d.nombre_gasto}" vence HOY (C$${d.monto_mensual}).`
            : `Tu gasto de "${d.nombre_gasto}" vence en 2 días (C$${d.monto_mensual}).`,
        time: d.proximo_pago,
      });
    }
  });

  // 2) Metas
  const metasQ = query(collection(db, "metas"), where("userId", "==", userId));
  const metasSnap = await getDocs(metasQ);
  metasSnap.forEach((doc) => {
    const d = doc.data();
    const limitDate = parseISO(d.fecha_limite);
    const diff = differenceInCalendarDays(limitDate, today);
    if (diff === 0 || diff === 2) {
      notifs.push({
        title: "Meta próxima",
        message:
          diff === 0
            ? `Tu meta "${d.nombre_meta}" debe cumplirse HOY.`
            : `Tu meta "${d.nombre_meta}" vence en 2 días.`,
        time: d.fecha_limite,
      });
    }
  });

  // Ordenar por fecha (ascendente)
  return notifs.sort((a, b) => (a.time > b.time ? 1 : -1));
}
