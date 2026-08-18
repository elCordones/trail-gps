# TrailGPS MTB - Estat i Documentació del Projecte

> **Darrera actualització:** 18 d'agost de 2026 (Redisseny Integral UI Manillar & ClimbPro v2.1)  
> **Estat general:** Versió PWA v2.1 completada, arquitectura de capes i controls reorganitzada per a iPhone (pantalla completa sense franges), pastilla de zoom flotant al centre dret, càpsula nano-dock de 52px i perfil d'altimetria ClimbPro professional amb càlcul de desnivell acumulat i telemetria per colors de pendent.

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
  - [x] **Eliminació definitiva de la Franja Fosca Inferior (Cockpit Nano-Dock 52px)**:
    - S'ha extret el panell d'eines de l'interior del Cockpit cap a un **Action Sheet Modal independent (`#tools-modal`)**, evitant reserves d'espai buit o alçades fantasma.
    - El Cockpit s'ha convertit en una nano-càpsula flotant d'alçada ultra-ajustada (`52px`), amb cantonades arrodonides (`18px`), línia superior de progrés en temps real (`#cockpit-progress-fill`) i 3 mètriques clau (*Velocitat*, *Restant*, *Al Track* en verd/vermell) més botó `⚡ Eines`.
  - [x] **Separació Total i Redisseny dels Controls de Zoom (Pastilla Connectada al Centre Dret)**:
    - Els controls flotants (🎯 On sóc, 🧭 Rumb/Nord, ⛰️ ClimbPro) i la nova pastilla unificada de zoom `[ + | − ]` s'han situat al **centre vertical dret de la pantalla (`top: 48%; transform: translateY(-50%)`)**.
    - Això deixa més de **200px de distància neta de mapa lliure per sobre del cockpit**, fent físicament impossible cap contacte o solapament visual entre el botó de zoom `−` i la part inferior.
  - [x] **Transparència Cristal·lina ClimbPro i Simplificació de la Barra Superior**:
    - Fons de la targeta d'altimetria ajustat a `rgba(15, 23, 42, 0.28)` amb blur lleuger (`8px`) i gradient SVG de baixa densitat (`0.22` a `0.01`) per permetre la visió nítida dels camins i senders per sota del gràfic.
  - [x] **Comportament Bidireccional (Toggle) del Ciclocomputador al Cockpit**:
    - Ara en tocar el Cockpit (mètriques de velocitat, distància o desviació), el panell de telemetria completa (`#stats-modal`) s'obre si estava tancat, i **es tanca automàticament si ja estava obert**, sense obligar l'usuari a tocar la `✕` superior.
  - [x] **Sincronització de Fitxers i Codi**:
    - Totes les millores s'han aplicat i verificat tant a `index.html` com a `web-app/index.html`.

- **Punt exacte on ens hem quedat**:
  - Interfície d'usuari ultra-neta, amb ClimbPro translúcid, controls ergonòmics, commutador ràpid de telemetria al cockpit i codi validat.
  - Codi pujat a GitHub (`elCordones/trail-gps`).

---

## 3. Full de Ruta per a Properes Tasques (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **Validació visual a l'iPhone (Safari i PWA autònoma)**.
  - [ ] **Ajust de configuració de pestanyes a Safari** (*Ajustos > Safari > Pestanya única a dalt*) si es vol eliminar la barra inferior nativa de Safari en navegar per web.
  - [ ] **Fase de telemetria avançada**: sensors BLE o millores en el seguiment en segon pla.
