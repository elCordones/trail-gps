# TrailGPS MTB — Pla de Validació de Camp (Field Testing Protocol)

> **Documentació de Proves Reals de Camp — Versió de referència:** v2.4.9  
> **Autor:** David Cordones (2026)  
> **Llicència:** GNU AGPL v3 (Codi) / CC BY-SA 4.0 (Continguts)

---

## 1. Objectiu del Protocol de Validació

Aquest document estableix el protocol operatiu per validar **TrailGPS MTB** en condicions reals de ciclisme de muntanya (BTT / Gravel), sotmès a vibracions al manillar, pèrdua temporal de cobertura mòbil, canvis bruscos de desnivell, vegetació densa que degradi el senyal GPS i llum solar directa.

L'objectiu és certificar que l'aplicació manté una estabilitat absoluta, alertes fiables sense falsos positius i una gestió energètica eficient durant sortides de **3 a 6 hores**.

---

## 2. Condicions i Equipament de Prova

- **Dispositiu de prova**: iPhone / Smartphone Android amb pantalla OLED o IPS d'alta brillantor.
- **Suport de bicicleta**: Suport rígid de manillar o potència (front mount rígid amb bloqueig mecànic).
- **Tipus de ruta**: Circuit mixt (pista ampla, corriols, trialeres de bosc frondós i carenes obertes).
- **Durada mínima de prova**: 25 a 50 km (temps estimat: 2h 30m - 4h 00m).
- **Dispositiu de contrast**: Garmin / Wahoo / Suunto per comparar desnivell acumulat, distància i alertes.
- **Sensors opcionals**: Cinta de pols cardíac BLE (HRM) i sensor de cadència (CSC).

---

## 3. Matriu de Casos de Prova de Camp (Test Cases)

### TC-01: Arrencada 100% Offline & Mapes en Memòria Cau
- **Objectiu**: Comprovar el funcionament integral sense dades mòbils en mode avió offline.
- **Procediment**: Importar el track GPX a la biblioteca, prémer **📥 OFFLINE** per descarregar les tessel·les de la zona, activar el **Mode Avió** al telèfon i iniciar la navegació amb la PWA.
- **Criteri d'acceptació**: Cap error de xarxa, mapes renderitzats 100% des de Cache Storage i ruta en color neó d'alt contrast visible sota el sol.

### TC-02: Prova d'Histèresi d'Alerta Fora de Ruta (40 m / 25 m)
- **Objectiu**: Validar que l'alerta no genera falsos positius en revolts tancats ni bucles continus.
- **Procediment**: Desviar-se deliberadament més de $40\text{ m}$ del traçat teòric i reincorporar-se després a menys de $25\text{ m}$.
- **Criteri d'acceptació**: L'alerta vermella s'activa a l'instant de superar els $40\text{ m}$ i es restableix suaument en baixar de $25\text{ m}$ sense falsos positius ni soroll repetitiu.

### TC-03: Turn-by-Turn HUD & Anticipació de Cruïlles
- **Objectiu**: Comprovar la claredat de les instruccions de gir i fites.
- **Procediment**: Apropar-se a una cruïlla amb canvi d'angle $> 50^\circ$.
- **Criteri d'acceptació**: Avís de prealerta a $100\text{ m}$ i avís immediat a $25\text{ m}$ amb icona de gir, distància regressiva i nom de waypoint/cruïlla associat.

### TC-04: Filtre d'Altimetria (+D) & ClimbPro en Rampes Reals
- **Objectiu**: Validar la supressió de soroll baromètric en aturada i l'avaluació de pendents.
- **Procediment**: Aturar-se 5-10 minuts en un punt pla i comprovar que el +D no augmenta de forma fictícia. Afrontar rampes conegudes i comparar cota amb el perfil ClimbPro interactiu (`#elevation-svg`).
- **Criteri d'acceptació**: Zero ascens fictici en repòs (deadband $2.0\text{ m}$) i desviació de +D acumulat $< 5\%$ respecte al dispositiu de contrast.

### TC-05: Auditoria de Consum de Bateria (Mode Normal vs Mode Eco)
- **Objectiu**: Comprovar l'autonomia amb Screen Wake Lock actiu.
- **Procediment**: 1a hora en mode Normal (60fps, filtres visuals), activar Mode Eco (`#btn-eco-toggle`) per a la 2a hora.
- **Criteri d'acceptació**: El mode Eco redueix el consum horari en un $\ge 25\%$, garantint més de 4 hores de navegació contínua.

### TC-06: Gravador GPX & Mostreig Intel·ligent (`BreadcrumbSampler`)
- **Objectiu**: Validar que no es generen nusos de punts en aturades i el traçat respecta els revolts.
- **Procediment**: Prémer **⏺️ REC**, recórrer 25-50 km, pausar en avituallaments i exportar el GPX resultant.
- **Criteri d'acceptació**: Traçat net, sense punts dispersos en repòs i arxiu GPX 100% vàlid integrable a Strava o Garmin Connect.

---

## 4. Full de Registre de Sortida de Camp (Log Template)

| Paràmetre de la Sortida | Valor Registrat | Notes / Observacions |
| :--- | :--- | :--- |
| **Data i Hora d'Inici** | `2026-__-__ __:__` | |
| **Dispositiu & Sistema Operatiu** | | |
| **Bateria Inicial / Final** | `___%` $\rightarrow$ `___%` | Consum: `___%` en `__h __m` |
| **Distància TrailGPS vs Garmin** | `___ km` vs `___ km` | Diferència: `___%` |
| **Desnivell +D TrailGPS / Garmin** | `+___ m` vs `+___ m` | Diferència: `___%` |
| **Alertes Fora de Ruta** | `___` alertes | `___` reals / `___` falsos positius |
| **Estabilitat BLE (Pols/Cadència)** | Estable / Desconnexions | Temps reconnexió: `___ s` |
| **Visibilitat sota llum solar** | Excel·lent / Bona / Regular | Contrast de color de ruta i HUD |
| **Incidències o millores detectades** | | |

---

## 5. Criteris d'Acceptació per a Versió Final 1.0 (Producció)

- [ ] **Zero bloquejos o congelacions** durant sortides de $\ge 3\text{ hores}$.
- [ ] **Precisió d'Altimetria**: Desviació de desnivell acumulat $< 5\%$ respecte al dispositiu de contrast.
- [ ] **Eficiència Energètica**: Consum mitjà en mode Eco $\le 18\%\text{ / hora}$ en smartphones actuals amb pantalla al 70% de brillantor.
- [ ] **Integritat de Dades**: Rutes gravades desades a IndexedDB sense pèrdues i exportables en format GPX / JSON estàndard.

