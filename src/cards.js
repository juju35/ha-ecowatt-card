// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
import { LEVEL_CLASS, LEVEL_ICON, MAX_DAYS } from "./core.js";
import { DAY_MS, ICONS, esc, fmtTime, fmtWhen, moreInfo, parseTime, startOfDay, svgIcon } from "./helpers.js";
import { BASE_STYLE, MINI_STYLE } from "./styles.js";
import { CardBase, withMini } from "./card-base.js";
import { hoursFromAttributes, levelOf, resolve, worst } from "./levels-discovery.js";
import { ECO_STYLE, EW_BANNER_STYLE, ewIsNight, ewSceneSvg } from "./styles-2.js";

export class EcoWattCard extends CardBase {
  static getConfigElement() {
    return document.createElement("ecowatt-card-editor");
  }

  getCardSize() {
    return 7;
  }

  _build() {
    return resolve(this._hass, this._config);
  }

  _entityIds(m) {
    return [...m.days.map((d) => d.entity), ...m.hourly.map((h) => h.entity), m.calendar, m.now].filter(Boolean);
  }

  _extraDeps() {
    return [this._events];
  }

  _onConnect() {
    this._fetchCalendar(true);
  }

  _configChanged() {
    this._events = undefined;
    this._calKey = null;
  }

  _afterUpdate() {
    this._fetchCalendar(false);
  }

  // The tight hours of My EcoWatt by RTE are events of its calendar: fetched for the days shown, again when the
  // calendar changes and every 30 minutes.
  _fetchCalendar(force) {
    const m = this._resolve();
    const cal = m?.calendar;
    if (!cal || !this._hass?.callApi || (this._config.show_hours === false && this._config.show_days === false)) return;
    const st = this._s(cal);
    const key = `${cal}|${st?.last_updated}|${Math.floor(Date.now() / 1.8e6)}`;
    if (!force && key === this._calKey) return;
    this._calKey = key;
    const start = new Date(startOfDay(Date.now())).toISOString();
    const end = new Date(startOfDay(Date.now()) + MAX_DAYS * DAY_MS).toISOString();
    Promise.resolve(this._hass.callApi("GET", `calendars/${cal}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`))
      .then((events) => {
        // An answer to an earlier request (the configuration or the calendar changed meanwhile) is dropped.
        if (this._calKey !== key) return;
        this._events = Array.isArray(events) ? events : [];
        this._lastDeps = null;
        this._update();
      })
      .catch(() => {});
  }

