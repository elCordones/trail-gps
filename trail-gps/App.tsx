import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';

import { CameraMode, GpxTrack, NavigationTelemetry, UserPosition } from './src/types';
import { parseGpxString } from './src/utils/gpxParser';
import { SAMPLE_GPX_STRING } from './src/utils/sampleGpx';
import { calculateNavigationTelemetry } from './src/utils/geoMath';
import { triggerOffTrackAlert } from './src/utils/soundAlert';
import { pickAndParseGpxFile } from './src/utils/fileImporter';

import { MapController } from './src/components/MapController';
import { CockpitDashboard } from './src/components/CockpitDashboard';
import { ElevationProfile } from './src/components/ElevationProfile';

export default function App() {
  // Mantenir la pantalla de l'iPhone encesa durant la navegació al manillar
  useKeepAwake();

  const mapRef = useRef<MapView | null>(null);

  const [track, setTrack] = useState<GpxTrack | null>(null);
  const [userPos, setUserPos] = useState<UserPosition | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('headingUp');
  const [showElevation, setShowElevation] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const [telemetry, setTelemetry] = useState<NavigationTelemetry>({
    isOffTrack: false,
    distanceToTrackM: 0,
    nearestPointIndex: 0,
    remainingDistanceKm: 0,
    progressPercent: 0,
    currentSlopePercent: 0,
  });

  // Carregar la ruta inicial d'exemple al començar
  useEffect(() => {
    try {
      const initialTrack = parseGpxString(SAMPLE_GPX_STRING);
      setTrack(initialTrack);

      // Posicionar l'usuari a l'inici del track per defecte
      if (initialTrack.points.length > 0) {
        const start = initialTrack.points[0];
        setUserPos({
          latitude: start.latitude,
          longitude: start.longitude,
          heading: 45,
          speedKmh: 0,
          altitude: start.altitude ?? 160,
          accuracy: 5,
          timestamp: Date.now(),
        });
      }
    } catch (e) {
      console.error('Error carregant track inicial:', e);
    }
  }, []);

  // Subscripció al GPS real de l'iPhone
  useEffect(() => {
    let locationSub: Location.LocationSubscription | null = null;
    let headingSub: Location.LocationSubscription | null = null;

    async function startGpsTracking() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permís de localització no concedit');
          return;
        }

        // Seguiment de posició GPS d'alta precisió
        locationSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 600,
            distanceInterval: 1,
          },
          (loc) => {
            if (isSimulating) return; // Si s'està simulant, ignorem el GPS estàtic de casa

            const speedKmh = loc.coords.speed ? Math.max(0, loc.coords.speed * 3.6) : 0;
            const heading = loc.coords.heading ?? 0;

            setUserPos((prev) => ({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              heading: heading >= 0 ? heading : prev?.heading ?? 0,
              speedKmh: parseFloat(speedKmh.toFixed(1)),
              altitude: loc.coords.altitude ?? 0,
              accuracy: loc.coords.accuracy ?? 5,
              timestamp: loc.timestamp,
            }));
          }
        );

        // Subscripció a la brúixola / heading per a màxima resposta
        headingSub = await Location.watchHeadingAsync((h) => {
          if (isSimulating) return;
          setUserPos((prev) => {
            if (!prev) return null;
            // Si estem aturats o a baixa velocitat, utilitzem el rumb magnètic
            if (prev.speedKmh < 3) {
              return { ...prev, heading: Math.round(h.trueHeading >= 0 ? h.trueHeading : h.magHeading) };
            }
            return prev;
          });
        });
      } catch (err) {
        console.log('Error iniciant seguiment de localització:', err);
      }
    }

    startGpsTracking();

    return () => {
      locationSub?.remove();
      headingSub?.remove();
    };
  }, [isSimulating]);

  // Recàlcul continu de telemetria i comprovació de fora de ruta
  useEffect(() => {
    if (!userPos || !track) return;

    const telem = calculateNavigationTelemetry(
      userPos,
      track.points,
      track.totalDistanceKm,
      40 // 40 metres de marge abans d'avisar
    );

    setTelemetry(telem);

    // Emetre alerta sonora si s'ha sortit de la ruta
    if (telem.isOffTrack) {
      triggerOffTrackAlert();
    }
  }, [userPos, track]);

  // Gestió de canvi de mode de càmera (Heading-Up vs North-Up)
  const handleToggleCameraMode = () => {
    setCameraMode((prev) => (prev === 'headingUp' ? 'northUp' : 'headingUp'));
  };

  // Recentrar la càmera al ciclista
  const handleRecenter = () => {
    if (!userPos || !mapRef.current) return;
    setCameraMode('headingUp');
    mapRef.current.animateCamera({
      center: {
        latitude: userPos.latitude,
        longitude: userPos.longitude,
      },
      heading: userPos.heading,
      pitch: 35,
      zoom: 17.5,
    });
  };

  // Seleccionar i carregar fitxer GPX
  const handleSelectGpx = async () => {
    try {
      const newTrack = await pickAndParseGpxFile();
      if (newTrack) {
        setTrack(newTrack);
        if (newTrack.points.length > 0) {
          const firstPt = newTrack.points[0];
          setUserPos({
            latitude: firstPt.latitude,
            longitude: firstPt.longitude,
            heading: 0,
            speedKmh: 0,
            altitude: firstPt.altitude ?? 0,
            accuracy: 5,
            timestamp: Date.now(),
          });
          mapRef.current?.fitToCoordinates(newTrack.points, {
            edgePadding: { top: 80, right: 50, bottom: 260, left: 50 },
            animated: true,
          });
        }
      }
    } catch (e) {
      Alert.alert('Error', 'No s\'ha pogut obrir el fitxer GPX.');
    }
  };

  // Simulador de ruta per fer proves a casa / taula
  const toggleSimulation = () => {
    if (!track || track.points.length === 0) return;

    if (isSimulating) {
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step >= track.points.length - 1) {
        clearInterval(interval);
        setIsSimulating(false);
        return;
      }

      const p1 = track.points[step];
      const p2 = track.points[step + 1];

      // Càlcul rumb entre punts
      const dLat = p2.latitude - p1.latitude;
      const dLng = p2.longitude - p1.longitude;
      const rad = Math.atan2(dLng, dLat);
      const heading = (rad * 180) / Math.PI;

      setUserPos({
        latitude: p1.latitude,
        longitude: p1.longitude,
        heading: (heading + 360) % 360,
        speedKmh: 24.8 + (Math.random() * 4 - 2),
        altitude: p1.altitude ?? 200,
        accuracy: 3,
        timestamp: Date.now(),
      });

      step++;
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Capçalera superior minimalista */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>TRAIL<Text style={styles.brandHighlight}>GPS</Text></Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>GPS FIX</Text>
          </View>
        </View>

        {/* Botó de simulador per provar a casa */}
        <TouchableOpacity
          style={[styles.simBtn, isSimulating ? styles.simBtnActive : null]}
          onPress={toggleSimulation}
          activeOpacity={0.8}
        >
          <Text style={styles.simBtnText}>
            {isSimulating ? '⏹️ Aturar Test' : '▶️ Simular Ruta'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mapa Central amb Fletxa Direccional */}
      <MapController
        userPos={userPos}
        track={track}
        cameraMode={cameraMode}
        onMapDrag={() => setCameraMode('free')}
        mapRef={mapRef}
      />

      {/* Perfil d'Altimetria desplegable */}
      {showElevation && (
        <View style={styles.elevationWrapper}>
          <ElevationProfile
            track={track}
            progressPercent={telemetry.progressPercent}
            currentSlopePercent={telemetry.currentSlopePercent}
            currentAltitude={userPos?.altitude}
          />
        </View>
      )}

      {/* Panell Ciclocomputador Cockpit */}
      <CockpitDashboard
        userPos={userPos}
        telemetry={telemetry}
        cameraMode={cameraMode}
        onToggleCameraMode={handleToggleCameraMode}
        onRecenter={handleRecenter}
        onSelectGpx={handleSelectGpx}
        onToggleElevation={() => setShowElevation((prev) => !prev)}
        showElevation={showElevation}
        trackName={track?.name}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandHighlight: {
    color: '#00E5FF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  simBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  simBtnActive: {
    backgroundColor: '#DC2626',
    borderColor: '#F87171',
  },
  simBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  elevationWrapper: {
    position: 'absolute',
    bottom: 175,
    left: 0,
    right: 0,
    zIndex: 30,
  },
});
