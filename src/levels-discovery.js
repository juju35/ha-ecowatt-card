// ---------------------------------------------------------------------------
// Levels and discovery
// ---------------------------------------------------------------------------
import { DAY_MS, asList, domainOf, keyText, parseTime, startOfDay } from "./helpers.js";

// A level (0..3) from a number (1-3, or 0 for the low-carbon level) or a text: the colours of the ecowatt and
// MyElectricalData integrations (Vert / Orange / Rouge), the sentences of My EcoWatt by RTE, English words.
export const levelOf = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" || /^\s*\d+(\.0+)?\s*$/.test(String(v))) {
    const n = Math.round(Number(v));
    return n >= 0 && n <= 3 ? n : null;
  }
  const s = String(v)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (/unknown|unavailable|none/.test(s)) return null;
  if (/coupure|cut|outage|rouge|red|shedding/.test(s) && !/risque|risk/.test(s)) return 3;
  if (/risque|risk|orange|tendu|tight|tension|alert|warning/.test(s)) return 2;
  if (/faible emission|co2|decarbon|low.?carbon|low emission/.test(s)) return 0;
  if (/normal|vert|green|ok/.test(s)) return 1;
  return null;
};

export const worst = (list) => list.reduce((w, l) => (l !== null && l !== undefined && (w === null || l > w) ? l : w), null);

// 24 hourly levels from attributes named by hour: h0…h23 (ecowatt) or a forecast map {"00 h": 1} (MyElectricalData).
export const hoursFromAttributes = (attrs = {}) => {
  const out = Array(24).fill(null);
  let found = false;
  for (let h = 0; h < 24; h++) {
    if (`h${h}` in attrs) {
      out[h] = levelOf(attrs[`h${h}`]);
      found = true;
    }
  }
  const fc = attrs.forecast;
  if (fc && typeof fc === "object" && !Array.isArray(fc)) {
    for (const [k, v] of Object.entries(fc)) {
      const h = parseInt(k, 10);
      if (h >= 0 && h < 24) {
        out[h] = levelOf(v);
        found = true;
      }
    }
  }
  return found ? out : null;
};

export const _cache = new WeakMap();

// The day sensors (and hourly sensors and calendar) of the configuration, else of the supported integrations.
// Returns { days: [{ date, entity, level, hours }], hourly: [{ entity, at }], calendar, now, source }.
export const resolve = (hass, config) => {
  const key = `${JSON.stringify(config.days ?? null)}|${config.now ?? ""}|${config.calendar ?? ""}`;
  let per = _cache.get(hass.entities);
  if (!per) _cache.set(hass.entities, (per = new Map()));
  const sig = `${key}|${Object.keys(hass.states).length}`;
  if (per.has(sig)) return per.get(sig);
  const today = startOfDay(Date.now());
  const days = [];
  const hourly = [];
  let calendar = config.calendar || null;
  let source = null;
  const entries = Object.values(hass.entities || {});
  if (config.days) {
    asList(config.days).forEach((d, i) => {
      const entity = typeof d === "string" ? d : d?.entity;
      if (entity) days.push({ index: i, entity, attribute: d?.attribute });
    });
    source = "config";
  } else {
    // My EcoWatt by RTE: sensors whose period is a day, or an hour; and its calendar of tight hours.
    for (const e of entries.filter((x) => x.platform === "rte_ecowatt")) {
      const s = hass.states[e.entity_id];
      if (domainOf(e.entity_id) === "calendar") calendar ??= e.entity_id;
      if (domainOf(e.entity_id) !== "sensor" || !s) continue;
      const start = parseTime(s.attributes.period_start);
      const end = parseTime(s.attributes.period_end);
      if (start !== null && end !== null && end - start <= 3.6e6 + 1000) hourly.push({ entity: e.entity_id, at: start });
      else if (start !== null && end !== null) days.push({ index: Math.round((startOfDay(start) - today) / DAY_MS), entity: e.entity_id });
      else if (/level_now|_now$/.test(keyText(e, hass))) hourly.push({ entity: e.entity_id, at: null });
    }
    if (days.length) source = "rte_ecowatt";
    // ecowatt (adetante): sensor.ecowatt_day_<n>, its hours in h0…h23.
    if (!days.length) {
      for (const e of entries.filter((x) => x.platform === "ecowatt" && domainOf(x.entity_id) === "sensor")) {
        const m = /_(?:day_|j)(\d)$/.exec(e.entity_id);
        // A renamed entity: its name says the day (Aujourd'hui, Demain, J+2, J+3).
        const name = String(hass.states[e.entity_id]?.attributes?.friendly_name || e.original_name || "");
        const byName = /aujourd|today/i.test(name) ? 0 : /demain|tomorrow/i.test(name) ? 1 : /j\s*\+\s*(\d)/i.exec(name)?.[1];
        const index = m ? Number(m[1]) : byName === undefined ? null : Number(byName);
        if (index !== null && !days.some((d) => d.index === index)) days.push({ index, entity: e.entity_id });
      }
      if (days.length) source = "ecowatt";
    }
    // MyElectricalData (MQTT): sensor …ecowatt_j0 / j1 / j2, its hours in `forecast`.
    if (!days.length) {
      for (const e of entries.filter((x) => domainOf(x.entity_id) === "sensor")) {
        const m = /ecowatt_j(\d)$/.exec(e.entity_id);
        if (m) days.push({ index: Number(m[1]), entity: e.entity_id });
      }
      if (days.length) source = "myelectricaldata";
    }
  }
  days.sort((a, b) => a.index - b.index);
  const out = { days, hourly, calendar, now: config.now || null, source };
  per.set(sig, out);
  return out;
};
