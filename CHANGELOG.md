# TrailGPS MTB — Registre de canvis

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
