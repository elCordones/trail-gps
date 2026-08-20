# TrailGPS MTB - Estat i Documentació del Projecte

> **Darrera actualització:** 20 d'agost de 2026 (v2.4.2 — Silenci per defecte, Gestió de Rutes, Sanejament GPX i Proves Automatitzades)
> **Estat general:** PWA v2.4.2 amb Fase 0 completada i Fase 1 iniciada. S'han integrat proves automatitzades (`npm test`), persistència de silenci per defecte, eliminació de rutes desades i sanejament complet d'entrades GPX.

> **Font de continuïtat:** [full de ruta i seguiment](PROPOSTES_MILLORA_I_FULL_DE_RUTA.md) · [registre de canvis](CHANGELOG.md)

---

## 1. Descripció i Especificacions del Projecte

- **Objectiu principal**: Aplicació de navegació GPS per a ciclisme/MTB i ciclocomputador d'alt contrast, 100% autònoma, privada (sense comptes, núvol ni telemetria) i optimitzada per a manillar de bicicleta amb guants i sota llum solar directa.
- **Públic destinatari**: Ciclistes de muntanya (MTB / Gravel / Carretera) que necessiten seguir tracks GPX amb precisió (sense snapping a asfalt) i consultar dades clau d'altimetria i telemetria sense dependre de cobertura mòbil.
- **Stack tecnològic**:
  - **PWA Web App**: HTML5, Vanilla CSS3 (disseny fluid d'alt contrast, paleta fosca Slate/OLED i neons cian/taronja), JavaScript modern, Leaflet 1.9.4, Web Bluetooth API (GATT Standard), Web Audio API, Screen Wake Lock API, Cache Storage API.
  - **Servidor local**: Node.js HTTP server autònom (`server.js`) per a proves en xarxa local (Port 3000).
  - **Base Nativa iOS**: React Native (Expo) amb MapKit, Expo Location, SVG delta arrow i TypeScript (`trail-gps/`).
  - **Motor de Geometria i GPX Compartit**: Mòduls purs `src/core/geoEngine.mjs` i `src/core/gpxParser.mjs` validats amb el test runner natiu de Node.js (`npm test`).

- **Estructura i Fitxers Clau del Projecte**:
  - [README.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/README.md): Guia ràpida de desplegament, característiques i instal·lació PWA.
  - [LICENSE](file:///C:/Users/David/Desktop/App%20bici%20GPS/LICENSE): Llicència legal de programari lliure GNU AGPL v3 (Codi) i CC BY-SA 4.0 (Continguts) - David Cordones (2026).
  - [PROJECT_STATUS.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/PROJECT_STATUS.md): Punt de control i continuïtat entre sessions.
  - [docs/DOCUMENTACIO_PROJECTE.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/docs/DOCUMENTACIO_PROJECTE.md): Documentació exhaustiva d'especificacions i arquitectura.
  - [index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/index.html) / [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html): Nucli de l'aplicació PWA amb Leaflet, motor Turn-by-Turn, Hub de Sensors BLE, Zones Cardíaques Z1-Z5, gestió de rutes desades amb esborrat, àudio silenciable persistent i suport tàctil.
  - [src/core/geoEngine.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/geoEngine.mjs): Motor matemàtic pur per a Haversine, azimuth/rumb, desviació angular, distància perpendicular a segment i detecció de girs.
  - [src/core/gpxParser.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/gpxParser.mjs): Parser GPX pur i sanejat per a Node.js i navegadors.
  - [tests/](file:///C:/Users/David/Desktop/App%20bici%20GPS/tests/): Suite de proves automatitzades (`geo-engine.test.mjs`, `gpx-parser.test.mjs`).
  - [manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/manifest.json) / [web-app/manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/manifest.json): Web App Manifest per a instal·lació PWA autònoma a pantalla completa.
  - [assets/icons/](file:///C:/Users/David/Desktop/App%20bici%20GPS/assets/icons/): Paquet complet d'icones PWA, favicons i Apple Touch Icons d'alta resolució.
  - [scripts/generate-icons.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/scripts/generate-icons.js): Generador automàtic de tot el paquet d'icones iOS / PWA / Expo amb `sharp`.
  - [server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/server.js) / [web-app/server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/server.js): Servidor Node.js per a proves locals (Port 3000).
  - [trail-gps/](file:///C:/Users/David/Desktop/App%20bici%20GPS/trail-gps/): Projecte mòbil Expo / React Native per a paquet natiu `.ipa`.

---

## 2. Estat Actual i Punt de Control (Tancament de Sessió: 20/08/2026 - v2.4.2)

- **Feina realitzada en aquesta sessió**:
  - [x] **🔇 Àudio OFF per defecte i Persistència d'Estat Acústic**:
    - Inicialització en silenci (`isAudioEnabled = false`) per evitar alertes inesperades.
    - Preferència de l'usuari desada a `localStorage` (`trailgps_audio_enabled`) i sincronitzada amb la UI del calaix d'ajustos (`#btn-audio-toggle`).
  - [x] **🗑️ Gestió Avançada de Rutes Desades (`#routes-modal`)**:
    - Implementada l'acció per eliminar rutes individuals de la memòria local amb botó `🗑️` i finestra de confirmació (`deleteRouteFromHistory`).
    - Disseny actualitzat amb accions independents (Eliminar `🗑️` / Carregar `▶️`) i etiqueta `MOSTRA` per a la ruta demo.
  - [x] **🛡️ Sanejament i Límits de Textos GPX & Waypoints**:
    - Truncament a 100 caràcters per a títols/noms i 300 caràcters per a descripcions.
    - Construcció segura de nodes DOM mitjançant `textContent` i escapat HTML (`escapeHtml`) a marcadors Leaflet per prevenir injeccions.
  - [x] **🧪 Suite de Proves Automatitzades (Node.js Test Runner)**:
    - Mòduls d'enginyeria purs `src/core/geoEngine.mjs` i `src/core/gpxParser.mjs`.
    - 12 proves unitàries executables mitjançant `npm test` (`node --test tests/*.test.mjs`) que validen Haversine, rumb, girs, forquilles, U-turns, distància perpendicular i parsing GPX.
  - [x] **Sincronització de Codi i Compilació**:
    - Còpies PWA `index.html` i `web-app/index.html` verificades amb hash SHA256 idèntic.
    - Compilació TypeScript Expo comprovada sense errors (`npx tsc --noEmit` a `trail-gps/`).

- **Punt exacte on ens hem quedat**:
  - Fase 0 completada al 100%.
  - Fase 1 (Qualitat, proves i modularització) iniciada amb èxit.
  - **Últim commit publicat:** `de1fc04` — `feat(pwa): v2.4.2 silenci per defecte, gestio de rutes, sanejament GPX i proves unitaries`.
  - Preparat per a la validació de camp amb GPS real i la integració dels mòduls compartits a la branca nativa Expo (`trail-gps`).

---

## 3. Full de Ruta per a Properes Sessions (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **🚴 Validació de navegació en sortida real de camp**:
    - Prova en moviment de la histèresi de fora de ruta (40 m / 25 m), filtratge de precisió GPS (< 50 m) i alertes sonores/hàptiques.
  - [ ] **🔗 Descàrrega Directa de Rutes per URL (Wikiloc, Strava, Enllaç directe GPX)**:
    - Camp d'importació per enllaç web al modal de rutes amb descàrrega automàtica i emmagatzematge local.
  - [ ] **🍏 Integració dels mòduls compartits a React Native / Expo (`trail-gps`)**:
    - Connectar `geoEngine` i `gpxParser` amb l'aplicació nativa Expo per a unificar la lògica de navegació.
  - [ ] **🍏 Sincronització amb Apple Salut & Entrenaments (Apple HealthKit)**:
    - Integració a la versió nativa per desar automàticament les sessions de ciclisme a Apple Health / Fitness.
  - [ ] **⌚ Companion App per a Apple Watch (watchOS)**:
    - HUD al canell per visualitzar telemetria clau (BPM, fletxes de gir, desnivell) i rebre vibracions hàptiques de gir o desviació.
