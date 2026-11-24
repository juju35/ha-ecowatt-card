/*
 * EcoWatt Card for Home Assistant
 * https://github.com/juju35/ha-ecowatt-card
 *
 * Lovelace cards for EcoWatt, the signal of the French electricity grid published by RTE: today's and tomorrow's
 * level hour by hour, the next days and the next tight period. The levels come from the My EcoWatt by RTE
 * integration (daily and hourly sensors, and its calendar of tight hours), the ecowatt integration (hourly
 * attributes) or MyElectricalData (MQTT sensors with their forecast), found through the entity registry; any
 * sensor giving a level can also be set in the configuration.
 */

export const VERSION = "__VERSION__";

export const CARD_ICONS = {
  bolt: "M11 15H6L13 1V9H18L11 23V15Z",
  leaf: "M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z",
  alert: "M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z",
  power_off: "M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13M3,3L21,21",
  calendar: "M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z",
  clock: "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z",
};

// Levels of the EcoWatt signal: 0 low-carbon electricity, 1 normal, 2 tight grid (cuts possible), 3 cuts planned.
export const LEVEL_CLASS = ["low", "ok", "warn", "crit"];
export const LEVEL_ICON = ["leaf", "bolt", "alert", "power_off"];
// How many days the card shows (the signal covers today and the next three days).
export const MAX_DAYS = 4;
