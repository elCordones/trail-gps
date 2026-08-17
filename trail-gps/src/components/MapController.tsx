import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { CameraMode, GpxTrack, UserPosition } from '../types';
import { NavigationArrow } from './NavigationArrow';

interface MapControllerProps {
  userPos: UserPosition | null;
  track: GpxTrack | null;
  cameraMode: CameraMode;
  onMapDrag?: () => void;
  mapRef: React.RefObject<MapView | null>;
}

export const MapController: React.FC<MapControllerProps> = ({
  userPos,
  track,
  cameraMode,
  onMapDrag,
  mapRef,
}) => {
  const lastCameraUpdate = useRef<number>(0);

  // Actualitzar càmera quan canvia la posició de l'usuari o el rumb
  useEffect(() => {
    if (!userPos || !mapRef.current || cameraMode === 'free') return;

    const now = Date.now();
    // Limitar actualitzacions a màxim 10 per segon per suavitat i bateria
    if (now - lastCameraUpdate.current < 100) return;
    lastCameraUpdate.current = now;

    if (cameraMode === 'headingUp') {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: userPos.latitude,
            longitude: userPos.longitude,
          },
          heading: userPos.heading,
          pitch: 35, // Angle 3D suau per mirar endavant en el corriol
          zoom: 17.5,
          altitude: 400,
        },
        { duration: 250 }
      );
    } else if (cameraMode === 'northUp') {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: userPos.latitude,
            longitude: userPos.longitude,
          },
          heading: 0, // Nord sempre a dalt
          pitch: 0,
          zoom: 16,
          altitude: 800,
        },
        { duration: 300 }
      );
    }
  }, [userPos, cameraMode]);

  // Centrar inicialment al track quan es carrega
  useEffect(() => {
    if (track && track.points.length > 0 && mapRef.current && !userPos) {
      const { bounds } = track;
      mapRef.current.fitToCoordinates(track.points, {
        edgePadding: { top: 80, right: 50, bottom: 260, left: 50 },
        animated: true,
      });
    }
  }, [track]);

  const initialRegion = track?.points[0]
    ? {
        latitude: track.points[0].latitude,
        longitude: track.points[0].longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }
    : userPos
    ? {
        latitude: userPos.latitude,
        longitude: userPos.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }
    : {
        latitude: 41.425,
        longitude: 2.13,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef as any}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={false} // Utilitzem el nostre marcador personalitzat d'alt contrast amb fletxa
        showsCompass={false}
        showsScale={true}
        mapType="standard"
        userInterfaceStyle="dark"
        onPanDrag={onMapDrag}
      >
        {/* Capa de tessel·les topogràfiques OpenStreetMap d'alta visibilitat per a muntanya */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          zIndex={1}
        />

        {/* Línia exterior fosca de la ruta per donar màxim contrast */}
        {track && track.points.length > 1 && (
          <Polyline
            coordinates={track.points}
            strokeColor="#051923"
            strokeWidth={8}
            lineJoin="round"
            lineCap="round"
            zIndex={10}
          />
        )}

        {/* Línia principal del traçat GPX (Cian elèctric brillant #00E5FF) */}
        {track && track.points.length > 1 && (
          <Polyline
            coordinates={track.points}
            strokeColor="#00E5FF"
            strokeWidth={5}
            lineJoin="round"
            lineCap="round"
            zIndex={11}
          />
        )}

        {/* Marcador de la posició del ciclista amb la FLETXA DIRECCIONAL */}
        {userPos && (
          <Marker
            coordinate={{
              latitude: userPos.latitude,
              longitude: userPos.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            zIndex={100}
            tracksViewChanges={true}
          >
            <NavigationArrow heading={userPos.heading} size={58} showCone={true} />
          </Marker>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
});
