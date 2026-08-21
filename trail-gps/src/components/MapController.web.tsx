import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraMode, GpxTrack, UserPosition } from '../types';
import { NavigationArrow } from './NavigationArrow';

interface MapControllerProps {
  userPos: UserPosition | null;
  track: GpxTrack | null;
  cameraMode: CameraMode;
  onMapDrag?: () => void;
  mapRef: any;
}

export const MapController: React.FC<MapControllerProps> = ({
  userPos,
  track,
  cameraMode,
  onMapDrag,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const outlinePolylineRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  // Carregar Leaflet dinàmicament al navegador web
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Afegir CSS de Leaflet si no existeix
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Carregar JS de Leaflet
    const loadLeaflet = () => {
      if ((window as any).L && containerRef.current && !leafletMapRef.current) {
        const L = (window as any).L;

        const initialLat = track?.points[0]?.latitude ?? userPos?.latitude ?? 41.425;
        const initialLng = track?.points[0]?.longitude ?? userPos?.longitude ?? 2.13;

        const map = L.map(containerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([initialLat, initialLng], 15);

        // Capa de mapa OpenStreetMap d'alt contrast
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        leafletMapRef.current = map;

        map.on('dragstart', () => {
          if (onMapDrag) onMapDrag();
        });
      }
    };

    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = loadLeaflet;
      document.head.appendChild(script);
    } else {
      loadLeaflet();
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Dibuixar el track GPX a Leaflet
  useEffect(() => {
    const L = (window as any).L;
    const map = leafletMapRef.current;
    if (!L || !map || !track || track.points.length === 0) return;

    const latlngs = track.points.map((p) => [p.latitude, p.longitude]);

    // Eliminar polilínies anteriors
    if (outlinePolylineRef.current) map.removeLayer(outlinePolylineRef.current);
    if (polylineRef.current) map.removeLayer(polylineRef.current);

    // Vora exterior fosca per a màxim contrast
    outlinePolylineRef.current = L.polyline(latlngs, {
      color: '#051923',
      weight: 8,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Traçat GPX interior cian elèctric
    polylineRef.current = L.polyline(latlngs, {
      color: '#00E5FF',
      weight: 5,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Centrar al track
    map.fitBounds(polylineRef.current.getBounds(), {
      padding: [40, 40],
    });
  }, [track]);

  // Actualitzar posició del ciclista i rotació de la fletxa
  useEffect(() => {
    const L = (window as any).L;
    const map = leafletMapRef.current;
    if (!L || !map || !userPos) return;

    const { latitude, longitude, heading } = userPos;

    // Crear o actualitzar marcador amb la fletxa delta SVG
    if (!userMarkerRef.current) {
      const customIcon = L.divIcon({
        className: 'user-heading-marker',
        html: `
          <div id="user-arrow-wrapper" style="width: 58px; height: 58px; transform: rotate(${heading}deg); transform-origin: center; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));">
            <svg width="58" height="58" viewBox="0 0 100 100">
              <defs>
                <radialGradient id="beam" cx="50%" cy="100%" r="90%">
                  <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.5"/>
                  <stop offset="100%" stop-color="#00E5FF" stop-opacity="0"/>
                </radialGradient>
              </defs>
              <path d="M 50 50 L 15 5 A 70 70 0 0 1 85 5 Z" fill="url(#beam)" />
              <polygon points="50,16 75,78 50,65 25,78" fill="#FFFFFF" stroke="#0F172A" stroke-width="3" stroke-linejoin="round"/>
              <polygon points="50,22 70,74 50,63 30,74" fill="#00E5FF" stroke="#0097A7" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
          </div>
        `,
        iconSize: [58, 58],
        iconAnchor: [29, 29],
      });

      userMarkerRef.current = L.marker([latitude, longitude], {
        icon: customIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([latitude, longitude]);
      const arrowEl = document.getElementById('user-arrow-wrapper');
      if (arrowEl) {
        arrowEl.style.transform = `rotate(${heading}deg)`;
      }
    }

    // Seguir la posició si estem en mode navegació
    if (cameraMode !== 'free') {
      map.panTo([latitude, longitude], {
        animate: true,
        duration: 0.3,
      });
    }
  }, [userPos, cameraMode]);

  return (
    <View style={styles.container}>
      <div
        ref={containerRef as any}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0F172A',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