  // The days shown, each { date, entity, level, hours: [24 levels | null] | null, message }.
  _days(m) {
    const today = startOfDay(Date.now());
    const out = [];
    for (const d of m.days) {
      const s = this._s(d.entity);
      if (!s) continue;
      const attrs = s.attributes || {};
      const dateAttr = parseTime(attrs.period_start ?? attrs.date);
      const date = dateAttr !== null ? startOfDay(dateAttr) : today + d.index * DAY_MS;
      const idx = Math.round((date - today) / DAY_MS);
      if (idx < 0 || idx >= MAX_DAYS) continue;
      const hours = hoursFromAttributes(d.attribute ? { forecast: attrs[d.attribute] } : attrs);
      // ecowatt reports the same state on every day sensor: the hours, when there are, say the day's level.
      const own = m.source === "ecowatt" && hours ? null : levelOf(attrs.level_code ?? s.state);
      out[idx] = { date, entity: d.entity, level: own ?? (hours ? worst(hours) : null), hours, message: attrs.message || null };
    }
    // My EcoWatt by RTE only makes today's day sensor by default: the other days come from its calendar of downgraded
    // levels, normal unless an event covers some of their hours.
    if (m.calendar && this._events) {
      for (let i = 0; i < MAX_DAYS; i++) {
        if (out[i]) continue;
        const date = today + i * DAY_MS;
        out[i] = { date, entity: m.calendar, level: 1, hours: null, message: null, fromCalendar: true };
      }
    }
    // Hours from the hourly sensors and the calendar's tight periods (My EcoWatt by RTE): normal hours are those of a
    // day whose level is normal.
    for (let i = 0; i < MAX_DAYS; i++) {
      const d = out[i];
      if (!d || d.hours) continue;
      const base = d.level !== null && d.level <= 1 ? d.level : null;
      const hours = Array(24).fill(base);
      let found = base !== null;
      for (const ev of this._events || []) {
        const s = parseTime(ev.start?.dateTime ?? ev.start?.date ?? ev.start);
        const e = parseTime(ev.end?.dateTime ?? ev.end?.date ?? ev.end);
        if (s === null || e === null) continue;
        const lvl = levelOf(/est (\d)/.exec(ev.description || "")?.[1] ?? ev.summary) ?? 2;
        for (let tms = s; tms < e; tms += 3.6e6) {
          if (startOfDay(tms) !== d.date) continue;
          hours[new Date(tms).getHours()] = lvl;
          found = true;
        }
      }
      for (const h of m.hourly) {
        const s = this._s(h.entity);
        if (!s || h.at === null || startOfDay(h.at) !== d.date) continue;
        hours[new Date(h.at).getHours()] = levelOf(s.attributes.level_code ?? s.state);
        found = true;
      }
      if (found && (d.level === null || d.level <= 1 || hours.some((l) => l !== null && l >= 2))) {
        // A tight day whose tight hours are not known keeps its unknown hours (grey) rather than calling them normal.
        if (d.level !== null && d.level >= 2) for (let h = 0; h < 24; h++) if (hours[h] === null || hours[h] < 2) hours[h] ??= 1;
        d.hours = hours;
      }
      if (d.fromCalendar && d.hours) d.level = worst(d.hours);
    }
    return out;
  }

  // The level of the current hour: the "now" sensor, else today's hours, else today's level.
  _nowLevel(m, days) {
    const ids = [m.now, ...m.hourly.filter((h) => h.at === null || Math.abs(h.at - Date.now()) < 3.6e6).map((h) => h.entity)].filter(Boolean);
    for (const id of ids) {
      const s = this._s(id);
      const l = s && levelOf(s.attributes.level_code ?? s.state);
      if (l !== null && l !== undefined) return { level: l, entity: id };
    }
    const today = days[0];
    if (!today) return { level: null, entity: null };
    const h = today.hours?.[new Date().getHours()];
    return { level: h ?? today.level, entity: today.entity };
  }

  // Ranges of hours at `min` or more (2: tight or cut, 3: cut): [{ from, to }] (to excluded).
  _tightRanges(day, min = 2) {
    const out = [];
    if (!day?.hours) return out;
    for (let h = 0; h < 24; h++) {
      const l = day.hours[h];
      if (l === null || l < min) continue;
      const last = out[out.length - 1];
      if (last && last.to === h) last.to = h + 1;
      else out.push({ from: h, to: h + 1 });
    }
    return out;
  }

  // Hours as Intl writes them for the card's language: "8 AM", "08 h"; a range "8 – 9 AM", "08 – 09 h".
  _hourFmt() {
    const l = this._locale();
    if (this._hf?.l !== l) this._hf = { l, f: new Intl.DateTimeFormat(l, { hour: "numeric" }) };
    return this._hf.f;
  }

  _rangesText(day, min = 2) {
    const f = this._hourFmt();
    return this._tightRanges(day, min)
      .map((r) => {
        const a = new Date(day.date + r.from * 3.6e6);
        const b = new Date(day.date + r.to * 3.6e6);
        return f.formatRange ? f.formatRange(a, b) : `${f.format(a)}–${f.format(b)}`;
      })
      .join(", ");
  }

