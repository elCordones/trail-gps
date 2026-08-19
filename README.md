# 🚵 TrailGPS MTB · Ciclocomputador & Navegació GPX de Manillar

[![Llicència: AGPL v3](https://img.shields.io/badge/Codi-GNU_AGPLv3-0284C7.svg)](LICENSE)
[![Continguts: CC BY-SA 4.0](https://img.shields.io/badge/Continguts-CC_BY--SA_4.0-orange.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![PWA Ready](https://img.shields.io/badge/PWA-iOS_%26_Android-10B981.svg)](https://elcordones.github.io/trail-gps/)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet_1.9.4-16A34A.svg)](https://leafletjs.com/)

> **Aplicació web progressiva (PWA) de navegació per a ciclisme de muntanya (MTB / BTT / Gravel) i ciclocomputador autònom d'alt contrast.**  
> Dissenyada específicament per a manillar de bicicleta: 100% privada (sense registre, sense comptes, sense núvol), optimitzada per a ús amb guants i sota la llum solar directa.

🌐 **App Web en Directe (HTTPS)**: [https://elcordones.github.io/trail-gps/](https://elcordones.github.io/trail-gps/)

---

## 📸 Característiques Principals

- 🗺️ **Seguiment Precís de Tracks GPX**: Navegació pura sobre corriols i pistes forestals sense 'snapping' forçat a carreteres d'asfalt.
- 🚴 **Cockpit de Manillar Ultra-Compacte**:
  - Només 54px d'alçada: allibera més del **85% de la pantalla per al mapa**.
  - 3 dades essencials d'alt contrast: **Velocitat (30px)**, **Distància restant** i **Desviació del track (Al Track)** amb alerta visual/acústica si et desvies de la ruta.
- ⚡ **Safata d'Eines Desplegable (Smart Drawer)**: Calaix suau amb accés a Rutes, POIs, Capes, Mode Offline, Telemetria i Simulació virtual.
- 🎯 **Botons Flotants d'Acció Ràpida per al Polze**: Centrar al ciclista, canviar mode de càmera (*Rumb / Nord fix*) i activar altimetria sense tapar el mapa.
- ⛰️ **Perfil d'Altimetria ClimbPro Semitransparent**: Gràfica flotant translúcida que permet continuar veient el mapa i els senders per sota.
- ⏺️ **Gravador de Rutes en Directe (REC GPX)**: Enregistra la teva ruta amb temps, distància i desnivell acumulat (+D) i descarrega el fitxer .gpx llest per a Strava, Wikiloc o Garmin.
- 📍 **Gestor de Waypoints & POIs**: Lectura automàtica de punts d'interès del GPX (fonts d'aigua 💧, cims ⛰️, miradors 📸, perills ⚠️) i botó ràpid per marcar punts a la teva ubicació.
- 📥 **Mapes Offline (Mode Avió)**: Descàrrega intel·ligent en memòria cau local (Cache Storage API) de les tessel·les de la ruta per navegar sense cobertura ni dades mòbils.
- ☀️ **Screen Wake Lock API**: Manté la pantalla de l'iPhone encesa permanentment durant la sortida sense que s'apagui ni es bloquegi.

---

## 📱 Instal·lació a l'iPhone (PWA Pantalla Completa)

1. Obre l'enllaç [https://elcordones.github.io/trail-gps/](https://elcordones.github.io/trail-gps/) al navegador **Safari de l'iPhone**.
2. Toca el botó **Compartir** d'iOS (icona quadrada amb fletxa cap amunt).
3. Tria l'opció **«Afegir a la pantalla d'inici»** (*Add to Home Screen*).
4. L'app quedarà instal·lada com una aplicació nativa a pantalla completa sense barres d'adreces de navegador.

---

## 🛠️ Stack Tecnològic

- **Frontend**: HTML5, Vanilla CSS3 (paleta Slate fosca OLED, neons cian/taronja d'alt contrast), JavaScript modern (ES6+).
- **Cartografia**: Leaflet 1.9.4 amb 5 capes (Topogràfic OpenTopoMap, CyclOSM MTB, Satèl·lit Ortofoto Esri, Dark Mode CARTO i Estàndard OSM).
- **APIs del Navegador**:
  - `navigator.geolocation.watchPosition` (GPS continu d'alta precisió).
  - `navigator.wakeLock.request` (Screen Wake Lock per a pantalla sempre activa).
  - `window.caches` (Cache Storage API per a mapes offline).
  - `Web Audio API` (Alertes sonores de desviació de ruta).

---

## 📁 Estructura del Projecte

- `index.html` / `web-app/`: Nucli de la PWA i servidors web de prova.
- `assets/brand/`: Fitxers mestres d'identitat visual i logotip d'alta resolució.
- `docs/`: Bitàcola d'especificacions completes ([`docs/DOCUMENTACIO_PROJECTE.md`](docs/DOCUMENTACIO_PROJECTE.md)).
- `trail-gps/`: Projecte mòbil natiu en React Native / Expo per a iOS.
- `scripts/`: Eines d'automatització i generador d'assets.

---

## 📄 Llicència i Autoria

**Autor:** David Cordones · 2026

- **Codi Font**: Distribuït sota llicència lliure **[GNU Affero General Public License v3.0 (GNU AGPLv3)](LICENSE)**. Ets lliure d'utilitzar, modificar i redistribuir aquest programari sempre que citis l'autor original i qualsevol obra derivada es mantingui sota la mateixa llicència de codi obert.
- **Documentació i Recursos Gràfics**: Distribuïts sota la llicència **[Creative Commons Reconeixement-CompartirIgual 4.0 Internacional (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)**.
