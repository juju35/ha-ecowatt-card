// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const ECO_STYLE = `
  .low { --c: #00acc1; }
  /* The dial: the 24 hours of today round a clock, the hand on the current hour, the level in the middle. */
  .dial { position: relative; width: 120px; height: 120px; flex: none; }
  .dial svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .dial .seg { fill: none; stroke-width: 12; stroke: color-mix(in srgb, var(--c, var(--ew-idle)) 85%, transparent); }
  .dial .seg.none { stroke: var(--divider-color, rgba(127,127,127,.25)); }
  .dial .seg.past { opacity: .35; }
  .dial .tick { font-size: 8px; fill: var(--secondary-text-color); text-anchor: middle; dominant-baseline: central; }
  .dial .hand { stroke: var(--primary-text-color); stroke-width: 2.5; stroke-linecap: round; }
  .core { position: absolute; left: 37%; top: 37%; width: 26%; height: 26%; border-radius: 50%; display: grid; place-items: center;
          background: var(--c); color: #fff; }
  /* A dark icon on the light orange and teal: the white one would not read. */
  .core.warn, .core.low { color: rgba(0, 0, 0, .78); }
  .core .icon { width: 18px; height: 18px; }
  .core.warn::before, .core.crit::before { content: ""; position: absolute; inset: -2px; border-radius: 50%; border: 2px solid var(--c);
                                            animation: ew-wave 2s ease-out infinite; }
  .core.crit .icon { animation: ew-blink 1.2s steps(2, jump-none) infinite; }
  @keyframes ew-wave { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(1.9); opacity: 0; } }
  @keyframes ew-blink { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
  .verdict b { color: color-mix(in srgb, var(--c) 60%, var(--primary-text-color)); }
  /* The forecast: one row a day, 24 hours a row. */
  .grid { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 5px 10px; align-items: center; }
  .grid .dname { font-size: 12.5px; color: var(--secondary-text-color); white-space: nowrap; max-width: 90px; overflow: hidden; text-overflow: ellipsis; }
  .grid .dname.today { color: var(--primary-text-color); font-weight: 500; }
  .strip { display: grid; grid-template-columns: repeat(24, minmax(0, 1fr)); gap: 2px; }
  .hour { height: 18px; border-radius: 3px; background: color-mix(in srgb, var(--c, var(--ew-idle)) 85%, transparent); position: relative; cursor: pointer; }
  .hour.none { background: var(--divider-color, rgba(127,127,127,.25)); }
  .hour.past { opacity: .3; }
  .hour.now { box-shadow: 0 0 0 2px var(--card-background-color, #fff), 0 0 0 4px var(--primary-text-color); z-index: 1; }
  .hour.now.warn, .hour.now.crit { animation: ew-pulse 1.4s ease-in-out infinite; }
  @keyframes ew-pulse { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.35); } }
  /* Tight and cut hours are hatched as well as coloured: told apart without the colours. */
  .hour.warn { background-image: repeating-linear-gradient(135deg, transparent 0 4px, rgba(255,255,255,.28) 4px 6px); }
  .hour.crit { background-image: repeating-linear-gradient(45deg, transparent 0 3px, rgba(0,0,0,.25) 3px 5px); }
  .axis { display: flex; justify-content: space-between; font-size: 11px; color: var(--secondary-text-color); }
  .notes { grid-column: 2; display: flex; flex-direction: column; gap: 2px; }
  .strip-note { font-size: 12px; color: var(--secondary-text-color); }
  .strip-note.warn, .strip-note.crit { color: color-mix(in srgb, var(--c) 60%, var(--primary-text-color)); }
  .legend { grid-column: 2; display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; }
  .legend span { display: inline-flex; align-items: center; gap: 5px; }
  .legend i { width: 9px; height: 9px; border-radius: 2px; background: var(--c); }
  .grid .dname .short { display: none; }
  .mini-strip { display: grid; grid-template-columns: repeat(24, minmax(0, 1fr)); gap: 1px; margin-top: 2px; }
  .mini-strip .hour { height: 8px; border-radius: 2px; cursor: default; }
  .mini-strip .hour.now { box-shadow: 0 0 0 1px var(--card-background-color, #fff), 0 0 0 2px var(--primary-text-color); }
  .content.mini .dial { width: 84px; height: 84px; }
  .content.mini .dial .tick { display: none; }
  .content.mini .dial .seg { stroke-width: 10; }
  @container (max-width: 300px) {
    .dial { width: 88px; height: 88px; }
    .dial .tick { display: none; }
    .big b { font-size: 24px; }
    .strip { gap: 1px; }
    .axis span:nth-child(even) { visibility: hidden; }
    .grid { column-gap: 6px; }
    .grid .dname .long { display: none; }
    .grid .dname .short { display: inline; }
    .hero .line span { white-space: normal; overflow-wrap: anywhere; }
  }
  @container (max-width: 260px) {
    .hero > .dial { display: none; }
  }
  @container (max-width: 200px) {
    .content.mini > .dial { display: none; }
  }
`;

// ---------------------------------------------------------------------------
// The illustration: the grid at the right of a 90 px banner (200 × 80 picture over a 10 px lawn strip): wind
// turbines, pylons and a line whose pulse takes the signal's colour (teal low-carbon, green normal, orange tight,
// red cuts). The turbines slow down as the grid tightens and stop during cuts; a beacon on the middle pylon
// blinks when the grid is tight or cut. The left of the banner is open sky for the title.
// No SVG id is used: several cards on one page cannot clash.
// ---------------------------------------------------------------------------

export const EW_STARS = [
  [12, 8],
  [44, 18],
  [96, 6],
  [132, 24],
  [168, 10],
  [188, 30],
  [70, 30],
];
export const EW_PYLONS = [
  [110, 30],
  [150, 22],
  [190, 30],
];
export const EW_TURBINES = [
  [60, 36],
  [82, 44],
];
export const EW_LINE = "M96 34 Q103 34 110 30 Q130 37 150 22 Q170 37 190 30 Q196 31 200 33";

export const ewSceneSvg = () => {
  const stars = EW_STARS.map(([x, y], i) => `<circle class="ew-star${i % 3 ? "" : " tw"}" cx="${x}" cy="${y}" r=".6"/>`).join("");
  const pylons = EW_PYLONS.map(([x, y]) => `<path class="ew-pylon" d="M${x - 7} 80 L${x} ${y} L${x + 7} 80 M${x - 4} ${y + 10} h8 M${x - 5} ${y + 22} h10 M${x - 5.6} ${y + 34} h11.2"/>`).join("");
  const turbines = EW_TURBINES.map(
    ([x, y]) =>
      `<path class="ew-mast" d="M${x} 80 V${y}"/><g class="ew-rotor" style="transform-origin:${x}px ${y}px"><path d="M${x} ${y} l0 -12 M${x} ${y} l10.4 6 M${x} ${y} l-10.4 6"/></g><circle class="ew-hub" cx="${x}" cy="${y}" r="1.4"/>`,
  ).join("");
  return `<svg class="ew-scene" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
    <g class="ew-night">${stars}<circle class="ew-moon" cx="30" cy="14" r="5.5"/><circle class="ew-moon-cut" cx="32.5" cy="12" r="4.5"/></g>
    <g class="ew-day"><circle class="ew-glow" cx="30" cy="14" r="9"/><circle class="ew-sun" cx="30" cy="14" r="6"/></g>
    <g transform="translate(70 12)"><path class="ew-cloud" d="M-14,4 C-17,4 -18,0 -14.5,-1 C-14,-5 -8,-6 -6,-3 C-4,-8 4,-8 5,-2 C9,-3 12,0 10,4 Z"/></g>
    <path class="ew-hill far" d="M0,80 C30,70 60,64 100,66 C140,68 170,60 200,62 L200,80Z"/>
    <path class="ew-hill" d="M0,80 C40,74 90,75 200,72 L200,80Z"/>
    ${turbines}${pylons}
    <path class="ew-wire" d="${EW_LINE}"/><path class="ew-pulse" d="${EW_LINE}"/>
    <circle class="ew-beacon" cx="150" cy="20" r="1.8"/>
  </svg>`;
};

export const EW_BANNER_STYLE = `
  .banner { position: relative; overflow: hidden; height: 90px; --ew-g: 10px; --ew-scene-w: min(200px, 38%);
            color: #0d2a45; --ew-sky-muted: #3b5b78; --ew-line: var(--ew-idle);
            background: linear-gradient(90deg, #f1f8ff 0%, #e2f1fd 34%, #b9def8 70%, #9fd0f3 100%); }
  .banner.night { color: #fff; --ew-sky-muted: rgba(255,255,255,.78);
                  background: linear-gradient(90deg, #1b2f52 0%, #15284a 36%, #0f1f3d 72%, #0a1830 100%); }
  .banner.lv-low { --ew-line: #00acc1; } .banner.lv-ok { --ew-line: #43c463; }
  .banner.lv-warn { --ew-line: #ffa600; } .banner.lv-crit { --ew-line: #e5484d; }
  .ew-scene { position: absolute; right: 0; bottom: var(--ew-g); height: calc(100% - var(--ew-g)); width: var(--ew-scene-w); }
  /* The lawn strip, edge to edge under the whole banner. */
  .ew-ground { position: absolute; left: 0; right: 0; bottom: 0; height: var(--ew-g);
               background: repeating-linear-gradient(90deg, #5aa83d 0 22px, #6cbb4c 22px 44px); }
  .night .ew-ground { background: repeating-linear-gradient(90deg, #1f4a2a 0 22px, #245433 22px 44px); }
  .ew-night, .night .ew-day { display: none; }
  .night .ew-night { display: inline; }
  .ew-star { fill: #fff; opacity: .8; } .ew-star.tw { animation: ew-twinkle 3.2s ease-in-out infinite alternate; }
  .ew-moon { fill: #f3eed2; } .ew-moon-cut { fill: #13254a; }
  .ew-sun { fill: #ffd65a; } .ew-glow { fill: #ffd65a; opacity: .28; }
  .ew-cloud { fill: #fff; opacity: .92; animation: ew-drift 4s ease-in-out infinite alternate; }
  .night .ew-cloud { opacity: .1; }
  .ew-hill { fill: #86c27f; } .ew-hill.far { fill: #a7d39f; }
  .night .ew-hill { fill: #17303d; } .night .ew-hill.far { fill: #1d3a4a; }
  .ew-pylon { stroke: #5f6b7a; stroke-width: 1.2; fill: none; stroke-linejoin: round; } .night .ew-pylon { stroke: #7d8793; }
  .ew-mast { stroke: #e9edf1; stroke-width: 1.6; } .night .ew-mast { stroke: #c4ccd6; }
  .ew-rotor { transform-box: view-box; animation: ew-spin 3s linear infinite; }
  .ew-rotor path { stroke: #fff; stroke-width: 1.6; stroke-linecap: round; fill: none; } .night .ew-rotor path { stroke: #dfe5ec; }
  .ew-hub { fill: #9aa3ae; }
  .ew-wire { stroke: #8a939c; stroke-width: .9; fill: none; } .night .ew-wire { stroke: #4a5568; }
  .ew-pulse { stroke: var(--ew-line); stroke-width: 1.5; fill: none; stroke-linecap: round; stroke-dasharray: 4 26; animation: ew-flow 1.4s linear infinite; }
  .ew-beacon { fill: var(--ew-line); display: none; }
  .lv-low .ew-rotor { animation-duration: 1.8s; }
  .lv-warn .ew-rotor { animation-duration: 6s; }
  .lv-crit .ew-rotor, .lv-none .ew-rotor { animation: none; }
  .lv-warn .ew-pulse { animation-duration: .9s; }
  .lv-crit .ew-pulse { stroke-dasharray: 6 6; animation: ew-flow .9s linear infinite, ew-blink 1.2s steps(2, jump-none) infinite; }
  .lv-none .ew-pulse { display: none; }
  .lv-warn .ew-beacon, .lv-crit .ew-beacon { display: inline; animation: ew-blink 1.2s steps(2, jump-none) infinite; }
  .lv-warn .ew-beacon, .lv-crit .ew-beacon { filter: drop-shadow(0 0 1.5px var(--ew-line)); }
  @keyframes ew-spin { to { transform: rotate(360deg); } }
  @keyframes ew-flow { to { stroke-dashoffset: -30; } }
  @keyframes ew-drift { to { transform: translateX(4px); } }
  @keyframes ew-twinkle { from { opacity: .3; } to { opacity: 1; } }
  /* The title on the sky, left of the scene: the round icon (its colour follows the signal), the name, the status. */
  .htext { position: absolute; z-index: 1; left: 0; top: 0; bottom: var(--ew-g); right: calc(var(--ew-scene-w) + 4px);
           display: flex; align-items: center; gap: 10px; padding: 8px 8px 8px 14px; min-width: 0; box-sizing: border-box; }
  .banner .type-icon { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ew-tint) 22%, transparent); }
  .banner .type-icon .icon { fill: color-mix(in srgb, var(--ew-tint) 82%, #0d2a45); }
  .banner.night .type-icon { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner.night .type-icon .icon { fill: color-mix(in srgb, var(--ew-tint) 78%, #fff); }
  .banner .titles { display: flex; flex-direction: column; justify-content: center; gap: 2px; }
  .banner .name { font-size: 16px; font-weight: 500; line-height: 1.2; }
  .banner .sub { color: var(--ew-sky-muted); font-size: 12px; min-width: 0; }
  .banner .chip { line-height: 16px; background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .chip { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .banner .zoom { color: #33506b; background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7);
                  -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
  .banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); }
  .banner + .content { padding-top: 12px; }
  /* Narrow card: no room for the scene beside the text, the sky and the lawn stay. */
  @container (max-width: 300px) { .ew-scene { display: none; } .htext { right: 34px; } }
`;

// Night picture: forced by illustration_theme, else the sun below the horizon or Home Assistant's dark theme.
// The width of an element's whole text in fractional pixels, even while it is cut with an ellipsis (0 when hidden).
export const textWidth = (el) => {
  if (!el?.getClientRects?.().length || typeof document.createRange !== "function") return 0;
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
};

// Night picture: forced by illustration_theme, else Home Assistant's dark mode alone (a light theme keeps the day
// picture after sunset).
export const ewIsNight = (hass, config) => {
  const theme = config?.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};
