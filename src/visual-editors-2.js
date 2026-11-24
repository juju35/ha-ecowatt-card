// ---------------------------------------------------------------------------
// Visual editors
// ---------------------------------------------------------------------------
import { VERSION } from "./core.js";
import { asList, t } from "./helpers.js";
import { EditorBase } from "./visual-editors.js";
import { register } from "./register.js";
import { EcoWattCard, EcoWattMiniCard } from "./cards.js";

export class EcoWattCardEditor extends EditorBase {
  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_hours", true],
      ["show_days", true],
    ];
  }

  static get sections() {
    return ["forecast"];
  }

  static get defaults() {
    return { illustration_theme: "auto" };
  }

  _fields() {
    const tr = (k) => t(this._hass, this._config, k);
    // `days` written as objects ({ entity, attribute }) is YAML-only: the entity picker would drop the attributes.
    const days = asList(this._config.days);
    return [
      ...(days.every((d) => typeof d === "string") ? [{ name: "days", selector: { entity: { multiple: true, domain: "sensor" } } }] : []),
      { name: "now", selector: { entity: { domain: "sensor" } } },
      { name: "calendar", selector: { entity: { domain: "calendar" } } },
      { name: "illustration_theme", selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: tr(`theme_${value}`) })) } } },
    ];
  }
}

// The mini card's detail view is the full card: its editor offers the full card's options, plus the detail button.
export class EcoWattMiniCardEditor extends EcoWattCardEditor {
  static get toggles() {
    return [...EcoWattCardEditor.toggles, ["zoom", true]];
  }
}

register(
  [
    ["ecowatt-card", EcoWattCard, { name: "EcoWatt Card", description: "EcoWatt signal of the French grid (RTE): today and tomorrow hour by hour, the next days and the next tight period." }],
    ["ecowatt-mini-card", EcoWattMiniCard, { name: "EcoWatt Mini Card", description: "Compact EcoWatt signal: today, tomorrow, the next tight period and the day's hours." }],
    ["ecowatt-card-editor", EcoWattCardEditor],
    ["ecowatt-mini-card-editor", EcoWattMiniCardEditor],
  ],
  "https://github.com/juju35/ha-ecowatt-card",
);

console.info(`%c ECOWATT-CARD %c v${VERSION} `, "color: white; background: #43a047; font-weight: 700;", "color: #43a047; background: white; font-weight: 700;");
