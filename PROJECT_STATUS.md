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

## 2. Estat Actual i Punt de Control (Tancament de Sessió: 18/08/2026)

- **Feina realitzada en aquesta sessió**:
  - [x] **Redisseny del Cockpit a Nano-Càpsula Flotant (52px)**:
    - Extracció del calaix d'eines cap a un **Action Sheet Modal independent (`#tools-modal`)**, evitant reserves d'espai buit o alçades fantasma.
    - Càpsula flotant ergonòmica amb línia de progrés cian neó (`#cockpit-progress-fill`) i 3 mètriques clau (*Velocitat*, *Restant*, *Al Track* en verd/vermell) amb accés directe `⚡ Eines`.
  - [x] **Separació Total i Redisseny dels Controls de Zoom (Pastilla Connectada al Centre Dret)**:
    - Els controls flotants (🎯 On sóc, 🧭 Rumb/Nord, ⛰️ ClimbPro) i la nova pastilla unificada de zoom `[ + | − ]` s'han situat al **centre vertical dret (`top: 48%; transform: translateY(-50%)`)**.
    - Distància lliure de mapa de més de 200px sobre el cockpit inferior (0% col·lisions visuals).
  - [x] **Transparència Cristal·lina ClimbPro i Simplificació de la Barra Superior**:
    - Fons de la targeta d'altimetria ajustat a `rgba(15, 23, 42, 0.28)` amb blur lleuger (`8px`) i gradient SVG atenuat (`0.22` a `0.01`) per permetre veure senders i camins per sota de la corba.
    - Eliminat el botó redundant `⚡ Eines` de la barra superior, deixant-la completament neta amb només el logotip/GPS i el botó `REC`.
  - [x] **Ajust del Layout de Pantalla Completa per a iOS (Safari i PWA)**:
    - Eliminació de restriccions `100vh` que provocaven talls a la part inferior en mode autònom a iPhone.
  - [x] **Sincronització de Codi i Validació**:
    - `index.html` i `web-app/index.html` sincronitzats al 100%, validats sense errors de sintaxi JS i pujats a GitHub Pages (`main`).

- **Punt exacte on ens hem quedat**:
  - Interfície d'usuari (ClimbPro, pastilla de zoom i cockpit nano-dock) visualment polida i integrada.
  - Pendent d'investigar i redissenyar una interacció més còmoda i directa per tancar el panell de telemetria/ciclocomputador a iPhone (com un gest de lliscament cap avall *swipe down*, un botó d'amagar gran o un toc a qualsevol zona del mapa).

---

## 3. Full de Ruta per a Properes Sessions (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **Mètode de Tancament Fàcil del Ciclocomputador a Manillar**:
    - Dissenyar una alternativa tàctil ergonòmica (p. ex. gest de lliscament cap avall *swipe to dismiss*, botó flotant inferior d'amagar o tancament immediat tocant fora a qualsevol punt del mapa).
  - [ ] **Validació de la navegació en ruta real amb track GPX**.
  - [ ] **Alertes Sonores i Vibració en Girs / Desviacions de Track**:
    - Notificacions acústiques clares quan el ciclista se separa més de 25m del traçat.
  - [ ] **Telemetria Avançada i Sensors Bluetooth BLE**:
    - Connexió amb sensors de banda cardíaca i cadència via Web Bluetooth API.
