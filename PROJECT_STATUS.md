# TrailGPS MTB - Estat i Documentació del Projecte

> **Darrera actualització:** 19 d'agost de 2026 (Branding Visual, Icones PWA & Expo Nativa v2.2.1)  
> **Estat general:** Versió PWA v2.2.1 completada. S'ha integrat el disseny mestre vectorial de la marca (fletxa delta de navegació en cian fluorescent, senda GPX corbada en taronja neó, relleu topogràfic i polsos de radar GPS) i s'han generat tots els assets d'alta resolució per a PWA (`manifest.json`, `apple-touch-icon`, `favicon.svg`, `icon-192`, `icon-512`) i per a l'App Nativa Expo (`icon.png` 1024x1024, `splash-icon.png`, adaptive icons).

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
  - [manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/manifest.json) / [web-app/manifest.json](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/manifest.json): Web App Manifest per a instal·lació PWA com a app autònoma.
  - [favicon.svg](file:///C:/Users/David/Desktop/App%20bici%20GPS/favicon.svg) / [apple-touch-icon.png](file:///C:/Users/David/Desktop/App%20bici%20GPS/apple-touch-icon.png): Paquet d'icones d'alt contrast.
  - [scripts/generate-icons.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/scripts/generate-icons.js): Generador d'icones i assets d'alta resolució amb `@resvg/resvg-js`.
  - [server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/server.js) / [web-app/server.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/web-app/server.js): Servidor Node.js per a proves locals (Port 3000).
  - [trail-gps/](file:///C:/Users/David/Desktop/App%20bici%20GPS/trail-gps/): Projecte mòbil Expo / React Native per a generació de paquet natiu `.ipa`.

---

## 2. Estat Actual i Punt de Control (Tancament de Sessió: 19/08/2026 - v2.2.1)

- **Feina realitzada en aquesta sessió**:
  - [x] **Disseny Vectorial Mestre de la Marca (Brand Identity)**:
    - Fletxa Delta de navegació aeronàutica en cian fluorescent (`#00E5FF`) amb facetes duals de llum i vora blanca pura.
    - Senda de muntanya GPX sinuosa en degradat taronja neó (`#FF5500` -> `#FFD600`) amb halo radiant i waypoints daurats.
    - Relleu topogràfic amb corbes de nivell subtils i arestes de muntanya en Dark Slate / Deep Navy (`#070C16` -> `#0F172A`).
    - Ones de pols radar GPS concèntriques a la punta de la fletxa.
  - [x] **Generació d'Assets d'Alta Resolució (PWA & Web)**:
    - `favicon.svg` vectorial escalable nítid a qualsevol densitat de pantalla.
    - `favicon-32.png` (32x32) i `favicon.png` (64x64).
    - `apple-touch-icon.png` (180x180) per a la pantalla d'inici d'iOS via Safari ("Afegir a la pantalla d'inici").
    - `icon-192.png` i `icon-512.png` per a la PWA.
    - `icon-maskable-192.png` i `icon-maskable-512.png` amb zona de seguretat del 80% per a Android / Chrome.
  - [x] **Integració Web App Manifest (`manifest.json`)**:
    - Creat i sincronitzat tant a l'arrel com a `web-app/manifest.json` amb colors `#0F172A`, orientació `portrait-primary`, categoria d'esports/navegació i suport complet de standalone.
  - [x] **Integració a l'App Nativa Expo (`trail-gps/assets/`)**:
    - `icon.png` (1024x1024) per a App Store i generació d'IPA.
    - `splash-icon.png` (512x512) i configuració del Splash screen fosc a `trail-gps/app.json`.
    - `android-icon-foreground.png`, `android-icon-background.png` i `android-icon-monochrome.png` per a icones adaptatives.
  - [x] **Integració Visual a la Interfície d'Usuari**:
    - Incorporat el logotip de marca amb halo lluminós dins del panell d'Informació (`#info-modal`) acompanyat de la insígnia `v2.2`.
  - [x] **Scripting i Automatització**:
    - Creat [scripts/generate-icons.js](file:///C:/Users/David/Desktop/App%20bici%20GPS/scripts/generate-icons.js) amb suport de comanda `npm run generate-icons`.
    - `server.js` arrel operatiu directament amb `npm start`.

- **Punt exacte on ens hem quedat**:
  - Branding complet, icones d'alta definició i manifest PWA plenament integrats i validats.
  - Preparat per al següent bloc: Alertes sonores intel·ligents (Web Audio API) o connectivitat de sensors Bluetooth BLE.

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
