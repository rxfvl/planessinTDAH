// IA gratuita: Cloudflare Workers AI a través del Worker de /worker (solo usuarios con sesión).
import { APP_CONFIG } from '../config';
import { getIdToken } from './store';

const KINDS = {
  preparativos: `PREPARATIVOS: acciones concretas que hay que hacer ANTES del plan. Cada una empieza con un verbo (Reservar, Comprar, Revisar, Descargar, Llevar, Avisar...). Piensa en reservas y entradas con antelación, documentación, transporte, alojamiento, dinero, equipaje adaptado a lo que vais a hacer y a la época del año, y gestiones previas. Ordénalas de más a menos urgente.`,
  imprevistos: `IMPREVISTOS: cosas que pueden salir mal en ESTE plan concreto. Cada punto es una afirmación objetiva y breve de lo que podría ocurrir, SIN explicar qué hacer ni dar soluciones. Ejemplos de estilo: "El bar puede estar cerrado", "El museo puede tener cola de más de una hora", "Puede llover durante la excursión". Piensa en tiempo meteorológico, retrasos o cancelaciones, horarios y cierres, aforo y colas, dinero, salud y cansancio, referidos a las actividades y lugares del plan.`,
};

const parseItems = (text) => {
  try {
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : data.items ?? Object.values(data)[0];
    if (Array.isArray(list)) return list.map(String);
  } catch { /* cae al parseo por líneas */ }
  return text.split('\n').map(l => l.replace(/^[\s\-*\d.)"]+|[",\s]+$/g, '')).filter(Boolean);
};

// kind: 'preparativos' | 'imprevistos'. Devuelve hasta 8 sugerencias nuevas (string[]).
export async function suggest(kind, plan) {
  const activities = (plan.proposals || []).filter(p => p.status === 'accepted').map(p => `- ${p.text}`).join('\n') || '(aún no hay)';
  const list = (items) => items?.length ? items.map(i => `- ${i.text}${i.completed ? ' (HECHO)' : ' (pendiente)'}`).join('\n') : '(nada)';
  const existing = [...(plan.analysis || []), ...(plan.contingencies || [])].map(i => i.text);
  const prompt = `Datos del plan:
- Título: ${plan.name}
- Descripción: ${plan.description}
- Fechas: ${plan.startDate}${plan.endDate ? ` a ${plan.endDate}` : ''} (hoy es ${new Date().toISOString().slice(0, 10)})
- Actividades confirmadas: ${activities}

Preparativos ya anotados:
${list(plan.analysis)}

Imprevistos ya anotados:
${list(plan.contingencies)}

Tarea: ${KINDS[kind]}

Reglas:
- Entre 6 y 8 puntos, de una sola frase corta cada uno.
- NO repitas ni reformules nada de lo ya anotado en ninguna de las dos listas, ni lo marcado como HECHO. Solo propón cosas NUEVAS.
- NO INVENTES DATOS: no supongas nada sobre las personas (alergias, intolerancias, salud, gustos, edad, presupuesto, si tienen coche, etc.) ni menciones a nadie por su nombre. Basa cada punto solo en el título, la descripción, las fechas y las actividades. Si algo no consta, no lo des por hecho.
- COHERENCIA: lo marcado como HECHO ya está resuelto, así que no propongas riesgos que esa acción ya elimina. Ejemplo: si "Reservar en el restaurante" está HECHO, no sugieras que el restaurante puede estar cerrado, lleno o sin mesa. Antes de dar cada punto, comprueba que no contradice nada de las dos listas.
- Escribe en español correcto, sin faltas de ortografía, con tildes y signos de puntuación.
- Todo tiene que ser específico para este plan: menciona el lugar, la actividad o la fecha. PROHIBIDO lo genérico ("llevar ropa cómoda", "tener cuidado", "ser flexibles").
- Si faltan datos (no hay actividades confirmadas o la descripción es breve), deduce lo razonable a partir del título y las fechas.

Responde SOLO con JSON: {"items": ["...", "..."]}`;

  const res = await fetch(APP_CONFIG.aiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getIdToken()}` },
    body: JSON.stringify({
      messages: [
      { role: 'system', content: 'Eres un organizador experto de viajes y planes de pareja. Tu trabajo es que no se les olvide absolutamente nada. Respondes en español de España, con propuestas prácticas y concretas.' },
      { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`IA ${res.status}: ${(await res.json().catch(() => ({}))).error ?? ''}`);
  const { text } = await res.json();

  const seen = new Set(existing.map(t => t.toLowerCase()));
  return [...new Set(parseItems(text).map(t => t.trim()))]
    .filter(t => t && !seen.has(t.toLowerCase()))
    .slice(0, 8);
}
