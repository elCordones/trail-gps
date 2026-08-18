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
  - [x] **Ajust de Pantalla Completa i Eliminació de la Franja Fosca Inferior**:
    - Identificat i resolt el bug de WebKit/Safari on el calaix d'eines (`tools-drawer-content`) amb CSS Grid ocupava espai fantasma invisible (~110px) fins i tot amb `max-height: 0`.
    - Canviat a `display: none` per defecte i `display: grid` només en `.open`, aconseguint que el cockpit inferior sigui autènticament compacte (només ~76px) i alliberant tot l'espai buit inferior.
    - Fixació de `html, body` i `#app-container` a `position: fixed` amb suport `100dvh` i `-webkit-fill-available`.
  - [x] **Optimització de Transparència Real ClimbPro**:
    - Fons ajustat a `rgba(15, 23, 42, 0.38)` amb blur lleuger (`8px`) i subtil vora cian `rgba(0, 229, 255, 0.35)` per veure clarament senders, camins i corbes de nivell del mapa per darrere.
    - Gradient suau de l'SVG (`0.40` a `0.02`) que maximitza la translucidesa del terreny.
  - [x] **Ajust del Botó de Zoom i Thumb Dock**:
    - Redimensionats els botons flotants de polze a 44px/38px amb separació de 6px.
    - Reubicats a `bottom: calc(max(env(safe-area-inset-bottom, 8px), 8px) + 84px)` garantint una separació neta i elegant respecte a la barra d'eines inferior.
    - Animació dinàmica sincronitzada amb el calaix d'eines (`drawer-open`).

- **Punt exacte on ens hem quedat**:
  - Interfície PWA 100% compacta, neta i sense espais buits residuals a l'iPhone.
  - Canvis aplicats a [index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/index.html) i [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html).

---

## 3. Full de Ruta per a Properes Tasques (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **Pujar canvis a GitHub** (`git commit & push`) perquè la PWA a GitHub Pages s'actualitzi automàticament.
  - [ ] **Proves a Safari/iPhone** per validar la translucidesa i l'encaix de pantalla completa.
  - [ ] **Fase Nativa iOS (`trail-gps/` o Capacitor)** o connexió de sensors BLE / Mode estalvi de bateria.
