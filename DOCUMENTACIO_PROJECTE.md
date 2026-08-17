# 🚴‍♂️ Bitàcola i Documentació del Projecte: App GPX MTB per a iOS & PWA

> **Estat del projecte:** Fases 1 a 6 completades i validades amb èxit  
> **Última actualització:** 17 d'agost de 2026  
> **Objectiu:** Crear una aplicació de navegació GPS per a ciclisme/MTB a iOS lleugera, privada, autònoma (sense comptes ni servidors externs) i amb una interfície optimitzada per a manillar de bicicleta.

---

## 📋 1. Visió General i Especificacions Assolides

### 🎯 Proposta de Valor
* **100% Privada i Local:** Sense registres, sense comptes d'usuari, sense telemetria ni dependència del núvol.
* **Traçat Fidel (No-Snapping):** La línia GPX no es deforma ni es força a carreteres d'asfalt; ideal per a senders i corriols de muntanya.
* **Cockpit Ciclista Intuïtiu:** Interfície de màxima visibilitat sota sol intens, botons grans aptes per a guants i panell de dades essencial.
* **Importació i Exportació Directa:** Suport d'arxius `.gpx` des de Wikiloc, iCloud, AirDrop o l'app Fitxers d'iOS, i exportació de tracks gravats.
* **Pantalla Sempre Encesa (Screen Wake Lock):** La pantalla de l'iPhone no s'apaga durant la sortida.

---

## 🗺️ 2. Arquitectura i Característiques Implementades

### 🧭 Fletxa de Posició i Rumb Dinàmic (Heading Indicator)
* **Disseny Delta d'Alta Visibilitat:** Fletxa aeronàutica en cian fluorescent (`#00E5FF`) amb vora blanca i ombra pronunciada.
* **Con de Rumb Translúcid:** Feix de llum frontal que indica el camp de visió i direcció del manillar.
* **Rotació per Brúixola / GPS:** Magnetòmetre a baixa velocitat i rumb GPS en moviment.
* **Modes de Càmera:**
  * **Heading-Up:** El mapa gira automàticament seguint la trajectòria del ciclista.
  * **Nord Dalt:** Fixació clàssica de mapa amb el Nord amunt.
  * **Manual / Lliure:** Permet moure i explorar el mapa sense perdre la posició.
  * **Botó «ON SÓC? (🎯)»:** Recentrat ràpid a la ubicació real del ciclista.
  * **Botons de Zoom (+ / -):** Botons flotants ergonòmics per a ús amb guants.

### 🥞 5 Capes de Mapa Online Específiques per a Ciclisme
1. 🚵 **OpenTopoMap:** Topogràfic amb corbes de nivell, relleu ombrejat i cims.
2. 🚲 **CyclOSM:** Específic per a bicis i MTB amb ressaltat de corriols i tipus de superfície.
3. 🛰️ **Esri World Imagery:** Satèl·lit aeri d'alta resolució / Ortofoto.
4. 🌙 **CartoDB Dark Matter:** Fons fosc d'alt contrast per a pantalles OLED (estalvi de bateria).
5. 🗺️ **OpenStreetMap:** Estàndard net.

### 🎨 Personalització del Traçat
* 6 colors d'alt contrast (Cian Neó, Groc Fluor, Vermell Fúcsia, Verd Llima, Taronja Neó, Blanc Pur).
* 3 opcions de gruix (3px, 5px, 8px) amb vora d'alt contrast per a qualsevol mapa.

### 📥 Motor de Mapes Offline (Mode Sense Cobertura / Mode Avió)
* **Descàrrega intel·ligent per Bounding Box del Track:** Calcula automàticament les tessel·les de la ruta amb un marge de seguretat de 600m i 4 nivells de zoom (`z13` a `z16`).
* **Cache Storage Natiu d'Apple:** Emmagatzematge permanent al disc del telèfon sense dependre d'Internet.
* **Barra de progrés i gestor de memòria:** Visualització de descàrrega i opció d'esborrar la memòria cau per alliberar espai.

### ⛰️ Perfil d'Altimetria Dinàmic (Estil ClimbPro)
* Gràfica SVG d'elevació amb el punt del ciclista avançant pel perfil en directe.
* Percentatge de pendent en temps real (% verd <5%, groc 5-8%, taronja 9-14%, vermell >14%).

