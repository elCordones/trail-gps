# TrailGPS MTB - Estat i Documentació del Projecte

> **Darrera actualització:** 21 d'agost de 2026 (v2.4.8 — Editor de Waypoints i POIs, Selector d'Icones, Còpies JSON i 35 Tests Unitaris)
> **Estat general:** PWA v2.4.8 amb Fase 0 i Fase 2 molt consolidades. Editor complet de waypoints amb selector ràpid d'icones i sincronització de girs al mapa, backups JSON a la UI, perfil interactiu d'altimetria, descàrrega de GPX per URL, persistència a IndexedDB i 35 proves automatitzades (`npm test` al 100%).

> **Font de continuïtat:** [full de ruta i seguiment](PROPOSTES_MILLORA_I_FULL_DE_RUTA.md) · [registre de canvis](CHANGELOG.md)

---

## 1. Descripció i Especificacions del Projecte

- **Objectiu principal**: Aplicació de navegació GPS per a ciclisme/MTB i ciclocomputador d'alt contrast, 100% autònoma, privada (sense comptes, núvol ni telemetria) i optimitzada per a manillar de bicicleta amb guants i sota llum solar directa.
- **Públic destinatari**: Ciclistes de muntanya (MTB / Gravel / Carretera) que necessiten seguir tracks GPX amb precisió (sense snapping a asfalt) i consultar dades clau d'altimetria i telemetria sense dependre de cobertura mòbil.
- **Stack tecnològic**:
  - **PWA Web App**: HTML5, Vanilla CSS3 (disseny fluid d'alt contrast, paleta fosca Slate/OLED i neons cian/taronja), JavaScript modern, Leaflet 1.9.4, IndexedDB API (`trailgps_db_v1`), Web Bluetooth API (GATT Standard), Web Audio API, Screen Wake Lock API, Cache Storage API.
  - **Servidor local**: Node.js HTTP server autònom (`server.js`) per a proves en xarxa local (Port 3000).
  - **Base Nativa iOS**: React Native (Expo) amb MapKit, Expo Location, SVG delta arrow i TypeScript (`trail-gps/`).
  - **Motor de Geometria, Altimetria, GPX, Descàrregues i Persistència**: Mòduls purs `src/core/geoEngine.mjs`, `src/core/gpxParser.mjs`, `src/core/routeStorage.mjs` i `src/core/gpxFetcher.mjs` validats amb 35 tests unitaris (`npm test`).

- **Estructura i Fitxers Clau del Projecte**:
  - [README.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/README.md): Guia ràpida de desplegament, característiques i instal·lació PWA.
  - [LICENSE](file:///C:/Users/David/Desktop/App%20bici%20GPS/LICENSE): Llicència legal de programari lliure GNU AGPL v3 (Codi) i CC BY-SA 4.0 (Continguts) - David Cordones (2026).
  - [PROJECT_STATUS.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/PROJECT_STATUS.md): Punt de control i continuïtat entre sessions.
  - [docs/DOCUMENTACIO_PROJECTE.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/docs/DOCUMENTACIO_PROJECTE.md): Documentació exhaustiva d'especificacions i arquitectura.
  - [index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/index.html) / [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html): Nucli de l'aplicació PWA amb Leaflet, motor Turn-by-Turn, editor interactiu de Waypoints, ClimbPro amb scrubbing, persistència IndexedDB, descàrrega GPX per URL, còpies JSON, filtres GPS/altimetria i gravador GPX.
  - [src/core/geoEngine.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/geoEngine.mjs): Motor matemàtic pur: Haversine, azimuth, distància perpendicular, girs, `ElevationFilter`, `GpsQualityFilter`, `BreadcrumbSampler`, `filterElevationSeries` i `getPointAtElevationProgress`.
  - [src/core/gpxParser.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/gpxParser.mjs): Parser GPX pur i sanejat per a Node.js i navegadors.
  - [src/core/gpxFetcher.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/gpxFetcher.mjs): Validador d'enllaços, extractor de títols i descàrrega de fitxers GPX per xarxa/proxy.
  - [src/core/routeStorage.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/routeStorage.mjs): Gestor asíncron d'IndexedDB amb migració de `localStorage`, fallback en memòria i còpies de seguretat JSON.
  - [tests/](file:///C:/Users/David/Desktop/App%20bici%20GPS/tests/): Suite de 35 proves automatitzades (`geo-engine.test.mjs`, `gpx-parser.test.mjs`, `route-storage.test.mjs`, `gpx-fetcher.test.mjs`).
  - [manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/manifest.json) / [web-app/manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/manifest.json): Web App Manifest per a instal·lació PWA autònoma a pantalla completa.
  - [assets/icons/](file:///C:/Users/David/Desktop/App%20bici%20GPS/assets/icons/): Paquet complet d'icones PWA, favicons i Apple Touch Icons d'alta resolució.
  - [scripts/generate-icons.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/scripts/generate-icons.js): Generador automàtic de tot el paquet d'icones iOS / PWA / Expo amb `sharp`.
  - [server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/server.js) / [web-app/server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/server.js): Servidor Node.js per a proves locals (Port 3000).
  - [trail-gps/](file:///C:/Users/David/Desktop/App%20bici%20GPS/trail-gps/): Projecte mòbil Expo / React Native per a paquet natiu `.ipa`.

---

## 2. Estat Actual i Punt de Control (Tancament de Sessió: 21/08/2026 - v2.4.8)

- **Feina realitzada en aquesta sessió**:
  - [x] **📍 Editor Interactiu de Waypoints / POIs (`#waypoints-modal`)**:
    - Formulari desplegable d'edició/creació de waypoints amb selector de xips d'icones (💧 Font, ⛰️ Cim, ⚠️ Perill, 🛑 Cruïlla, 📸 Foto, 🔧 Taller, 🥪 Menjar, 📍 General).
    - Botons d'edició (`✏️`) i eliminació (`🗑️`) a cada fila del llistat, amb navegació ràpida al mapa.
    - Sincronització automàtica amb les fites del motor Turn-by-Turn (`detectTrackTurns`).
  - [x] **💾 Botons de Còpia de Seguretat i Restauració a la UI (`#routes-modal`)**:
    - Exportació d'arxiu `trailgps_backup_rutes_YYYY-MM-DD.json` i restauració des de fitxer JSON.
  - [x] **📈 Perfil d'Altimetria Interactiu & Scrubbing (`getPointAtElevationProgress`)**:
    - Inspecció tàctil sobre el perfil SVG ClimbPro amb marcador sincronitzat en temps real sobre el mapa Leaflet.
  - [x] **🌐 Descàrrega Directa de Rutes per URL (`gpxFetcher.mjs`)**:
    - Formulari d'importació per URL web al modal de biblioteca de rutes amb suport de proxy CORS i límit de 10 MB.
  - [x] **💾 Migració Completa a IndexedDB (`RouteStorage`)**:
    - ObjectStore `routes` (`trailgps_db_v1`), eliminant el límit de 5-10 MB de `localStorage`.
  - [x] **📈 Suavitzat d'Altimetria i Acumulació de Desnivell (+D) (`ElevationFilter`)**:
    - Suavitzat EMA de l'altitud i acumulació per deadband ($2.0\text{ m}$) eliminant al 100% l'ascens fictici en repòs.
  - [x] **🛰️ Rebuig de Salts GPS i Filtre de Qualitat (`GpsQualityFilter`)**:
    - Rebuig de teletransportacions irreals ($> 100\text{ km/h}$ i $> 150\text{ m}$) i detecció de deriva estàtica.
  - [x] **📍 Mostreig Intel·ligent del Gravador GPX (`BreadcrumbSampler`)**:
    - Mostreig per distància ($\ge 3.5\text{ m}$), temps ($6\text{ s}$) i canvis de rumb ($\ge 18^\circ$).
  - [x] **🧪 Suite Ampliada a 35 Proves Unitàries Automatitzades (`npm test`)**:
    - 35 tests passant al 100% verificant geometria, altimetria, GPX, persistència IndexedDB, descàrrega per URL, scrubbing, validació de backups i waypoints a Turn-by-Turn.
  - [x] **Sincronització de Codi i Compilació**:
    - Còpies PWA `index.html` i `web-app/index.html` amb hash SHA256 idèntic (`3a9e8549...`).
    - Compilació TypeScript Expo (`npx tsc --noEmit`) 100% neta.

- **Punt exacte on ens hem quedat**:
  - Fase 0 completada al 100%.
  - Fase 1 i Fase 2 consolidades amb biblioteca IndexedDB, editor de waypoints, backups JSON a la UI, descàrrega per URL, perfil interactiu ClimbPro i 35 tests unitaris.
  - Preparat per continuar amb el mode d'estalvi de bateria o la validació de camp.

---

## 3. Full de Ruta per a Properes Sessions (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **🔋 Mode d'Estalvi de Bateria & Renderitzat Intel·ligent**:
    - Reducció del refresc cartogràfic en aturada per a sessions llargues de 4-6 hores.
  - [ ] **🍏 Integració dels mòduls compartits a React Native / Expo (`trail-gps`)**:
    - Connectar `geoEngine`, `gpxParser`, `routeStorage` i `gpxFetcher` a l'aplicació nativa Expo.
  - [ ] **🚴 Validació de navegació en sortida real de camp**:
    - Prova en moviment de la histèresi de fora de ruta (40 m / 25 m), filtratge de precisió GPS (< 50 m) i alertes sonores/hàptiques.
