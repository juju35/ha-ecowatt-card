# Changelog

## 1.1.0 - 2026-11-16

### Features
- New look, in line with the other cards: a 24-hour dial of today (each hour in its level's colour, the hand on the current hour, the level now in the middle) beside the level in large and its lines.
- The hours become a 4-day forecast grid, one row a day with a legend of the levels shown, in a single `forecast` section (the `today`, `tomorrow` and `next_days` sections are gone from `collapsed`).
- Mini card: a small dial of today beside the lines.

### Fixes
- My EcoWatt by RTE as set up by default (only today's day sensor): tomorrow and the next days now come from its calendar of downgraded levels.
- ecowatt: renamed day sensors are found by their name (Aujourd'hui, Demain, J+2, J+3).

## 1.0.0 - 2026-11-16

First release.

### Features
- **EcoWatt Card** (`custom:ecowatt-card`): the level now in a medal (low-carbon, normal, tight grid, power cuts), today's and tomorrow's 24 hours as bars with the current hour outlined, the tight hours in words, the next tight period and the next days as tiles; collapsible sections.
- **EcoWatt Mini Card** (`custom:ecowatt-mini-card`): compact view with today, tomorrow, the next tight period and the hours of the day to watch; the detail button switches to the full card.
- Levels from My EcoWatt by RTE (day and hourly sensors, and its calendar of tight hours), ecowatt (hourly attributes) and MyElectricalData (MQTT sensors with their forecast), found through the entity registry; any sensor in `days`.
- Animations while the grid is tight (a wave out of the medal, the current hour pulsing) and during power cuts (the medal's icon blinking); tight and cut hours hatched, told apart without the colours.
- Visual editor for both cards; light and dark themes; 22 languages, English in the bundle and every other language in its own file loaded on demand.
