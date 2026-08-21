# TrailGPS MTB - Estat i Documentació del Projecte

> **Darrera actualització:** 21 d'agost de 2026 (v2.4.11 — Integració de Mòduls a React Native / Expo, Col·lecció de GPX i 38 Tests Unitaris)
> **Estat general:** PWA v2.4.11 amb Fase 0, Fase 1 i Fase 2 consolidades. Integració completa dels mòduls matemàtics purs a React Native / Expo (`trail-gps/src/utils/`), col·lecció de GPX reals de prova (`samples/`), pla de validació de camp (`docs/PLA_VALIDACIO_CAMP.md`), gestió avançada de Wikiloc i 38 proves automatitzades (`npm test` al 100%).

> **Font de continuïtat:** [full de ruta i seguiment](PROPOSTES_MILLORA_I_FULL_DE_RUTA.md) · [registre de canvis](CHANGELOG.md)

---

## 1. Descripció i Especificacions del Projecte

- **Objectiu principal**: Aplicació de navegació GPS per a ciclisme/MTB i ciclocomputador d'alt contrast, 100% autònoma, privada (sense comptes, núvol ni telemetria) i optimitzada per a manillar de bicicleta amb guants i sota llum solar directa.
- **Públic destinatari**: Ciclistes de muntanya (MTB / Gravel / Carretera) que necessiten seguir tracks GPX amb precisió (sense snapping a asfalt) i consultar dades clau d'altimetria i telemetria sense dependre de cobertura mòbil.
- **Stack tecnològic**:
  - **PWA Web App**: HTML5, Vanilla CSS3 (disseny fluid d'alt contrast, paleta fosca Slate/OLED i neons cian/taronja), JavaScript modern, Leaflet 1.9.4, IndexedDB API (`trailgps_db_v1`), Battery Status API (`navigator.getBattery`), Web Bluetooth API (GATT Standard), Web Audio API, Screen Wake Lock API, Cache Storage API.
  - **Servidor local**: Node.js HTTP server autònom (`server.js`) per a proves en xarxa local (Port 3000).
  - **Base Nativa iOS**: React Native (Expo) amb MapKit, Expo Location, SVG delta arrow, Turn-by-Turn HUD i TypeScript (`trail-gps/`).
  - **Motor de Geometria, Altimetria, GPX, Descàrregues, Bateria i Persistència**: Mòduls purs `src/core/geoEngine.mjs` (`BatteryRenderPolicy`, `ElevationFilter`, `GpsQualityFilter`, `BreadcrumbSampler`), `src/core/gpxParser.mjs`, `src/core/routeStorage.mjs` i `src/core/gpxFetcher.mjs` validats amb 38 tests unitaris (`npm test`).

- **Estructura i Fitxers Clau del Projecte**:
  - [README.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/README.md): Guia ràpida de desplegament, característiques i instal·lació PWA.
  - [LICENSE](file:///C:/Users/David/Desktop/App%20bici%20GPS/LICENSE): Llicència legal de programari lliure GNU AGPL v3 (Codi) i CC BY-SA 4.0 (Continguts) - David Cordones (2026).
  - [PROJECT_STATUS.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/PROJECT_STATUS.md): Punt de control i continuïtat entre sessions.
  - [docs/DOCUMENTACIO_PROJECTE.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/docs/DOCUMENTACIO_PROJECTE.md): Documentació exhaustiva d'especificacions i arquitectura.
  - [docs/PLA_VALIDACIO_CAMP.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/docs/PLA_VALIDACIO_CAMP.md): Protocol operatiu i matriu de casos de prova per a sortides reals de camp (bateria, offline, histèresi d'alertes).
  - [samples/](file:///C:/Users/David/Desktop/App%20bici%20GPS/samples/): Col·lecció de fitxers GPX reals de prova (`riudellots-caldes-btt.gpx`, `collserola-gravel-epic.gpx`).
  - [index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/index.html) / [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html): Nucli de l'aplicació PWA amb Leaflet, motor Turn-by-Turn, gestor de bateria / Eco Mode, editor interactiu de Waypoints, ClimbPro amb scrubbing, persistència IndexedDB, descàrrega GPX per URL, còpies JSON, filtres GPS/altimetria i gravador GPX.
  - [src/core/geoEngine.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/geoEngine.mjs): Motor matemàtic pur: Haversine, azimuth, distància perpendicular, girs, `BatteryRenderPolicy`, `ElevationFilter`, `GpsQualityFilter`, `BreadcrumbSampler`, `filterElevationSeries` i `getPointAtElevationProgress`.
  - [src/core/gpxParser.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/gpxParser.mjs): Parser GPX pur i sanejat per a Node.js i navegadors.
  - [src/core/gpxFetcher.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/gpxFetcher.mjs): Validador d'enllaços, extractor de títols, detecció de Wikiloc (`isWikilocUrl`) i descàrrega de fitxers GPX per xarxa/proxy.
  - [src/core/routeStorage.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/routeStorage.mjs): Gestor asíncron d'IndexedDB amb migració de `localStorage`, fallback en memòria i còpies de seguretat JSON.
  - [tests/](file:///C:/Users/David/Desktop/App%20bici%20GPS/tests/): Suite de 38 proves automatitzades (`geo-engine.test.mjs`, `gpx-parser.test.mjs`, `route-storage.test.mjs`, `gpx-fetcher.test.mjs`).
  - [manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/manifest.json) / [web-app/manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/manifest.json): Web App Manifest per a instal·lació PWA autònoma a pantalla completa.
  - [assets/icons/](file:///C:/Users/David/Desktop/App%20bici%20GPS/assets/icons/): Paquet complet d'icones PWA, favicons i Apple Touch Icons d'alta resolució.
  - [scripts/generate-icons.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/scripts/generate-icons.js): Generador automàtic de tot el paquet d'icones iOS / PWA / Expo amb `sharp`.
  - [server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/server.js) / [web-app/server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/server.js): Servidor Node.js per a proves locals (Port 3000).
  - [trail-gps/](file:///C:/Users/David/Desktop/App%20bici%20GPS/trail-gps/): Projecte mòbil Expo / React Native amb TypeScript 100% net.

---

## 2. Estat Actual i Punt de Control (Tancament de Sessió: 21/08/2026 - v2.4.11)

- **Feina realitzada en aquesta sessió**:
  - [x] **🍏 Integració dels Mòduls Compartits a React Native / Expo (`trail-gps`)**:
    - Traslladat tot el nucli geomètric i altimètric pur a TypeScript (`trail-gps/src/utils/geoMath.ts`).
    - Suport de waypoints i càlcul de girs automàtics a `gpxParser.ts` i visualització Turn-by-Turn a `CockpitDashboard.tsx`.
    - Mòdul natiu `gpxFetcher.ts` amb detecció de Wikiloc i proxies fallbacks.
    - Compilació TypeScript (`npx tsc --noEmit`) 100% neta sense errors.
  - [x] **🗂️ Col·lecció de Rutes GPX Reals de Prova (`samples/`)**:
    - `riudellots-caldes-btt.gpx` (circular BTT amb waypoints) i `collserola-gravel-epic.gpx` (desnivell sever 170m-512m).
  - [x] **🌐 Detecció Específica d'Enllaços de Wikiloc & Proxies Resilients (`gpxFetcher.mjs`)**:
    - Detecció d'adreces de pàgines web de Wikiloc (`wikiloc.com/rutas-...`) amb explicació guiada a l'usuari sobre la descàrrega del fitxer `.gpx` amb sessió oberta.
    - Cadena de fallada de proxies CORS per a descàrregues d'enllaços GPX directes.
  - [x] **📋 Pla de Validació de Camp (`docs/PLA_VALIDACIO_CAMP.md`)**:
    - Document operatiu amb 6 casos de prova (offline, histèresi 40m/25m, Turn-by-Turn, ClimbPro, consum de bateria i gravador GPX).
  - [x] **🔋 Mode d'Estalvi de Bateria & Renderitzat Intel·ligent (`BatteryRenderPolicy`)**:
    - Suport de Battery API amb autoactivació del mode Eco per sota del 20% sense connexió de càrrega.
    - Throttling dinàmic de Leaflet `map.panTo()` en aturada ($< 2.5\text{ km/h}$) i en mode Eco per minimitzar el consum de CPU.
    - Filtre de rumb amb supressió de jitter de compàs ($< 4^\circ$) i desactivació d'efectes pesats de GPU `backdrop-filter: blur()`.
  - [x] **🧪 Suite Ampliada a 38 Proves Unitàries Automatitzades (`npm test`)**:
    - 38 tests passant al 100% verificant geometria, altimetria, GPX, persistència IndexedDB, descàrrega per URL, scrubbing, validació de backups, waypoints a Turn-by-Turn, polítiques de bateria i detecció de Wikiloc.
  - [x] **Sincronització de Codi i Compilació**:
    - Còpies PWA `index.html` i `web-app/index.html` amb hash SHA256 idèntic (`8fbb372d...`).
    - Compilació TypeScript Expo (`npx tsc --noEmit`) 100% neta.

- **Punt exacte on ens hem quedat**:
  - Fase 0, Fase 1 i Fase 2 completades i consolidades.
  - Els mòduls matemàtics, d'altimetria, girs i descàrrega estan sincronitzats al 100% tant a la PWA com a l'aplicació nativa Expo / React Native.
  - Pla de validació de camp i col·lecció de GPX preparats per a sortides reals de prova.

---

## 3. Full de Ruta per a Properes Sessions (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **🚴 Validació de navegació en sortida real de camp**:
    - Execució del protocol `docs/PLA_VALIDACIO_CAMP.md` en sortida real de ciclisme.
  - [ ] **📦 Generació i signatura del paquet natiu iOS (`.ipa`)**:
    - Configuració EAS Build / Xcode per a distribució a iPhone via TestFlight o instal·lació directa Ad-Hoc.
  - [ ] **🗺️ Ampliar col·lecció de GPX de prova reals**:
    - Proves amb tracks de més de 50 km, múltiples segments i descensos tècnics.
