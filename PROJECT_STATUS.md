# TrailGPS MTB - Estat i Documentació del Projecte

> **Darrera actualització:** 21 d'agost de 2026 (v2.4.12 — Validació de Camp Real amb iPhone 12 Pro, Rotació Dinàmica de Mapa Heading-Up, Wake Lock Resilient iOS i Filtre de Doble-Fix GPS)
> **Estat general:** PWA v2.4.12 i React Native / Expo amb Fase 0, Fase 1, Fase 2 i Fase 3 en marxa. Primera prova de camp real superada amb èxit (`samples/Sortida_BTT_21_8_2026_PROVA_PARC.gpx`). Implementada la rotació real del mapa en rumb, el gestor de pantalla encesa (*Screen Wake Lock*) multi-gest amb fallback per a Safari iOS, el filtre de doble fix ultra-ràpid al `BreadcrumbSampler` i 38 proves automatitzades (`npm test` al 100%).

> **Font de continuïtat:** [full de ruta i seguiment](PROPOSTES_MILLORA_I_FULL_DE_RUTA.md) · [registre de canvis](CHANGELOG.md)

---

## 1. Descripció i Especificacions del Projecte

- **Objectiu principal**: Aplicació de navegació GPS per a ciclisme/MTB i ciclocomputador d'alt contrast, 100% autònoma, privada (sense comptes, núvol ni telemetria) i optimitzada per a manillar de bicicleta amb guants i sota llum solar directa.
- **Públic destinatari**: Ciclistes de muntanya (MTB / Gravel / Carretera) que necessiten seguir tracks GPX amb precisió (sense snapping a asfalt) i consultar dades clau d'altimetria i telemetria sense dependre de cobertura mòbil.
- **Stack tecnològic**:
  - **PWA Web App**: HTML5, Vanilla CSS3 (disseny fluid d'alt contrast, paleta fosca Slate/OLED i neons cian/taronja), JavaScript modern, Leaflet 1.9.4, IndexedDB API (`trailgps_db_v1`), Battery Status API (`navigator.getBattery`), Web Bluetooth API (GATT Standard), Web Audio API (keep-alive i alertes acústiques), Screen Wake Lock API, Cache Storage API.
  - **Servidor local**: Node.js HTTP server autònom (`server.js`) per a proves en xarxa local (Port 3000).
  - **Base Nativa iOS**: React Native (Expo) amb MapKit, Expo Location, SVG delta arrow, Turn-by-Turn HUD i TypeScript (`trail-gps/`).
  - **Motor de Geometria, Altimetria, GPX, Descàrregues, Bateria i Persistència**: Mòduls purs `src/core/geoEngine.mjs` (`BatteryRenderPolicy`, `ElevationFilter`, `GpsQualityFilter`, `BreadcrumbSampler`), `src/core/gpxParser.mjs`, `src/core/routeStorage.mjs` i `src/core/gpxFetcher.mjs` validats amb 38 tests unitaris (`npm test`).

- **Estructura i Fitxers Clau del Projecte**:
  - [README.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/README.md): Guia ràpida de desplegament, característiques i instal·lació PWA.
  - [LICENSE](file:///C:/Users/David/Desktop/App%20bici%20GPS/LICENSE): Llicència legal de programari lliure GNU AGPL v3 (Codi) i CC BY-SA 4.0 (Continguts) - David Cordones (2026).
  - [PROJECT_STATUS.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/PROJECT_STATUS.md): Punt de control i continuïtat entre sessions.
  - [docs/DOCUMENTACIO_PROJECTE.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/docs/DOCUMENTACIO_PROJECTE.md): Documentació exhaustiva d'especificacions i arquitectura.
  - [docs/PLA_VALIDACIO_CAMP.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/docs/PLA_VALIDACIO_CAMP.md): Protocol operatiu i matriu de casos de prova per a sortides reals de camp (bateria, offline, histèresi d'alertes).
  - [samples/](file:///C:/Users/David/Desktop/App%20bici%20GPS/samples/): Col·lecció de fitxers GPX reals de prova (`Sortida_BTT_21_8_2026_PROVA_PARC.gpx`, `riudellots-caldes-btt.gpx`, `collserola-gravel-epic.gpx`).
  - [index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/index.html) / [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html): Nucli de l'aplicació PWA amb rotació de mapa Heading-Up, gestor de pantalla encesa resilient, Leaflet, motor Turn-by-Turn, gestor de bateria / Eco Mode, editor interactiu de Waypoints, ClimbPro amb scrubbing, persistència IndexedDB, descàrrega GPX per URL, còpies JSON, filtres GPS/altimetria i gravador GPX.
  - [src/core/geoEngine.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/geoEngine.mjs): Motor matemàtic pur: Haversine, azimuth, distància perpendicular, girs, `BatteryRenderPolicy`, `ElevationFilter`, `GpsQualityFilter`, `BreadcrumbSampler` (amb protecció de double-fix $\Delta t < 0.45\text{ s}$), `filterElevationSeries` i `getPointAtElevationProgress`.
  - [src/core/gpxParser.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/gpxParser.mjs): Parser GPX pur i sanejat per a Node.js i navegadors.
  - [src/core/gpxFetcher.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/gpxFetcher.mjs): Validador d'enllaços, extractor de títols, detecció de Wikiloc (`isWikilocUrl`) i descàrrega de fitxers GPX per xarxa/proxy.
  - [src/core/routeStorage.mjs](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/routeStorage.mjs): Gestor asíncron d'IndexedDB amb migració de `localStorage`, fallback en memòria i còpies de seguretat JSON.
  - [tests/](file:///C:/Users/David/Desktop/App%20bici%20GPS/tests/): Suite de 38 proves automatitzades (`geo-engine.test.mjs`, `gpx-parser.test.mjs`, `route-storage.test.mjs`, `gpx-fetcher.test.mjs`).
  - [trail-gps/](file:///C:/Users/David/Desktop/App%20bici%20GPS/trail-gps/): Projecte mòbil Expo / React Native amb TypeScript 100% net.

---

## 2. Estat Actual i Punt de Control (Tancament de Sessió: 21/08/2026 - v2.4.12)

- **Feina realitzada en aquesta sessió**:
  - [x] **🚴 Auditoria Tècnica de Sortida Real de Camp (`Sortida_BTT_21_8_2026_PROVA_PARC.gpx`)**:
    - Dispositiu: iPhone 12 Pro.
    - Recorregut: 3,91 km, temps total 1h 03m (26,6 min en moviment, velocitat mitjana 8,8 km/h).
    - **Validació de repòs**: Durant la parada de 36 minuts (15:50 a 16:26), el `BreadcrumbSampler` va registrar **0 punts**, suprimint completament el soroll i la teranyina GPS en aturada.
    - **Validació d'altimetria**: El filtre EMA i deadband $2.0\text{ m}$ va purgar 22 m de desnivell fictici (+44 m reals vs +66 m bruts).
    - **Visibilitat i bateria**: Verificada una visibilitat excel·lent sota el sol amb colors neó i fons fosc, i consum de bateria mínim.
  - [x] **🧭 Rotació Dinàmica del Mapa en Mode Rumb (*Heading-Up Map Rotation*)**:
    - Creat el contenidor `#map-viewport` amb tall de desbordament (`overflow: hidden`) i `#map` sobredimensionat (150% x 150%) amb `transform-origin: 50% 50%`.
    - En mode `headingUp`, el mapa rota dinàmicament (`transform: rotate(-heading deg)`) seguint el rumb de la bicicleta, mantenint el corriol/carretera apuntant cap a dalt de la pantalla.
    - La fletxa cian es manté orientada amunt ($0^\circ$) en mode rumb i gira sobre el mapa en mode `northUp`.
  - [x] **📱 Gestor de Pantalla Encesa Resilient per a iOS (*Screen Wake Lock Manager*)**:
    - Re-adquisició garantida del `navigator.wakeLock` en qualsevol gest tàctil (`touchstart`, `click`, botó `REC`, `🎯 ON SÓC`, etc.), evitant el bloqueig de seguretat de Safari.
    - Re-activació automàtica quan l'aplicació torna a primer pla (`visibilitychange`).
    - Fallback multimèdia/àudio silenciós per impedir que Safari apagui la pantalla i congeli el GPS en segon pla.
    - Afegit indicador d'estat a la barra superior (`🔆 PANTALLA ON`).
  - [x] **⏱️ Filtre de Doble-Fix i Salts Instantanis (`BreadcrumbSampler`)**:
    - Incorporada guarda temporal mínima ($\Delta t \ge 0.45\text{ s}$) i comprovació de velocitat màxima ($100\text{ km/h}$) a `src/core/geoEngine.mjs`, `trail-gps/src/utils/geoMath.ts` i `index.html`.
    - Eliminats els pics artificials de velocitat punta provocats per dobles lectures de xarxa/GPS a iOS.
  - [x] **🧪 Proves Unitàries i Sincronització**:
    - Suite de 38 proves passant al 100% (`npm test`).
    - Compilació TypeScript Expo (`npx tsc --noEmit`) 100% neta.
    - `index.html` i `web-app/index.html` perfectament sincronitzats.

- **Punt exacte on ens hem quedat**:
  - Les millores crítiques identificades a la prova de camp real (rotació de mapa, pantalla encesa a iOS i protecció de doble fix) estan implementades i verificades.
  - La PWA està a punt per a una nova sortida de camp amb la pantalla sempre encesa i orientació de rumb en directe.

---

## 3. Full de Ruta per a Properes Sessions (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **🚴 Segona sortida de validació de camp (PWA v2.4.12)**:
    - Comprovar que la pantalla es manté encesa durant tota la sortida a l'iPhone 12 Pro sense cap tall de GPS.
    - Verificar la fluïdesa de la rotació del mapa en corbes ràpides i senders revirats.
  - [ ] **🗺️ Proves amb tracks llargs**:
    - Carregar rutes de més de 30 km i perfils amb rampes pronunciades.
  - [ ] **🍏 Fase Expo / React Native (`trail-gps/`)**:
    - Portar els modals d'Ajustos, Biblioteca de Rutes i Waypoints a components JSX natius.
