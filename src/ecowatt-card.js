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

const VERSION = "__VERSION__";

const CARD_ICONS = {
  bolt: "M11 15H6L13 1V9H18L11 23V15Z",
  leaf: "M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z",
  alert: "M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z",
  power_off: "M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13M3,3L21,21",
  calendar: "M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z",
  clock: "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z",
};

// Levels of the EcoWatt signal: 0 low-carbon electricity, 1 normal, 2 tight grid (cuts possible), 3 cuts planned.
const LEVEL_CLASS = ["low", "ok", "warn", "crit"];
const LEVEL_ICON = ["leaf", "bolt", "alert", "power_off"];
// How many days the card shows (the signal covers today and the next three days).
const MAX_DAYS = 4;

const STRINGS = {
  en: {
    today: "Today",
    tomorrow: "Tomorrow",
    next_days: "Next days",
    level_0: "Low-carbon",
    level_1: "Normal",
    level_2: "Tight",
    level_3: "Power cuts",
    now_0: "Low-carbon power",
    now_1: "Normal",
    now_2: "Tight grid",
    now_3: "Power cuts",
    day_0: "{day}: low-carbon electricity",
    day_1: "{day}: normal",
    day_2: "{day}: tight grid",
    day_3: "{day}: power cuts planned",
    day_tight_hours: "{day}: tight {hours}",
    day_cut_hours: "{day}: cuts {hours}",
    day_unknown: "{day}: not published yet",
    chip_tight: "Tight {day}",
    chip_cut: "Cuts {day}",
    no_alert: "No alert",
    next_tight: "Next tight period {when}",
    next_cut: "Power cuts planned {when}",
    tight_now: "Tight grid now: save power",
    cut_now: "Power cuts now",
    no_tight_ahead: "No tight period ahead",
    rte_signal: "RTE grid signal",
    updated: "Updated {when}",
    hours_unknown: "Tight hours not published yet",
    no_data: "No data",
    no_data_found: "No EcoWatt sensor found: install My EcoWatt by RTE, ecowatt or MyElectricalData, or set the day sensors in the card.",
    days: "Day sensors (today first; empty: automatic)",
    now: "Current hour sensor (optional)",
    calendar: "Calendar of tight hours (optional)",
    show_hours: "Show the hours of today and tomorrow",
    show_days: "Show the next days",
    forecast: "Forecast",
    right_now: "Now · {time}",
    cancel: "Cancel",
    left: "{time} left",
    today_at: "today {time}",
    tomorrow_at: "tomorrow {time}",
    yesterday_at: "yesterday {time}",
    zoom_in: "Show details",
    zoom_out: "Show less",
    title: "Title (optional)",
    language: "Language",
    lang_auto: "Automatic",
    collapsed: "Sections folded by default",
    zoom: "Detail button",
    zoom_helper: "Switches the mini card to the full card's content",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    no_registry: "This card needs Home Assistant 2024.8 or later.",
    illustration: "Animated illustration",
    illustration_theme: "Illustration theme",
    theme_auto: "Automatic (sun)",
    theme_day: "Day",
    theme_night: "Night",
    unavailable: "Unavailable",
  },
  fr: {
    today: "Aujourd'hui",
    tomorrow: "Demain",
    next_days: "Prochains jours",
    level_0: "Décarboné",
    level_1: "Normal",
    level_2: "Tendu",
    level_3: "Coupures",
    now_0: "Électricité décarbonée",
    now_1: "Normal",
    now_2: "Réseau tendu",
    now_3: "Coupures",
    day_0: "{day} : électricité décarbonée",
    day_1: "{day} : normal",
    day_2: "{day} : réseau tendu",
    day_3: "{day} : coupures programmées",
    day_tight_hours: "{day} : tendu {hours}",
    day_cut_hours: "{day} : coupures {hours}",
    day_unknown: "{day} : pas encore publié",
    chip_tight: "Tendu {day}",
    chip_cut: "Coupures {day}",
    no_alert: "Pas d'alerte",
    next_tight: "Prochaine période tendue {when}",
    next_cut: "Coupures programmées {when}",
    tight_now: "Réseau tendu : modérez votre consommation",
    cut_now: "Coupures en cours",
    no_tight_ahead: "Aucune période tendue à venir",
    rte_signal: "Signal RTE",
    updated: "Mis à jour {when}",
    hours_unknown: "Heures tendues pas encore publiées",
    no_data: "Pas de données",
    no_data_found: "Aucun capteur EcoWatt trouvé : installez My EcoWatt by RTE, ecowatt ou MyElectricalData, ou indiquez les capteurs des jours dans la carte.",
    days: "Capteurs des jours (aujourd'hui d'abord ; vide : automatique)",
    now: "Capteur de l'heure en cours (facultatif)",
    calendar: "Calendrier des heures tendues (facultatif)",
    show_hours: "Afficher les heures d'aujourd'hui et de demain",
    show_days: "Afficher les prochains jours",
    forecast: "Prévisions",
    right_now: "Maintenant · {time}",
    cancel: "Annuler",
    left: "{time} restantes",
    today_at: "aujourd'hui {time}",
    tomorrow_at: "demain {time}",
    yesterday_at: "hier {time}",
    zoom_in: "Afficher les détails",
    zoom_out: "Réduire",
    title: "Titre (facultatif)",
    language: "Langue",
    lang_auto: "Automatique",
    collapsed: "Sections repliées par défaut",
    zoom: "Bouton détail",
    zoom_helper: "Bascule la mini-carte vers le contenu de la carte complète",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    no_registry: "Cette carte nécessite Home Assistant 2024.8 ou plus récent.",
    illustration: "Illustration animée",
    illustration_theme: "Thème de l’illustration",
    theme_auto: "Automatique (soleil)",
    theme_day: "Jour",
    theme_night: "Nuit",
    unavailable: "Indisponible",
  },
  de: {
    today: "Heute",
    tomorrow: "Morgen",
    next_days: "Nächste Tage",
    level_0: "CO₂-arm",
    level_1: "Normal",
    level_2: "Angespannt",
    level_3: "Abschaltungen",
    now_0: "CO₂-armer Strom",
    now_1: "Normal",
    now_2: "Netz angespannt",
    now_3: "Abschaltungen",
    day_0: "{day}: CO₂-armer Strom",
    day_1: "{day}: normal",
    day_2: "{day}: Netz angespannt",
    day_3: "{day}: Abschaltungen geplant",
    day_tight_hours: "{day}: angespannt {hours}",
    day_cut_hours: "{day}: Abschaltungen {hours}",
    day_unknown: "{day}: noch nicht veröffentlicht",
    chip_tight: "Angespannt {day}",
    chip_cut: "Abschaltungen {day}",
    no_alert: "Keine Warnung",
    next_tight: "Nächste angespannte Zeit {when}",
    next_cut: "Abschaltungen geplant {when}",
    tight_now: "Netz angespannt: Strom sparen",
    cut_now: "Abschaltungen laufen",
    no_tight_ahead: "Keine angespannte Zeit in Sicht",
    rte_signal: "RTE-Netzsignal",
    updated: "Aktualisiert {when}",
    hours_unknown: "Angespannte Stunden noch nicht veröffentlicht",
    no_data: "Keine Daten",
    no_data_found: "Kein EcoWatt-Sensor gefunden: My EcoWatt by RTE, ecowatt oder MyElectricalData installieren oder die Tagessensoren in der Karte angeben.",
    days: "Tagessensoren (heute zuerst; leer: automatisch)",
    now: "Sensor der aktuellen Stunde (optional)",
    calendar: "Kalender der angespannten Stunden (optional)",
    show_hours: "Stunden von heute und morgen anzeigen",
    show_days: "Nächste Tage anzeigen",
    forecast: "Vorhersage",
    right_now: "Jetzt · {time}",
    cancel: "Abbrechen",
    left: "Noch {time}",
    today_at: "heute {time}",
    tomorrow_at: "morgen {time}",
    yesterday_at: "gestern {time}",
    zoom_in: "Details anzeigen",
    zoom_out: "Weniger anzeigen",
    title: "Titel (optional)",
    language: "Sprache",
    lang_auto: "Automatisch",
    collapsed: "Standardmäßig eingeklappte Bereiche",
    zoom: "Detail-Schaltfläche",
    zoom_helper: "Schaltet die Mini-Karte auf den Inhalt der vollen Karte um",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    no_registry: "Diese Karte benötigt Home Assistant 2024.8 oder neuer.",
    illustration: "Animierte Illustration",
    illustration_theme: "Thema der Illustration",
    theme_auto: "Automatisch (Sonne)",
    theme_day: "Tag",
    theme_night: "Nacht",
    unavailable: "Nicht verfügbar",
  },
  es: {
    today: "Hoy",
    tomorrow: "Mañana",
    next_days: "Próximos días",
    level_0: "Bajo en carbono",
    level_1: "Normal",
    level_2: "Tensa",
    level_3: "Cortes",
    now_0: "Electricidad baja en carbono",
    now_1: "Normal",
    now_2: "Red tensa",
    now_3: "Cortes",
    day_0: "{day}: electricidad baja en carbono",
    day_1: "{day}: normal",
    day_2: "{day}: red tensa",
    day_3: "{day}: cortes programados",
    day_tight_hours: "{day}: tensa {hours}",
    day_cut_hours: "{day}: cortes {hours}",
    day_unknown: "{day}: aún no publicado",
    chip_tight: "Tensa {day}",
    chip_cut: "Cortes {day}",
    no_alert: "Sin alerta",
    next_tight: "Próximo periodo tenso {when}",
    next_cut: "Cortes programados {when}",
    tight_now: "Red tensa: modere su consumo",
    cut_now: "Cortes en curso",
    no_tight_ahead: "Ningún periodo tenso a la vista",
    rte_signal: "Señal de RTE",
    updated: "Actualizado {when}",
    hours_unknown: "Horas tensas aún no publicadas",
    no_data: "Sin datos",
    no_data_found: "No se encontró ningún sensor EcoWatt: instale My EcoWatt by RTE, ecowatt o MyElectricalData, o indique los sensores de los días en la tarjeta.",
    days: "Sensores de los días (hoy primero; vacío: automático)",
    now: "Sensor de la hora actual (opcional)",
    calendar: "Calendario de horas tensas (opcional)",
    show_hours: "Mostrar las horas de hoy y mañana",
    show_days: "Mostrar los próximos días",
    forecast: "Previsión",
    right_now: "Ahora · {time}",
    cancel: "Cancelar",
    left: "Quedan {time}",
    today_at: "hoy {time}",
    tomorrow_at: "mañana {time}",
    yesterday_at: "ayer {time}",
    zoom_in: "Ver detalles",
    zoom_out: "Ver menos",
    title: "Título (opcional)",
    language: "Idioma",
    lang_auto: "Automático",
    collapsed: "Secciones plegadas por defecto",
    zoom: "Botón de detalle",
    zoom_helper: "Cambia la minitarjeta al contenido de la tarjeta completa",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    no_registry: "Esta tarjeta necesita Home Assistant 2024.8 o posterior.",
    illustration: "Ilustración animada",
    illustration_theme: "Tema de la ilustración",
    theme_auto: "Automático (sol)",
    theme_day: "Día",
    theme_night: "Noche",
    unavailable: "No disponible",
  },
  it: {
    today: "Oggi",
    tomorrow: "Domani",
    next_days: "Prossimi giorni",
    level_0: "Decarbonizzata",
    level_1: "Normale",
    level_2: "Tesa",
    level_3: "Interruzioni",
    now_0: "Elettricità decarbonizzata",
    now_1: "Normale",
    now_2: "Rete tesa",
    now_3: "Interruzioni",
    day_0: "{day}: elettricità decarbonizzata",
    day_1: "{day}: normale",
    day_2: "{day}: rete tesa",
    day_3: "{day}: interruzioni programmate",
    day_tight_hours: "{day}: tesa {hours}",
    day_cut_hours: "{day}: interruzioni {hours}",
    day_unknown: "{day}: non ancora pubblicato",
    chip_tight: "Tesa {day}",
    chip_cut: "Interruzioni {day}",
    no_alert: "Nessun avviso",
    next_tight: "Prossimo periodo teso {when}",
    next_cut: "Interruzioni programmate {when}",
    tight_now: "Rete tesa: riduci i consumi",
    cut_now: "Interruzioni in corso",
    no_tight_ahead: "Nessun periodo teso in vista",
    rte_signal: "Segnale RTE",
    updated: "Aggiornato {when}",
    hours_unknown: "Ore tese non ancora pubblicate",
    no_data: "Nessun dato",
    no_data_found: "Nessun sensore EcoWatt trovato: installa My EcoWatt by RTE, ecowatt o MyElectricalData, oppure indica i sensori dei giorni nella scheda.",
    days: "Sensori dei giorni (oggi per primo; vuoto: automatico)",
    now: "Sensore dell'ora corrente (facoltativo)",
    calendar: "Calendario delle ore tese (facoltativo)",
    show_hours: "Mostra le ore di oggi e domani",
    show_days: "Mostra i prossimi giorni",
    forecast: "Previsioni",
    right_now: "Ora · {time}",
    cancel: "Annulla",
    left: "{time} rimanenti",
    today_at: "oggi {time}",
    tomorrow_at: "domani {time}",
    yesterday_at: "ieri {time}",
    zoom_in: "Mostra dettagli",
    zoom_out: "Mostra meno",
    title: "Titolo (facoltativo)",
    language: "Lingua",
    lang_auto: "Automatica",
    collapsed: "Sezioni chiuse per impostazione predefinita",
    zoom: "Pulsante dettagli",
    zoom_helper: "Passa la mini scheda al contenuto della scheda completa",
    show_title: "Mostra titolo",
    show_subtitle: "Mostra sottotitolo",
    no_registry: "Questa scheda richiede Home Assistant 2024.8 o successivo.",
    illustration: "Illustrazione animata",
    illustration_theme: "Tema dell’illustrazione",
    theme_auto: "Automatico (sole)",
    theme_day: "Giorno",
    theme_night: "Notte",
    unavailable: "Non disponibile",
  },
  nl: {
    today: "Vandaag",
    tomorrow: "Morgen",
    next_days: "Komende dagen",
    level_0: "Koolstofarm",
    level_1: "Normaal",
    level_2: "Krap",
    level_3: "Afschakeling",
    now_0: "Koolstofarme stroom",
    now_1: "Normaal",
    now_2: "Krap net",
    now_3: "Afschakeling",
    day_0: "{day}: koolstofarme stroom",
    day_1: "{day}: normaal",
    day_2: "{day}: krap net",
    day_3: "{day}: afschakeling gepland",
    day_tight_hours: "{day}: krap {hours}",
    day_cut_hours: "{day}: afschakeling {hours}",
    day_unknown: "{day}: nog niet gepubliceerd",
    chip_tight: "Krap {day}",
    chip_cut: "Afschakeling {day}",
    no_alert: "Geen waarschuwing",
    next_tight: "Volgende krappe periode {when}",
    next_cut: "Afschakeling gepland {when}",
    tight_now: "Krap net: bespaar stroom",
    cut_now: "Afschakeling bezig",
    no_tight_ahead: "Geen krappe periode in zicht",
    rte_signal: "RTE-netsignaal",
    updated: "Bijgewerkt {when}",
    hours_unknown: "Krappe uren nog niet gepubliceerd",
    no_data: "Geen gegevens",
    no_data_found: "Geen EcoWatt-sensor gevonden: installeer My EcoWatt by RTE, ecowatt of MyElectricalData, of geef de dagsensoren op in de kaart.",
    days: "Dagsensoren (vandaag eerst; leeg: automatisch)",
    now: "Sensor van het huidige uur (optioneel)",
    calendar: "Agenda van krappe uren (optioneel)",
    show_hours: "Uren van vandaag en morgen tonen",
    show_days: "Komende dagen tonen",
    forecast: "Verwachting",
    right_now: "Nu · {time}",
    cancel: "Annuleren",
    left: "Nog {time}",
    today_at: "vandaag {time}",
    tomorrow_at: "morgen {time}",
    yesterday_at: "gisteren {time}",
    zoom_in: "Details tonen",
    zoom_out: "Minder tonen",
    title: "Titel (optioneel)",
    language: "Taal",
    lang_auto: "Automatisch",
    collapsed: "Standaard ingeklapte secties",
    zoom: "Detailknop",
    zoom_helper: "Schakelt de minikaart naar de inhoud van de volledige kaart",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    no_registry: "Deze kaart vereist Home Assistant 2024.8 of nieuwer.",
    illustration: "Geanimeerde illustratie",
    illustration_theme: "Thema van de illustratie",
    theme_auto: "Automatisch (zon)",
    theme_day: "Dag",
    theme_night: "Nacht",
    unavailable: "Niet beschikbaar",
  },
  pt: {
    today: "Hoje",
    tomorrow: "Amanhã",
    next_days: "Próximos dias",
    level_0: "Baixo carbono",
    level_1: "Normal",
    level_2: "Tensa",
    level_3: "Cortes",
    now_0: "Eletricidade de baixo carbono",
    now_1: "Normal",
    now_2: "Rede tensa",
    now_3: "Cortes",
    day_0: "{day}: eletricidade de baixo carbono",
    day_1: "{day}: normal",
    day_2: "{day}: rede tensa",
    day_3: "{day}: cortes programados",
    day_tight_hours: "{day}: tensa {hours}",
    day_cut_hours: "{day}: cortes {hours}",
    day_unknown: "{day}: ainda não publicado",
    chip_tight: "Tensa {day}",
    chip_cut: "Cortes {day}",
    no_alert: "Sem alerta",
    next_tight: "Próximo período tenso {when}",
    next_cut: "Cortes programados {when}",
    tight_now: "Rede tensa: poupe energia",
    cut_now: "Cortes em curso",
    no_tight_ahead: "Nenhum período tenso à vista",
    rte_signal: "Sinal da RTE",
    updated: "Atualizado {when}",
    hours_unknown: "Horas tensas ainda não publicadas",
    no_data: "Sem dados",
    no_data_found: "Nenhum sensor EcoWatt encontrado: instale My EcoWatt by RTE, ecowatt ou MyElectricalData, ou indique os sensores dos dias no cartão.",
    days: "Sensores dos dias (hoje primeiro; vazio: automático)",
    now: "Sensor da hora atual (opcional)",
    calendar: "Calendário das horas tensas (opcional)",
    show_hours: "Mostrar as horas de hoje e amanhã",
    show_days: "Mostrar os próximos dias",
    forecast: "Previsão",
    right_now: "Agora · {time}",
    cancel: "Cancelar",
    left: "Faltam {time}",
    today_at: "hoje {time}",
    tomorrow_at: "amanhã {time}",
    yesterday_at: "ontem {time}",
    zoom_in: "Mostrar detalhes",
    zoom_out: "Mostrar menos",
    title: "Título (opcional)",
    language: "Idioma",
    lang_auto: "Automático",
    collapsed: "Secções recolhidas por predefinição",
    zoom: "Botão de detalhe",
    zoom_helper: "Muda o minicartão para o conteúdo do cartão completo",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    no_registry: "Este cartão requer o Home Assistant 2024.8 ou posterior.",
    illustration: "Ilustração animada",
    illustration_theme: "Tema da ilustração",
    theme_auto: "Automático (sol)",
    theme_day: "Dia",
    theme_night: "Noite",
    unavailable: "Indisponível",
  },
  pl: {
    today: "Dziś",
    tomorrow: "Jutro",
    next_days: "Kolejne dni",
    level_0: "Niskoemisyjny",
    level_1: "Normalny",
    level_2: "Napięty",
    level_3: "Wyłączenia",
    now_0: "Prąd niskoemisyjny",
    now_1: "Normalny",
    now_2: "Sieć napięta",
    now_3: "Wyłączenia",
    day_0: "{day}: prąd niskoemisyjny",
    day_1: "{day}: normalnie",
    day_2: "{day}: sieć napięta",
    day_3: "{day}: planowane wyłączenia",
    day_tight_hours: "{day}: napięty {hours}",
    day_cut_hours: "{day}: wyłączenia {hours}",
    day_unknown: "{day}: jeszcze nieopublikowany",
    chip_tight: "Napięty {day}",
    chip_cut: "Wyłączenia {day}",
    no_alert: "Brak alertu",
    next_tight: "Następny napięty okres {when}",
    next_cut: "Planowane wyłączenia {when}",
    tight_now: "Sieć napięta: oszczędzaj prąd",
    cut_now: "Trwają wyłączenia",
    no_tight_ahead: "Brak napiętych okresów w najbliższym czasie",
    rte_signal: "Sygnał RTE",
    updated: "Zaktualizowano {when}",
    hours_unknown: "Napięte godziny jeszcze nieopublikowane",
    no_data: "Brak danych",
    no_data_found: "Nie znaleziono czujnika EcoWatt: zainstaluj My EcoWatt by RTE, ecowatt lub MyElectricalData albo podaj czujniki dni w karcie.",
    days: "Czujniki dni (najpierw dziś; puste: automatycznie)",
    now: "Czujnik bieżącej godziny (opcjonalnie)",
    calendar: "Kalendarz napiętych godzin (opcjonalnie)",
    show_hours: "Pokaż godziny dziś i jutro",
    show_days: "Pokaż kolejne dni",
    forecast: "Prognoza",
    right_now: "Teraz · {time}",
    cancel: "Anuluj",
    left: "Pozostało {time}",
    today_at: "dziś {time}",
    tomorrow_at: "jutro {time}",
    yesterday_at: "wczoraj {time}",
    zoom_in: "Pokaż szczegóły",
    zoom_out: "Pokaż mniej",
    title: "Tytuł (opcjonalnie)",
    language: "Język",
    lang_auto: "Automatycznie",
    collapsed: "Sekcje domyślnie zwinięte",
    zoom: "Przycisk szczegółów",
    zoom_helper: "Przełącza minikartę na zawartość pełnej karty",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    no_registry: "Ta karta wymaga Home Assistant 2024.8 lub nowszego.",
    illustration: "Animowana ilustracja",
    illustration_theme: "Motyw ilustracji",
    theme_auto: "Automatycznie (słońce)",
    theme_day: "Dzień",
    theme_night: "Noc",
    unavailable: "Niedostępne",
  },
  sr: {
    today: "Данас",
    tomorrow: "Сутра",
    next_days: "Следећи дани",
    level_0: "Нискоугљенична",
    level_1: "Нормално",
    level_2: "Оптерећено",
    level_3: "Искључења",
    now_0: "Нискоугљенична струја",
    now_1: "Нормално",
    now_2: "Оптерећена мрежа",
    now_3: "Искључења",
    day_0: "{day}: нискоугљенична струја",
    day_1: "{day}: нормално",
    day_2: "{day}: оптерећена мрежа",
    day_3: "{day}: планирана искључења",
    day_tight_hours: "{day}: оптерећено {hours}",
    day_cut_hours: "{day}: искључења {hours}",
    day_unknown: "{day}: још није објављено",
    chip_tight: "Оптерећено {day}",
    chip_cut: "Искључења {day}",
    no_alert: "Без упозорења",
    next_tight: "Следећи оптерећени период {when}",
    next_cut: "Планирана искључења {when}",
    tight_now: "Мрежа оптерећена: штедите струју",
    cut_now: "Искључења у току",
    no_tight_ahead: "Нема оптерећених периода на видику",
    rte_signal: "RTE сигнал",
    updated: "Ажурирано {when}",
    hours_unknown: "Оптерећени сати још нису објављени",
    no_data: "Нема података",
    no_data_found: "Није пронађен EcoWatt сензор: инсталирајте My EcoWatt by RTE, ecowatt или MyElectricalData, или унесите сензоре дана у картицу.",
    days: "Сензори дана (прво данас; празно: аутоматски)",
    now: "Сензор текућег сата (опционо)",
    calendar: "Календар оптерећених сати (опционо)",
    show_hours: "Прикажи сате данас и сутра",
    show_days: "Прикажи следеће дане",
    forecast: "Прогноза",
    right_now: "Сада · {time}",
    cancel: "Откажи",
    left: "Преостало {time}",
    today_at: "данас {time}",
    tomorrow_at: "сутра {time}",
    yesterday_at: "јуче {time}",
    zoom_in: "Прикажи детаље",
    zoom_out: "Прикажи мање",
    title: "Наслов (опционо)",
    language: "Језик",
    lang_auto: "Аутоматски",
    collapsed: "Подразумевано скупљени одељци",
    zoom: "Дугме за детаље",
    zoom_helper: "Пребацује мини картицу на садржај пуне картице",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    no_registry: "Ова картица захтева Home Assistant 2024.8 или новији.",
    illustration: "Анимирана илустрација",
    illustration_theme: "Тема илустрације",
    theme_auto: "Аутоматски (сунце)",
    theme_day: "Дан",
    theme_night: "Ноћ",
    unavailable: "Недоступно",
  },
  "sr-Latn": {
    today: "Danas",
    tomorrow: "Sutra",
    next_days: "Sledeći dani",
    level_0: "Niskougljenična",
    level_1: "Normalno",
    level_2: "Opterećeno",
    level_3: "Isključenja",
    now_0: "Niskougljenična struja",
    now_1: "Normalno",
    now_2: "Opterećena mreža",
    now_3: "Isključenja",
    day_0: "{day}: niskougljenična struja",
    day_1: "{day}: normalno",
    day_2: "{day}: opterećena mreža",
    day_3: "{day}: planirana isključenja",
    day_tight_hours: "{day}: opterećeno {hours}",
    day_cut_hours: "{day}: isključenja {hours}",
    day_unknown: "{day}: još nije objavljeno",
    chip_tight: "Opterećeno {day}",
    chip_cut: "Isključenja {day}",
    no_alert: "Bez upozorenja",
    next_tight: "Sledeći opterećeni period {when}",
    next_cut: "Planirana isključenja {when}",
    tight_now: "Mreža opterećena: štedite struju",
    cut_now: "Isključenja u toku",
    no_tight_ahead: "Nema opterećenih perioda na vidiku",
    rte_signal: "RTE signal",
    updated: "Ažurirano {when}",
    hours_unknown: "Opterećeni sati još nisu objavljeni",
    no_data: "Nema podataka",
    no_data_found: "Nije pronađen EcoWatt senzor: instalirajte My EcoWatt by RTE, ecowatt ili MyElectricalData, ili unesite senzore dana u karticu.",
    days: "Senzori dana (prvo danas; prazno: automatski)",
    now: "Senzor tekućeg sata (opciono)",
    calendar: "Kalendar opterećenih sati (opciono)",
    show_hours: "Prikaži sate danas i sutra",
    show_days: "Prikaži sledeće dane",
    forecast: "Prognoza",
    right_now: "Sada · {time}",
    cancel: "Otkaži",
    left: "Preostalo {time}",
    today_at: "danas {time}",
    tomorrow_at: "sutra {time}",
    yesterday_at: "juče {time}",
    zoom_in: "Prikaži detalje",
    zoom_out: "Prikaži manje",
    title: "Naslov (opciono)",
    language: "Jezik",
    lang_auto: "Automatski",
    collapsed: "Podrazumevano skupljeni odeljci",
    zoom: "Dugme za detalje",
    zoom_helper: "Prebacuje mini karticu na sadržaj pune kartice",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    no_registry: "Ova kartica zahteva Home Assistant 2024.8 ili noviji.",
    illustration: "Animirana ilustracija",
    illustration_theme: "Tema ilustracije",
    theme_auto: "Automatski (sunce)",
    theme_day: "Dan",
    theme_night: "Noć",
    unavailable: "Nedostupno",
  },
  ro: {
    today: "Astăzi",
    tomorrow: "Mâine",
    next_days: "Zilele următoare",
    level_0: "Cu emisii reduse",
    level_1: "Normal",
    level_2: "Tensionat",
    level_3: "Întreruperi",
    now_0: "Energie cu emisii reduse",
    now_1: "Normal",
    now_2: "Rețea tensionată",
    now_3: "Întreruperi",
    day_0: "{day}: energie cu emisii reduse",
    day_1: "{day}: normal",
    day_2: "{day}: rețea tensionată",
    day_3: "{day}: întreruperi programate",
    day_tight_hours: "{day}: tensionat {hours}",
    day_cut_hours: "{day}: întreruperi {hours}",
    day_unknown: "{day}: încă nepublicat",
    chip_tight: "Tensionat {day}",
    chip_cut: "Întreruperi {day}",
    no_alert: "Nicio alertă",
    next_tight: "Următoarea perioadă tensionată {when}",
    next_cut: "Întreruperi programate {when}",
    tight_now: "Rețea tensionată: economisiți energie",
    cut_now: "Întreruperi în curs",
    no_tight_ahead: "Nicio perioadă tensionată în perspectivă",
    rte_signal: "Semnal RTE",
    updated: "Actualizat {when}",
    hours_unknown: "Orele tensionate nu sunt încă publicate",
    no_data: "Fără date",
    no_data_found: "Niciun senzor EcoWatt găsit: instalați My EcoWatt by RTE, ecowatt sau MyElectricalData sau indicați senzorii zilelor în card.",
    days: "Senzorii zilelor (azi primul; gol: automat)",
    now: "Senzorul orei curente (opțional)",
    calendar: "Calendarul orelor tensionate (opțional)",
    show_hours: "Afișează orele de azi și de mâine",
    show_days: "Afișează zilele următoare",
    forecast: "Prognoză",
    right_now: "Acum · {time}",
    cancel: "Anulează",
    left: "Mai sunt {time}",
    today_at: "azi {time}",
    tomorrow_at: "mâine {time}",
    yesterday_at: "ieri {time}",
    zoom_in: "Arată detalii",
    zoom_out: "Arată mai puțin",
    title: "Titlu (opțional)",
    language: "Limbă",
    lang_auto: "Automat",
    collapsed: "Secțiuni pliate implicit",
    zoom: "Buton de detalii",
    zoom_helper: "Comută mini cardul la conținutul cardului complet",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    no_registry: "Acest card necesită Home Assistant 2024.8 sau mai nou.",
    illustration: "Ilustrație animată",
    illustration_theme: "Tema ilustrației",
    theme_auto: "Automat (soare)",
    theme_day: "Zi",
    theme_night: "Noapte",
    unavailable: "Indisponibil",
  },
  da: {
    today: "I dag",
    tomorrow: "I morgen",
    next_days: "Kommende dage",
    level_0: "CO₂-fattig",
    level_1: "Normal",
    level_2: "Presset",
    level_3: "Udkobling",
    now_0: "CO₂-fattig strøm",
    now_1: "Normal",
    now_2: "Presset net",
    now_3: "Udkobling",
    day_0: "{day}: CO₂-fattig strøm",
    day_1: "{day}: normal",
    day_2: "{day}: presset net",
    day_3: "{day}: planlagt udkobling",
    day_tight_hours: "{day}: presset {hours}",
    day_cut_hours: "{day}: udkobling {hours}",
    day_unknown: "{day}: endnu ikke offentliggjort",
    chip_tight: "Presset {day}",
    chip_cut: "Udkobling {day}",
    no_alert: "Ingen advarsel",
    next_tight: "Næste pressede periode {when}",
    next_cut: "Planlagt udkobling {when}",
    tight_now: "Presset net: spar på strømmen",
    cut_now: "Udkobling i gang",
    no_tight_ahead: "Ingen pressede perioder i sigte",
    rte_signal: "RTE-netsignal",
    updated: "Opdateret {when}",
    hours_unknown: "Pressede timer endnu ikke offentliggjort",
    no_data: "Ingen data",
    no_data_found: "Ingen EcoWatt-sensor fundet: installer My EcoWatt by RTE, ecowatt eller MyElectricalData, eller angiv dagsensorerne i kortet.",
    days: "Dagsensorer (i dag først; tom: automatisk)",
    now: "Sensor for den aktuelle time (valgfri)",
    calendar: "Kalender over pressede timer (valgfri)",
    show_hours: "Vis timerne i dag og i morgen",
    show_days: "Vis de kommende dage",
    forecast: "Prognose",
    right_now: "Nu · {time}",
    cancel: "Annuller",
    left: "{time} tilbage",
    today_at: "i dag {time}",
    tomorrow_at: "i morgen {time}",
    yesterday_at: "i går {time}",
    zoom_in: "Vis detaljer",
    zoom_out: "Vis mindre",
    title: "Titel (valgfri)",
    language: "Sprog",
    lang_auto: "Automatisk",
    collapsed: "Sektioner foldet sammen som standard",
    zoom: "Detaljeknap",
    zoom_helper: "Skifter minikortet til det fulde korts indhold",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    no_registry: "Dette kort kræver Home Assistant 2024.8 eller nyere.",
    illustration: "Animeret illustration",
    illustration_theme: "Illustrationens tema",
    theme_auto: "Automatisk (sol)",
    theme_day: "Dag",
    theme_night: "Nat",
    unavailable: "Utilgængelig",
  },
  sv: {
    today: "I dag",
    tomorrow: "I morgon",
    next_days: "Kommande dagar",
    level_0: "Koldioxidsnål",
    level_1: "Normal",
    level_2: "Ansträngt",
    level_3: "Bortkoppling",
    now_0: "Koldioxidsnål el",
    now_1: "Normal",
    now_2: "Ansträngt nät",
    now_3: "Bortkoppling",
    day_0: "{day}: koldioxidsnål el",
    day_1: "{day}: normal",
    day_2: "{day}: ansträngt nät",
    day_3: "{day}: planerad bortkoppling",
    day_tight_hours: "{day}: ansträngt {hours}",
    day_cut_hours: "{day}: bortkoppling {hours}",
    day_unknown: "{day}: inte publicerat än",
    chip_tight: "Ansträngt {day}",
    chip_cut: "Bortkoppling {day}",
    no_alert: "Ingen varning",
    next_tight: "Nästa ansträngda period {when}",
    next_cut: "Planerad bortkoppling {when}",
    tight_now: "Ansträngt nät: spara el",
    cut_now: "Bortkoppling pågår",
    no_tight_ahead: "Inga ansträngda perioder i sikte",
    rte_signal: "RTE-nätsignal",
    updated: "Uppdaterad {when}",
    hours_unknown: "Ansträngda timmar inte publicerade än",
    no_data: "Inga data",
    no_data_found: "Ingen EcoWatt-sensor hittades: installera My EcoWatt by RTE, ecowatt eller MyElectricalData, eller ange dagsensorerna i kortet.",
    days: "Dagsensorer (i dag först; tom: automatiskt)",
    now: "Sensor för aktuell timme (valfri)",
    calendar: "Kalender över ansträngda timmar (valfri)",
    show_hours: "Visa timmarna i dag och i morgon",
    show_days: "Visa kommande dagar",
    forecast: "Prognos",
    right_now: "Nu · {time}",
    cancel: "Avbryt",
    left: "{time} kvar",
    today_at: "i dag {time}",
    tomorrow_at: "i morgon {time}",
    yesterday_at: "i går {time}",
    zoom_in: "Visa detaljer",
    zoom_out: "Visa mindre",
    title: "Titel (valfri)",
    language: "Språk",
    lang_auto: "Automatiskt",
    collapsed: "Sektioner hopfällda som standard",
    zoom: "Detaljknapp",
    zoom_helper: "Växlar minikortet till hela kortets innehåll",
    show_title: "Visa titel",
    show_subtitle: "Visa undertitel",
    no_registry: "Det här kortet kräver Home Assistant 2024.8 eller senare.",
    illustration: "Animerad illustration",
    illustration_theme: "Illustrationens tema",
    theme_auto: "Automatiskt (sol)",
    theme_day: "Dag",
    theme_night: "Natt",
    unavailable: "Otillgänglig",
  },
  bg: {
    today: "Днес",
    tomorrow: "Утре",
    next_days: "Следващи дни",
    level_0: "Нисковъглеродна",
    level_1: "Нормално",
    level_2: "Напрегнато",
    level_3: "Прекъсвания",
    now_0: "Нисковъглеродна енергия",
    now_1: "Нормално",
    now_2: "Напрегната мрежа",
    now_3: "Прекъсвания",
    day_0: "{day}: нисковъглеродна енергия",
    day_1: "{day}: нормално",
    day_2: "{day}: напрегната мрежа",
    day_3: "{day}: планирани прекъсвания",
    day_tight_hours: "{day}: напрегнато {hours}",
    day_cut_hours: "{day}: прекъсвания {hours}",
    day_unknown: "{day}: все още не е публикувано",
    chip_tight: "Напрегнато {day}",
    chip_cut: "Прекъсвания {day}",
    no_alert: "Няма предупреждение",
    next_tight: "Следващ напрегнат период {when}",
    next_cut: "Планирани прекъсвания {when}",
    tight_now: "Напрегната мрежа: пестете енергия",
    cut_now: "Текущи прекъсвания",
    no_tight_ahead: "Няма предстоящи напрегнати периоди",
    rte_signal: "Сигнал на RTE",
    updated: "Обновено {when}",
    hours_unknown: "Напрегнатите часове още не са публикувани",
    no_data: "Няма данни",
    no_data_found: "Не е открит сензор EcoWatt: инсталирайте My EcoWatt by RTE, ecowatt или MyElectricalData или посочете сензорите на дните в картата.",
    days: "Сензори на дните (първо днес; празно: автоматично)",
    now: "Сензор на текущия час (по избор)",
    calendar: "Календар на напрегнатите часове (по избор)",
    show_hours: "Показване на часовете днес и утре",
    show_days: "Показване на следващите дни",
    forecast: "Прогноза",
    right_now: "Сега · {time}",
    cancel: "Отказ",
    left: "Остават {time}",
    today_at: "днес {time}",
    tomorrow_at: "утре {time}",
    yesterday_at: "вчера {time}",
    zoom_in: "Покажи подробности",
    zoom_out: "Покажи по-малко",
    title: "Заглавие (по избор)",
    language: "Език",
    lang_auto: "Автоматично",
    collapsed: "Сгънати по подразбиране раздели",
    zoom: "Бутон за подробности",
    zoom_helper: "Превключва мини картата към съдържанието на пълната карта",
    show_title: "Покажи заглавие",
    show_subtitle: "Покажи подзаглавие",
    no_registry: "Тази карта изисква Home Assistant 2024.8 или по-нов.",
    illustration: "Анимирана илюстрация",
    illustration_theme: "Тема на илюстрацията",
    theme_auto: "Автоматично (слънце)",
    theme_day: "Ден",
    theme_night: "Нощ",
    unavailable: "Недостъпно",
  },
  ru: {
    today: "Сегодня",
    tomorrow: "Завтра",
    next_days: "Следующие дни",
    level_0: "Низкоуглеродная",
    level_1: "Норма",
    level_2: "Напряжённо",
    level_3: "Отключения",
    now_0: "Низкоуглеродная энергия",
    now_1: "Норма",
    now_2: "Сеть перегружена",
    now_3: "Отключения",
    day_0: "{day}: низкоуглеродная энергия",
    day_1: "{day}: норма",
    day_2: "{day}: сеть перегружена",
    day_3: "{day}: плановые отключения",
    day_tight_hours: "{day}: напряжённо {hours}",
    day_cut_hours: "{day}: отключения {hours}",
    day_unknown: "{day}: ещё не опубликовано",
    chip_tight: "Напряжённо {day}",
    chip_cut: "Отключения {day}",
    no_alert: "Нет предупреждений",
    next_tight: "Следующий напряжённый период {when}",
    next_cut: "Плановые отключения {when}",
    tight_now: "Сеть перегружена: экономьте энергию",
    cut_now: "Идут отключения",
    no_tight_ahead: "Напряжённых периодов не ожидается",
    rte_signal: "Сигнал RTE",
    updated: "Обновлено {when}",
    hours_unknown: "Напряжённые часы ещё не опубликованы",
    no_data: "Нет данных",
    no_data_found: "Датчик EcoWatt не найден: установите My EcoWatt by RTE, ecowatt или MyElectricalData или укажите датчики дней в карточке.",
    days: "Датчики дней (сначала сегодня; пусто: автоматически)",
    now: "Датчик текущего часа (необязательно)",
    calendar: "Календарь напряжённых часов (необязательно)",
    show_hours: "Показывать часы сегодня и завтра",
    show_days: "Показывать следующие дни",
    forecast: "Прогноз",
    right_now: "Сейчас · {time}",
    cancel: "Отмена",
    left: "Осталось {time}",
    today_at: "сегодня {time}",
    tomorrow_at: "завтра {time}",
    yesterday_at: "вчера {time}",
    zoom_in: "Показать подробности",
    zoom_out: "Свернуть",
    title: "Заголовок (необязательно)",
    language: "Язык",
    lang_auto: "Автоматически",
    collapsed: "Свёрнутые по умолчанию разделы",
    zoom: "Кнопка подробностей",
    zoom_helper: "Переключает мини-карточку на содержимое полной карточки",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    no_registry: "Для этой карточки нужен Home Assistant 2024.8 или новее.",
    illustration: "Анимированная иллюстрация",
    illustration_theme: "Тема иллюстрации",
    theme_auto: "Автоматически (солнце)",
    theme_day: "День",
    theme_night: "Ночь",
    unavailable: "Недоступно",
  },
  uk: {
    today: "Сьогодні",
    tomorrow: "Завтра",
    next_days: "Наступні дні",
    level_0: "Низьковуглецева",
    level_1: "Норма",
    level_2: "Напружено",
    level_3: "Відключення",
    now_0: "Низьковуглецева енергія",
    now_1: "Норма",
    now_2: "Мережа перевантажена",
    now_3: "Відключення",
    day_0: "{day}: низьковуглецева енергія",
    day_1: "{day}: норма",
    day_2: "{day}: мережа перевантажена",
    day_3: "{day}: планові відключення",
    day_tight_hours: "{day}: напружено {hours}",
    day_cut_hours: "{day}: відключення {hours}",
    day_unknown: "{day}: ще не опубліковано",
    chip_tight: "Напружено {day}",
    chip_cut: "Відключення {day}",
    no_alert: "Без попереджень",
    next_tight: "Наступний напружений період {when}",
    next_cut: "Планові відключення {when}",
    tight_now: "Мережа перевантажена: заощаджуйте енергію",
    cut_now: "Тривають відключення",
    no_tight_ahead: "Напружених періодів не очікується",
    rte_signal: "Сигнал RTE",
    updated: "Оновлено {when}",
    hours_unknown: "Напружені години ще не опубліковані",
    no_data: "Немає даних",
    no_data_found: "Датчик EcoWatt не знайдено: встановіть My EcoWatt by RTE, ecowatt або MyElectricalData або вкажіть датчики днів у картці.",
    days: "Датчики днів (спершу сьогодні; порожньо: автоматично)",
    now: "Датчик поточної години (необов'язково)",
    calendar: "Календар напружених годин (необов'язково)",
    show_hours: "Показувати години сьогодні й завтра",
    show_days: "Показувати наступні дні",
    forecast: "Прогноз",
    right_now: "Зараз · {time}",
    cancel: "Скасувати",
    left: "Залишилось {time}",
    today_at: "сьогодні {time}",
    tomorrow_at: "завтра {time}",
    yesterday_at: "учора {time}",
    zoom_in: "Показати подробиці",
    zoom_out: "Згорнути",
    title: "Заголовок (необов'язково)",
    language: "Мова",
    lang_auto: "Автоматично",
    collapsed: "Згорнуті за замовчуванням розділи",
    zoom: "Кнопка подробиць",
    zoom_helper: "Перемикає міні-картку на вміст повної картки",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    no_registry: "Для цієї картки потрібен Home Assistant 2024.8 або новіший.",
    illustration: "Анімована ілюстрація",
    illustration_theme: "Тема ілюстрації",
    theme_auto: "Автоматично (сонце)",
    theme_day: "День",
    theme_night: "Ніч",
    unavailable: "Недоступно",
  },
  hu: {
    today: "Ma",
    tomorrow: "Holnap",
    next_days: "Következő napok",
    level_0: "Alacsony szén-dioxid",
    level_1: "Normál",
    level_2: "Feszített",
    level_3: "Lekapcsolás",
    now_0: "Alacsony kibocsátású áram",
    now_1: "Normál",
    now_2: "Feszített hálózat",
    now_3: "Lekapcsolás",
    day_0: "{day}: alacsony kibocsátású áram",
    day_1: "{day}: normál",
    day_2: "{day}: feszített hálózat",
    day_3: "{day}: tervezett lekapcsolás",
    day_tight_hours: "{day}: feszített {hours}",
    day_cut_hours: "{day}: lekapcsolás {hours}",
    day_unknown: "{day}: még nincs közzétéve",
    chip_tight: "Feszített {day}",
    chip_cut: "Lekapcsolás {day}",
    no_alert: "Nincs figyelmeztetés",
    next_tight: "Következő feszített időszak {when}",
    next_cut: "Tervezett lekapcsolás {when}",
    tight_now: "Feszített hálózat: takarékoskodjon",
    cut_now: "Lekapcsolás folyamatban",
    no_tight_ahead: "Nincs feszített időszak kilátásban",
    rte_signal: "RTE hálózati jel",
    updated: "Frissítve {when}",
    hours_unknown: "A feszített órák még nincsenek közzétéve",
    no_data: "Nincs adat",
    no_data_found: "Nem található EcoWatt érzékelő: telepítse a My EcoWatt by RTE, ecowatt vagy MyElectricalData integrációt, vagy adja meg a napok érzékelőit a kártyán.",
    days: "Napok érzékelői (először a mai; üres: automatikus)",
    now: "Az aktuális óra érzékelője (opcionális)",
    calendar: "A feszített órák naptára (opcionális)",
    show_hours: "A mai és a holnapi órák megjelenítése",
    show_days: "A következő napok megjelenítése",
    forecast: "Előrejelzés",
    right_now: "Most · {time}",
    cancel: "Mégse",
    left: "Még {time}",
    today_at: "ma {time}",
    tomorrow_at: "holnap {time}",
    yesterday_at: "tegnap {time}",
    zoom_in: "Részletek",
    zoom_out: "Kevesebb",
    title: "Cím (nem kötelező)",
    language: "Nyelv",
    lang_auto: "Automatikus",
    collapsed: "Alapértelmezetten összecsukott szakaszok",
    zoom: "Részletek gomb",
    zoom_helper: "A minikártyát a teljes kártya tartalmára váltja",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    no_registry: "Ehhez a kártyához Home Assistant 2024.8 vagy újabb szükséges.",
    illustration: "Animált illusztráció",
    illustration_theme: "Az illusztráció témája",
    theme_auto: "Automatikus (nap)",
    theme_day: "Nappal",
    theme_night: "Éjszaka",
    unavailable: "Nem elérhető",
  },
  sk: {
    today: "Dnes",
    tomorrow: "Zajtra",
    next_days: "Ďalšie dni",
    level_0: "Nízkouhlíková",
    level_1: "Normálne",
    level_2: "Napätá",
    level_3: "Odstávky",
    now_0: "Nízkouhlíková elektrina",
    now_1: "Normálne",
    now_2: "Napätá sieť",
    now_3: "Odstávky",
    day_0: "{day}: nízkouhlíková elektrina",
    day_1: "{day}: normálne",
    day_2: "{day}: napätá sieť",
    day_3: "{day}: plánované odstávky",
    day_tight_hours: "{day}: napätá {hours}",
    day_cut_hours: "{day}: odstávky {hours}",
    day_unknown: "{day}: zatiaľ nezverejnené",
    chip_tight: "Napätá {day}",
    chip_cut: "Odstávky {day}",
    no_alert: "Bez upozornenia",
    next_tight: "Ďalšie napäté obdobie {when}",
    next_cut: "Plánované odstávky {when}",
    tight_now: "Napätá sieť: šetrite elektrinou",
    cut_now: "Prebiehajú odstávky",
    no_tight_ahead: "Žiadne napäté obdobie v dohľade",
    rte_signal: "Signál RTE",
    updated: "Aktualizované {when}",
    hours_unknown: "Napäté hodiny zatiaľ nie sú zverejnené",
    no_data: "Žiadne údaje",
    no_data_found: "Nenašiel sa žiadny senzor EcoWatt: nainštalujte My EcoWatt by RTE, ecowatt alebo MyElectricalData, alebo zadajte senzory dní v karte.",
    days: "Senzory dní (najprv dnes; prázdne: automaticky)",
    now: "Senzor aktuálnej hodiny (voliteľné)",
    calendar: "Kalendár napätých hodín (voliteľné)",
    show_hours: "Zobraziť hodiny dnes a zajtra",
    show_days: "Zobraziť ďalšie dni",
    forecast: "Predpoveď",
    right_now: "Teraz · {time}",
    cancel: "Zrušiť",
    left: "Zostáva {time}",
    today_at: "dnes {time}",
    tomorrow_at: "zajtra {time}",
    yesterday_at: "včera {time}",
    zoom_in: "Zobraziť podrobnosti",
    zoom_out: "Zobraziť menej",
    title: "Názov (voliteľné)",
    language: "Jazyk",
    lang_auto: "Automaticky",
    collapsed: "Predvolene zbalené sekcie",
    zoom: "Tlačidlo podrobností",
    zoom_helper: "Prepne mini kartu na obsah úplnej karty",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnadpis",
    no_registry: "Táto karta vyžaduje Home Assistant 2024.8 alebo novší.",
    illustration: "Animovaná ilustrácia",
    illustration_theme: "Téma ilustrácie",
    theme_auto: "Automaticky (slnko)",
    theme_day: "Deň",
    theme_night: "Noc",
    unavailable: "Nedostupné",
  },
  cs: {
    today: "Dnes",
    tomorrow: "Zítra",
    next_days: "Další dny",
    level_0: "Nízkouhlíková",
    level_1: "Normální",
    level_2: "Napjatá",
    level_3: "Odstávky",
    now_0: "Nízkouhlíková elektřina",
    now_1: "Normální",
    now_2: "Napjatá síť",
    now_3: "Odstávky",
    day_0: "{day}: nízkouhlíková elektřina",
    day_1: "{day}: normální",
    day_2: "{day}: napjatá síť",
    day_3: "{day}: plánované odstávky",
    day_tight_hours: "{day}: napjatá {hours}",
    day_cut_hours: "{day}: odstávky {hours}",
    day_unknown: "{day}: zatím nezveřejněno",
    chip_tight: "Napjatá {day}",
    chip_cut: "Odstávky {day}",
    no_alert: "Bez upozornění",
    next_tight: "Další napjaté období {when}",
    next_cut: "Plánované odstávky {when}",
    tight_now: "Napjatá síť: šetřete elektřinou",
    cut_now: "Probíhají odstávky",
    no_tight_ahead: "Žádné napjaté období v dohledu",
    rte_signal: "Signál RTE",
    updated: "Aktualizováno {when}",
    hours_unknown: "Napjaté hodiny zatím nejsou zveřejněny",
    no_data: "Žádná data",
    no_data_found: "Nebyl nalezen žádný senzor EcoWatt: nainstalujte My EcoWatt by RTE, ecowatt nebo MyElectricalData, nebo zadejte senzory dnů v kartě.",
    days: "Senzory dnů (nejprve dnes; prázdné: automaticky)",
    now: "Senzor aktuální hodiny (volitelné)",
    calendar: "Kalendář napjatých hodin (volitelné)",
    show_hours: "Zobrazit hodiny dnes a zítra",
    show_days: "Zobrazit další dny",
    forecast: "Předpověď",
    right_now: "Nyní · {time}",
    cancel: "Zrušit",
    left: "Zbývá {time}",
    today_at: "dnes {time}",
    tomorrow_at: "zítra {time}",
    yesterday_at: "včera {time}",
    zoom_in: "Zobrazit podrobnosti",
    zoom_out: "Zobrazit méně",
    title: "Název (volitelné)",
    language: "Jazyk",
    lang_auto: "Automaticky",
    collapsed: "Ve výchozím stavu sbalené sekce",
    zoom: "Tlačítko podrobností",
    zoom_helper: "Přepne mini kartu na obsah plné karty",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podtitul",
    no_registry: "Tato karta vyžaduje Home Assistant 2024.8 nebo novější.",
    illustration: "Animovaná ilustrace",
    illustration_theme: "Motiv ilustrace",
    theme_auto: "Automaticky (slunce)",
    theme_day: "Den",
    theme_night: "Noc",
    unavailable: "Nedostupné",
  },
  sl: {
    today: "Danes",
    tomorrow: "Jutri",
    next_days: "Naslednji dnevi",
    level_0: "Nizkoogljična",
    level_1: "Normalno",
    level_2: "Obremenjeno",
    level_3: "Izklopi",
    now_0: "Nizkoogljična elektrika",
    now_1: "Normalno",
    now_2: "Obremenjeno omrežje",
    now_3: "Izklopi",
    day_0: "{day}: nizkoogljična elektrika",
    day_1: "{day}: normalno",
    day_2: "{day}: obremenjeno omrežje",
    day_3: "{day}: načrtovani izklopi",
    day_tight_hours: "{day}: obremenjeno {hours}",
    day_cut_hours: "{day}: izklopi {hours}",
    day_unknown: "{day}: še ni objavljeno",
    chip_tight: "Obremenjeno {day}",
    chip_cut: "Izklopi {day}",
    no_alert: "Brez opozorila",
    next_tight: "Naslednje obremenjeno obdobje {when}",
    next_cut: "Načrtovani izklopi {when}",
    tight_now: "Obremenjeno omrežje: varčujte z elektriko",
    cut_now: "Izklopi potekajo",
    no_tight_ahead: "Ni obremenjenih obdobij na vidiku",
    rte_signal: "Signal RTE",
    updated: "Posodobljeno {when}",
    hours_unknown: "Obremenjene ure še niso objavljene",
    no_data: "Ni podatkov",
    no_data_found: "Ni najdenega senzorja EcoWatt: namestite My EcoWatt by RTE, ecowatt ali MyElectricalData ali vnesite senzorje dni v kartico.",
    days: "Senzorji dni (najprej danes; prazno: samodejno)",
    now: "Senzor trenutne ure (neobvezno)",
    calendar: "Koledar obremenjenih ur (neobvezno)",
    show_hours: "Prikaži ure danes in jutri",
    show_days: "Prikaži naslednje dni",
    forecast: "Napoved",
    right_now: "Zdaj · {time}",
    cancel: "Prekliči",
    left: "Še {time}",
    today_at: "danes {time}",
    tomorrow_at: "jutri {time}",
    yesterday_at: "včeraj {time}",
    zoom_in: "Prikaži podrobnosti",
    zoom_out: "Prikaži manj",
    title: "Naslov (neobvezno)",
    language: "Jezik",
    lang_auto: "Samodejno",
    collapsed: "Privzeto strnjeni razdelki",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Preklopi mini kartico na vsebino polne kartice",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    no_registry: "Ta kartica potrebuje Home Assistant 2024.8 ali novejši.",
    illustration: "Animirana ilustracija",
    illustration_theme: "Tema ilustracije",
    theme_auto: "Samodejno (sonce)",
    theme_day: "Dan",
    theme_night: "Noč",
    unavailable: "Ni na voljo",
  },
  lv: {
    today: "Šodien",
    tomorrow: "Rīt",
    next_days: "Nākamās dienas",
    level_0: "Zemu emisiju",
    level_1: "Normāli",
    level_2: "Noslogots",
    level_3: "Atslēgumi",
    now_0: "Zemu emisiju elektrība",
    now_1: "Normāli",
    now_2: "Tīkls noslogots",
    now_3: "Atslēgumi",
    day_0: "{day}: zemu emisiju elektrība",
    day_1: "{day}: normāli",
    day_2: "{day}: tīkls noslogots",
    day_3: "{day}: plānoti atslēgumi",
    day_tight_hours: "{day}: noslogots {hours}",
    day_cut_hours: "{day}: atslēgumi {hours}",
    day_unknown: "{day}: vēl nav publicēts",
    chip_tight: "Noslogots {day}",
    chip_cut: "Atslēgumi {day}",
    no_alert: "Nav brīdinājumu",
    next_tight: "Nākamais noslogotais periods {when}",
    next_cut: "Plānoti atslēgumi {when}",
    tight_now: "Tīkls noslogots: taupiet elektrību",
    cut_now: "Notiek atslēgumi",
    no_tight_ahead: "Noslogoti periodi nav gaidāmi",
    rte_signal: "RTE tīkla signāls",
    updated: "Atjaunināts {when}",
    hours_unknown: "Noslogotās stundas vēl nav publicētas",
    no_data: "Nav datu",
    no_data_found: "EcoWatt sensors nav atrasts: instalējiet My EcoWatt by RTE, ecowatt vai MyElectricalData vai norādiet dienu sensorus kartītē.",
    days: "Dienu sensori (vispirms šodiena; tukšs: automātiski)",
    now: "Pašreizējās stundas sensors (neobligāts)",
    calendar: "Noslogoto stundu kalendārs (neobligāts)",
    show_hours: "Rādīt šodienas un rītdienas stundas",
    show_days: "Rādīt nākamās dienas",
    forecast: "Prognoze",
    right_now: "Tagad · {time}",
    cancel: "Atcelt",
    left: "Atlikušas {time}",
    today_at: "šodien {time}",
    tomorrow_at: "rīt {time}",
    yesterday_at: "vakar {time}",
    zoom_in: "Rādīt detaļas",
    zoom_out: "Rādīt mazāk",
    title: "Virsraksts (neobligāts)",
    language: "Valoda",
    lang_auto: "Automātiski",
    collapsed: "Pēc noklusējuma sakļautās sadaļas",
    zoom: "Detaļu poga",
    zoom_helper: "Pārslēdz mini kartīti uz pilnās kartītes saturu",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    no_registry: "Šai kartītei nepieciešams Home Assistant 2024.8 vai jaunāks.",
    illustration: "Animēta ilustrācija",
    illustration_theme: "Ilustrācijas motīvs",
    theme_auto: "Automātiski (saule)",
    theme_day: "Diena",
    theme_night: "Nakts",
    unavailable: "Nav pieejams",
  },
  el: {
    today: "Σήμερα",
    tomorrow: "Αύριο",
    next_days: "Επόμενες ημέρες",
    level_0: "Χαμηλού άνθρακα",
    level_1: "Κανονικό",
    level_2: "Επιβαρυμένο",
    level_3: "Διακοπές",
    now_0: "Ρεύμα χαμηλού άνθρακα",
    now_1: "Κανονικό",
    now_2: "Επιβαρυμένο δίκτυο",
    now_3: "Διακοπές",
    day_0: "{day}: ρεύμα χαμηλού άνθρακα",
    day_1: "{day}: κανονικό",
    day_2: "{day}: επιβαρυμένο δίκτυο",
    day_3: "{day}: προγραμματισμένες διακοπές",
    day_tight_hours: "{day}: επιβαρυμένο {hours}",
    day_cut_hours: "{day}: διακοπές {hours}",
    day_unknown: "{day}: δεν έχει δημοσιευτεί ακόμη",
    chip_tight: "Επιβαρυμένο {day}",
    chip_cut: "Διακοπές {day}",
    no_alert: "Καμία ειδοποίηση",
    next_tight: "Επόμενη επιβαρυμένη περίοδος {when}",
    next_cut: "Προγραμματισμένες διακοπές {when}",
    tight_now: "Επιβαρυμένο δίκτυο: εξοικονομήστε ρεύμα",
    cut_now: "Διακοπές σε εξέλιξη",
    no_tight_ahead: "Καμία επιβαρυμένη περίοδος στον ορίζοντα",
    rte_signal: "Σήμα RTE",
    updated: "Ενημέρωση {when}",
    hours_unknown: "Οι επιβαρυμένες ώρες δεν έχουν δημοσιευτεί ακόμη",
    no_data: "Χωρίς δεδομένα",
    no_data_found: "Δεν βρέθηκε αισθητήρας EcoWatt: εγκαταστήστε το My EcoWatt by RTE, το ecowatt ή το MyElectricalData ή ορίστε τους αισθητήρες των ημερών στην κάρτα.",
    days: "Αισθητήρες ημερών (πρώτα σήμερα· κενό: αυτόματα)",
    now: "Αισθητήρας τρέχουσας ώρας (προαιρετικό)",
    calendar: "Ημερολόγιο επιβαρυμένων ωρών (προαιρετικό)",
    show_hours: "Εμφάνιση των ωρών σήμερα και αύριο",
    show_days: "Εμφάνιση των επόμενων ημερών",
    forecast: "Πρόβλεψη",
    right_now: "Τώρα · {time}",
    cancel: "Ακύρωση",
    left: "Απομένουν {time}",
    today_at: "σήμερα {time}",
    tomorrow_at: "αύριο {time}",
    yesterday_at: "χθες {time}",
    zoom_in: "Εμφάνιση λεπτομερειών",
    zoom_out: "Εμφάνιση λιγότερων",
    title: "Τίτλος (προαιρετικό)",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
    collapsed: "Ενότητες συμπτυγμένες από προεπιλογή",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Αλλάζει τη μίνι κάρτα στο περιεχόμενο της πλήρους κάρτας",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    no_registry: "Αυτή η κάρτα απαιτεί Home Assistant 2024.8 ή νεότερο.",
    illustration: "Κινούμενη εικονογράφηση",
    illustration_theme: "Θέμα εικονογράφησης",
    theme_auto: "Αυτόματα (ήλιος)",
    theme_day: "Ημέρα",
    theme_night: "Νύχτα",
    unavailable: "Μη διαθέσιμο",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_ICONS = {
  chevron_down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  alert: "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z",
  plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
  minus: "M19,13H5V11H19V13Z",
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
  stop: "M18,18H6V6H18V18Z",
  check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
  close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
};
const ICONS = { ...BASE_ICONS, ...CARD_ICONS };

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language, or Home Assistant's full locale when it has the same base (pt-BR, de-CH).
// A bare "pt" (Home Assistant's code for European Portuguese) becomes "pt-PT", otherwise Intl formats it the Brazilian way.
const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");



const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// Attributes of an element that opens an entity's more-info (nothing without an entity).
const moreInfo = (id) => (id ? ` role="button" tabindex="0" data-entity="${esc(id)}"` : "");
const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const domainOf = (id) => String(id || "").split(".")[0];
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const DAY_MS = 8.64e7;


// "8:12", "1:05:00": a countdown, rounded up to the second.
const fmtCountdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};

// A time stamp (ISO string, sensor state or input_datetime "YYYY-MM-DD HH:MM:SS") in ms; null otherwise.
const parseTime = (v) => {
  if (v === null || v === undefined || v === "" || v === "unknown" || v === "unavailable") return null;
  if (typeof v === "number") return v > 1e11 ? v : v * 1000;
  const s = String(v);
  const ms = Date.parse(/^\d{4}-\d{2}-\d{2} \d/.test(s) ? s.replace(" ", "T") : s);
  return Number.isFinite(ms) ? ms : null;
};

const startOfDay = (ms) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const fmtTime = (hass, config, ms) =>
  new Intl.DateTimeFormat(intlLocale(hass, config), { hour: "numeric", minute: "2-digit" }).format(new Date(ms));

// "today 18:00", "tomorrow 06:00", "yesterday 21:00", "Tue 06:00", "Jun 24, 06:00".
const fmtWhen = (hass, config, ms) => {
  const day = Math.round((startOfDay(ms) - startOfDay(Date.now())) / DAY_MS);
  const time = fmtTime(hass, config, ms);
  if (day === 0) return t(hass, config, "today_at", { time });
  if (day === 1) return t(hass, config, "tomorrow_at", { time });
  if (day === -1) return t(hass, config, "yesterday_at", { time });
  const locale = intlLocale(hass, config);
  if (Math.abs(day) < 7) return `${new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(ms))} ${time}`;
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(ms));
};



