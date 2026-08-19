# TrailGPS MTB - Estat i Documentació del Projecte

> **Darrera actualització:** 19 d'agost de 2026 (Sensors BLE, Zones Z1-Z5, Optimització Cockpit & Botó Ajustos ⚙️ v2.4.1)  
> **Estat general:** Versió PWA v2.4.1 completada amb Hub Universal de Sensors Bluetooth Low Energy (Web Bluetooth API), suport per a bandes cardíaques (HRM) i sensors de cadència (CSC), càlcul de Zones d'Esforç Z1-Z5, exportació GPX amb telemetria i redisseny fluid del Cockpit inferior amb el botó d'Ajustos (**⚙️**) perfectament alineat a la dreta.

---

## 1. Descripció i Especificacions del Projecte

- **Objectiu principal**: Aplicació de navegació GPS per a ciclisme/MTB i ciclocomputador d'alt contrast, 100% autònoma, privada (sense comptes, núvol ni telemetria) i optimitzada per a manillar de bicicleta amb guants i sota llum solar directa.
- **Públic destinatari**: Ciclistes de muntanya (MTB / Gravel / Carretera) que necessiten seguir tracks GPX amb precisió (sense snapping a asfalt) i consultar dades clau d'altimetria i telemetria sense dependre de cobertura mòbil.
- **Stack tecnològic**:
  - **PWA Web App**: HTML5, Vanilla CSS3 (disseny fluid d'alt contrast, paleta fosca Slate/OLED i neons cian/taronja), JavaScript modern, Leaflet 1.9.4, Web Bluetooth API (GATT Standard), Web Audio API, Screen Wake Lock API, Cache Storage API.
  - **Servidor local**: Node.js HTTP server autònom (`server.js`) per a proves en xarxa local (Port 3000).
  - **Base Nativa iOS**: React Native (Expo) amb MapKit, Expo Location, SVG delta arrow i TypeScript (`trail-gps/`).

- **Estructura i Fitxers Clau del Projecte**:
  - [README.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/README.md): Guia ràpida de desplegament, característiques i instal·lació PWA.
  - [LICENSE](file:///C:/Users/David/Desktop/App%20bici%20GPS/LICENSE): Llicència legal de programari lliure GNU AGPL v3 (Codi) i CC BY-SA 4.0 (Continguts) - David Cordones (2026).
  - [PROJECT_STATUS.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/PROJECT_STATUS.md): Punt de control i continuïtat entre sessions.
  - [docs/DOCUMENTACIO_PROJECTE.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/docs/DOCUMENTACIO_PROJECTE.md): Documentació exhaustiva d'especificacions i arquitectura.
  - [index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/index.html) / [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html): Nucli de l'aplicació PWA amb Leaflet, motor Turn-by-Turn, Hub de Sensors BLE (BPM i RPM), Zones Cardíaques Z1-Z5, cockpit compacte fluid amb botó `⚙️ Ajustos`, bottom sheets, brúixola, perfil ClimbPro, gravador REC amb telemetria, gestor de Waypoints, ciclocomputador complet, Wake Lock i suport tàctil iOS.
  - [manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/manifest.json) / [web-app/manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/manifest.json): Web App Manifest per a instal·lació PWA autònoma a pantalla completa.
  - [assets/icons/](file:///C:/Users/David/Desktop/App%20bici%20GPS/assets/icons/): Paquet complet d'icones PWA, favicons i Apple Touch Icons d'alta resolució.
  - [assets/brand/](file:///C:/Users/David/Desktop/App%20bici%20GPS/assets/brand/): Imatges mestres d'alta resolució (`master-icon.png`, `master-icon.jfif`).
  - [scripts/generate-icons.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/scripts/generate-icons.js): Generador automàtic de tot el paquet d'icones iOS / PWA / Expo amb `sharp`.
  - [server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/server.js) / [web-app/server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/server.js): Servidor Node.js per a proves locals (Port 3000).
  - [trail-gps/](file:///C:/Users/David/Desktop/App%20bici%20GPS/trail-gps/): Projecte mòbil Expo / React Native per a paquet natiu `.ipa`.

---

## 2. Estat Actual i Punt de Control (Tancament de Sessió: 19/08/2026 - v2.4.1)

- **Feina realitzada en aquesta sessió**:
  - [x] **Hub Universal de Sensors Bluetooth Low Energy (BLE)**:
    - Connexió amb serveis universals estàndard Bluetooth GATT:
      - 💓 **Heart Rate Service (`0x180D`)**: Lectura de BPM en temps real, màxim i mitjà.
      - 🔄 **Cycling Speed and Cadence Service (`0x1816`)**: Lectura de revolucions de biela i càlcul de RPM de pedaleig.
      - 🔋 **Battery Service (`0x180F`)**: Monitorització del % de bateria del sensor.
  - [x] **Càlcul Dinàmic de Zones Cardíaques (Z1 a Z5)**:
    - Algoritme de percentatge de FC Màxima configurable per l'usuari (per defecte 185 bpm, amb memòria a `localStorage`):
      - 🔵 **Z1 Recuperació** (<60% HRmax - Blau `#38BDF8`)
      - 🟢 **Z2 Aeròbic base / Crema de greixos** (60-70% - Verd `#10B981`)
      - 🟡 **Z3 Ritme / Tempo** (70-80% - Groc `#FACC15`)
      - 🟠 **Z4 Llindar Anaeròbic** (80-90% - Taronja `#FF6600`)
      - 🔴 **Z5 Màxim Esforç / Vo2Max** (>90% - Vermell `#EF4444`)
  - [x] **Integració i Optimització UI Cockpit & Botó d'Ajustos**:
    - **Alineació perfecta del Cockpit Dock**: S'ha migrat `.hud-card-strip` a un disseny Flexbox fluid i proporcional, evitant desplaçaments estranys quan s'activa o s'amaga la pastilla de pols cardíac.
    - **Substitució de la icona**: S'ha canviat la icona del llamp `⚡` per l'engranatge estàndard **`⚙️`** amb etiqueta **`Ajustos`**, molt més representativa de la configuració i eines de l'aplicació.
    - **Modal de Gestió de Sensors (`#sensors-modal`)**: Targetes individuals per a banda cardíaca i cadència amb estat de connexió, botons d'emparellar/desconnectar, selector de FC Màxima i llegenda de zones.
    - **Simulador Virtual de Sensors BLE**: Permet provar el funcionament sense sensors físics simulant pols i cadència sincronitzats amb el pendent del terreny i la velocitat.
    - **Ciclocomputador Ampliat (`#stats-modal`)**: Targetes noves per a Pols Actual, FC Mitjana/Màxima, Cadència (RPM) i Estimació de Calories (kcal).
    - **Calaix d'Eines / Ajustos (`#tools-modal`)**: Grid simètric de 3x3 amb accés directe a **`💓 SENSORS`**.
  - [x] **Exportació GPX Enriquida (Extensions Garmin / Strava / Apple Health)**:
    - El gravador REC desa les mostres de pols i cadència directament a l'arxiu `.gpx` emprant el format estàndard `<extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>...<gpxtpx:cad>...`.

- **Punt exacte on ens hem quedat**:
  - Fase A (Sensors Bluetooth BLE & Zones Cardíaques) completada, validada i sincronitzada a `index.html` i `web-app/index.html`.
  - Preparat per a les següents etapes: Descàrrega directa de rutes per URL/Wikiloc o inici de la branca nativa Expo (Apple Watch Companion & HealthKit).

---

## 3. Full de Ruta per a Properes Sessions (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **🔇 Àudio OFF per defecte i Persistència d'Estat Acústic**:
    - Configurar l'estat inicial de les alertes sonores a apagat/silenci per defecte (`isAudioEnabled = false`), activable voluntàriament des del panell d'ajustos.
  - [ ] **🗑️ Gestió Avançada de Rutes Desades (`#routes-modal`)**:
    - Afegir acció per eliminar/esborrar rutes individuals de la biblioteca local (`localStorage`) amb botó `🗑️`, modal de confirmació i refresc dinàmic de la llista.
  - [ ] **🔗 Descàrrega Directa de Rutes per URL (Wikiloc, Strava, Enllaç directe GPX)**:
    - Camp d'importació per enllaç web al modal de rutes amb descàrrega automàtica i emmagatzematge local.
  - [ ] **🍏 Sincronització amb Apple Salut & Entrenaments (Apple HealthKit)**:
    - Integració a la versió nativa per desar automàticament les sessions de ciclisme a Apple Health / Fitness a partir de les dades del Sensor Hub.
  - [ ] **⌚ Companion App per a Apple Watch (watchOS)**:
    - HUD al canell per visualitzar telemetria clau (BPM, fletxes de gir, desnivell) i rebre vibracions hàptiques de gir o desviació.
  - [ ] **Validació de la navegació en ruta real de camp**.
  - [ ] **Portabilitat dels indicadors de gir i BLE a React Native / Expo (`trail-gps`)**.