### ⚠️ Alerta de Fora de Ruta (>40m)
* Càlcul continu de distància perpendicular al segment del track més proper.
* Avís sonor acústic (beep) i vibració hàptica en cas de sortir del camí.

### 🔴 Gravador de Rutes GPX en Directe (REC)
* Enregistrament continu de la teva sortida amb botons Iniciar / Pausar / Descarregar.
* Dibuix del track gravat en temps real sobre el mapa amb línia distintiva.
* Exportació automàtica a arxiu estàndard `.gpx` compatible amb Strava, Garmin i Wikiloc.

### 📍 Gestor de Punts d'Interès (Waypoints & POIs)
* Extracció automàtica de waypoints des del fitxer GPX amb icones contextuals (💧 Fonts, ⛰️ Cims, 📸 Miradors, ⚠️ Perills, 🔀 Cruïlles).
* Botó d'afegir punt ràpid a la posició actual.
* Llista de waypoints ordenada per distància restant.

### 📊 Ciclocomputador Ampliat
* Modal complet de telemetria: velocitat actual, velocitat mitjana, velocitat màxima, desnivell positiu (+D), altitud, temps total i distància restant.

---

## 🛠️ 3. Estructura de Fitxers del Projecte

```text
C:\Users\David\Desktop\App bici GPS\
├── DOCUMENTACIO_PROJECTE.md         <-- Bitàcola viva del projecte
├── PROJECT_STATUS.md                <-- Punt de control i continuïtat
├── Especificació del Projecte App GPX.md  <-- Especificació inicial
│
├── web-app/                         <-- Versió Web PWA d'alta velocitat
│   ├── index.html                   <-- Nucli complet: Leaflet, GPS, REC, POIs, Capes, Offline, ClimbPro
│   └── server.js                    <-- Servidor HTTP Node.js autònom (port 3000)
│
└── trail-gps/                       <-- Base React Native / Expo per a .IPA natiu
    ├── App.tsx                      <-- Component arrel amb telemetria i estat
    ├── app.json                     <-- Configuració d'iOS (permisos, segon pla, GPX)
    └── src/
        ├── types/index.ts           <-- Tipus TypeScript
        ├── utils/geoMath.ts         <-- Geometria (Haversine, Cross-track, Bearing)
        ├── utils/gpxParser.ts       <-- Parser ràpid GPX
        ├── utils/fileImporter.ts    <-- Gestió de fitxers GPX
        ├── utils/soundAlert.ts      <-- Alertes sonores i hàptiques
        ├── components/NavigationArrow.tsx  <-- Fletxa delta SVG
        ├── components/MapController.tsx    <-- Mapa natiu MapKit
        ├── components/CockpitDashboard.tsx <-- Panell HUD d'alt contrast
        └── components/ElevationProfile.tsx <-- Altimetria dinàmica
```

---

## 🚀 4. Com engegar i provar l'aplicació

```bash
# 1. Anar a la carpeta web-app
cd "C:\Users\David\Desktop\App bici GPS\web-app"

# 2. Engegar el servidor web
node server.js

# 3. (Opcional) Engegar el túnel Cloudflare per obrir des de l'iPhone:
npx cloudflared tunnel --url http://127.0.0.1:3000
```

---

## 📝 5. Full de Ruta per a Futures Sessions (Roadmap Pendent)

- [x] **Fases 1 a 6:** Navegació, fletxa direccional, 5 capes de mapa, perfil ClimbPro, geolocalització iOS, descàrrega offline, gravador REC, waypoints i ciclocomputador.
- [ ] **Fase 7: Prova de camp i portabilitat a React Native (`trail-gps`):**
  - Portar les noves eines de gravació i waypoints al projecte Expo si es vol compilar `.ipa`.
- [ ] **Fase 8: Telemetria Avançada i Sensors Bluetooth (Opcional):**
  - Connexió de sensors BLE de freqüència cardíaca (banda de pit), cadència o canvi electrònic (SRAM AXS / Shimano Di2).
  - Mode d'estalvi de bateria *Screen Wake on Turn*.