// What an entity is called, to recognise it: its id, translation key and names (registry and state), as snake_case.
const keyText = (e, hass) =>
  [e.entity_id, e.translation_key, e.name, hass.states[e.entity_id]?.attributes?.friendly_name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --ew-accent: #43a047; --ew-ok: var(--success-color, #43a047); --ew-warn: var(--warning-color, #ffa600);
          --ew-crit: var(--error-color, #db4437); --ew-idle: var(--disabled-text-color, #9e9e9e); --ew-active: var(--info-color, #039be5);
          /* Text in a state color is mixed with the text color so that it reads at 4.5:1 at least. */
          --ew-accent-text: color-mix(in srgb, var(--ew-accent) 50%, var(--primary-text-color)); }
  ha-card { overflow: hidden; container: ew-card / inline-size; }
  /* Natural width in a parent that sizes to its content (inline-block, grid "auto" column), without a minimum. */
  :host { display: block; min-width: 0; --ew-natural-width: 380px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--ew-natural-width)); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible { outline: 2px solid var(--primary-color, var(--ew-accent)); outline-offset: 2px; border-radius: 4px; }
  .ok { --c: var(--ew-ok); } .warn { --c: var(--ew-warn); } .crit { --c: var(--ew-crit); } .idle { --c: var(--ew-idle); }
  .active { --c: var(--ew-active); } .accent { --c: var(--ew-accent); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--ew-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--ew-ok)) 15%, transparent); color: color-mix(in srgb, var(--c, var(--ew-ok)) 50%, var(--primary-text-color));
          flex: 0 1 auto; min-width: 0; max-width: 50%; overflow: hidden; box-sizing: border-box; }
  .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .header { position: relative; display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  .header:has(.zoom) { padding-right: 34px; }
  .type-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none;
               --ew-tint: var(--c, var(--ew-accent)); background: color-mix(in srgb, var(--ew-tint) 16%, transparent); transition: background-color .3s ease; }
  .type-icon .icon { width: 24px; height: 24px; fill: color-mix(in srgb, var(--ew-tint) 60%, var(--primary-text-color)); transition: fill .3s ease; }
  .titles { flex: 1 1 0; min-width: 5ch; container: ew-titles / inline-size; }
  :host([hide-title]) .title-row > .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  /* The title line: the title, then the status pill, which keeps its whole label (the title gives way first). */
  .title-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .title-row .name { flex: 0 1 auto; min-width: 4ch; }
  .title-row .chip { flex: none; max-width: 51%; }
  .pill-line { display: none; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: color-mix(in srgb, var(--ew-warn) 50%, var(--primary-text-color)); }
  /* Buttons as on the other cards: a smoked-glass background (never a filled color), the icon in the accent color. */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; font: inherit; font-size: 13px;
         font-weight: 500; padding: 6px 12px; border-radius: 18px; background: var(--secondary-background-color, rgba(127,127,127,.12));
         color: var(--primary-text-color); min-width: 0; }
  .btn span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .btn:not(:disabled):hover { background: color-mix(in srgb, var(--ew-accent) 12%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  .btn .icon { width: 18px; height: 18px; color: var(--ew-accent); }
  .btn.primary { background: color-mix(in srgb, var(--ew-accent) 16%, transparent); color: var(--ew-accent-text); }
  .btn.primary:not(:disabled):hover { background: color-mix(in srgb, var(--ew-accent) 24%, transparent); }
  .btn.active { background: color-mix(in srgb, var(--ew-active) 16%, transparent); color: color-mix(in srgb, var(--ew-active) 50%, var(--primary-text-color)); }
  .btn.active .icon { color: var(--ew-active); }
  .btn.round { width: 36px; height: 36px; padding: 0; border-radius: 50%; flex: none; }
  .btn:disabled { opacity: .45; cursor: default; }
  .btn:focus-visible { outline: 2px solid var(--primary-color, var(--ew-accent)); outline-offset: 2px; }
  /* The mini card's detail button: 24 px round, in the top right corner. */
  .zoom { all: unset; position: absolute; z-index: 2; top: 5px; right: 5px; cursor: pointer; width: 24px; height: 24px; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); box-shadow: inset 0 0 0 1px var(--divider-color, rgba(127,127,127,.3)); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--ew-idle) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, var(--ew-accent)); outline-offset: 1px; }
  .line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .line .icon { width: 16px; height: 16px; }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .line.ok, .line.warn, .line.crit, .line.active, .line.accent { color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }
  .line.ok .icon, .line.warn .icon, .line.crit .icon, .line.active .icon, .line.accent .icon { color: var(--c); }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .num { font-variant-numeric: tabular-nums; }
  .content { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title.toggle { cursor: pointer; user-select: none; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .section-title .count { margin-left: 2px; text-transform: none; letter-spacing: 0; font-weight: 400; }
  .section-title.toggle[aria-expanded="false"] { margin-bottom: 0; }
  /* Folded: the chevron points right; unfolded: down. */
  .section-title .chevron { margin-left: auto; width: 16px; height: 16px; transition: transform .2s ease; }
  .section-title.toggle[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  .empty { font-size: 13px; color: var(--secondary-text-color); padding: 2px 0; }
  .ring-svg { position: absolute; inset: 0; transform: rotate(-90deg); }
  .ring-svg circle { fill: none; }
  .ring-svg .track { stroke: color-mix(in srgb, var(--c, var(--ew-accent)) 18%, transparent); }
  .ring-svg .prog { stroke: var(--c, var(--ew-accent)); stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
  /* Hero, as on the garden and tempo cards: a flat illustration on the left, a big value and a few colored lines on the right. */
  .hero { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .hero-art { flex: none; width: 120px; display: grid; place-items: center; }
  .hero-art svg { width: 100%; height: auto; display: block; }
  .hero-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .hero-kick { font-size: 12px; color: var(--secondary-text-color); }
  .big { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
  .big .icon { width: 24px; height: 24px; align-self: center; color: var(--c, var(--ew-accent)); }
  .big b { font-size: 30px; font-weight: 400; line-height: 1; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .big span { font-size: 14px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hero .line { font-size: 12.5px; }
  /* Rows, as the watering zones: a round icon (grey at rest, tinted otherwise, a ring while it runs), name, colored state, a button. */
  .row { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .row-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; flex: none; display: grid; place-items: center;
              --t: var(--c, var(--ew-idle)); background: color-mix(in srgb, var(--t) 18%, transparent); color: color-mix(in srgb, var(--t) 70%, var(--primary-text-color)); }
  .row-icon.idle { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); color: var(--secondary-text-color); }
  .row-icon > .icon, .row-icon > ha-icon { width: 22px; height: 22px; --mdc-icon-size: 22px; }
  .row-icon .ring-svg { inset: -2px; width: 44px; height: 44px; }
  .badge { position: absolute; right: -3px; bottom: -3px; width: 17px; height: 17px; border-radius: 50%; display: grid; place-items: center;
           background: var(--b, var(--ew-ok)); color: #fff; box-shadow: 0 0 0 2px var(--ha-card-background, var(--card-background-color, #fff)); }
  .badge .icon { width: 11px; height: 11px; }
  .row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .row-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-state { font-size: 12.5px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-state.ok, .row-state.warn, .row-state.crit, .row-state.active, .row-state.accent { color: color-mix(in srgb, var(--c) 60%, var(--primary-text-color)); }
  .rows { display: flex; flex-direction: column; gap: 8px; }
  /* Tiles, as on room overview: grey, tinted with a border when they need a look; small badges below. */
  .tiles { display: grid; gap: 8px; grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr)); }
  .tile { min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 10px; box-sizing: border-box;
          background: var(--secondary-background-color, rgba(127,127,127,.12)); border: 1px solid transparent; }
  .tile.tint { background: color-mix(in srgb, var(--c) 13%, var(--secondary-background-color, rgba(127,127,127,.12)));
               border-color: color-mix(in srgb, var(--c) 30%, transparent); }
  .tile-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .tile .row-icon { width: 30px; height: 30px; } .tile .row-icon > .icon { width: 18px; height: 18px; }
  .tile .row-state { font-size: 12px; }
  .badges { display: flex; gap: 4px; flex-wrap: wrap; }
  .pill { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; padding: 1px 7px; border-radius: 10px;
          color: color-mix(in srgb, var(--c, var(--ew-idle)) 60%, var(--primary-text-color)); background: color-mix(in srgb, var(--c, var(--ew-idle)) 14%, transparent); }
  .pill .icon { width: 14px; height: 14px; color: var(--c, var(--ew-idle)); }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  /* Narrow title block: the pill leaves the title's line for a line of its own under the subtitle. */
  @container ew-titles (max-width: 205px) {
    .title-row .chip { display: none; }
    .pill-line { display: flex; min-width: 0; margin-top: 3px; }
    .pill-line .chip { max-width: 100%; }
  }
  @container ew-card (max-width: 260px) {
    .title-row .chip { display: none; }
    .pill-line { display: flex; min-width: 0; margin-top: 3px; }
    .pill-line .chip { max-width: 100%; }
  }
  /* Very narrow card: only the pill's dot stays, on the title's line. */
  @container ew-card (max-width: 200px) {
    .title-row .chip { display: inline-flex; padding: 4px; }
    .chip-text, .pill-line { display: none; }
    .header { gap: 6px; }
  }
`;

// Popup at the top of the card, over a backdrop: it stays in view on a long card.
const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 220px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 15px; font-weight: 500; line-height: 1.3; overflow-wrap: anywhere; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
  .stepper { display: flex; align-items: center; justify-content: center; gap: 14px; }
  .stepper .val { font-size: 28px; font-weight: 400; min-width: 4ch; text-align: center; }
  .stepper .val small { font-size: 14px; color: var(--secondary-text-color); margin-left: 2px; }
  .presets { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
  .preset { font: inherit; font-size: 12px; padding: 4px 10px; border-radius: 14px; cursor: pointer; color: var(--primary-text-color);
            background: transparent; border: 1px solid color-mix(in srgb, var(--primary-text-color) 16%, transparent); }
  .preset.on { border-color: color-mix(in srgb, var(--ew-accent) 60%, transparent); color: var(--ew-accent-text); font-weight: 500;
               background: color-mix(in srgb, var(--ew-accent) 10%, transparent); }
  .field { font: inherit; font-size: 15px; width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 10px; color: var(--primary-text-color);
           background: transparent; border: 1px solid color-mix(in srgb, var(--primary-text-color) 20%, transparent); }
  .field:focus { outline: 2px solid var(--primary-color, var(--ew-accent)); outline-offset: -1px; }
`;

// The mini card: header and a compact row; its detail button switches it to the full card's content.
const MINI_STYLE = `
  :host { --ew-natural-width: 300px; }
  .content.mini { flex-direction: row; align-items: center; gap: 12px; }
  .mini .info { gap: 4px; }
  .mini .line .icon { width: 14px; height: 14px; }
  .controls { display: flex; gap: 6px; flex: none; }
  @container (max-width: 300px) {
    .content.mini { flex-wrap: wrap; row-gap: 8px; }
    .mini .controls { flex-basis: 100%; justify-content: flex-end; }
  }
`;

// Element names of Home Assistant dialogs (a more-info opened from the card): a click there is not "elsewhere".
const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app) a
// tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to the
// page. It counts when the press and the release are both outside the card (a slider dragged out of the card does not
// fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through the click
// event. `tap(ev)` (a press and a release at the same spot) is for the tests.
const watchOutside = (isOut, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOut(ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOut(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOut(ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};
// After a popup closes, clicks on the card are ignored this long (the second click of a double click).
const CONFIRM_GUARD_MS = 400;
// Elements a click acts on, and how one is told from the others across renders (focus kept for keyboard users).
const FOCUS_SELECTOR = "[data-action], [data-entity], [data-keep]";
const focusKey = (el) => {
  const data = Object.entries({ ...el.dataset });
  return data.length ? `${el.tagName}|${JSON.stringify(data)}` : "";
};

// ---------------------------------------------------------------------------
// Card base
// ---------------------------------------------------------------------------

// What every card of this file shares: rendering only when something shown changed, no rewrite under a press, focus
// kept for keyboard users, folding sections, a popup at the top of the card, live countdowns, service calls.
// A card defines _build() (its model from the registries and the configuration), _entityIds(m), _render(), and may
// define _action(action, el, ev), _dialogHtml() / _dialogAction(action, el), _extraDeps(), _onConnect() / _onDisconnect().
class CardBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._inputs = {};
    // No rewrite of the card between a press and its click: Home Assistant updates the card several times a second,
    // and a rewrite under the pointer replaces the element pressed, so that the click lands on the card itself and
    // does nothing. The update held back is drawn once released: by the click (registered before the card's own
    // handler, which renders at once), else right after the release.
    this._onPress = () => {
      this._byPointer = true;
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    };
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      setTimeout(() => {
        this._pressing = false;
        if (this._dirty) this._update();
      }, 0);
    };
    this._onPressClick = (ev) => {
      if (ev.detail === 0) this._byPointer = false;
      this._pressing = false;
    };
    this.shadowRoot.addEventListener("pointerdown", this._onPress);
    this.shadowRoot.addEventListener("click", this._onPressClick);
    // From the keyboard, the focus is kept across rewrites (with the pointer it would draw the focus ring).
    this.shadowRoot.addEventListener("keydown", () => {
      this._byPointer = false;
    });
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Text typed in a field of the card is kept across rewrites (see _update); Enter in it acts as its button.
    this.shadowRoot.addEventListener("input", (ev) => {
      const key = ev.target?.dataset?.keep;
      if (key) this._inputs[key] = ev.target.value;
    });
    this.shadowRoot.addEventListener("keydown", (ev) => {
      const el = ev.target;
      if (ev.key === "Enter" && el?.dataset?.keep && el.dataset.submit) {
        ev.preventDefault();
        this._onClick({ composedPath: () => [{ dataset: { action: el.dataset.submit } }], stopPropagation() {}, detail: 0 });
        return;
      }
      // Enter / Space on an element with the button role acts as a click, as on a <button>.
      if ((ev.key !== "Enter" && ev.key !== " ") || el?.getAttribute?.("role") !== "button") return;
      ev.preventDefault();
      el.click();
    });
    this._onKey = (ev) => {
      if (ev.key !== "Escape" || !this._dialog) return;
      ev.stopPropagation();
      this._closeDialog();
    };
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._lastDeps = null;
    this._model = null;
    this._configChanged?.();
    this._update();
  }

  // Home Assistant pushes a new hass on every state change of the whole instance: the card is only rebuilt when
  // something it shows changed (see _deps).
  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    const prev = this._lastDeps;
    if (deps && prev && deps.length === prev.length && deps.every((d, i) => d === prev[i])) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  // The registries, the language, the theme, the state objects the card reads, its own data and the minute (the
  // "12 min ago" texts move on their own).
  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const m = this._resolve();
    const ids = m ? this._entityIds(m) : [];
    return [h.entities, h.devices, h.areas, h.language, h.locale, h.themes?.darkMode, Math.floor(Date.now() / 6e4), ...this._extraDeps(), ...ids.map((id) => h.states[id])];
  }

  _extraDeps() {
    return [];
  }

  // The model is rebuilt when the registries or the set of entities change (a new entity, a device renamed).
  _resolve() {
    const h = this._hass;
    if (!h?.entities || !h?.devices) return null;
    const key = [h.entities, h.devices, h.areas, Object.keys(h.states).length];
    if (this._model && this._modelKey?.every((k, i) => k === key[i])) return this._model;
    this._modelKey = key;
    this._model = this._build();
    return this._model;
  }

  connectedCallback() {
    // A click elsewhere on the page folds the sections back to their defaults and closes the popup.
    this._outside ??= watchOutside(
      (ev) => isOutside(this, ev),
      () => {
        if (!this._toggled?.size && !this._dialog) return;
        this._toggled = new Map();
        if (this._dialog) this._closeDialog();
        else this._update();
      },
    );
    this._outside.on();
    if (this._dialog) window.addEventListener("keydown", this._onKey);
    clearInterval(this._tick);
    this._tick = setInterval(() => {
      if (this._hass) this.hass = this._hass;
    }, 60000);
    this._onConnect?.();
    this._update();
  }

  disconnectedCallback() {
    this._pressing = this._dirty = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    clearInterval(this._tick);
    clearInterval(this._countdown);
    this._tick = this._countdown = null;
    this._outside?.off();
    window.removeEventListener("keydown", this._onKey);
    this._onDisconnect?.();
    // Left (another dashboard view, a conditional card hidden): back to the defaults, so that the card does not come
    // back unfolded or with its popup open.
    this._toggled = new Map();
    this._dialog = null;
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _locale() {
    return intlLocale(this._hass, this._config);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  // Service call whose failure Home Assistant already reports (toast): handled here so that it does not end up as
  // "Uncaught (in promise)".
  _call(domain, service, data) {
    const r = this._hass.callService(domain, service, data);
    if (r && typeof r.catch === "function") r.catch(() => {});
    return r;
  }

  // A websocket command, through hass.callWS (or the connection), resolved with null on error.
  async _ws(msg) {
    const h = this._hass;
    try {
      if (h.callWS) return await h.callWS(msg);
      if (h.connection?.sendMessagePromise) return await h.connection.sendMessagePromise(msg);
    } catch {
      return null;
    }
    return null;
  }

  _update() {
    if (!this._hass || !this._config) return;
    // Held back under a press (see the constructor): drawn once released.
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    let html = this._render();
    if (this._dialog) {
      html = html.replace(/<ha-card(\s[^>]*)?>([\s\S]*)<\/ha-card>\s*$/, (_, attrs = "", inner) => {
        const a = attrs.includes('class="') ? attrs.replace('class="', 'class="dialog-open ') : `${attrs} class="dialog-open"`;
        return `<ha-card${a}>${inner}<style>${DIALOG_STYLE}</style>${this._dialogHtml()}</ha-card>`;
      });
    }
    if (html !== this._html) {
      const active = this.shadowRoot.activeElement;
      const field = active?.dataset?.keep ? { key: active.dataset.keep, start: active.selectionStart, end: active.selectionEnd } : null;
      const focused = this._dialog && active?.dataset?.action;
      const kept = this._dialog || this._byPointer ? null : this._focusedSpot();
      this._html = html;
      this.shadowRoot.innerHTML = html;
      // Fields get back what was typed, and the caret when one had the focus.
      for (const el of this.shadowRoot.querySelectorAll?.("[data-keep]") || []) {
        const v = this._inputs[el.dataset.keep];
        if (v !== undefined) el.value = v;
      }
      if (field) {
        const el = this.shadowRoot.querySelector(`[data-keep="${field.key}"]`);
        el?.focus?.({ preventScroll: true });
        el?.setSelectionRange?.(field.start, field.end);
      } else if (kept) this._restoreFocus(kept);
      if (this._dialog && !field) {
        const sel = focused ? `.modal [data-action="${focused}"]` : ".modal [data-keep], .modal .primary";
        this.shadowRoot.querySelector(sel)?.focus?.({ preventScroll: true });
      }
    }
    this._syncCountdown();
    this._afterUpdate?.();
  }

  // Countdowns move every second in place (no re-render, which would restart the animations): the text of [data-end]
  // elements, and the arc of rings (data-total and data-c). The card is redrawn once a countdown ends.
  _syncCountdown() {
    const els = [...(this.shadowRoot.querySelectorAll?.("[data-end]") || [])];
    if (!els.length) {
      clearInterval(this._countdown);
      this._countdown = null;
      return;
    }
    if (this._countdown) return;
    this._countdown = setInterval(() => {
      const now = Date.now();
      let ended = false;
      for (const el of this.shadowRoot.querySelectorAll("[data-end]")) {
        const left = Number(el.dataset.end) - now;
        if (left <= 0) ended = true;
        if (el.dataset.total) {
          const offset = (Number(el.dataset.c) * (1 - clamp(left / Number(el.dataset.total), 0, 1))).toFixed(2);
          if (el.style.strokeDashoffset !== offset) el.style.strokeDashoffset = offset;
        } else {
          const text = el.dataset.fmt === "left" ? this._t("left", { time: fmtCountdown(left) }) : fmtCountdown(left);
          if (el.textContent !== text) el.textContent = text;
        }
      }
      if (ended) {
        clearInterval(this._countdown);
        this._countdown = null;
        this._lastDeps = null;
        this._update();
      }
    }, 1000);
  }

  _focusedSpot() {
    const el = this.shadowRoot.activeElement;
    if (!el?.dataset) return null;
    const key = focusKey(el);
    if (!key) return null;
    const index = this._focusables(key).indexOf(el);
    return index < 0 ? null : { key, index };
  }

  _focusables(key) {
    return [...this.shadowRoot.querySelectorAll(FOCUS_SELECTOR)].filter((n) => focusKey(n) === key);
  }

  _restoreFocus({ key, index }) {
    this._focusables(key)[index]?.focus({ preventScroll: true });
  }

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    if (!this._dialog && Date.now() - (this._dialogClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    if (this._dialog) {
      ev.stopPropagation();
      const action = el?.dataset.action;
      if (action === "dialog_cancel" || (action === "dialog_backdrop" && path[0] === el)) return this._closeDialog();
      if (action) this._dialogAction(action, el);
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const { action, entity } = el.dataset;
    if (action === "zoom") return this._toggleZoom(ev);
    if (action === "toggle_section") {
      const key = el.dataset.section;
      this._toggled = new Map(this._toggled).set(key, !this._isCollapsed(key));
      return this._update();
    }
    if (action && this._action(action, el, ev)) return;
    if (entity) this._moreInfo(entity);
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  _action() {
    return false;
  }

  _dialogAction() {}

  _dialogHtml() {
    return "";
  }

  _openDialog(d) {
    this._dialog = d;
    window.addEventListener("keydown", this._onKey);
    this._update();
    this.shadowRoot.querySelector(".modal [data-keep], .modal .primary")?.focus?.();
  }

  _closeDialog() {
    this._dialog = null;
    this._dialogClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
  }

  // The popup's frame: a message, the content and its buttons (cancel, then the main action).
  _modal(title, body, okLabel, okIcon, okDisabled = false) {
    return `<div class="backdrop" data-action="dialog_backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="msg">${esc(title)}</div>
        ${body}
        <div class="modal-actions">
          <button class="btn" data-action="dialog_cancel"><span>${esc(this._t("cancel"))}</span></button>
          <button class="btn primary" data-action="dialog_ok"${okDisabled ? " disabled" : ""}>${okIcon ? svgIcon(okIcon) : ""}<span>${esc(okLabel)}</span></button>
        </div>
      </div>
    </div>`;
  }

  _isCollapsed(key) {
    if (this._toggled?.has(key)) return this._toggled.get(key);
    return asList(this._config.collapsed ?? this.constructor.defaultCollapsed ?? []).includes(key);
  }

  _sectionTitle(key, icon, label, count = "") {
    const closed = this._isCollapsed(key);
    return `<div class="section-title toggle" role="button" tabindex="0" data-action="toggle_section" data-section="${key}" aria-expanded="${!closed}">${svgIcon(icon)}<span>${esc(
      label,
    )}</span>${count !== "" ? `<span class="count">${esc(count)}</span>` : ""}${svgIcon(ICONS.chevron_down, "chevron")}</div>`;
  }

  // A folding section: its title, and its body unless folded.
  _section(key, icon, label, count, body) {
    return `<div class="section">${this._sectionTitle(key, icon, label, count)}${this._isCollapsed(key) ? "" : body}</div>`;
  }

  // The model ready to draw, or the error card to draw instead: no registries (Home Assistant too old), or nothing to
  // show (_emptyKey(m) names the message).
  _ready() {
    const m = this._resolve();
    if (!m) return { error: this._errorCard("no_registry") };
    const empty = this._emptyKey(m);
    return empty ? { error: this._errorCard(empty) } : { m };
  }

  _emptyKey() {
    return null;
  }

  _errorCard(key) {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(this._t(key))}</div></ha-card>`;
  }

  // Header: the tinted round icon (its tint follows `cls`), the title and subtitle, the status chip on the title's line.
  _header({ icon, cls = "accent", title, sub, chip, extra = "" }) {
    return `
      <div class="header">
        <div class="type-icon ${cls}">${extra}${svgIcon(icon)}</div>
        ${this._titles(title, sub, chip)}
        ${this._zoomButton()}
      </div>`;
  }

  // The status pill: on the title's line, right after the title; when the title block is narrow (a narrow card, or
  // the banner's scene beside it) it takes a line of its own under the subtitle (the copy in .pill-line), and on a
  // very narrow card only its dot stays (its text stays in its title and aria-label).
  _chip(chip) {
    if (!chip) return "";
    return `<span class="chip ${chip.cls}${chip.entity ? " clickable" : ""}"${moreInfo(chip.entity)} title="${esc(chip.text)}" aria-label="${esc(
      chip.text,
    )}"><span class="dot"></span><span class="chip-text">${esc(chip.text)}</span></span>`;
  }

  _titles(title, sub, chip) {
    const pill = this._chip(chip);
    return `<div class="titles">
          <div class="title-row"><div class="name">${esc(title)}</div>${pill}</div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
          ${pill ? `<div class="pill-line">${pill}</div>` : ""}
        </div>`;
  }

  _zoomButton() {
    return "";
  }

  _toggleZoom() {}
}

// The mini card is the full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
const withMini = (Full) =>
  class extends Full {
    constructor() {
      super();
      this._unzoom = watchOutside(
        (ev) => isOutside(this, ev),
        () => {
          if (this._zoomed && !this._dialog) this._setZoom(false);
        },
      );
    }

    connectedCallback() {
      super.connectedCallback();
      this._unzoom.on();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._unzoom.off();
      // Back to the compact view once off the screen (see the full card).
      this._zoomed = false;
    }

    getCardSize() {
      return this._zoomed ? super.getCardSize() : 3;
    }

    getGridOptions() {
      return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
    }

    _zoomButton() {
      if (this._config.zoom === false) return "";
      const z = this._zoomed;
      const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
      return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
    }

    _setZoom(on) {
      this._zoomed = on;
      this._update();
      this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
    }

    _toggleZoom(ev) {
      this._setZoom(!this._zoomed);
      if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
    }

    _render() {
      return this._zoomed ? super._render() : this._renderMini();
    }
  };

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

// An editor is a ha-form: `fields` (the card's options), `toggles` ([name, default] booleans), `defaults` (options
// left out of the YAML when at their default), `sections` (the foldable sections, for `collapsed`). Options written
// in YAML that the form does not show are kept.
class EditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  static get defaults() {
    return {};
  }

  static get sections() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _fields() {
    return [];
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    const toggles = this.constructor.toggles;
    const sections = this.constructor.sections;
    return [
      { name: "title", selector: { text: {} } },
      ...this._fields(),
      ...(toggles.length ? [{ type: "grid", name: "", schema: toggles.map(([name]) => ({ name, selector: { boolean: {} } })) }] : []),
      ...(sections.length ? [{ name: "collapsed", selector: { select: { multiple: true, mode: "list", options: sections.map((value) => ({ value, label: tr(value) })) } } }] : []),
      { name: "language", selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } } },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    const defaults = { ...Object.fromEntries(toggles), ...this.constructor.defaults };
    if (!this._form) {
      this._form = document.createElement("ha-form");
      // A field's label is its `<name>_field` text when the card also uses `<name>` for something else (a section).
      this._form.computeLabel = (s) => t(this._hass, this._config, STRINGS.en[`${s.name}_field`] ? `${s.name}_field` : s.name);
      this._form.computeHelper = (s) => (STRINGS.en[`${s.name}_helper`] ? t(this._hass, this._config, `${s.name}_helper`) : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: no empty values, no options left at their default.
          if (v === "" || v === undefined || v === null || (Array.isArray(v) && !v.length) || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    if (this._formConfig !== this._config) {
      this._formConfig = this._config;
      this._form.data = { ...defaults, ...this._config };
    }
    const l = lang(this._hass, this._config);
    if (this._schemaLang !== l) {
      this._schemaLang = l;
      this._form.schema = this._schema();
    }
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};

const register = (cards, url) => {
  for (const [name, cls] of cards) define(name, cls);
  window.customCards = window.customCards || [];
  for (const [type, , card] of cards) {
    if (card && !window.customCards.some((c) => c.type === type)) window.customCards.push({ type, ...card, preview: true, documentationURL: url });
  }
};

// ---------------------------------------------------------------------------
// Levels and discovery
// ---------------------------------------------------------------------------

// A level (0..3) from a number (1-3, or 0 for the low-carbon level) or a text: the colours of the ecowatt and
// MyElectricalData integrations (Vert / Orange / Rouge), the sentences of My EcoWatt by RTE, English words.
const levelOf = (v) => {
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

const worst = (list) => list.reduce((w, l) => (l !== null && l !== undefined && (w === null || l > w) ? l : w), null);

// 24 hourly levels from attributes named by hour: h0…h23 (ecowatt) or a forecast map {"00 h": 1} (MyElectricalData).
const hoursFromAttributes = (attrs = {}) => {
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

const _cache = new WeakMap();

// The day sensors (and hourly sensors and calendar) of the configuration, else of the supported integrations.
// Returns { days: [{ date, entity, level, hours }], hourly: [{ entity, at }], calendar, now, source }.
const resolve = (hass, config) => {
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const ECO_STYLE = `
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

const EW_STARS = [
  [12, 8],
  [44, 18],
  [96, 6],
  [132, 24],
  [168, 10],
  [188, 30],
  [70, 30],
];
const EW_PYLONS = [
  [110, 30],
  [150, 22],
  [190, 30],
];
const EW_TURBINES = [
  [60, 36],
  [82, 44],
];
const EW_LINE = "M96 34 Q103 34 110 30 Q130 37 150 22 Q170 37 190 30 Q196 31 200 33";

const ewSceneSvg = () => {
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

const EW_BANNER_STYLE = `
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

// Night picture: forced by illustration_theme, else the sun below the horizon, else Home Assistant's dark mode.
const ewIsNight = (hass, config) => {
  const theme = config?.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  const sun = hass?.states?.["sun.sun"]?.state;
  if (sun === "below_horizon" || sun === "above_horizon") return sun === "below_horizon";
  return !!hass?.themes?.darkMode;
};

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

class EcoWattCard extends CardBase {
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
    return [this._events, this._hass?.states?.["sun.sun"]?.state];
  }

  _onConnect() {
    this._fetchCalendar(true);
  }

  _onDisconnect() {
    clearTimeout(this._calTimer);
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

class EcoWattMiniCard extends withMini(EcoWattCard) {
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

// ---------------------------------------------------------------------------
// Visual editors
// ---------------------------------------------------------------------------

class EcoWattCardEditor extends EditorBase {
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
    return [
      { name: "days", selector: { entity: { multiple: true, domain: "sensor" } } },
      { name: "now", selector: { entity: { domain: "sensor" } } },
      { name: "calendar", selector: { entity: { domain: "calendar" } } },
      { name: "illustration_theme", selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: tr(`theme_${value}`) })) } } },
    ];
  }
}

// The mini card's detail view is the full card: its editor offers the full card's options, plus the detail button.
class EcoWattMiniCardEditor extends EcoWattCardEditor {
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
