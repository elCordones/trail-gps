# TrailGPS MTB — Registre de canvis

## 2026-08-20 — v2.4.2: Silenci per defecte, Gestió de Rutes, Sanejament GPX i Proves Automatitzades

### Canvis implementats

- **🔇 Àudio OFF per defecte**: L’estat inicial de les alertes sonores passa a silenci (`isAudioEnabled = false`) i persisteix a `localStorage` (`trailgps_audio_enabled`).
- **🗑️ Gestió de rutes desades**: Afegida l'acció per eliminar rutes de la memòria local amb confirmació (`deleteRouteFromHistory`), botó individual `🗑️` i distintiu `MOSTRA` a la ruta demo.
- **🛡️ Sanejament complet de dades GPX**: Límit de 100 caràcters per a títols/noms i 300 per a descripcions; ús de `textContent` i funció d'escapat HTML (`escapeHtml`) a finestres emergents i marcadors.
- **🧪 Suite de proves automatitzades**: Creats els mòduls purs `src/core/geoEngine.mjs` i `src/core/gpxParser.mjs` amb 12 proves unitàries executables amb `npm test` (Node.js test runner natiu).
- **📱 Sincronització PWA i Expo**: Còpies web sincronitzades i comprovada la compilació TypeScript a `trail-gps/`.

## 2026-08-20 — Fase 0.1: estabilització inicial

Commit publicat: `d5a53fe` — `fix: estabilitzar GPS i importació GPX`

### Canvis implementats

- Corregida la compilació TypeScript d’Expo amb la importació de `MapView`.
- Substituït l’ús d’`innerHTML` per `textContent` a la biblioteca de rutes desades.
- Reestructurada la subscripció GPS PWA per mantenir un únic `watchPosition` actiu.
- Afegida degradació controlada a GPS de menor precisió després d’un error.
- Els fixes amb precisió superior a 50 m no actualitzen telemetria ni gravació.
- Evitada la duplicació del listener de brúixola.
- Validació de GPX buit o XML invàlid.
- Límit de 10 MB per fitxer GPX i 25.000 punts de track.
- Histèresi de desviació: entrada a 40 m, recuperació a 25 m i dos fixes consecutius.
- Validada la sintaxi de les dues còpies PWA i la compilació TypeScript d’Expo.
- Actualitzat el full de ruta amb el punt de continuïtat i les tasques pendents.

### Pendent per a la següent sessió

- Limitar longitud dels textos de noms i descripcions GPX.
- Crear proves automatitzades per al parser i la geometria GPS.
- Fer proves manuals en un iPhone i comprovar el comportament amb poca precisió.
- Filtrar salts GPS i freqüència de mostres del gravador.
- Continuar la modularització del motor compartit PWA/Expo.

## 2026-08-19 — v2.4.1

- Hub BLE de freqüència cardíaca, cadència i bateria.
- Zones d’esforç Z1–Z5.
- Exportació GPX amb freqüència cardíaca i cadència.
- Redisseny del cockpit i botó d’ajustos.
