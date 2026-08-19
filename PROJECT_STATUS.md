# TrailGPS MTB - Estat i Documentació del Projecte

> **Darrera actualització:** 19 d'agost de 2026 (Indicadors de Girs & Cruïlles Turn-by-Turn, Roadbook Cue Sheet, Toggles de Visualització & Àudio v2.3.1)  
> **Estat general:** Versió PWA v2.3.1 completada amb opcions independents per activar o desactivar la targeta de gir HUD, les fites de gir sobre el mapa i els avisos acústics de maniobra, amb persistència a `localStorage`.

---

## 1. Descripció i Especificacions del Projecte

- **Objectiu principal**: Aplicació de navegació GPS per a ciclisme/MTB i ciclocomputador d'alt contrast, 100% autònoma, privada (sense comptes, núvol ni telemetria) i optimitzada per a manillar de bicicleta amb guants i sota llum solar directa.
- **Públic destinatari**: Ciclistes de muntanya (MTB / Gravel / Carretera) que necessiten seguir tracks GPX amb precisió (sense snapping a asfalt) i consultar dades clau d'altimetria i telemetria sense dependre de cobertura mòbil.
- **Stack tecnològic**:
  - **PWA Web App**: HTML5, Vanilla CSS3 (disseny fluid d'alt contrast, paleta fosca Slate/OLED i neons cian/taronja), JavaScript modern, Leaflet 1.9.4, SVG dinàmic, Web Audio API, Screen Wake Lock API, Cache Storage API.
  - **Servidor local**: Node.js HTTP server autònom (`server.js`) per a proves en xarxa local (Port 3000).
  - **Base Nativa iOS**: React Native (Expo) amb MapKit, Expo Location, SVG delta arrow i TypeScript (`trail-gps/`).

- **Estructura i Fitxers Clau del Projecte**:
  - [README.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/README.md): Guia ràpida de desplegament, característiques i instal·lació PWA.
  - [LICENSE](file:///C:/Users/David/Desktop/App%20bici%20GPS/LICENSE): Llicència legal de programari lliure GNU AGPL v3 (Codi) i CC BY-SA 4.0 (Continguts) - David Cordones (2026).
  - [PROJECT_STATUS.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/PROJECT_STATUS.md): Punt de control i continuïtat entre sessions.
  - [docs/DOCUMENTACIO_PROJECTE.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/docs/DOCUMENTACIO_PROJECTE.md): Documentació exhaustiva d'especificacions i arquitectura.
  - [index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/index.html) / [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html): Nucli de l'aplicació PWA amb Leaflet, motor Turn-by-Turn, panell de control de visualització de girs, roadbook de girs, cockpit compacte, bottom sheets, brúixola, perfil ClimbPro, gravador REC, gestor de Waypoints, ciclocomputador complet, Wake Lock i suport tàctil iOS.
  - [manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/manifest.json) / [web-app/manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/manifest.json): Web App Manifest per a instal·lació PWA autònoma a pantalla completa.
  - [assets/icons/](file:///C:/Users/David/Desktop/App%20bici%20GPS/assets/icons/): Paquet complet d'icones PWA, favicons i Apple Touch Icons d'alta resolució.
  - [assets/brand/](file:///C:/Users/David/Desktop/App%20bici%20GPS/assets/brand/): Imatges mestres d'alta resolució (`master-icon.png`, `master-icon.jfif`).
  - [scripts/generate-icons.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/scripts/generate-icons.js): Generador automàtic de tot el paquet d'icones iOS / PWA / Expo amb `sharp`.
  - [server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/server.js) / [web-app/server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/server.js): Servidor Node.js per a proves locals (Port 3000).
  - [trail-gps/](file:///C:/Users/David/Desktop/App%20bici%20GPS/trail-gps/): Projecte mòbil Expo / React Native per a paquet natiu `.ipa`.

---

## 2. Estat Actual i Punt de Control (Tancament de Sessió: 19/08/2026 - v2.3.1)

- **Feina realitzada en aquesta sessió**:
  - [x] **Motor Autònom de Detecció de Girs i Cruïlles (Turn Detection Engine)**:
    - Algorisme trigonomètric de rumb dinàmic amb finestra adaptativa per filtrar el soroll GPS en camins i corriols estrets.
    - Classificació matemàtica dels girs: Lleuger (26°-52°), Gir estàndard (52°-100°), Forquilla / Tancat (100°-145°) i Canvi de sentit / U-Turn (>145°).
    - Agrupació matemàtica per identificar el vèrtex exacte de la corba (àpex) i associació contextual de Waypoints propers (ex: *"Lleuger a la dreta (Cim del Mirador BTT)"*).
  - [x] **Banner Flotant HUD Turn-by-Turn**:
    - Targeta superior d'alt contrast amb fletxes vectorials SVG d'alta fidelitat (`#00E5FF` girs normals, `#FF6600` forquilles, `#EF4444` U-turns).
    - Compte enrere en directe: metres fins al gir, transició a badge fluorescent `ARA` (<14m) i indicació de destinació en finalitzar.
    - Botons `📋` (obrir el Roadbook) i `✕` (amagar ràpidament la targeta de gir).
  - [x] **Panell de Configuració i Toggles de Girs a `#turns-modal`**:
    - Botó de commutació **🧭 Targeta HUD** (ON / OFF): Permet amagar o mostrar el banner superior flotant.
    - Botó de commutació **🗺️ Fites Mapa** (ON / OFF): Permet mostrar o amagar les fites circulars de gir sobre el mapa Leaflet.
    - Botó de commutació **🔔 Avisos So** (ON / OFF): Permet activar o silenciar els avisos acústics específics de girs (mantenint si es vol les alertes de desviació de ruta).
    - Persistència total de les preferències de l'usuari mitjançant `localStorage`.
  - [x] **Llista Roadbook de Girs i Cruïlles (`#turns-modal`)**:
    - Modal tàctil amb resum de girs totals, quilometratge del track i llista cronològica de girs amb cota d'elevació i angle.
    - Indicadors d'estat per a cada gir en temps real: `PASSAT`, `a 85m`, `ARA`.
    - En tocar qualsevol gir de la llista, el mapa es desplaça automàticament per visualitzar-ne el punt exacte.
  - [x] **Fites Visuals de Gir al Mapa Leaflet (`turnMarkersLayer`)**:
    - Capa de xapes circulars d'alt contrast situades sobre cada corba destacada amb la icona de direcció.
    - Tooltip emergent amb informació del punt en clicar sobre el mapa.
  - [x] **Sintetitzador Acústic i Hàptic Intel·ligent (Web Audio API)**:
    - **Avís d'aproximació** (~40m abans del gir): Melodia cristal·lina de dos tons ascendents (G5 -> C6).
    - **Avís immediat** (<14m): To sòlid de confirmació (A5).
    - **Alerta de fora de ruta** (>40m): Alerta acústica descendent d'avís (A5 -> A4).
    - **Ruta recuperada**: Tríada harmònica ascendent alegre (C5 -> E5 -> G5) en tornar al camí.
    - Botó de control d'àudio (🔊 ON / 🔇 SILENCI) afegit al menú d'eines.
  - [x] **Sincronització amb el Simulador GPS**:
    - El simulador virtual recorre el track executant en temps real el compte enrere de metres, l'actualització de fletxes i els avisos acústics de gir.

- **Punt exacte on ens hem quedat**:
  - Motor de Turn-by-Turn i roadbook completament integrat i validat sintàcticament a `index.html` i `web-app/index.html`.
  - Pendent d'iniciar el següent bloc funcional: Sensors Bluetooth BLE (Banda Cardíaca HRM & Cadència).

---

## 3. Full de Ruta per a Properes Sessions (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **💓 Telemetria Avançada i Sensors Bluetooth BLE**:
    - Connexió amb sensors de banda cardíaca (Heart Rate Service `0x180D`) i sensors de cadència (`0x1816`) via Web Bluetooth API.
    - Visualització de BPM i zones cardíaques (Z1-Z5 amb codi de colors) al cockpit i ciclocomputador ampliat.
    - Exportació de pulsacions i cadència al fitxer GPX del gravador REC (`gpxtpx:hr`, `gpxtpx:cad`).
  - [ ] **🍏 Sincronització amb Apple Salut & Entrenaments (Apple HealthKit)**:
    - Integració a la versió nativa per desar automàticament les sessions de ciclisme a Apple Health / Fitness.
  - [ ] **⌚ Companion App per a Apple Watch (watchOS)**:
    - HUD al canell per visualitzar telemetria clau en directe i rebre vibracions hàptiques de gir o desviació.
  - [ ] **Validació de la navegació en ruta real de camp**.
  - [ ] **Portabilitat dels indicadors de gir a React Native / Expo (`trail-gps`)**.
