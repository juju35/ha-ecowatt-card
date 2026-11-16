// Mock Home Assistant registries and states for the screenshots and the tests: the My EcoWatt by RTE integration
// with its day sensors (today normal, tomorrow tight, then normal and low-carbon), its sensor of the current hour and
// its calendar of tight hours (tomorrow 08:00–09:00 and 18:00–20:00). Every time is relative to NOW, a fixed instant,
// so that the captures never change. `mockData(variant)` returns everything a card needs for one capture.
export const NOW = Date.parse("2026-11-16T09:30:00Z");
const DAY = 8.64e7;
const today = Date.parse("2026-11-16T00:00:00Z");
const iso = (ms) => new Date(ms).toISOString();

const TEXT = {
  0: "Situation normale - Electricité faible émission de CO2",
  1: "Situation normale",
  2: "Risques de coupures d'électricité",
  3: "Coupures d'électricité programmées",
};

const base = () => {
  const states = {};
  const entities = {};
  const devices = { rte: { id: "rte", name: "RTE", name_by_user: null } };
  const entity = (entity_id, state, attributes = {}) => {
    entities[entity_id] = { entity_id, device_id: "rte", platform: "rte_ecowatt", translation_key: null };
    states[entity_id] = { entity_id, state: String(state), attributes, last_changed: iso(NOW - 3.6e6), last_updated: iso(NOW - 3.6e6) };
  };
  const day = (id, shift, level, name) =>
    entity(id, TEXT[level], {
      friendly_name: name,
      level_code: level,
      period_start: iso(today + shift * DAY),
      period_end: iso(today + (shift + 1) * DAY),
      generation_time: iso(Date.parse("2026-11-16T09:00:00Z")),
    });
  // Entity ids in French on purpose (the card never relies on them); the names shown are neutral English ones.
  day("sensor.ecowatt_niveau_aujourd_hui", 0, 1, "Ecowatt level today");
  day("sensor.ecowatt_niveau_demain", 1, 2, "Ecowatt level tomorrow");
  day("sensor.ecowatt_niveau_dans_2_jours", 2, 1, "Ecowatt level in 2 days");
  day("sensor.ecowatt_niveau_dans_3_jours", 3, 0, "Ecowatt level in 3 days");
  entity("sensor.ecowatt_niveau_maintenant", TEXT[1], {
    friendly_name: "Ecowatt level now",
    level_code: 1,
    period_start: iso(Date.parse("2026-11-16T09:00:00Z")),
    period_end: iso(Date.parse("2026-11-16T10:00:00Z")),
  });
  entity("calendar.ecowatt_niveau_degrade", "off", { friendly_name: "Ecowatt downgraded level", message: TEXT[2] });
  return { states, entities, devices, areas: {}, api: { calendars: [] }, ws: {}, subs: {} };
};

const event = (from, to, level) => ({
  start: { dateTime: iso(from) },
  end: { dateTime: iso(to) },
  summary: TEXT[level],
  description: `Le niveau ecowatt prévu est ${level}`,
});
const h = (day, hour) => today + day * DAY + hour * 3.6e6;

// Tomorrow is tight in the morning and the evening.
export const EVENTS = [event(h(1, 8), h(1, 9), 2), event(h(1, 18), h(1, 20), 2)];

const setLevel = (d, id, level) => {
  d.states[id] = { ...d.states[id], state: TEXT[level], attributes: { ...d.states[id].attributes, level_code: level } };
};

// The variants of the captures:
//   default — today normal, tomorrow tight
//   tight   — the grid is tight now (today 08:00–11:00 and 17:00–20:00)
//   cut     — power cuts are planned now (09:00–10:00), tight around them
export const mockData = (variant = "default") => {
  const d = base();
  d.api.calendars = structuredClone(EVENTS);
  if (variant === "tight") {
    setLevel(d, "sensor.ecowatt_niveau_aujourd_hui", 2);
    setLevel(d, "sensor.ecowatt_niveau_maintenant", 2);
    d.api.calendars.push(event(h(0, 8), h(0, 11), 2), event(h(0, 17), h(0, 20), 2));
  }
  if (variant === "cut") {
    setLevel(d, "sensor.ecowatt_niveau_aujourd_hui", 3);
    setLevel(d, "sensor.ecowatt_niveau_maintenant", 3);
    d.api.calendars.push(event(h(0, 8), h(0, 9), 2), event(h(0, 9), h(0, 10), 3), event(h(0, 10), h(0, 12), 2), event(h(0, 18), h(0, 20), 2));
  }
  return d;
};
