# Changelog

## 1.0.0 - 2026-11-16

First release.

### Features
- **EcoWatt Card** (`custom:ecowatt-card`): the level now in a medal (low-carbon, normal, tight grid, power cuts), today's and tomorrow's 24 hours as bars with the current hour outlined, the tight hours in words, the next tight period and the next days as tiles; collapsible sections.
- **EcoWatt Mini Card** (`custom:ecowatt-mini-card`): compact view with today, tomorrow, the next tight period and the hours of the day to watch; the detail button switches to the full card.
- Levels from My EcoWatt by RTE (day and hourly sensors, and its calendar of tight hours), ecowatt (hourly attributes) and MyElectricalData (MQTT sensors with their forecast), found through the entity registry; any sensor in `days`.
- Animations while the grid is tight (a wave out of the medal, the current hour pulsing) and during power cuts (the medal's icon blinking); tight and cut hours hatched, told apart without the colours.
- Visual editor for both cards; light and dark themes; 22 languages, English in the bundle and every other language in its own file loaded on demand.
