# TrailGPS MTB — Registre de canvis

## 2026-08-21 — v2.4.12: Validació de Camp Real amb iPhone 12 Pro, Rotació Dinàmica Heading-Up, Wake Lock Resilient iOS i Filtre Doble-Fix

### Canvis implementats

- **🚴 Auditoria i Validació de Sortida Real de Camp (`Sortida_BTT_21_8_2026_PROVA_PARC.gpx`)**:
  - Validació en ruta real amb iPhone 12 Pro (3,91 km, 1h 03m).
  - **Èxit de supressió en repòs**: 0 punts gravats durant l'aturada de 36 minuts (15:50 a 16:26), eliminant completament les teranyines de soroll GPS.
  - **Èxit de filtratge altimètric**: 22 m de desnivell fictici eliminats per l'algorisme EMA + deadband (+44 m reals vs +66 m bruts).
  - Consum energètic molt baix i visibilitat excel·lent dels neons sobre fons fosc sota la llum solar.
- **🧭 Rotació Dinàmica del Mapa en Mode Rumb (*Heading-Up Map Rotation*)**:
  - Envoltat el mapa amb el contenidor `#map-viewport` (`overflow: hidden`) i `#map` sobredimensionat (150% x 150%) amb `transform-origin: 50% 50%`.
  - En mode `headingUp`, el mapa sencer gira fluidament seguint el rumb de la bicicleta (`transform: rotate(-heading deg)`), mantenint la carretera o corriol apuntant cap a dalt de la pantalla.
  - La fletxa cian es manté orientada amunt ($0^\circ$) en mode rumb i rota sobre el mapa en mode `northUp`.
- **📱 Gestor de Pantalla Encesa Resilient per a iOS (*Screen Wake Lock Manager*)**:
  - Re-adquisició automàtica garantida de `navigator.wakeLock` a qualsevol toc de pantalla (`touchstart`, `click`, `btn-rec`, `btn-recenter`), superant la restricció d'activació de Safari iOS.
  - Re-activació en canvis de visibilitat (`visibilitychange`) i suport amb bucle d'àudio silenciós WebAudio per evitar que iOS congeli el GPS en suspendre la pantalla.
  - Indicador visual d'estat a la barra superior (`🔆 PANTALLA ON`).
- **⏱️ Filtre de Doble-Fix GPS (`BreadcrumbSampler`)**:
  - Afegida guarda temporal mínima ($\Delta t \ge 0.45\text{ s}$) i topall de velocitat instantània ($100\text{ km/h}$) a `geoEngine.mjs`, `geoMath.ts` i `index.html`.
  - Eliminats els pics artificials de velocitat punta provocats per dobles lectures consecutives de Safari/GPS en mil·lisegons.
- **🧪 38 Proves Unitàries Automatitzades (`npm test` 100% OK)**:
  - Suite de proves actualitzada per cobrir la supressió de double-fixes i salts anòmals de velocitat.
- **📱 Sincronització de Codi i Compilació**:
  - `index.html` i `web-app/index.html` sincronitzats.
  - Compilació TypeScript Expo (`npx tsc --noEmit`) 100% neta.

## 2026-08-21 — v2.4.11: Sincronització de Mòduls Compartits a React Native (Expo) i Col·lecció de GPX de Prova

### Canvis implementats

- **🍏 Sincronització Completa dels Mòduls a React Native / Expo (`trail-gps/`)**:
  - **Motor Geomètric i Altimètric**: Traslladat tot el nucli pur a TypeScript a `trail-gps/src/utils/geoMath.ts` (`ElevationFilter`, `GpsQualityFilter`, `BreadcrumbSampler`, `filterElevationSeries`, `getPointAtElevationProgress`, `BatteryRenderPolicy`).
  - **Suport de Waypoints & Turn-by-Turn**: Actualitzat el parser GPX natiu (`gpxParser.ts`) per extraure waypoints (`<wpt>`) i calcular alertes de girs i cruïlles (`detectTrackTurns`).
  - **Indicador HUD Turn-by-Turn**: Afegit panell de proper gir al ciclocomputador natiu (`CockpitDashboard.tsx`).
  - **Mòdul de descàrrega GPX**: Creat `gpxFetcher.ts` amb detecció de Wikiloc i proxies múltiples per a l'app mòbil.
  - **Compilació TypeScript Neta**: 0 errors a `npx tsc --noEmit`.
