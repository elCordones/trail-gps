# TrailGPS MTB — Propostes de millora i full de ruta actualitzat

> Document generat a partir de l’auditoria tècnica del 20 d’agost de 2026.
> Objectiu: convertir el prototip PWA actual en un producte de navegació fiable per a BTT, prioritzant seguretat, precisió, ús offline legal i compatibilitat real amb iPhone.

## Seguiment de procés

> **Darrera actualització:** 20 d’agost de 2026 — Fase 0 en curs.
>
> **Punt actual:** s’han aplicat les validacions d’entrada GPX i la histèresi d’alertes. Falta executar les proves manuals en dispositiu i començar les proves automatitzades abans de modularitzar el motor compartit.

### Fites completades en aquesta sessió

- [x] Corregida la compilació TypeScript de la branca Expo: importació de `MapView` a `trail-gps/App.tsx`.
- [x] Eliminada la interpolació amb `innerHTML` de les dades de rutes desades: la biblioteca de rutes crea ara els textos amb `textContent`.
- [x] Refactoritzada la subscripció GPS de la PWA: una única subscripció activa, neteja abans del reintent i degradació única a baixa precisió.
- [x] Afegit filtre inicial de qualitat GPS: fixes amb una precisió superior a 50 m no actualitzen telemetria ni gravació i es comuniquen com a “precisió baixa”.
- [x] Evitada la duplicació del listener de brúixola quan es torna a demanar el GPS.
- [x] Afegida validació d’entrada GPX: XML invàlid, fitxer buit, mida màxima de 10 MB i màxim de 25.000 punts de track.
- [x] Afegida histèresi de fora de ruta: entrada a 40 m, recuperació a 25 m i confirmació de dos fixes consecutius.
- [x] Validacions locals superades: sintaxi de les dues PWA, hash idèntic entre còpies i `tsc --noEmit` d’Expo.

### Pendent immediat

- [x] Validar XML GPX (`parsererror`) i establir límits de mida i punts; resta limitar texts de waypoints/metadades.
- [x] Afegir histèresi a l’alerta de fora de ruta; l’alerta només sona en entrar a l’estat de desviació.
- [ ] Definir i començar les proves automatitzades de geometria i parser GPX.
- [ ] Prova manual en dispositiu real del nou comportament GPS; encara no s’ha realitzat.

## Resum executiu

L’aplicació PWA presenta una base funcional molt completa: importació i visualització GPX sense *snapping*, cockpit per a manillar, gravació GPX, waypoints, perfil d’altimetria, indicacions de gir, persistència local i sensors BLE web.

Abans d’ampliar funcionalitats, cal resoldre uns quants punts que afecten la fiabilitat en sortida real:

1. La PWA no és una base fiable per a BLE en iPhone/Safari; aquesta funció s’ha de prioritzar a l’app nativa.
2. El sistema actual de descàrrega offline de tessel·les no s’ha de desplegar així: cal un proveïdor que ho autoritzi o paquets vectorials/MBTiles.
3. El motor GPS necessita filtratge de qualitat, control únic de subscripcions i histèresi en les alertes de desviació.
4. La importació GPX ha de sanejar tots els textos abans de representar-los a la UI.
5. La branca Expo ha de compilar, guanyar proves i convertir-se en la plataforma per a les funcions crítiques d’iOS.

## Valoració de l’estat actual

| Àrea | Valoració | Observació |
| --- | --- | --- |
| Proposta de valor MTB | Molt bona | El seguiment fidel del GPX és l’enfocament correcte per a corriols. |
| UX de manillar | Bona | El cockpit compacte, contrast i controls ràpids són encertats. |
| Funcionalitat PWA | Molt àmplia | GPS, GPX, gravació, POIs, girs i telemetria ja formen un conjunt coherent. |
| Robustesa GPS | Insuficient | Falta filtrar fixes imprecisos, soroll d’altitud i gestionar subscripcions. |
| Offline | No apte per producció | S’ha de redissenyar amb una font de mapes autoritzada. |
| BLE en iPhone PWA | No viable | Safari/iOS no ofereix Web Bluetooth natiu. |
| Seguretat d’entrada | Millorable | Els textos del GPX no s’han d’interpolar amb `innerHTML`. |
| Qualitat de codi | Mitjana | Un únic HTML concentra massa responsabilitats; no hi ha tests, lint ni CI. |
| Branca nativa Expo | Inicial | Té una bona base tipada, però encara és incompleta i no compila actualment. |

