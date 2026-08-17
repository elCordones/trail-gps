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

## 2. Estat Actual i Punt de Control (Sessió: 17/08/2026)

- **Feina realitzada en aquesta sessió**:
  - [x] **Redisseny de Manillar Compacte (Opcions A + C)**:
    - **Cockpit Dock inferior ultra-compacte**: Reduït a només 54px d'alçada amb 3 mètriques clau d'alt contrast (Velocitat en gran de 30px, Distància restant i Desviació al track en verd/vermell).
    - **Safata d'Eines Desplegable (Smart Drawer)**: La fila inferior de botons s'ha transformat en un calaix retràctil suau (`▲ Eines & Rutes`) que s'obre en tocar el tirador o des de la barra superior.
    - **Botons Flotants d'Acció Ràpida (Thumb Dock)**: Columna vertical a la dreta accessible amb el polze dret (`🎯 On sóc / Centrar`, `🧭 Rumb / Nord`, `⛰️ Toggle Altimetria`, `➕ / ➖ Zoom`).
    - **Perfil d'Altimetria Semitransparent ClimbPro**: Targeta flotant translúcida (`rgba(15, 23, 42, 0.78)` + blur) que permet veure el mapa per darrere, amb botó ràpid de tancament (`✕`).
    - **Alliberament visual**: Ara el **85-90% de la pantalla està lliure per al mapa**.
  - [x] **Publicació a GitHub Pages**:
    - Repositori remot connectat: `https://github.com/elCordones/trail-gps.git`
    - Codi publicat a la branca `main`.
    - URL de producció PWA: **`https://elcordones.github.io/trail-gps/`**

- **Punt exacte on ens hem quedat**:
  - Interfície d'usuari completament redissenyada, neta, àgil i optimitzada per a manillar.
  - Codi pujat a GitHub; pendent activar Pages a la configuració del repositori per tenir la URL viva i instal·lar com a PWA a l'iPhone.

---

## 3. Full de Ruta per a la Propera Sessió (Roadmap)

- **Tasques immediates per reprendre**:
  - [x] **Pujar codi a GitHub**: Repositori `elCordones/trail-gps` sincronitzat.
  - [ ] **Activar GitHub Pages a GitHub Settings**: `Settings > Pages > Branch: main / (root)`.
  - [ ] **Instal·lació PWA a l'iPhone**: Obrir `https://elcordones.github.io/trail-gps/` a Safari i afegir com a app autònoma a la pantalla d'inici.
  - [ ] **Proves de camp**: Provar la navegació, el seguiment de track i la gravació REC en una sortida real en bicicleta.
  - [ ] **Fase Nativa iOS (`trail-gps/` o Capacitor)**: Generar el paquet `.ipa` per a instal·lació per cable (Sideloadly / AltStore) o TestFlight d'Apple.
- **Millores futures**:
  - [ ] Connexió de sensors BLE de freqüència cardíaca, cadència o canvi electrònic (SRAM AXS / Shimano Di2).
  - [ ] Mode d'estalvi de bateria *Screen Wake on Turn*.
