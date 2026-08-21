# TrailGPS MTB — Registre de canvis

## 2026-08-21 — v2.4.8: Editor Complet de Waypoints, Selector d'Icones i 35 Proves Automatitzades

### Canvis implementats

- **📍 Editor Interactiu de Waypoints / POIs (`#waypoints-modal`)**:
  - Afegit formulari desplegable per crear i editar waypoints amb camps per a títol, descripció i selector d'icones ràpides.
  - **Selector d'icones i categories**: Selector visual amb xips per a 📍 General, 💧 Font d'aigua, ⛰️ Cim, ⚠️ Perill/Trialera, 🛑 Cruïlla, 📸 Mirador/Foto, 🔧 Taller/Mecànica i 🥪 Menjar/Refugi.
  - **Accions a cada fila de waypoint**:
    - ✏️ **Editar**: Obre el formulari amb les dades precarregades per modificar nom, text o icona.
    - 🗑️ **Eliminar**: Elimina el punt de la col·lecció de forma segura amb confirmació.
    - **Navegació al mapa**: Clicar a la fila centra automàticament el mapa i fa zoom sobre el punt.
  - **Sincronització amb el motor de girs**: Qualsevol canvi en waypoints actualitza en temps real les fites i alertes del Turn-by-Turn (`detectTrackTurns`).
- **🧪 Suite de proves ampliada a 35 tests (`npm test`)**:
  - Nova prova unitària a `tests/geo-engine.test.mjs` que valida la integració de waypoints i fites personalitzades a les instruccions de gir (100% de tests passant).
- **📱 Sincronització de Codi**:
  - Fitxers `index.html` i `web-app/index.html` sincronitzats amb hash SHA256 idèntic.

## 2026-08-21 — v2.4.7: Botons de Còpia de Seguretat i Restauració de Rutes (JSON) i 34 Proves Automatitzades

### Canvis implementats

- **💾 Còpia de Seguretat i Restauració a la UI (`#routes-modal`)**:
  - Afegits botons directes **💾 Exportar Còpia (.json)** i **📥 Restaurar Còpia** a la part inferior del modal de la biblioteca de rutes.
  - **Descàrrega immediata**: Genera un fitxer `trailgps_backup_rutes_YYYY-MM-DD.json` amb l'estructura completa de la base de dades IndexedDB (`trailgps_db_v1`), permetent transferir fàcilment rutes entre dispositius, navegadors o fer còpies de seguretat periòdiques.
  - **Restauració amb selector de fitxer**: Permet importar un fitxer JSON de backup anterior, guardant automàticament totes les rutes a IndexedDB i refrescant immediatament el llistat i els comptadors.
  - **Tractament d'errors robust**: Validació de formats JSON invàlids o corruptes amb notificacions amigables per a l'usuari.
- **🧪 Suite de proves ampliada a 34 tests (`npm test`)**:
  - Nova prova unitària a `tests/route-storage.test.mjs` que valida el rebuig segur de fitxers de backup corruptes o buits sense fallades no controlades (100% de tests passant).
- **📱 Sincronització de Codi**:
  - Fitxers `index.html` i `web-app/index.html` sincronitzats amb hash SHA256 idèntic.

## 2026-08-21 — v2.4.6: Perfil d'Altimetria Interactiu (Scrubbing & Map Sync) i 33 Proves Automatitzades

### Canvis implementats