  _dayName(date) {
    const idx = Math.round((date - startOfDay(Date.now())) / DAY_MS);
    if (idx === 0) return this._t("today");
    if (idx === 1) return this._t("tomorrow");
    const s = new Intl.DateTimeFormat(this._locale(), { weekday: "long" }).format(new Date(date));
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // "Today: tight 08:00–09:00, 18:00–20:00", "Tomorrow: normal".
  _dayLine(day) {
    if (!day) return null;
    const name = this._dayName(day.date);
    if (day.level === null) return { cls: "idle", icon: ICONS.clock, text: this._t("day_unknown", { day: name }) };
    const ranges = this._rangesText(day, day.level === 3 ? 3 : 2);
    const key = `day_${day.level}`;
    const text = ranges && day.level >= 2 ? this._t(day.level === 3 ? "day_cut_hours" : "day_tight_hours", { day: name, hours: ranges }) : this._t(key, { day: name });
    return { cls: LEVEL_CLASS[day.level], icon: ICONS[LEVEL_ICON[day.level]], text, entity: day.entity };
  }

  // The first hour from now at a level of 2 or more: { at, level, entity }.
  _nextTight(days) {
    const nowH = Date.now();
    for (const d of days) {
      if (!d) continue;
      for (let h = 0; h < 24; h++) {
        const at = d.date + h * 3.6e6;
        if (at + 3.6e6 <= nowH) continue;
        const l = d.hours ? d.hours[h] : null;
        if (l !== null && l >= 2) return { at, level: l, entity: d.entity };
      }
      if (!d.hours && d.level !== null && d.level >= 2 && d.date > nowH) return { at: d.date, level: d.level, entity: d.entity, day: true };
    }
    return null;
  }

  _summary(m) {
    const days = this._days(m);
    const now = this._nowLevel(m, days);
    const w = worst(days.filter(Boolean).map((d) => d.level));
    const alertDay = days.find((d) => d && d.level === w && w >= 2);
    let chip;
    if (!days.some(Boolean)) chip = { cls: "idle", text: this._t("no_data") };
    else if (w >= 2) chip = { cls: LEVEL_CLASS[w], text: this._t(w === 3 ? "chip_cut" : "chip_tight", { day: this._dayName(alertDay.date).toLowerCase() }), entity: alertDay.entity };
    else chip = { cls: "ok", text: this._t("no_alert") };
    const gen = days.filter(Boolean).map((d) => parseTime(this._s(d.entity)?.attributes?.generation_time ?? this._s(d.entity)?.attributes?.generation_date) ?? parseTime(this._s(d.entity)?.last_changed));
    const updated = gen.filter(Boolean).sort((a, b) => b - a)[0] ?? null;
    return { days, now, chip, next: this._nextTight(days), updated };
  }

  _subtitle(sum) {
    if (!sum.updated) return this._t("rte_signal");
    return this._t("updated", { when: fmtWhen(this._hass, this._config, sum.updated) });
  }

  _strip(day, mini = false) {
    const nowH = Date.now();
    const cells = [];
    for (let h = 0; h < 24; h++) {
      const l = day.hours ? day.hours[h] : day.level;
      const at = day.date + h * 3.6e6;
      const cls = l === null || l === undefined ? "none" : LEVEL_CLASS[l];
      const state = at + 3.6e6 <= nowH ? " past" : at <= nowH ? " now" : "";
      const label = `${fmtTime(this._hass, this._config, at)} · ${l === null || l === undefined ? this._t("no_data") : this._t(`level_${l}`)}`;
      cells.push(
        mini
          ? `<div class="hour ${cls}${state}" title="${esc(label)}"></div>`
          : `<div class="hour ${cls}${state}" role="button" tabindex="0" data-entity="${esc(day.entity)}" data-hour="${h}" title="${esc(label)}" aria-label="${esc(label)}"></div>`,
      );
    }
    return `<div class="${mini ? "mini-strip" : "strip"}" role="img" aria-label="${esc(this._dayName(day.date))}">${cells.join("")}</div>`;
  }

  _axis(day) {
    const f = this._hourFmt();
    return `<div class="axis">${[0, 6, 12, 18, 24].map((h) => `<span>${esc(f.format(new Date(day.date + h * 3.6e6)))}</span>`).join("")}</div>`;
  }

  _notes(day) {
    if (!day || day.level === null || day.level < 2) return "";
    const out = [];
    if (!this._rangesText(day)) out.push(`<div class="strip-note ${LEVEL_CLASS[day.level]}">${esc(this._t("hours_unknown"))}</div>`);
    if (day.message) out.push(`<div class="strip-note ${LEVEL_CLASS[day.level]}">${esc(day.message)}</div>`);
    return out.join("");
  }

  // One row a day: today and tomorrow hour by hour (show_hours), then the next days (show_days).
  _forecast(days) {
    const c = this._config;
    const rows = [];
    const shown = [];
    let notes = "";
    days.forEach((d, i) => {
      if (!d || (i < 2 && c.show_hours === false) || (i >= 2 && c.show_days === false)) return;
      shown.push(d);
      const short = new Intl.DateTimeFormat(this._locale(), { weekday: "short" }).format(new Date(d.date));
      rows.push(`<span class="dname${i === 0 ? " today" : ""} clickable"${moreInfo(d.entity)}><span class="long">${esc(this._dayName(d.date))}</span><span class="short">${esc(short)}</span></span>${this._strip(d)}`);
      notes += this._notes(d);
    });
    if (!rows.length) return "";
    const first = shown[0];
    const seen = new Set(shown.flatMap((d) => (d.hours || [d.level]).filter((l) => l !== null && l !== undefined)));
    const legend = [1, 2, 3, 0].filter((l) => seen.has(l)).map((l) => `<span class="${LEVEL_CLASS[l]}"><i></i>${esc(this._t(`level_${l}`))}</span>`);
    return this._section(
      "forecast",
      ICONS.calendar,
      this._t("forecast"),
      "",
      `<div class="grid">${rows.join("")}<span></span>${this._axis(first)}${notes ? `<div class="notes">${notes}</div>` : ""}<div class="legend">${legend.join("")}</div></div>`,
    );
  }

  _lines(sum) {
    const out = [];
    const [today, tomorrow] = sum.days;
    for (const d of [today, tomorrow]) {
      const l = this._dayLine(d);
      if (l) out.push(`<div class="line ${l.cls}${l.entity ? " clickable" : ""}"${moreInfo(l.entity)}>${svgIcon(l.icon)}<span>${esc(l.text)}</span></div>`);
    }
    const n = sum.next;
    if (n) {
      const when = n.day ? this._dayName(n.at).toLowerCase() : fmtWhen(this._hass, this._config, n.at);
      const text = n.at <= Date.now() ? this._t(n.level === 3 ? "cut_now" : "tight_now") : this._t(n.level === 3 ? "next_cut" : "next_tight", { when });
      out.push(`<div class="line ${LEVEL_CLASS[n.level]} clickable"${moreInfo(n.entity)}>${svgIcon(ICONS.calendar)}<span>${esc(text)}</span></div>`);
    } else if (!n && sum.days.some(Boolean)) out.push(`<div class="line">${svgIcon(ICONS.calendar)}<span>${esc(this._t("no_tight_ahead"))}</span></div>`);
    return out.join("");
  }

  // The 24 hours of today round a clock (midnight on top), the hand on the current hour, the level in the middle.
  _dial(sum) {
    const day = sum.days[0];
    const l = sum.now.level;
    const now = new Date();
    const cur = now.getHours() + now.getMinutes() / 60;
    const pt = (h, r) => {
      const a = (h / 24) * 2 * Math.PI - Math.PI / 2;
      return [(60 + r * Math.cos(a)).toFixed(1), (60 + r * Math.sin(a)).toFixed(1)];
    };
    const segs = [];
    for (let h = 0; h < 24; h++) {
      const lv = day ? (day.hours ? day.hours[h] : day.level) : null;
      const [x0, y0] = pt(h + 0.06, 50);
      const [x1, y1] = pt(h + 0.94, 50);
      const cls = lv === null || lv === undefined ? "none" : LEVEL_CLASS[lv];
      segs.push(`<path class="seg ${cls}${h + 1 <= cur ? " past" : ""}" d="M${x0} ${y0} A50 50 0 0 1 ${x1} ${y1}"/>`);
    }
    const ticks = [0, 6, 12, 18].map((h) => {
      const [x, y] = pt(h, 33);
      return `<text class="tick" x="${x}" y="${y}">${h}</text>`;
    });
    const [hx, hy] = pt(cur, 58);
    const [bx, by] = pt(cur, 17);
    const cls = l === null ? "idle" : LEVEL_CLASS[l];
    const word = l === null ? this._t("no_data") : this._t(`now_${l}`);
    const target = sum.now.entity ? ` class="dial clickable"${moreInfo(sum.now.entity)}` : ` class="dial" role="img"`;
    return `<div${target} aria-label="${esc(word)}"><svg viewBox="0 0 120 120">${segs.join("")}${ticks.join("")}<line class="hand" x1="${bx}" y1="${by}" x2="${hx}" y2="${hy}"/></svg><div class="core ${cls}">${svgIcon(ICONS[LEVEL_ICON[l ?? 1]])}</div></div>`;
  }

  _hero(sum) {
    const l = sum.now.level;
    const cls = l === null ? "idle" : LEVEL_CLASS[l];
    const word = l === null ? this._t("no_data") : this._t(`now_${l}`);
    return `<div class="hero">
      ${this._dial(sum)}
      <div class="hero-body"><span class="hero-kick">${esc(this._t("right_now", { time: fmtTime(this._hass, this._config, Date.now()) }))}</span><div class="big verdict ${cls}"><b>${esc(word)}</b></div>${this._lines(sum)}</div>
    </div>`;
  }

  // The header: the illustrated banner (the grid in the signal's colour, day or night), or the classic header
  // (illustration: false). The icon's colour follows the current level, grey when it is unknown.
  _head(sum, sub) {
    const l = sum.now.level;
    const icon = ICONS[LEVEL_ICON[l ?? 1]];
    // The icon takes the colour of the status pill: the worst signal of today and tomorrow.
    const cls = sum.chip.cls;
    const title = this._config.title || "EcoWatt";
    if (this._config.illustration === false) return this._header({ icon, cls, title, sub, chip: sum.chip });
    const night = ewIsNight(this._hass, this._config) ? " night" : "";
    return `<div class="banner lv-${l === null || l === undefined ? "none" : LEVEL_CLASS[l]}${night}">${ewSceneSvg()}<div class="ew-ground"></div>
      <div class="htext"><div class="type-icon ${cls}">${svgIcon(icon)}</div>${this._titles(title, sub, sum.chip)}</div>${this._zoomButton()}</div>`;
  }

  _bannerStyle() {
    return this._config.illustration === false ? "" : EW_BANNER_STYLE;
  }

  _emptyKey(m) {
    return m.days.length || m.calendar ? null : "no_data_found";
  }

  _render() {
    const { m, error } = this._ready();
    if (error) return error;
    const sum = this._summary(m);
    const parts = [this._hero(sum), this._forecast(sum.days)];
    return `<style>${BASE_STYLE}${ECO_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._head(sum, this._subtitle(sum))}
        <div class="content">${parts.join("")}</div>
      </ha-card>`;
  }
}

export class EcoWattMiniCard extends withMini(EcoWattCard) {
  static getConfigElement() {
    return document.createElement("ecowatt-mini-card-editor");
  }

  _renderMini() {
    const { m, error } = this._ready();
    if (error) return error;
    const sum = this._summary(m);
    // The day to watch: today, or tomorrow when only tomorrow is tight.
    const [today, tomorrow] = sum.days;
    const focus = today && (today.level ?? 0) < 2 && tomorrow && (tomorrow.level ?? 0) >= 2 ? tomorrow : today || tomorrow;
    const strip = focus && this._config.show_hours !== false ? this._strip(focus, true) : "";
    return `<style>${BASE_STYLE}${ECO_STYLE}${MINI_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._head(sum, "")}
        <div class="content mini">
          ${this._dial(sum)}
          <div class="info">${this._lines(sum)}${strip}</div>
        </div>
      </ha-card>`;
  }
}
