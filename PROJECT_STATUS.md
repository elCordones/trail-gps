# TrailGPS MTB - Estat i Documentació del Projecte

> **Darrera actualització:** 17 d'agost de 2026 (Tancament de sessió)  
> **Estat general:** Versió PWA v2.0 completada, redissenyada per a manillar, blindada amb llicències GNU AGPLv3/CC BY-SA 4.0 i publicada a GitHub Pages (`https://elcordones.github.io/trail-gps/`)

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
  - [index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/index.html) / [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html): Nucli de l'aplicació PWA amb Leaflet, cockpit compacte, drawer, brúixola, perfil ClimbPro, gravador REC, gestor de Waypoints, ciclocomputador complet, Wake Lock i suport tàctil iOS.
  - [web-app/server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/server.js): Servidor Node.js per a proves locals (Port 3000).
  - [trail-gps/](file:///C:/Users/David/Desktop/App%20bici%20GPS/trail-gps/): Projecte mòbil Expo / React Native per a generació de paquet natiu `.ipa`.

---

## 2. Estat Actual i Punt de Control (Sessió: 18/08/2026)

- **Feina realitzada en aquesta sessió**:
  - [x] **Redisseny del Cockpit com a Illa Flotant Arrodonida (Eliminació definitiva del peu de pantalla fosc)**:
    - En lloc d'un bloc sòlid fixat a `bottom: 0`, el Cockpit s'ha transformat en una **targeta/illa flotant** amb cantonades 100% arrodonides (`20px`), marges laterals (`12px`) i separada de la base del vidre (`bottom: calc(max(env(safe-area-inset-bottom, 8px), 8px) + 4px)`).
    - El mapa Leaflet ara és visible tot al voltant i per sota del Cockpit, eliminant completament la sensació de "franja fosca" o barra tallada a la part inferior d'iOS tant a Safari com en mode App PWA autònoma.
  - [x] **Optimització de Transparència Real ClimbPro**:
    - Fons ajustat a `rgba(15, 23, 42, 0.38)` amb blur lleuger (`8px`) i subtil vora cian `rgba(0, 229, 255, 0.35)` per veure clarament senders, camins i corbes de nivell del mapa per darrere.
    - Gradient suau de l'SVG (`0.40` a `0.02`) que maximitza la translucidesa del terreny.
  - [x] **Separació Neta del Botó de Zoom (`−`) i Thumb Dock**:
    - Botons de polze compactats a 42px/36px amb separació de 6px.
    - Posició vertical elevada que garanteix **22px nets de mapa visible entre el botó `−` i la part superior del Cockpit**, evitant qualsevol contacte o solapament.
    - Sincronització fluida amb l'obertura del calaix d'eines (`drawer-open`).

- **Punt exacte on ens hem quedat**:
  - Interfície PWA redissenyada amb Cockpit flotant, ClimbPro translúcid i màxima llibertat per al mapa sense cap franja bloquejant la pantalla.
  - Canvis aplicats a [index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/index.html) i [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html).

---

## 3. Full de Ruta per a Properes Tasques (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **Pujar canvis a GitHub** (`git commit & push`) perquè la PWA a GitHub Pages s'actualitzi automàticament.
  - [ ] **Proves a Safari/iPhone** per validar la translucidesa i l'encaix de pantalla completa.
  - [ ] **Fase Nativa iOS (`trail-gps/` o Capacitor)** o connexió de sensors BLE / Mode estalvi de bateria.
