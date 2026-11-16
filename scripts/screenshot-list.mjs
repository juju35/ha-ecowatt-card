// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every capture has a twin in the other theme ("-dark" for a light capture) that shows exactly the same state: only
// the theme differs (checked by test/screenshots.test.mjs). `variant` picks the mock data (scripts/mock-states.mjs).
const twins = (list) => list.flatMap((s) => [{ ...s, theme: "light" }, { ...s, file: `${s.file}-dark`, theme: "dark" }]);

export const shots = twins([
  { file: "card", type: "ecowatt-card", width: 460, config: {} },
  { file: "card-cut", type: "ecowatt-card", width: 460, config: { show_days: false }, variant: "cut" },
  { file: "mini-card", type: "ecowatt-mini-card", width: 380, config: {} },
  { file: "mini-card-tight", type: "ecowatt-mini-card", width: 380, config: {}, variant: "tight" },
  { file: "mini-card-zoom", type: "ecowatt-mini-card", width: 460, config: {}, clicks: [".zoom"] },
  // Narrow cards: the full card at 6 columns of a phone's Sections view and the mini card at its minimum width.
  { file: "card-narrow", type: "ecowatt-card", width: 238, config: { show_days: false } },
  { file: "mini-card-narrow", type: "ecowatt-mini-card", width: 170, config: {} },
]);

// One looping GIF per distinct animated state:
//   tight — the grid is tight now: a wave goes out of the medal, the current hour pulses
//   cut   — power cuts now: the medal's icon blinks, the wave goes out, the current hour pulses
export const gifs = twins([
  { file: "tight", type: "ecowatt-card", width: 460, config: { show_days: false, collapsed: ["tomorrow"] }, variant: "tight" },
  { file: "cut", type: "ecowatt-card", width: 460, config: { show_days: false, collapsed: ["tomorrow"] }, variant: "cut" },
]);