- **🗂️ Col·lecció de Rutes GPX de Prova (`samples/`)**:
  - Creada carpeta `samples/` amb rutes reals i completes:
    - `riudellots-caldes-btt.gpx`: Circuit tancat BTT amb múltiples waypoints culturals i fites de cruïlla.
    - `collserola-gravel-epic.gpx`: Ruta de desnivell sever (170m a 512m Cim Tibidabo) per validar ClimbPro i alertes de trialera.
- **🧪 38 Proves Unitàries Automatitzades (`npm test`)**:
  - 100% de proves superades.

## 2026-08-21 — v2.4.10: Detecció de Pàgines de Wikiloc, Cadena de Proxies Fallback i 38 Proves Automatitzades

### Canvis implementats

- **🌐 Detecció Específica d'Enllaços de Wikiloc (`isWikilocUrl`)**:
  - Detecció d'adreces de pàgines web de Wikiloc (`wikiloc.com/rutas-...`) que contenen pàgines HTML protegides per inici de sessió i no pas fitxers `.gpx` directes.
  - **Missatges d'ajuda ergonòmics**: Indicació clara a l'usuari sobre com descarregar el GPX des de Wikiloc (*"Descargar > Archivo > GPX"*) i carregar-lo directament des del mòbil amb el botó **📂 Tria Fitxer (.gpx)**.
- **🔄 Cadena de Proxies CORS Fallback Resilient**:
  - Implementat sistema de fallada en cascada (*failover*) amb múltiples servidors proxy públics (`api.allorigins.win`, `api.codetabs.com`) per a enllaços GPX directes d'altres servidors oberts que bloquegen CORS.
- **🧪 Suite de proves ampliada a 38 tests (`npm test`)**:
  - Noves proves unitàries a `tests/gpx-fetcher.test.mjs` validant la detecció d'enllaços de Wikiloc i la resposta controlada davant de pàgines HTML protegides (100% de tests passant).
- **📱 Sincronització de Codi**:
  - Fitxers `index.html` i `web-app/index.html` sincronitzats amb hash SHA256 idèntic.

## 2026-08-21 — v2.4.9: Mode d'Estalvi de Bateria (Eco), Renderitzat Intel·ligent i 36 Proves Automatitzades

### Canvis implementats

- **🔋 Gestor de Bateria i Mode Eco Automàtic (`BatteryRenderPolicy`)**:
  - Integració de la Battery Status API (`navigator.getBattery()`) amb monitoratge en temps real de percentatge i estat de càrrega.
  - **Activació intel·ligent automàtica**: Quan la bateria baixa de $\le 20\%$ i el dispositiu no està connectat a càrrega, s'activa automàticament el mode Eco per evitar que el telèfon s'apagui a meitat de ruta.
  - **Selector i indicador manual**: Botó ràpid d'estalvi a la graella d'ajustos (`#btn-eco-toggle`) i xip indicador verd a la barra superior (`#btn-top-eco`).
- **⚡ Renderitzat Cartogràfic Intel·ligent (Throttling)**:
  - **Filtre de moviment**: Quan el ciclista està aturat o en repòs ($< 2.5\text{ km/h}$), s'espaien els refrescos del mapa i es redueixen les crides a `map.panTo()` de mil·lisegons continus a $1.5\text{ s}$ ($2.0\text{ s}$ en mode Eco).
  - **Filtre de rumb de compàs**: Suprimeix el soroll i oscil·lacions residuals d'orientació ($< 4^\circ$) per evitar repintats innecessaris del vector direccional.
  - **Optimització de GPU**: En mode Eco es desactiven automàticament els filtres `backdrop-filter: blur()` i animacions de fons a tot el CSS de l'aplicació, allargant dràsticament l'autonomia en pantalles OLED/Retina durant sortides de 4 a 6 hores.
- **🧪 Suite de proves ampliada a 36 tests (`npm test`)**:
  - Nova prova unitària a `tests/geo-engine.test.mjs` que valida les polítiques de refresc de `BatteryRenderPolicy` (100% de tests passant).
- **📱 Sincronització de Codi**:
  - Fitxers `index.html` i `web-app/index.html` sincronitzats amb hash SHA256 idèntic.

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
