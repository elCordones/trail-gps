import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { GpxTrack } from '../types';

interface ElevationProfileProps {
  track: GpxTrack | null;
  progressPercent: number;
  currentSlopePercent: number;
  currentAltitude?: number;
}

export const ElevationProfile: React.FC<ElevationProfileProps> = ({
  track,
  progressPercent,
  currentSlopePercent,
  currentAltitude,
}) => {
  if (!track || track.points.length === 0) return null;

  const screenWidth = Dimensions.get('window').width - 32;
  const height = 75;

  const { points, minElevation, maxElevation, totalDistanceKm } = track;
  const eleDiff = Math.max(20, maxElevation - minElevation);

  // Generar el traçat SVG de l'altimetria
  const svgPoints = points
    .filter((p, i) => i % Math.max(1, Math.floor(points.length / 80)) === 0 || i === points.length - 1)
    .map((p) => {
      const x = totalDistanceKm > 0 ? ((p.distanceFromStartKm ?? 0) / totalDistanceKm) * screenWidth : 0;
      const alt = p.altitude ?? minElevation;
      const y = height - ((alt - minElevation) / eleDiff) * (height - 18) - 6;
      return { x, y, alt };
    });

  if (svgPoints.length === 0) return null;

  let pathD = `M 0 ${height} L ${svgPoints[0].x} ${svgPoints[0].y}`;
  for (let i = 1; i < svgPoints.length; i++) {
    pathD += ` L ${svgPoints[i].x} ${svgPoints[i].y}`;
  }
  pathD += ` L ${screenWidth} ${height} Z`;

  let lineD = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
  for (let i = 1; i < svgPoints.length; i++) {
    lineD += ` L ${svgPoints[i].x} ${svgPoints[i].y}`;
  }

  // Posició del punt actual
  const currentX = (Math.max(0, Math.min(100, progressPercent)) / 100) * screenWidth;
  // Trobar la Y interpolada
  const currentY =
    currentAltitude !== undefined
      ? height - ((currentAltitude - minElevation) / eleDiff) * (height - 18) - 6
      : height / 2;

  // Color de pendent segons la duresa
  const getSlopeColor = (slope: number) => {
    if (slope > 14) return '#EF4444'; // Vermell (>14%)
    if (slope > 8) return '#F97316'; // Taronja (9-14%)
    if (slope > 4) return '#EAB308'; // Groc (5-8%)
    if (slope < -4) return '#3B82F6'; // Blau (Baixada)
    return '#10B981'; // Verd (Pla/Suau)
  };

  const slopeColor = getSlopeColor(currentSlopePercent);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.label}>PERFIL D'ALTIMETRIA</Text>
          <Text style={styles.altText}>
            {currentAltitude ? `${Math.round(currentAltitude)} m` : `${minElevation}-${maxElevation} m`}
          </Text>
        </View>

        <View style={[styles.slopeBadge, { backgroundColor: slopeColor }]}>
          <Text style={styles.slopeText}>
            {currentSlopePercent > 0 ? `+${currentSlopePercent}%` : `${currentSlopePercent}%`}
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={screenWidth} height={height}>
          <Defs>
            <LinearGradient id="eleGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#00E5FF" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#00E5FF" stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* Relleno de la muntanya */}
          <Path d={pathD} fill="url(#eleGradient)" />

          {/* Línia de perfil d'alt contrast */}
          <Path d={lineD} stroke="#00E5FF" strokeWidth="2.5" fill="none" />

          {/* Marcador de la posició del ciclista */}
          <Circle cx={currentX} cy={currentY} r="7" fill="#FFFFFF" />
          <Circle cx={currentX} cy={currentY} r="5" fill="#00E5FF" />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  altText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  slopeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  slopeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
