# TrailGPS MTB - Estat i Documentació del Projecte

> **Darrera actualització:** 19 d'agost de 2026 (Branding Visual Definitiu, Reorganització de Carpetes & PWA v2.2.2)  
> **Estat general:** Versió PWA v2.2.2 completada. S'ha integrat la nova identitat visual d'alt contrast (bisell de ciclocomputador fosc amb fletxa delta cian fluorescent i corriol de muntanya en taronja elèctric) processada a partir de la imatge mestre 2048x2048 amb interpolació d'alta fidelitat `sharp` (Lanczos3). S'ha reestructurat i netejat l'espai de treball organitzant la documentació a `docs/`, la identitat visual a `assets/brand/` i eliminant recursos obsolets.

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
  - [index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/index.html) / [web-app/index.html](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/index.html): Nucli de l'aplicació PWA amb Leaflet, cockpit compacte, bottom sheets, brúixola, perfil ClimbPro, gravador REC, gestor de Waypoints, ciclocomputador complet, Wake Lock i suport tàctil iOS.
  - [manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/manifest.json) / [web-app/manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/manifest.json): Web App Manifest per a instal·lació PWA autònoma a pantalla completa.
  - [assets/brand/](file:///C:/Users/David/Desktop/App%20bici%20GPS/assets/brand/): Imatges mestres d'alta resolució (`master-icon.png`, `master-icon.jfif`).
  - [scripts/generate-icons.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/scripts/generate-icons.js): Generador automàtic de tot el paquet d'icones iOS / PWA / Expo amb `sharp`.
  - [server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/server.js) / [web-app/server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/server.js): Servidor Node.js per a proves locals (Port 3000).
  - [trail-gps/](file:///C:/Users/David/Desktop/App%20bici%20GPS/trail-gps/): Projecte mòbil Expo / React Native per a paquet natiu `.ipa`.

---

## 2. Estat Actual i Punt de Control (Tancament de Sessió: 19/08/2026 - v2.2.2)

- **Feina realitzada en aquesta sessió**:
  - [x] **Nova Identitat Visual de Màxima Qualitat**:
    - Processament de la imatge mestre 2048x2048 amb disseny de dial d'alta precisió, fletxa delta fluorescent `#00E5FF` i corriol taronja `#FF6600` sobre fons Dark Slate / OLED.
    - Extracció i retall matemàtic per eliminar el doble marc exterior i alinear el bisell de ciclocomputador directament al 100% de la icona nativa d'iOS.
    - Conversió i renderització amb algoritme de reescalat d'alta fidelitat `Lanczos3` mitjançant la llibreria nativa `sharp`.
  - [x] **Generació de tot el paquet d'Assets**:
    - Paquet complet iOS Safari: `apple-touch-icon.png` (180x180), `apple-touch-icon-180x180.png`, `apple-touch-icon-precomposed.png`, `apple-touch-icon-152x152.png`, `apple-touch-icon-120x120.png`.
    - Paquet PWA Web: `icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png`, `favicon.svg`, `favicon-32.png`, `favicon.png`, `favicon.ico`.
    - Paquet Expo Nativa: `trail-gps/assets/icon.png` (1024x1024), `splash-icon.png`, `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png`.
  - [x] **Neteja i Reorganització d'Arxius de l'Espai de Treball**:
    - Creada la carpeta `docs/` i moguts els documents d'especificacions (`docs/DOCUMENTACIO_PROJECTE.md` i `docs/ESPECIFICACIO_ORIGINAL_GPX.md`).
    - Creada la carpeta `assets/brand/` per emmagatzemar els fitxers mestres d'identitat corporativa (`master-icon.jfif` i `master-icon.png`).
    - Eliminades les captures de pantalla temporals obsoletes (`Captures/`).
    - Mantinguda l'estructura neta i directa a l'arrel per a un servei fluid a GitHub Pages i servidors locals.
  - [x] **Integració a la UI i Modal d'Informació**:
    - El modal `#info-modal` utilitza ara la nova icona nítida de 48px amb halo cian i badge `v2.2`.

- **Punt exacte on ens hem quedat**:
  - Tota l'estructura neta i organitzada en carpetes.
  - Icona definitiva generada en totes les resolucions i aplicada.
  - Pendent de pujar canvis a GitHub i continuar amb el bloc funcional (Alertes sonores / Sensors Bluetooth).

---

## 3. Full de Ruta per a Properes Sessions (Roadmap)

- **Tasques immediates per reprendre**:
  - [ ] **🔊 Alertes Sonores i Vibració en Girs / Desviacions de Track**:
    - Notificacions acústiques clares (Web Audio API) en separar-se més de 25m del traçat i en recuperar la ruta.
    - So distintiu en aproximació a Waypoints clau (fonts, cims, alertes de perill).
  - [ ] **💓 Telemetria Avançada i Sensors Bluetooth BLE**:
    - Connexió amb sensors de banda cardíaca (HRM) i cadència via Web Bluetooth API.
  - [ ] **🍏 Sincronització amb Apple Salut & Entrenaments (Apple HealthKit)**:
    - Integració a la versió nativa per desar automàticament les sessions de ciclisme a Apple Health / Fitness (freqüència cardíaca, desnivell +D, velocitats, calories actives i distància).
  - [ ] **⌚ Interacció i Pantalla Remota amb Apple Watch (watchOS)**:
    - Companion app / HUD al canell per visualitzar telemetria clau en directe i rebre vibracions hàptiques en desviacions de track o girs imminents.
  - [ ] **Validació de la navegació en ruta real amb track GPX**.
  - [ ] **Portabilitat a l'App Nativa (`trail-gps` - Expo / React Native)**.
