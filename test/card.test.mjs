import assert from "node:assert/strict";
import { test } from "node:test";
import { EVENTS, mockData, NOW } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const ew = load({ names: ["levelOf", "hoursFromAttributes", "resolve", "STRINGS", "LANGUAGES"] });
const EcoWattCard = ew.element("ecowatt-card");
const EcoWattMiniCard = ew.element("ecowatt-mini-card");
// Objects from the sandbox have the sandbox's prototypes: compared as plain JSON.
const same = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), msg);

const makeHass = (variant = "default", { language = "en", data } = {}) => {
  const d = data ?? mockData(variant);
  const calls = [];
  return {
    calls,
    ...d,
    language,
    locale: { language },
    callService: (...a) => calls.push(a),
    callApi: async (method, path) => {
      calls.push(["api", method, path]);
      return structuredClone(d.api.calendars);
    },
  };
};

const mount = async (config = {}, variant = "default", Card = EcoWattCard, opts = {}) => {
  const card = new Card();
  card._connected = true;
  card.setConfig(config);
  const hass = makeHass(variant, opts);
  card.hass = hass;
  card.connectedCallback();
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  // Intl puts thin and narrow no-break spaces in times and ranges ("8 – 9 AM"): plain spaces for the assertions.
  return { card, hass, html: () => card.shadowRoot.innerHTML.replace(/[\u2009\u202f\u00a0]/g, " ") };
};

const click = (card, dataset) => card._onClick({ composedPath: () => [{ dataset }], stopPropagation() {}, detail: 1 });

test("levels: numbers, the colours of ecowatt and MyElectricalData, the sentences of My EcoWatt by RTE", () => {
  same(
    [1, 2, 3, 0, "1", "Vert", "Orange", "Rouge", "Situation normale", "Risques de coupures d'électricité", "Coupures d'électricité programmées"].map(ew.levelOf),
    [1, 2, 3, 0, 1, 1, 2, 3, 1, 2, 3],
  );
  assert.equal(ew.levelOf("Situation normale - Electricité faible émission de CO2"), 0);
  assert.equal(ew.levelOf("Coupure d'électricité en cours"), 3);
  assert.equal(ew.levelOf("unknown"), null);
  assert.equal(ew.levelOf(7), null);
});

test("hours from attributes: h0…h23 (ecowatt) and a forecast map (MyElectricalData)", () => {
  const a = ew.hoursFromAttributes({ h0: "Vert", h8: "Orange", h19: "Rouge" });
  assert.equal(a[0], 1);
  assert.equal(a[8], 2);
  assert.equal(a[19], 3);
  assert.equal(a[1], null);
  const b = ew.hoursFromAttributes({ forecast: { "00 h": 1, "18 h": 2 } });
  assert.equal(b[18], 2);
  assert.equal(ew.hoursFromAttributes({ friendly_name: "x" }), null);
});

test("My EcoWatt by RTE: day sensors by their period, the hourly sensor and the calendar are discovered", () => {
  const m = ew.resolve(makeHass(), {});
  assert.equal(m.source, "rte_ecowatt");
  same(
    m.days.map((d) => [d.index, d.entity]),
    [
      [0, "sensor.ecowatt_niveau_aujourd_hui"],
      [1, "sensor.ecowatt_niveau_demain"],
      [2, "sensor.ecowatt_niveau_dans_2_jours"],
      [3, "sensor.ecowatt_niveau_dans_3_jours"],
    ],
  );
  same(
    m.hourly.map((h) => h.entity),
    ["sensor.ecowatt_niveau_maintenant"],
  );
  assert.equal(m.calendar, "calendar.ecowatt_niveau_degrade");
});

test("the ecowatt integration and MyElectricalData are discovered by their day sensors", () => {
  const states = {};
  const entities = {};
  for (let i = 0; i < 4; i++) {
    const id = `sensor.ecowatt_day_${i}`;
    entities[id] = { entity_id: id, platform: "ecowatt" };
    states[id] = { entity_id: id, state: "Vert", attributes: { h0: "Vert", h9: i === 1 ? "Orange" : "Vert" } };
  }
  const m = ew.resolve({ states, entities, devices: {} }, {});
  assert.equal(m.source, "ecowatt");
  assert.equal(m.days.length, 4);
  const states2 = { "sensor.myelectricaldata_ecowatt_j1": { state: "2", attributes: {} }, "sensor.myelectricaldata_ecowatt_j0": { state: "1", attributes: {} } };
  const entities2 = {
    "sensor.myelectricaldata_ecowatt_j0": { entity_id: "sensor.myelectricaldata_ecowatt_j0", platform: "mqtt" },
    "sensor.myelectricaldata_ecowatt_j1": { entity_id: "sensor.myelectricaldata_ecowatt_j1", platform: "mqtt" },
  };
  const m2 = ew.resolve({ states: states2, entities: entities2, devices: {} }, {});
  assert.equal(m2.source, "myelectricaldata");
  same(
    m2.days.map((d) => d.index),
    [0, 1],
  );
});

