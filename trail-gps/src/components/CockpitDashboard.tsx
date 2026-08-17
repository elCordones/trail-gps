import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraMode, NavigationTelemetry, UserPosition } from '../types';

interface CockpitDashboardProps {
  userPos: UserPosition | null;
  telemetry: NavigationTelemetry;
  cameraMode: CameraMode;
  onToggleCameraMode: () => void;
  onRecenter: () => void;
  onSelectGpx: () => void;
  onToggleElevation: () => void;
  showElevation: boolean;
  trackName?: string;
}

export const CockpitDashboard: React.FC<CockpitDashboardProps> = ({
  userPos,
  telemetry,
  cameraMode,
  onToggleCameraMode,
  onRecenter,
  onSelectGpx,
  onToggleElevation,
  showElevation,
  trackName,
}) => {
  const speed = userPos ? Math.max(0, userPos.speedKmh).toFixed(1) : '0.0';

  return (
    <View style={styles.container}>
      {/* Banner d'alerta fora de ruta si estem a >40m */}
      {telemetry.isOffTrack && (
        <View style={styles.offTrackBanner}>
          <View style={styles.alertIconPulse}>
            <Text style={styles.alertIconText}>⚠️</Text>
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.offTrackTitle}>FORA DE RUTA!</Text>
            <Text style={styles.offTrackSubtitle}>
              A {telemetry.distanceToTrackM}m del traçat GPX
            </Text>
          </View>
        </View>
      )}

      {/* Barra de controls ràpids flotants */}
      <View style={styles.floatingBar}>
        <TouchableOpacity
          style={[
            styles.controlBtn,
            cameraMode === 'headingUp' ? styles.controlBtnActive : null,
          ]}
          onPress={onToggleCameraMode}
          activeOpacity={0.8}
        >
          <Text style={styles.controlIcon}>
            {cameraMode === 'headingUp' ? '🧭' : '⬆️'}
          </Text>
          <Text style={styles.controlLabel}>
            {cameraMode === 'headingUp' ? 'RUMB (HEADING)' : 'NORD DALT'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, showElevation ? styles.controlBtnActive : null]}
          onPress={onToggleElevation}
          activeOpacity={0.8}
        >
          <Text style={styles.controlIcon}>⛰️</Text>
          <Text style={styles.controlLabel}>PERFIL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={onRecenter}
          activeOpacity={0.8}
        >
          <Text style={styles.controlIcon}>🎯</Text>
          <Text style={styles.controlLabel}>CENTRAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={onSelectGpx}
          activeOpacity={0.8}
        >
          <Text style={styles.controlIcon}>📂</Text>
          <Text style={styles.controlLabel}>GPX</Text>
        </TouchableOpacity>
      </View>

      {/* Panell Ciclocomputador Principal (HUD) */}
      <View style={styles.hudCard}>
        {trackName && (
          <View style={styles.trackInfo}>
            <Text style={styles.trackName} numberOfLines={1}>
              📍 {trackName}
            </Text>
            <Text style={styles.progressText}>
              {telemetry.progressPercent}% completat
            </Text>
          </View>
        )}

        <View style={styles.metricsGrid}>
          {/* Velocitat gran */}
          <View style={styles.metricBig}>
            <Text style={styles.metricLabel}>VELOCITAT</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValueBig}>{speed}</Text>
              <Text style={styles.metricUnit}>km/h</Text>
            </View>
          </View>

          {/* Distància restant */}
          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>RESTANT</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>
                {telemetry.remainingDistanceKm}
              </Text>
              <Text style={styles.metricUnit}>km</Text>
            </View>
          </View>

          {/* Distància al track */}
          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>AL TRACK</Text>
            <View style={styles.metricValueRow}>
              <Text
                style={[
                  styles.metricValue,
                  telemetry.isOffTrack ? styles.valueDanger : styles.valueSuccess,
                ]}
              >
                {telemetry.distanceToTrackM}
              </Text>
              <Text style={styles.metricUnit}>m</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 24,
  },
  offTrackBanner: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  alertIconPulse: {
    marginRight: 12,
  },
  alertIconText: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  offTrackTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  offTrackSubtitle: {
    color: '#FEE2E2',
    fontSize: 13,
    fontWeight: '600',
  },
  floatingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  controlBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  controlBtnActive: {
    backgroundColor: '#0369A1',
    borderColor: '#38BDF8',
  },
  controlIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  controlLabel: {
    color: '#F1F5F9',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hudCard: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  trackInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  trackName: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricBig: {
    flex: 1.4,
  },
  metricCol: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#1E293B',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  metricValueBig: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  valueSuccess: {
    color: '#10B981',
  },
  valueDanger: {
    color: '#EF4444',
  },
  metricUnit: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
});
