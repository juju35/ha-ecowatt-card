# Changelog

## 1.2.0 - 2026-11-17

### Features
- Animated illustrated header on the full and mini cards (90 px): the title on the sky, the grid at the right (wind turbines, pylons, power line) over a lawn strip. The pulse along the line takes the level's colour (teal, green, orange, red), the turbines slow down as the grid tightens and stop during cuts, and a beacon blinks on the middle pylon when the grid is tight or cut. The header icon takes the colour of the status pill (the worst level of today and tomorrow, grey when unknown).
- Status pill on the title line, right after the title only when the whole title and its whole label fit there, otherwise on its own line under the subtitle (then kept to one line), and only its dot when even that does not fit in the banner or the card is 200 px wide or less (measured on the rendered card, so that it fits in every language); "No data" when nothing is published yet. The mini card's detail button is a 24 px round glass button in the top right corner of the header.
- Night picture after sunset (`sun.sun`) or with the dark theme, forced with the new `illustration_theme` option (`auto`, `day`, `night`); `illustration: false` keeps the classic header. Both options are in the visual editors.
- Night picture with the dark theme even while the sun is up

## 1.1.0 - 2026-11-16

### Features
- New look, in line with the other cards: a 24-hour dial of today (each hour in its level's colour, the hand on the current hour, the level now in the middle) beside the level in large and its lines.
- The hours become a 4-day forecast grid, one row a day with a legend of the levels shown, in a single `forecast` section (the `today`, `tomorrow` and `next_days` sections are gone from `collapsed`).
- Mini card: a small dial of today beside the lines, above the strip of the day to watch.

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