- **📈 Perfil d'Altimetria Interactiu & Scrubbing al Gràfic (`#elevation-svg`)**:
  - Implementat sistema d'inspecció interactiva tàctil (`touchstart`, `touchmove`, `touchend`) i de punter (`pointerdown`, `pointermove`, `pointerup`).
  - **Sincronització amb el mapa**: En lliscar el dit pel perfil d'elevació, apareix una línia vertical taronja (`#ele-inspect-guide`), un punt lluminós (`#ele-inspect-dot`) i un marcador animat amb pols (`elevationInspectMarker`) que recorre la ruta sobre el mapa Leaflet en temps real.
  - **Dades de cota puntuals**: La capçalera de ClimbPro mostra instantàniament el quilòmetre exacte (`📍 Km X.X`), l'altitud en metres (`Xm`) i el percentatge de pendent puntual (`+X%` / `-X%`).
  - **Auto-restauració**: Retorn automàtic a les dades globals de la ruta en finalitzar la interacció.
  - **Mòdul pur provat**: Nova funció `getPointAtElevationProgress(points, ratio)` a [`src/core/geoEngine.mjs`](file:///C:/Users/David/Desktop/App%20bici%20GPS/src/core/geoEngine.mjs).
- **🧪 Suite de proves ampliada a 33 tests (`npm test`)**:
  - Nova prova unitària a `tests/geo-engine.test.mjs` que valida el càlcul precís de posició, cota i pendent segons el progrés de l'elevació (100% de tests passant).
- **📱 Sincronització de Codi**:
  - Fitxers `index.html` i `web-app/index.html` sincronitzats amb hash SHA256 idèntic.

## 2026-08-21 — v2.4.5: Descàrrega Directa de Rutes per URL i 32 Proves Automatitzades

### Canvis implementats

- **🌐 Descàrrega Directa de Rutes per URL (`gpxFetcher.mjs`)**:
  - Afegit formulari desplegable d'importació per URL (`http:` / `https:`) directament al modal de biblioteca de rutes (`#routes-modal`).
  - **Mòdul pur compartit**: Validació d'esquemes URL (`isValidGpxUrl`), extracció i sanejament automàtic de títol de ruta des de la ruta (`extractRouteNameFromUrl`), i comprovació d'estructura GPX (`isGpxContent`).
  - **Recuperació robusta per proxy CORS**: Petició directa amb alternativa automàtica mitjançant proxy obert (`https://api.allorigins.win/raw?url=`) si el servidor remot bloqueja peticions creuades (CORS), amb límit de seguretat de 10 MB i temporitzador d'avortament de 12 s.
  - **Integració immediata**: La ruta descarregada es parseja, es dibuixa al mapa, es desa automàticament a IndexedDB i s'actualitza el comptador de la biblioteca.
- **🧪 Suite de proves ampliada a 32 tests (`npm test`)**:
  - 6 noves proves unitàries a `tests/gpx-fetcher.test.mjs` que validen filtratge d'URL, extracció de noms, detecció de contingut GPX/HTML, descàrrega directa i fallback per proxy (100% de tests passant).
- **📱 Sincronització de Codi**:
  - Fitxers `index.html` i `web-app/index.html` sincronitzats amb hash SHA256 idèntic.

## 2026-08-21 — v2.4.4: Migració de Biblioteca de Rutes a IndexedDB i 26 Proves Automatitzades

### Canvis implementats

- **💾 Migració Completa a IndexedDB (`RouteStorage`)**:
  - Implementat gestor asíncron d'IndexedDB (`trailgps_db_v1`) per emmagatzemar múltiples fitxers GPX pesats, eliminant la restricció de 5-10 MB de `localStorage`.
  - **Migració transparent**: Detecta automàticament qualsevol ruta desada prèviament a `localStorage` (`trailgps_saved_routes_v1`), la transfereix a la base de dades IndexedDB i allibera la memòria de `localStorage`.
  - **Còpies de seguretat**: Suport per exportar i importar la biblioteca de rutes en format JSON (`exportBackupJson`, `importBackupJson`).
  - **Degradació suau**: Fallback automàtic en memòria si IndexedDB està bloquejat o restringit pel navegador.
- **🧪 Suite de proves ampliada a 26 tests (`npm test`)**:
  - 6 noves proves unitàries a `tests/route-storage.test.mjs` que validen emmagatzematge, upsert, esborrat per ID/nom, migració de `localStorage` i exportació/importació de còpia de seguretat (100% de tests passant).
- **📱 Sincronització de Codi**:
  - Actualitzades i verificades les dues còpies PWA (`index.html` i `web-app/index.html`) amb hash SHA256 idèntic.

## 2026-08-21 — v2.4.3: Filtratge de Dades de Gravació, Salts GPS i Suavitzat d'Altimetria (+D)

### Canvis implementats

- **📈 Filtre d'altimetria i desnivell acumulat (+D) (`ElevationFilter`)**:
  - Suavitzat per mitjana mòbil exponencial (EMA, $\alpha = 0.35$) de l'altitud en temps real.
  - Acumulació de desnivell positiu (+D) basada en histeresi / deadband ($2.0\text{ m}$), eliminant al 100% l'ascens fictici produït per oscil·lacions GPS/baromètriques en aturat o terreny pla.
  - Limitador de velocitat vertical màxima física ($1.5\text{ m/s}$) per evitar pics sobtats d'altitud.
- **🛰️ Filtratge de qualitat GPS i rebuig de salts anòmals (`GpsQualityFilter`)**:
  - Detecció i descart automàtic de teletransportacions i salts absurds ($> 100\text{ km/h}$ i $> 150\text{ m}$) sense alterar la posició ni disparar falses alarmes de fora de ruta.
  - Detecció de deriva estàtica quan l'usuari està aturat ($< 1.8\text{ km/h}$).
  - Sanejament de la velocitat màxima i mostres de velocitat mitjana real en moviment.
- **📍 Mostreig intel·ligent del gravador GPX (`BreadcrumbSampler`)**:
  - Mostreig adaptatiu per distància ($\ge 3.5\text{ m}$), temps de refresc ($6\text{ s}$) i detecció de girs i paelles ($\ge 18^\circ$) per preservar corbes sense inflar el fitxer amb punts duplicats en aturat.
- **🧪 Ampliació de proves automatitzades (`npm test`)**:
  - 8 noves proves unitàries (total de 20 tests, 100% superats) per validar el comportament del filtre d'altitud en repòs i pujada real, filtre de salts GPS, mostreig de breadcrumbs i suavitzat de sèries temporals.
- **📱 Sincronització a Expo i PWA**:
  - Sincronització de càlculs de desnivell a `trail-gps/src/utils/gpxParser.ts` (Expo) i SHA256 idèntic a les còpies PWA.

## 2026-08-20 — v2.4.2: Silenci per defecte, Gestió de Rutes, Sanejament GPX i Proves Automatitzades

### Canvis implementats

- **🔇 Àudio OFF per defecte**: L’estat inicial de les alertes sonores passa a silenci (`isAudioEnabled = false`) i persisteix a `localStorage` (`trailgps_audio_enabled`).
- **🗑️ Gestió de rutes desades**: Afegida l'acció per eliminar rutes de la memòria local amb confirmació (`deleteRouteFromHistory`), botó individual `🗑️` i distintiu `MOSTRA` a la ruta demo.
- **🛡️ Sanejament complet de dades GPX**: Límit de 100 caràcters per a títols/noms i 300 per a descripcions; ús de `textContent` i funció d'escapat HTML (`escapeHtml`) a finestres emergents i marcadors.
- **🧪 Suite de proves automatitzades**: Creats els mòduls purs `src/core/geoEngine.mjs` i `src/core/gpxParser.mjs` amb 12 proves unitàries executables amb `npm test` (Node.js test runner natiu).
- **📱 Sincronització PWA i Expo**: Còpies web sincronitzades i comprovada la compilació TypeScript a `trail-gps/`.

## 2026-08-20 — Fase 0.1: estabilització inicial

Commit publicat: `d5a53fe` — `fix: estabilitzar GPS i importació GPX`

### Canvis implementats

- Corregida la compilació TypeScript d’Expo amb la importació de `MapView`.
- Substituït l’ús d’`innerHTML` per `textContent` a la biblioteca de rutes desades.
- Reestructurada la subscripció GPS PWA per mantenir un únic `watchPosition` actiu.
- Afegida degradació controlada a GPS de menor precisió després d’un error.
- Els fixes amb precisió superior a 50 m no actualitzen telemetria ni gravació.
- Evitada la duplicació del listener de brúixola.
- Validació de GPX buit o XML invàlid.
- Límit de 10 MB per fitxer GPX i 25.000 punts de track.
- Histèresi de desviació: entrada a 40 m, recuperació a 25 m i dos fixes consecutius.
- Validada la sintaxi de les dues còpies PWA i la compilació TypeScript d’Expo.
- Actualitzat el full de ruta amb el punt de continuïtat i les tasques pendents.

### Pendent per a la següent sessió

- Limitar longitud dels textos de noms i descripcions GPX.
- Crear proves automatitzades per al parser i la geometria GPS.
- Fer proves manuals en un iPhone i comprovar el comportament amb poca precisió.
- Filtrar salts GPS i freqüència de mostres del gravador.
- Continuar la modularització del motor compartit PWA/Expo.

## 2026-08-19 — v2.4.1

- Hub BLE de freqüència cardíaca, cadència i bateria.
- Zones d’esforç Z1–Z5.
- Exportació GPX amb freqüència cardíaca i cadència.
- Redisseny del cockpit i botó d’ajustos.
