import { GpxPoint, UserPosition, NavigationTelemetry } from '../types';

const EARTH_RADIUS_METERS = 6371000;

/**
 * Converteix graus a radiants
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converteix radiants a graus
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calcula la distància Haversine en metres entre dos punts
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Calcula el rumb (bearing) de p1 a p2 en graus (0..360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaLambda = toRadians(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return (toDegrees(theta) + 360) % 360;
}

/**
 * Calcula la distància perpendicular en metres d'un punt P a un segment AB
 */
function distancePointToSegmentMeters(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  // Projecció plana local aproximada (ràpida i extremadament precisa per distàncies curtes < 1km)
  const latMid = (aLat + bLat) / 2;
  const kx = Math.cos(toRadians(latMid)) * 111320;
  const ky = 110540;

  const ax = aLng * kx;
  const ay = aLat * ky;
  const bx = bLng * kx;
  const by = bLat * ky;
  const px = pLng * kx;
  const py = pLat * ky;

  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    return Math.sqrt((px - ax) * (px - ax) + (py - ay) * (py - ay));
  }

  // Factor de projecció t sobre el segment [0, 1]
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
  const projX = ax + t * dx;
  const projY = ay + t * dy;

  return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
}

/**
 * Calcula la telemetria de navegació: distància al track, fora de ruta (>40m), progrés i pendent
 */
export function calculateNavigationTelemetry(
  userPos: UserPosition,
  trackPoints: GpxPoint[],
  totalDistanceKm: number,
  offTrackThresholdM: number = 40
): NavigationTelemetry {
  if (!trackPoints || trackPoints.length === 0) {
    return {
      isOffTrack: false,
      distanceToTrackM: 0,
      nearestPointIndex: 0,
      remainingDistanceKm: 0,
      progressPercent: 0,
      currentSlopePercent: 0,
    };
  }

  let minDistance = Infinity;
  let nearestIdx = 0;

  // Cerca del segment més proper
  for (let i = 0; i < trackPoints.length - 1; i++) {
    const d = distancePointToSegmentMeters(
      userPos.latitude,
      userPos.longitude,
      trackPoints[i].latitude,
      trackPoints[i].longitude,
      trackPoints[i + 1].latitude,
      trackPoints[i + 1].longitude
    );

    if (d < minDistance) {
      minDistance = d;
      nearestIdx = i;
    }
  }

  const nearestPoint = trackPoints[nearestIdx];
  const distanceFromStart = nearestPoint.distanceFromStartKm ?? 0;
  const remainingKm = Math.max(0, totalDistanceKm - distanceFromStart);
  const progress = totalDistanceKm > 0 ? (distanceFromStart / totalDistanceKm) * 100 : 0;

  return {
    isOffTrack: minDistance > offTrackThresholdM,
    distanceToTrackM: Math.round(minDistance),
    nearestPointIndex: nearestIdx,
    remainingDistanceKm: parseFloat(remainingKm.toFixed(1)),
    progressPercent: Math.min(100, Math.round(progress)),
    currentSlopePercent: nearestPoint.slopePercent ?? 0,
  };
}