## Correccions prioritàries

### P0 — Abans de continuar ampliant funcions

1. **Corregir la importació segura de GPX.**
   - No inserir el nom, descripció ni metadades del GPX amb `innerHTML`.
   - Crear nodes de DOM i assignar els textos amb `textContent`.
   - Detectar XML invàlid (`parsererror`) i limitar mida, nombre de punts i longitud de textos.

2. **Reestructurar el seguiment GPS.**
   - Mantenir un únic identificador de `watchPosition` i cancel·lar-lo abans de canviar de mode o reintentar.
   - Rebutjar o marcar fixes amb precisió insuficient; per exemple, no activar alarmes ni gravar punts amb precisió superior al llindar configurat.
   - Aplicar filtres de velocitat, salt màxim i distància/temps mínims entre mostres.
   - Informar clarament a la UI si el GPS és imprecís, en lloc de mostrar un fals “GPS FIX”.

3. **Fer segura l’alerta de fora de ruta.**
   - Usar un llindar adaptatiu: màxim entre el llindar de la ruta i la precisió GPS multiplicada per un factor.
   - Exigir diversos fixes consecutius fora de ruta abans d’alertar.
   - Afegir un llindar diferent per desactivar l’alerta en tornar al track, evitant oscil·lacions.
   - Limitar les alertes sonores i hàptiques per temps, no per cada actualització GPS.

4. **Aturar el desplegament de l’offline actual.**
   - No fer descàrrega preventiva de tessel·les de serveis públics sense una llicència que ho permeti.
   - Definir un proveïdor de mapes amb condicions compatibles o migrar a mapes vectorials amb paquets offline.
   - Mostrar mida real, cobertura, data de caducitat i opció d’eliminar cada àrea descarregada.

5. **Recuperar la branca Expo.**
   - Corregir l’error TypeScript actual a `App.tsx` (referència a `MapView` sense importació).
   - Afegir compilació TypeScript obligatòria abans de cada canvi funcional.

### P1 — Fiabilitat d’una sortida real

1. Filtrar altitud i desnivell acumulat per evitar que el soroll GPS infli el +D.
2. Desar gravacions en curs a IndexedDB o emmagatzematge natiu, amb recuperació després d’un tancament o falta de bateria.
3. Substituir la biblioteca de rutes basada només en `localStorage` per IndexedDB, amb quota, metadades, límit de mida i exportació/importació de còpia de seguretat.
4. Afegir identificadors interns de ruta; no usar el nom com a clau única.
5. Afegir estat explícit de permisos: GPS, brúixola, pantalla activa, Bluetooth i emmagatzematge.
6. Separar el motor de domini (GPX, geometria, gravació, turn-by-turn) de la UI i del mapa.

### P2 — Producte, experiència i accessibilitat

1. Checklist pre-sortida: ruta carregada, precisió GPS, bateria, espai, cobertura offline i sensors.
2. Mode “retorn al track”: direcció, distància i punt recomanat de reincorporació, no només alarma.
3. Mode de contrast extrem, configuració apta per daltonisme i patrons/hàptics diferenciats.
4. Perfil ClimbPro per pujades segmentades: distància de pujada, pendent mitjà, altitud restant i cim previst.
5. Detecció de pausa automàtica configurable i resum de la sortida.
6. Importació robusta mitjançant el full de compartir d’iOS i fitxers GPX locals.

## Decisió d’arquitectura recomanada

### PWA

Mantenir-la com a aplicació lleugera per:

- importar i consultar tracks;
- navegar en primer pla;
- provar UX i lògica de negoci;
- utilitzar-la en Android/Chrome quan les APIs siguin compatibles.

No basar-hi la promesa d’enregistrament en segon pla, BLE a iPhone o mapes offline massius.

### App nativa Expo/iOS

Prioritzar-la com a producte de sortida real per:

- localització en segon pla;
- BLE mitjançant mòdul natiu i *development build*;
- HealthKit i Apple Watch;
- paquets offline gestionats legalment;
- recuperació de sessió i persistència robusta.

La lògica pura hauria de viure en mòduls TypeScript compartits entre PWA i Expo: parser GPX, geometria, detecció de girs, filtres GPS, càlcul de dades i exportació GPX.

## Full de ruta actualitzat

