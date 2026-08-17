# **Especificació del Projecte: App de Navegació GPX per a Bici (iOS)**

## **1\. Objectiu i Concepte**

Crear una aplicació mòbil lleugera, privada i 100% autònoma per a iOS. L'aplicació ha de permetre rebre un fitxer .gpx (provinent de Wikiloc o altres fonts), dibuixar-lo sobre un mapa i fer el seguiment de la posició en temps real de la bicicleta. Tot això sense dependre de comptes d'usuari, connexió a internet constant ni servidors externs.

## **2\. Requisits Tècnics i Stack Recomanat**

S'utilitzarà un enfocament basat en tecnologies web encapsulades per a mòbil (ideal per generar l'app ràpidament amb eines tipus AntiGravity CLI):

| **Mòdul / Eina** | **Llibreria / Recurs** | **Funció principal** |

| **Framework** | **React Native (Expo)** | Base de l'app nativa, gestió de l'estat i cicle de vida. |

| **Renderitzador de Mapa** | react-native-maps | Utilitza el MapKit natiu d'Apple; renderitza capes i el component \<Polyline\>. |

| **GPS i Ubicació** | expo-location | Gestió de permisos (Foreground i Background) i subscripció a canvis de coordenades. |

| **Parseig de dades** | fast-xml-parser o @tmcw/togeojson | Extracció ràpida de punts \<trkpt\> (latitud, longitud, alçada) des de l'XML del GPX. |

| **Integració iOS** | app.json (CFBundleDocumentTypes) | Registrar l'app per obrir arxius .gpx directament des d'AirDrop o WhatsApp. |

| **Mapes Offline** | URL Template de tessel·les | Emmagatzematge en memòria cau local de les tessel·les (OpenStreetMap) per a zones sense cobertura. |

## **3\. Característiques a Incorporar (Inspirades en el mercat)**

Després d'analitzar alternatives com OsmAnd, OffTrail, GPX Viewer i Organic Maps, l'app pròpia ha d'integrar els següents punts forts:

* **Seguiment Fidel del Traçat (Model *OffTrail*):** Evitar qualsevol recàlcul de ruta automàtic que intenti "enganxar" la posició a carrers asfaltats. La línia GPX ha de ser un traçat estàtic intocable (ideal per a corriols MTB).  
* **Alerta de "Fora de Ruta" (Model *GPX Viewer PRO*):** Càlcul geomètric de distància perpendicular entre la posició GPS actual i el segment més proper de la ruta. Si supera els \~40 metres, emetre un avís acústic.  
* **Orientació del Mapa per Rumb (Model *OsmAnd*):** Rotar el mapa automàticament en funció de la direcció de moviment (heading) per facilitar la lectura visual ràpida des del manillar.  
* **Panell Ciclocomputador Minimalista:** Una barra inferior neta amb dades essencials en tipografia gran: Distància recorreguda, Velocitat i Desnivell.  
* **Privacitat Absoluta:** Sense formularis de registre ni telemetria; procés 100% local al dispositiu de l'usuari.

## **4\. Full de Ruta d'Implementació**

1. **Configuració Inicial:** Inicialitzar el projecte React Native / Expo i configurar els tipus d'arxiu acceptats (GPX).  
2. **Mòdul de Parseig:** Crear el parser per llegir l'arxiu GPX i extreure un array d'objectes amb { latitude, longitude, altitude }.  
3. **Renderitzat UI:** Pintar la ruta mitjançant \<MapView\> i \<Polyline\>.  
4. **Mòdul de Geolocalització:** Implementar la subscripció a Location.watchPositionAsync per moure el marcador de l'usuari i centrar la càmera.  
5. **Capa Offline:** Afegir la lògica per descarregar i guardar a la memòria cau les tessel·les del mapa corresponents a l'àrea del track carregat.