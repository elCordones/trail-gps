# TrailGPS MTB - Estat i Documentació del Projecte

> **Darrera actualització:** 18 d'agost de 2026 (Integració Gestos Tàctils & Bottom Sheets v2.2)  
> **Estat general:** Versió PWA v2.2 completada. S'ha integrat un motor de gestos tàctils professional amb lliscament cap avall (*Swipe Down to Dismiss*), tiradors visuals (*drag handles*) a tots els modals, fons translúcid (*backdrop*) per tancar tocant el mapa i botons d'amagar ergonòmics a la part inferior aptes per a guants de ciclisme.

---

## 1. Descripció i Especificacions del Projecte

- **Objectiu principal**: Aplicació de navegació GPS per a ciclisme/MTB i ciclocomputador d'alt contrast, 100% autònoma, privada (sense comptes, núvol ni telemetria) i optimitzada per a manillar de bicicleta amb guants i sota llum solar directa.
- **Públic destinatari**: Ciclistes de muntanya (MTB / Gravel / Carretera) que necessiten seguir tracks GPX amb precisió (sense snapping a asfalt) i consultar dades clau d'altimetria i telemetria sense dependre de cobertura mòbil.
- **Stack tecnològic**:
  - **PWA Web App**: HTML5, Vanilla CSS3 (disseny fluid d'alt contrast, paleta fosca Slate/OLED i neons cian/taronja), JavaScript modern, Leaflet 1.9.4, SVG dinàmic, Web Audio API, Screen Wake Lock API, Cache Storage API.
  - **Servidor local**: Node.js HTTP server autònom (`server.js`) per a proves en xarxa local (Port 3000).
  - **Base Nativa iOS**: React Native (Expo) amb MapKit, Expo Location, SVG delta arrow i TypeScript (`trail-gps/`).

- **Fitxers clau del projecte**:
  - [README.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/README.md): Guia ràpida de desplegament, característiques i instal·lació PWA.
  - [LICENSE](file:///C:/Users/David/Desktop/App%20bici%20GPS/LICENSE): Llicència legal de programari lliure GNU AGPL v3 (Codi) i CC BY-SA 4.0 (Continguts) - David Cordones (2026).
  - [DOCUMENTACIO_PROJECTE.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/DOCUMENTACIO_PROJECTE.md): Documentació general i bitàcola d'especificacions.
  - [PROJECT_STATUS.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/PROJECT_STATUS.md): Punt de control i continuïtat entre sessions.
  - [index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/index.html) / [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html): Nucli de l'aplicació PWA amb Leaflet, cockpit compacte, bottom sheets, brúixola, perfil ClimbPro, gravador REC, gestor de Waypoints, ciclocomputador complet, Wake Lock i suport tàctil iOS.
  - [web-app/server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/server.js): Servidor Node.js per a proves locals (Port 3000).
  - [trail-gps/](file:///C:/Users/David/Desktop/App%20bici%20GPS/trail-gps/): Projecte mòbil Expo / React Native per a generació de paquet natiu `.ipa`.

---

## 2. Estat Actual i Punt de Control (Tancament de Sessió: 18/08/2026 - v2.2)

- **Feina realitzada en aquesta sessió**:
  - [x] **Motor de Gestos Tàctils (*Swipe Down to Dismiss*)**:
    - Implementació d'un motor tàctil fluid a tots els 7 modals (`#stats-modal`, `#tools-modal`, `#layers-modal`, `#offline-modal`, `#waypoints-modal`, `#routes-modal`, `#info-modal`).
    - Seguiment elàstic del dit en temps real (`translateY`), atenuació dinàmica del fons i tancament automàtic en superar el llindar de 55px o velocitat de llançament cap avall.
    - Resposta hàptica per vibració (`navigator.vibrate(15)`) en tancar el modal amb gest.
  - [x] **Tiradors Visuals de Lliscament (*Drag Handle Pills*)**:
    - Afegit un tirador ergonòmic superior (`.modal-drag-handle`) a tots els modals per indicar visualment la capacitat de lliscament.
  - [x] **Fons Translúcid (*Backdrop Overlay*) i Tancament per Tap al Mapa**:
    - Nou element `#modal-backdrop` amb desenfocament de fons (`backdrop-filter: blur(4px)`) que tanca qualsevol modal amb un sol toc a la pantalla.
    - Integració amb l'event `map.on('click')` de Leaflet per tancar modals immediatament en tocar qualsevol punt del mapa.
  - [x] **Botons Amples d'Amagar Inferiors per a Guants de Bici**:
    - Afegit el botó d'amagar a la part inferior del Ciclocomputador (`#stats-modal`), panell d'Eines (`#tools-modal`) i panell d'Informació (`#info-modal`), accionable fàcilment sense necessitat d'apuntar a la petita `✕` superior.
  - [x] **Unificació de l'Arquitectura de Modals a *Bottom Sheets***:
    - Tots els modals s'alineen harmònicament a la part inferior (`bottom: calc(...) + 68px`) amb animació nativa de pujada (`sheetSlideUp`), situant-se just a sobre del nano-dock de 52px.
  - [x] **Sincronització de Codi i Validació**:
    - `index.html` i `web-app/index.html` sincronitzats al 100% i validats sense errors.

- **Punt exacte on ens hem quedat**:
  - Interfície tàctil 100% optimitzada per a manillar de bicicleta amb guants (gest de lliscament cap avall, toc al mapa i botons amples).
  - Pendent d'implementar alertes sonores intel·ligents (girs, desviacions >25m, proximitat a waypoints) o connectivitat de sensors BLE.

---

## 3. Full de Ruta per a Properes Sessions (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **🎨 Disseny d'Icona i Favicon Professional (PWA & App Nativa)**:
    - Disseny vectorial modern i distintiu (fletxa delta / muntanya / ciclisme tech).
    - Generació d'assets per a PWA (`apple-touch-icon`, `favicon.svg`, `favicon.png`, `manifest.json`).
    - Paquet d'icones per a App Store i Expo / React Native (`icon.png`, `adaptive-icon.png`, `splash.png`).
  - [ ] **🔊 Alertes Sonores i Vibració en Girs / Desviacions de Track**:
    - Notificacions acústiques clares (Web Audio API) en separar-se més de 25m del traçat i en recuperar la ruta.
  - [ ] **💓 Telemetria Avançada i Sensors Bluetooth BLE**:
    - Connexió amb sensors de banda cardíaca (HRM) i cadència via Web Bluetooth API.
  - [ ] **🍏 Sincronització amb Apple Salut & Entrenaments (Apple HealthKit)**:
    - Integració a la versió nativa per desar automàticament les sessions de ciclisme a Apple Health / Fitness (freqüència cardíaca, desnivell +D, velocitats, calories actives i distància).
  - [ ] **⌚ Interacció i Pantalla Remota amb Apple Watch (watchOS)**:
    - Companion app / HUD al canell per visualitzar telemetria clau en directe i rebre vibracions hàptiques en desviacions de track o girs imminents.
  - [ ] **Validació de la navegació en ruta real amb track GPX**.
  - [ ] **Portabilitat a l'App Nativa (`trail-gps` - Expo / React Native)**.