### Fase 0 — Estabilització i seguretat

- [ ] Sanejament de totes les dades del GPX a la UI.
- [x] Sanejament de la biblioteca de rutes desades a la UI.
- [~] Validació XML, límits de mida i missatges d’error útils: feta per XML, fitxer i punts; resten límits de textos.
- [x] Un sol gestor de subscripció GPS amb neteja garantida.
- [~] Filtre de precisió, salts i mostres per al gravador: filtre de precisió inicial aplicat; resten filtres de salts i freqüència.
- [x] Histèresi i limitació temporal d’alertes fora de ruta.
- [ ] Àudio silenciat per defecte i preferència persistent.
- [x] Corregida la compilació TypeScript de la branca Expo.

**Criteri de sortida:** cap error de compilació; importació maliciosa o invàlida no trenca la UI; el GPS no crea subscripcions duplicades.

### Fase 1 — Qualitat, proves i modularització

- [ ] Extreure geometria, GPX, gravació i turn-by-turn de l’HTML monolític.
- [ ] Crear proves unitàries per Haversine, segment més proper, desviació, girs i parser GPX.
- [ ] Preparar una col·lecció de GPX reals: curts, molt llargs, circulars, autocreuats, múltiples segments i elevació absent.
- [ ] Afegir ESLint/formatador i pipeline de validació.
- [ ] Establir una única font de codi per a la PWA; evitar mantenir dues còpies manuals.

**Criteri de sortida:** proves automatitzades executables localment i en CI; duplicats eliminats o generats automàticament.

### Fase 2 — Offline legal i persistència de rutes

- [ ] Escollir proveïdor/format de mapa que autoritzi explícitament offline.
- [ ] Dissenyar àrees offline amb control de mida, cobertura i expiració.
- [ ] Migrar biblioteca de rutes a IndexedDB o emmagatzematge natiu.
- [ ] Afegir esborrat individual amb confirmació, còpia de seguretat i restauració.

**Criteri de sortida:** ús offline verificat en mode avió sense infringir les condicions del proveïdor cartogràfic.

### Fase 3 — Validació de camp

- [ ] Pla de proves: bosc dens, canó/roca, cruïlles, track circular, track amb trams propers i ruta llarga.
- [ ] Mesurar precisió, consum, temperatura, durada de bateria i llegibilitat solar.
- [ ] Verificar recuperació després de bloqueig, trucada, canvi d’app i poca cobertura.
- [ ] Prioritzar incidències segons severitat i freqüència.

**Criteri de sortida:** almenys diverses sortides reals completes sense pèrdua de gravació ni falses alertes repetides.

### Fase 4 — Consolidació nativa iOS

- [ ] Portar els mòduls compartits a Expo.
- [ ] Integrar GPS en segon pla i recuperació de sessió.
- [ ] Integrar BLE natiu per banda cardíaca, cadència i bateria de sensors.
- [ ] Implementar exportació GPX robusta i biblioteca local.
- [ ] Integrar HealthKit amb consentiment explícit.

**Criteri de sortida:** una beta TestFlight que cobreixi navegació, gravació, sensors i persistència durant una sortida real.

### Fase 5 — Apple Watch i funcions avançades

- [ ] Companion watchOS per a fletxes de gir, pols, distància i alertes hàptiques.
- [ ] ClimbPro segmentat i pantalles de dades configurables.
- [ ] Rutes per URL només si es resolen legalment CORS, autenticació i condicions de Wikiloc/Strava; prioritzar sempre compartir/importar GPX.
- [ ] Formats esportius addicionals si hi ha demanda real (FIT/TCX).

## Indicadors de qualitat recomanats

- Cap alerta fora de ruta amb un fix GPS de mala precisió.
- Cap pèrdua de gravació després d’una interrupció controlada.
- Temps de càrrega i representació acceptable amb GPX de desenes de milers de punts.
- Desnivell i distància contrastats amb almenys dos dispositius de referència.
- Proves passades abans de publicar una versió.
- Cap funcionalitat offline que incompleixi les condicions del proveïdor de mapes.

## Notes de privacitat

La ruta, sensors i gravacions poden romandre locals, però les peticions de tessel·les de mapes revelen aproximadament la zona consultada al proveïdor cartogràfic. La comunicació de producte hauria de dir “sense compte ni telemetria pròpia; dades de ruta locals” en lloc de “100% privada” sense matisos.
