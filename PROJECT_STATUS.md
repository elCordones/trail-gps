# TrailGPS MTB - Estat i Documentació del Projecte

> **Darrera actualització:** 17 d'agost de 2026 (Tancament de sessió)  
> **Estat general:** Versió PWA completada i optimitzada per a iOS / Pendent desplegament a GitHub Pages o Netlify Drop

---

## 1. Descripció i Especificacions del Projecte

- **Objectiu principal**: Aplicació de navegació GPS per a ciclisme/MTB i ciclocomputador d'alt contrast, 100% autònoma, privada (sense comptes, núvol ni telemetria) i optimitzada per a manillar de bicicleta amb guants i sota llum solar directa.
- **Públic destinatari**: Ciclistes de muntanya (MTB / Gravel / Carretera) que necessiten seguir tracks GPX amb precisió (sense snapping a asfalt) i consultar dades clau d'altimetria i telemetria sense dependre de cobertura mòbil.
- **Stack tecnològic**:
  - **PWA Web App**: HTML5, Vanilla CSS3 (disseny fluid d'alt contrast, paleta fosca Slate/OLED i neons cian/taronja), JavaScript modern, Leaflet 1.9.4, SVG dinàmic, Web Audio API, Screen Wake Lock API, Cache Storage API.
  - **Servidor local**: Node.js HTTP server autònom (`server.js`) per a proves en xarxa local (Port 3000).
  - **Base Nativa iOS**: React Native (Expo) amb MapKit, Expo Location, SVG delta arrow i TypeScript (`trail-gps/`).

- **Fitxers clau del projecte**:
  - [DOCUMENTACIO_PROJECTE.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/DOCUMENTACIO_PROJECTE.md): Documentació general i bitàcola d'especificacions.
  - [PROJECT_STATUS.md](file:///C:/Users/David/Desktop/App%20bici%20GPS/PROJECT_STATUS.md): Punt de control i continuïtat entre sessions.
  - [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html): Nucli de l'aplicació PWA amb Leaflet, 5 capes, brúixola, perfil ClimbPro, gravador REC, gestor de Waypoints, ciclocomputador complet, Wake Lock i suport tàctil iOS.
  - [web-app/server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/server.js): Servidor Node.js per a proves locals (Port 3000).
  - [trail-gps/](file:///C:/Users/David/Desktop/App%20bici%20GPS/trail-gps/): Projecte mòbil Expo / React Native per a generació de paquet natiu `.ipa`.

---

## 2. Estat Actual i Punt de Control (Sessió: 17/08/2026)

- **Feina realitzada en aquesta sessió**:
  - [x] **Gravador de Rutes GPX en Directe (REC)**: Enregistrament de coordenades, temps, distància i desnivell (+D) amb exportació a fitxer `.gpx` descarregable compatible amb Strava/Wikiloc/Garmin.
  - [x] **Gestor de Waypoints & POIs**: Parseig de `<wpt>` des de qualsevol GPX amb icones intel·ligents (💧, ⛰️, 📸, ⚠️, 🔀) i botó ràpid per afegir nous punts a la posició actual.
  - [x] **Ciclocomputador Ampliat**: Modal complet de telemetria (velocitat actual, mitjana, màxima, desnivell +D acumulat, altitud, temps i distància restant).
  - [x] **Personalització del Traçat**: Selector de 6 colors d'alt contrast (Cian, Groc, Vermell, Verd, Taronja, Blanc) i 3 gruixos de línia.
  - [x] **Biblioteca Local de Rutes**: Persistència a `localStorage` de les darreres rutes obertes.
  - [x] **Screen Wake Lock API**: Manté la pantalla de l'iPhone encesa durant tota la navegació.
  - [x] **Optimització Tàctil iOS Safari**: Resolució de la resposta als tocs assignant `z-index` elevats (9000+) i `touch-action: manipulation`.

- **Punt exacte on ens hem quedat**:
  - Totes les funcionalitats de la PWA estan completades i validades a [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html).
  - Pendent pujar a **GitHub Pages** (o **Netlify Drop**) per disposar d'una adreça HTTPS permanent per a l'iPhone.

---

## 3. Full de Ruta per a la Propera Sessió (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **Publicació HTTPS**: Pujar el repositori a GitHub Pages (o Netlify Drop) per tenir l'enllaç permanent i afegir-lo a la pantalla d'inici de l'iPhone.
  - [ ] **Proves de camp**: Provar la navegació, el seguiment de track i la gravació REC en una sortida real en bicicleta.
  - [ ] **Fase Nativa iOS (`trail-gps/` o Capacitor)**: Generar el paquet `.ipa` per a instal·lació per cable (Sideloadly / AltStore) o TestFlight d'Apple.
- **Millores futures**:
  - [ ] Connexió de sensors BLE de freqüència cardíaca, cadència o canvi electrònic (SRAM AXS / Shimano Di2).
  - [ ] Mode d'estalvi de bateria *Screen Wake on Turn*.