test("the calendar's tight periods become tomorrow's tight hours; today is normal all day", async () => {
  const { card, hass } = await mount();
  assert.ok(hass.calls.some((c) => c[0] === "api" && c[2].startsWith("calendars/calendar.ecowatt_niveau_degrade?start=")));
  const days = card._days(card._resolve());
  assert.equal(days[0].hours.every((l) => l === 1), true);
  same(
    days[1].hours.map((l, h) => (l >= 2 ? h : null)).filter((h) => h !== null),
    [8, 18, 19],
  );
  assert.equal(days[3].level, 0);
  assert.equal(EVENTS.length, 2);
});

test("header chip, hero and lines: tight tomorrow, the next tight period", async () => {
  const { html } = await mount();
  const h = html();
  assert.match(h, /chip warn[^>]*>.*Tight tomorrow/s);
  assert.match(h, /class="big verdict ok"><b>Normal</);
  assert.match(h, /Tomorrow: tight 8 – 9 AM, 6 – 8 PM/);
  assert.match(h, /Next tight period tomorrow 8:00 AM/);
  // 24 hours a day for the 4 days, the current one marked; the dial shows today's 24 hours.
  assert.equal((h.match(/class="hour /g) || []).length, 96);
  assert.equal((h.match(/class="seg /g) || []).length, 24);
  assert.equal((h.match(/class="hour ok now"/g) || []).length, 1);
});

test("tight now and power cuts now: the dial, the chip and the current hour say it", async () => {
  const tight = (await mount({}, "tight")).html();
  assert.match(tight, /chip warn[^>]*>.*Tight today/s);
  assert.match(tight, /class="core warn"/);
  assert.match(tight, /Tight grid now: save power/);
  assert.match(tight, /class="hour warn now"/);
  const cut = (await mount({}, "cut")).html();
  assert.match(cut, /chip crit[^>]*>.*Cuts today/s);
  assert.match(cut, /class="core crit"/);
  assert.match(cut, /Today: cuts 9 – 10 AM/);
  assert.match(cut, /Power cuts now/);
});

test("a tight day whose hours are not published yet says so", async () => {
  const data = mockData("default");
  data.api.calendars = [];
  const { html } = await mount({}, "default", EcoWattCard, { data });
  assert.match(html(), /Tight hours not published yet/);
});

test("options: rows hidden, the forecast folded, and a click elsewhere folds it back", async () => {
  const days = (await mount({ show_days: false })).html();
  assert.equal((days.match(/class="hour /g) || []).length, 48);
  const hours = (await mount({ show_hours: false })).html();
  assert.equal((hours.match(/class="hour /g) || []).length, 48);
  assert.doesNotMatch(hours, /class="dname today/);
  const { card, html } = await mount({ collapsed: ["forecast"] });
  assert.equal((html().match(/class="hour /g) || []).length, 0);
  click(card, { action: "toggle_section", section: "forecast" });
  assert.equal((html().match(/class="hour /g) || []).length, 96);
  card._outside.tap({ composedPath: () => [] });
  assert.equal((html().match(/class="hour /g) || []).length, 0);
});

test("an hour opens the day's sensor (more-info)", async () => {
  const { card } = await mount();
  click(card, { entity: "sensor.ecowatt_niveau_demain", hour: "8" });
  assert.equal(card.events.at(-1).type, "hass-more-info");
  assert.equal(card.events.at(-1).detail.entityId, "sensor.ecowatt_niveau_demain");
});

test("mini card: the dial and the lines; the detail button shows the full card", async () => {
  const { card, html } = await mount({}, "default", EcoWattMiniCard);
  assert.match(html(), /content mini/);
  assert.match(html(), /class="dial clickable"/);
  assert.match(html(), /Tomorrow: tight 8 – 9 AM, 6 – 8 PM/);
  assert.doesNotMatch(html(), /class="hour /);
  click(card, { action: "zoom" });
  assert.match(html(), /FORECAST|section-title/);
  card._unzoom.tap({ composedPath: () => [] });
  assert.match(html(), /content mini/);
});

test("nothing found: a clear message instead of an empty card", async () => {
  const card = new EcoWattCard();
  card.setConfig({});
  card.hass = { states: {}, entities: {}, devices: {}, language: "en" };
  assert.match(card.shadowRoot.innerHTML, /No EcoWatt sensor found/);
});

test("configured day sensors are used as given", async () => {
  const { card } = await mount({ days: ["sensor.ecowatt_niveau_demain"] });
  const m = card._resolve();
  assert.equal(m.source, "config");
  same(
    m.days.map((d) => d.entity),
    ["sensor.ecowatt_niveau_demain"],
  );
});

test("French: day names, levels and hours in the card's language", async () => {
  const { html } = await mount({ language: "fr" });
  assert.match(html(), /Tendu demain/);
  assert.match(html(), /Demain : tendu/);
});

test("every language has every text, with the same placeholders as English", () => {
  const en = ew.STRINGS.en;
  const ph = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const [l, table] of Object.entries(ew.STRINGS)) {
    assert.deepEqual(Object.keys(table).sort(), Object.keys(en).sort(), l);
    for (const k of Object.keys(en)) assert.deepEqual(ph(table[k]), ph(en[k]), `${l}.${k}`);
  }
  assert.equal(ew.LANGUAGES.length, Object.keys(ew.STRINGS).length);
});

test("visual editor: options at their default are left out of the YAML; the mini editor adds the detail button", () => {
  const Editor = ew.element("ecowatt-card-editor");
  const MiniEditor = ew.element("ecowatt-mini-card-editor");
  const doc = ew.window.document;
  const create = doc.createElement;
  let form;
  doc.createElement = (tag) => (form = { tag, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } });
  try {
    const ed = new Editor();
    let out;
    ed.dispatchEvent = (ev) => {
      out = ev.detail.config;
    };
    ed.setConfig({ type: "custom:ecowatt-card" });
    ed.hass = makeHass();
    assert.equal(form.tag, "ha-form");
    assert.ok(form.schema.some((s) => s.name === "days"));
    assert.ok(form.schema.some((s) => s.name === "collapsed"));
    form.listeners["value-changed"]({ stopPropagation() {}, detail: { value: { type: "custom:ecowatt-card", show_days: true, show_hours: false, title: "" } } });
    same(out, { type: "custom:ecowatt-card", show_hours: false });
  } finally {
    doc.createElement = create;
  }
  assert.ok(MiniEditor.toggles.some(([n]) => n === "zoom"));
  assert.ok(Editor.toggles.every(([n]) => MiniEditor.toggles.some(([m]) => m === n)));
});

test("every clickable element can be reached and used from the keyboard", async () => {
  const { html } = await mount();
  const h = html();
  for (const m of h.matchAll(/<(div|span)[^>]*data-(entity|action)=[^>]*>/g)) {
    assert.match(m[0], /role="button"/, m[0]);
    assert.match(m[0], /tabindex="0"/, m[0]);
  }
  assert.ok(NOW > 0);
});

test("My EcoWatt by RTE as set up by default: today's sensor and the calendar give the 4 days", async () => {
  const data = mockData();
  for (const id of ["sensor.ecowatt_niveau_demain", "sensor.ecowatt_niveau_dans_2_jours", "sensor.ecowatt_niveau_dans_3_jours"]) {
    delete data.states[id];
    delete data.entities[id];
  }
  const card = new EcoWattCard();
  card._connected = true;
  card.setConfig({});
  card.hass = makeHass("default", { data });
  card.connectedCallback();
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  const h = card.shadowRoot.innerHTML.replace(/[   ]/g, " ");
  assert.equal((h.match(/class="hour /g) || []).length, 96);
  assert.match(h, /Tomorrow: tight 8 – 9 AM, 6 – 8 PM/);
  assert.match(h, /chip warn[^>]*>.*Tight tomorrow/s);
});

test("ecowatt with renamed entities: the day comes from the name", () => {
  const states = {};
  const entities = {};
  ["Ecowatt Aujourd'hui", "Ecowatt Demain", "Ecowatt J+2", "Ecowatt J+3"].forEach((name, i) => {
    const id = `sensor.signal_${i}`;
    entities[id] = { entity_id: id, platform: "ecowatt" };
    states[id] = { entity_id: id, state: "Vert", attributes: { friendly_name: name, h0: "Vert" } };
  });
  const m = ew.resolve({ states, entities }, {});
  assert.equal(m.source, "ecowatt");
  same(
    m.days.map((d) => [d.index, d.entity]),
    [
      [0, "sensor.signal_0"],
      [1, "sensor.signal_1"],
      [2, "sensor.signal_2"],
      [3, "sensor.signal_3"],
    ],
  );
});
