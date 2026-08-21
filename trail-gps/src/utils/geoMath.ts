import { GpxPoint, UserPosition, NavigationTelemetry, Waypoint, TurnInstruction } from '../types';

export const EARTH_RADIUS_METERS = 6371000;
export const MAX_VALID_CYCLING_SPEED_KMH = 100;
export const MIN_MOVING_SPEED_KMH = 1.8;
export const GPS_MAX_ACCEPTABLE_ACCURACY_METERS = 50;
export const GPS_ANOMALOUS_JUMP_METERS = 150;
export const ELEVATION_EMA_ALPHA = 0.25;
export const ELEVATION_ASCENT_DEADBAND_METERS = 2.0;
export const MAX_VERTICAL_SPEED_MPS = 1.5;
export const MIN_RECORD_DISTANCE_METERS = 3.5;
export const MAX_RECORD_INTERVAL_SECONDS = 6;
export const MIN_RECORD_TURN_DEGREES = 18;

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
  if (lat1 === lat2 && lon1 === lon2) return 0;
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
 * Calcula la diferència d'angle amb signe (-180..+180)
 */
export function angleDiff(b1: number, b2: number): number {
  return ((b2 - b1 + 540) % 360) - 180;
}

/**
 * Calcula la distància perpendicular en metres d'un punt P a un segment AB
 */
export function distancePointToSegmentMeters(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
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

  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
  const projX = ax + t * dx;
  const projY = ay + t * dy;

  return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
}

/**
 * Categoritza icones de Waypoint per paraules clau
 */
export function getPoiIcon(name: string = '', desc: string = ''): string {
  const text = (name + ' ' + desc).toLowerCase();
  if (text.includes('font') || text.includes('aigua') || text.includes('water') || text.includes('fuente')) return '💧';
  if (text.includes('cim') || text.includes('pic') || text.includes('peak') || text.includes('summit')) return '⛰️';
  if (text.includes('mirador') || text.includes('foto') || text.includes('view')) return '📸';
  if (text.includes('perill') || text.includes('danger') || text.includes('alerta') || text.includes('atenció')) return '⚠️';
  if (text.includes('cruïlla') || text.includes('desvi') || text.includes('turn') || text.includes('cross')) return '🔀';
  if (text.includes('bar') || text.includes('refugi') || text.includes('menjar') || text.includes('rest')) return '🥪';
  if (text.includes('taller') || text.includes('bici') || text.includes('mecanic') || text.includes('repair')) return '🔧';
  return '📍';
}

/**
 * Detecta girs, cruïlles i instruccions de navegació Turn-by-Turn
 */
export function detectTrackTurns(points: GpxPoint[], waypointsList: Waypoint[] = []): TurnInstruction[] {
  const turns: TurnInstruction[] = [];
  if (!points || points.length < 3) return turns;

  const totalTrackDist = (points[points.length - 1].distanceFromStartKm || 0) * 1000;
  const avgSegDist = totalTrackDist / Math.max(1, points.length - 1);
  const windowMeters = Math.max(20, Math.min(60, avgSegDist * 1.1));

  const rawTurns: any[] = [];

  for (let i = 1; i < points.length - 1; i++) {
    const cur = points[i];
    const curDistM = (cur.distanceFromStartKm || 0) * 1000;

    let prevIdx = i - 1;
    while (prevIdx > 0 && (curDistM - ((points[prevIdx].distanceFromStartKm || 0) * 1000)) < windowMeters) {
      prevIdx--;
    }

    let nextIdx = i + 1;
    while (nextIdx < points.length - 1 && (((points[nextIdx].distanceFromStartKm || 0) * 1000) - curDistM) < windowMeters) {
      nextIdx++;
    }

    const bIn = calculateBearing(points[prevIdx].latitude, points[prevIdx].longitude, cur.latitude, cur.longitude);
    const bOut = calculateBearing(cur.latitude, cur.longitude, points[nextIdx].latitude, points[nextIdx].longitude);
    const diff = angleDiff(bIn, bOut);
    const absDiff = Math.abs(diff);

    if (absDiff >= 26) {
      let direction: TurnInstruction['direction'] = 'straight';
      let text = 'Recte';
      let icon = '⬆️';

      if (absDiff >= 145) {
        direction = 'uturn';
        text = 'Canvi de sentit';
        icon = '🔄';
      } else if (absDiff >= 100) {
        direction = diff > 0 ? 'sharp_right' : 'sharp_left';
        text = diff > 0 ? 'Gir molt tancat a la dreta' : 'Gir molt tancat a l\'esquerra';
        icon = diff > 0 ? '↘️' : '↙️';
      } else if (absDiff >= 52) {
        direction = diff > 0 ? 'right' : 'left';
        text = diff > 0 ? 'Gir a la dreta' : 'Gir a l\'esquerra';
        icon = diff > 0 ? '➡️' : '⬅️';
      } else {
        direction = diff > 0 ? 'slight_right' : 'slight_left';
        text = diff > 0 ? 'Lleuger a la dreta' : 'Lleuger a l\'esquerra';
        icon = diff > 0 ? '↗️' : '↖️';
      }

      let poiName: string | undefined;
      if (waypointsList && waypointsList.length > 0) {
        for (const wp of waypointsList) {
          const dWp = haversineDistanceMeters(cur.latitude, cur.longitude, wp.lat, wp.lng);
          if (dWp < 45) {
            text = `${text} (${wp.name})`;
            poiName = wp.name;
            break;
          }
        }
      }

      rawTurns.push({
        index: i,
        lat: cur.latitude,
        lng: cur.longitude,
        distKm: cur.distanceFromStartKm || 0,
        distFromStartM: curDistM,
        angle: diff,
        absAngle: absDiff,
        direction,
        text,
        icon,
        poiName,
      });
    }
  }

  const clusterDist = Math.max(30, Math.min(80, avgSegDist * 1.2));
  let cluster: any[] = [];

  for (const t of rawTurns) {
    if (cluster.length === 0) {
      cluster.push(t);
    } else {
      const last = cluster[cluster.length - 1];
      if ((t.distFromStartM - last.distFromStartM) < clusterDist) {
        cluster.push(t);
      } else {
        cluster.sort((a, b) => b.absAngle - a.absAngle);
        turns.push(cluster[0]);
        cluster = [t];
      }
    }
  }
  if (cluster.length > 0) {
    cluster.sort((a, b) => b.absAngle - a.absAngle);
    turns.push(cluster[0]);
  }

  return turns;
}

/**
 * Filtre d'Altimetria EMA + Deadband
 */
export class ElevationFilter {
  alpha: number;
  deadband: number;
  maxVerticalSpeedMps: number;
  smoothedEle: number | null = null;
  eleBaseline: number | null = null;
  totalAscentM: number = 0;
  lastTimestamp: number | null = null;

  constructor(options: { alpha?: number; deadband?: number; maxVerticalSpeedMps?: number } = {}) {
    this.alpha = options.alpha ?? ELEVATION_EMA_ALPHA;
    this.deadband = options.deadband ?? ELEVATION_ASCENT_DEADBAND_METERS;
    this.maxVerticalSpeedMps = options.maxVerticalSpeedMps ?? MAX_VERTICAL_SPEED_MPS;
  }

  reset(initialEle: number | null = null) {
    this.smoothedEle = initialEle !== null && !isNaN(initialEle) ? Number(initialEle) : null;
    this.eleBaseline = this.smoothedEle;
    this.totalAscentM = 0;
    this.lastTimestamp = null;
  }

  update(rawEle: number, timestamp: number = Date.now()): { smoothedEle: number; eleGain: number; totalAscentM: number } {
    const ele = Number(rawEle);
    if (isNaN(ele)) {
      return { smoothedEle: this.smoothedEle ?? 0, eleGain: 0, totalAscentM: this.totalAscentM };
    }

    if (this.smoothedEle === null) {
      this.smoothedEle = ele;
      this.eleBaseline = ele;
      this.lastTimestamp = timestamp;
      return { smoothedEle: ele, eleGain: 0, totalAscentM: 0 };
    }

    let dtSec = 1;
    if (this.lastTimestamp !== null && timestamp > this.lastTimestamp) {
      dtSec = (timestamp - this.lastTimestamp) / 1000;
    }
    this.lastTimestamp = timestamp;

    let targetEle = ele;
    const maxDelta = this.maxVerticalSpeedMps * Math.max(1, dtSec);
    if (Math.abs(targetEle - this.smoothedEle) > maxDelta) {
      targetEle = this.smoothedEle + Math.sign(targetEle - this.smoothedEle) * maxDelta;
    }

    this.smoothedEle = (1 - this.alpha) * this.smoothedEle + this.alpha * targetEle;

    let eleGain = 0;
    if (this.eleBaseline !== null && this.smoothedEle > this.eleBaseline) {
      const delta = this.smoothedEle - this.eleBaseline;
      if (delta >= this.deadband) {
        eleGain = delta;
        this.totalAscentM += eleGain;
        this.eleBaseline = this.smoothedEle;
      }
    } else if (this.eleBaseline !== null && this.smoothedEle < this.eleBaseline) {
      this.eleBaseline = this.smoothedEle;
    }

    return {
      smoothedEle: Math.round(this.smoothedEle * 10) / 10,
      eleGain: Math.round(eleGain * 10) / 10,
      totalAscentM: Math.round(this.totalAscentM * 10) / 10,
    };
  }
}

/**
 * Filtre de Qualitat GPS
 */
export class GpsQualityFilter {
  maxAccuracy: number;
  maxSpeedKmh: number;
  maxSpeedMps: number;
  anomalousJumpMeters: number;

  constructor(options: { maxAccuracy?: number; maxSpeedKmh?: number; anomalousJumpMeters?: number } = {}) {
    this.maxAccuracy = options.maxAccuracy ?? GPS_MAX_ACCEPTABLE_ACCURACY_METERS;
    this.maxSpeedKmh = options.maxSpeedKmh ?? MAX_VALID_CYCLING_SPEED_KMH;
    this.maxSpeedMps = this.maxSpeedKmh / 3.6;
    this.anomalousJumpMeters = options.anomalousJumpMeters ?? GPS_ANOMALOUS_JUMP_METERS;
  }

  filterFix(newFix: { lat: number; lng: number; accuracy?: number; speed?: number; timestamp?: number }, prevFix?: { lat: number; lng: number; timestamp?: number }) {
    if (!newFix || typeof newFix.lat !== 'number' || typeof newFix.lng !== 'number') {
      return { valid: false, reason: 'invalid_coordinates', isOutlier: true };
    }

    const accuracy = typeof newFix.accuracy === 'number' ? newFix.accuracy : 10;
    if (accuracy > this.maxAccuracy) {
      return { valid: false, reason: 'low_accuracy', accuracy, isOutlier: true };
    }

    if (!prevFix || typeof prevFix.lat !== 'number' || typeof prevFix.lng !== 'number') {
      const reportedSpeed = typeof newFix.speed === 'number' ? newFix.speed : 0;
      return {
        valid: true,
        isOutlier: false,
        isStationary: false,
        distanceMeters: 0,
        calculatedSpeedKmh: reportedSpeed,
        filteredSpeedKmh: Math.min(reportedSpeed, this.maxSpeedKmh),
        reason: 'initial_fix',
      };
    }

    const dist = haversineDistanceMeters(prevFix.lat, prevFix.lng, newFix.lat, newFix.lng);
    const newTime = newFix.timestamp || Date.now();
    const prevTime = prevFix.timestamp || (newTime - 1000);
    const dtSec = Math.max(0.1, (newTime - prevTime) / 1000);

    if (dtSec > 60) {
      return {
        valid: true,
        isOutlier: false,
        isStationary: false,
        distanceMeters: dist,
        calculatedSpeedKmh: 0,
        filteredSpeedKmh: Math.min(newFix.speed || 0, this.maxSpeedKmh),
        reason: 'resume_after_gap',
      };
    }

    const calculatedSpeedMps = dist / dtSec;
    const calculatedSpeedKmh = calculatedSpeedMps * 3.6;

    if (calculatedSpeedMps > this.maxSpeedMps && dist > this.anomalousJumpMeters) {
      return {
        valid: false,
        isOutlier: true,
        isStationary: false,
        distanceMeters: dist,
        calculatedSpeedKmh,
        reason: 'anomalous_speed_jump',
      };
    }

    const reportedSpeed = typeof newFix.speed === 'number' ? newFix.speed : calculatedSpeedKmh;
    const isStationary = reportedSpeed < MIN_MOVING_SPEED_KMH && dist < 2.5;
    const filteredSpeedKmh = Math.min(
      Math.max(0, reportedSpeed > 0 ? reportedSpeed : calculatedSpeedKmh),
      this.maxSpeedKmh
    );

    return {
      valid: true,
      isOutlier: false,
      isStationary,
      distanceMeters: dist,
      calculatedSpeedKmh,
      filteredSpeedKmh,
      reason: isStationary ? 'stationary' : 'valid_moving',
    };
  }
}

/**
 * Mostreig Intel·ligent de Gravació de Rutes
 */
export class BreadcrumbSampler {
  minDist: number;
  maxIntervalSec: number;
  turnAngleDeg: number;
  lastRecordedHeading: number | null = null;

  constructor(options: { minDistanceMeters?: number; maxIntervalSeconds?: number; minTurnDegrees?: number } = {}) {
    this.minDist = options.minDistanceMeters ?? MIN_RECORD_DISTANCE_METERS;
    this.maxIntervalSec = options.maxIntervalSeconds ?? MAX_RECORD_INTERVAL_SECONDS;
    this.turnAngleDeg = options.minTurnDegrees ?? MIN_RECORD_TURN_DEGREES;
  }

  shouldSample(newPoint: { lat: number; lng: number; heading?: number | null; speed?: number; timestamp?: number }, lastPoint?: { lat: number; lng: number; timestamp?: number }) {
    if (!lastPoint) {
      this.lastRecordedHeading = newPoint.heading ?? null;
      return { sample: true, reason: 'first_point' };
    }

    const dist = haversineDistanceMeters(lastPoint.lat, lastPoint.lng, newPoint.lat, newPoint.lng);
    const newTime = (newPoint.timestamp || (newPoint as any).time) ? new Date((newPoint as any).time || newPoint.timestamp!).getTime() : Date.now();
    const prevTime = (lastPoint.timestamp || (lastPoint as any).time) ? new Date((lastPoint as any).time || lastPoint.timestamp!).getTime() : (newTime - 1000);
    const dtSec = Math.max(0.001, (newTime - prevTime) / 1000);
    const speed = newPoint.speed || 0;

    // 0. Double-fix guard and anomalous jump suppression
    if (dtSec < 0.45) {
      return { sample: false, reason: 'double_fix_suppression' };
    }
    const instantSpeedKmh = (dist / dtSec) * 3.6;
    if (instantSpeedKmh > MAX_VALID_CYCLING_SPEED_KMH) {
      return { sample: false, reason: 'anomalous_speed' };
    }

    if (speed < MIN_MOVING_SPEED_KMH && dist < this.minDist) {
      return { sample: false, reason: 'stationary_idle' };
    }

    if (this.lastRecordedHeading !== null && newPoint.heading !== undefined && newPoint.heading !== null && dist >= 2.0) {
      const headingDiff = Math.abs(angleDiff(this.lastRecordedHeading, newPoint.heading));
      if (headingDiff >= this.turnAngleDeg) {
        this.lastRecordedHeading = newPoint.heading;
        return { sample: true, reason: 'turn_corner' };
      }
    }

    if (dist >= this.minDist) {
      if (newPoint.heading !== undefined && newPoint.heading !== null) {
        this.lastRecordedHeading = newPoint.heading;
      }
      return { sample: true, reason: 'distance_threshold' };
    }

    if (dtSec >= this.maxIntervalSec && dist >= 1.5) {
      if (newPoint.heading !== undefined && newPoint.heading !== null) {
        this.lastRecordedHeading = newPoint.heading;
      }
      return { sample: true, reason: 'time_interval' };
    }

    return { sample: false, reason: 'sub_threshold' };
  }
}

/**
 * Suavitzat i càlcul de sèries d'elevació
 */
export function filterElevationSeries(points: { ele?: number; [key: string]: any }[], options: { deadband?: number } = {}): { points: any[]; totalAscent: number } {
  if (!Array.isArray(points) || points.length === 0) return { points: [], totalAscent: 0 };
  const deadband = options.deadband ?? ELEVATION_ASCENT_DEADBAND_METERS;

  const smoothedArr: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const prev = points[Math.max(0, i - 1)].ele || 200;
    const cur = points[i].ele || 200;
    const next = points[Math.min(points.length - 1, i + 1)].ele || 200;
    const smoothed = (prev + 2 * cur + next) / 4;
    smoothedArr.push(smoothed);
  }

  const resultPoints: any[] = [];
  let eleBaseline = smoothedArr[0];
  let totalAscent = 0;

  for (let i = 0; i < points.length; i++) {
    const sEle = smoothedArr[i];
    if (sEle > eleBaseline) {
      const diff = sEle - eleBaseline;
      if (diff >= deadband) {
        totalAscent += diff;
        eleBaseline = sEle;
      }
    } else if (sEle < eleBaseline) {
      eleBaseline = sEle;
    }

    resultPoints.push({
      ...points[i],
      altitude: Math.round(sEle * 10) / 10,
      rawEle: points[i].ele,
    });
  }

  return {
    points: resultPoints,
    totalAscent: Math.round(totalAscent),
  };
}

/**
 * Posició a la ruta segons la ràtio de progrés (0..1)
 */
export function getPointAtElevationProgress(points: GpxPoint[], ratio: number) {
  if (!Array.isArray(points) || points.length === 0) return null;
  const clampedRatio = Math.max(0, Math.min(1, Number(ratio) || 0));
  const idx = Math.min(points.length - 1, Math.round(clampedRatio * (points.length - 1)));
  const pt = points[idx];
  return {
    point: pt,
    index: idx,
    progressPercent: Math.round(clampedRatio * 100),
    distKm: pt.distanceFromStartKm !== undefined ? pt.distanceFromStartKm.toFixed(1) : '0.0',
    eleM: Math.round(pt.altitude || 0),
    slope: pt.slopePercent || 0,
  };
}

/**
 * Gestió de bateria i renderitzat adaptatiu
 */
export class BatteryRenderPolicy {
  ecoMode: boolean;
  minMovingSpeedKmh: number;
  stationaryThrottleMs: number;
  normalThrottleMs: number;
  ecoThrottleMs: number;
  minHeadingDeltaDeg: number;

  constructor(options: { ecoMode?: boolean; minMovingSpeedKmh?: number; stationaryThrottleMs?: number; normalThrottleMs?: number; ecoThrottleMs?: number; minHeadingDeltaDeg?: number } = {}) {
    this.ecoMode = options.ecoMode ?? false;
    this.minMovingSpeedKmh = options.minMovingSpeedKmh ?? 2.5;
    this.stationaryThrottleMs = options.stationaryThrottleMs ?? 1500;
    this.normalThrottleMs = options.normalThrottleMs ?? 250;
    this.ecoThrottleMs = options.ecoThrottleMs ?? 2000;
    this.minHeadingDeltaDeg = options.minHeadingDeltaDeg ?? 4.0;
  }

  setEcoMode(enabled: boolean) {
    this.ecoMode = Boolean(enabled);
  }

  shouldUpdateMapPosition(speedKmh: number, lastUpdateTime: number, now: number = Date.now()): boolean {
    const isMoving = Number(speedKmh) >= this.minMovingSpeedKmh;
    const elapsed = now - (lastUpdateTime || 0);

    if (this.ecoMode) return elapsed >= this.ecoThrottleMs;
    if (!isMoving) return elapsed >= this.stationaryThrottleMs;
    return elapsed >= this.normalThrottleMs;
  }

  shouldUpdateHeading(lastHeading: number | null | undefined, newHeading: number, lastUpdateTime: number, now: number = Date.now()): boolean {
    if (lastHeading === null || lastHeading === undefined) return true;
    const elapsed = now - (lastUpdateTime || 0);
    const minInterval = this.ecoMode ? 1000 : 300;
    if (elapsed < minInterval) return false;

    let diff = Math.abs((Number(newHeading) || 0) - (Number(lastHeading) || 0)) % 360;
    if (diff > 180) diff = 360 - diff;

    const threshold = this.ecoMode ? (this.minHeadingDeltaDeg * 2) : this.minHeadingDeltaDeg;
    return diff >= threshold;
  }

  evaluateAutoEco(batteryLevel: number | null | undefined, isCharging: boolean): boolean {
    if (isCharging) return false;
    if (batteryLevel !== null && batteryLevel !== undefined && Number(batteryLevel) <= 0.20) {
      return true;
    }
    return false;
  }
}

/**
 * Calcula la telemetria de navegació
 */
export function calculateNavigationTelemetry(
  userPos: UserPosition,
  trackPoints: GpxPoint[],
  totalDistanceKm: number,
  offTrackThresholdM: number = 40,
  turnsList?: TurnInstruction[]
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

  let nextTurn: TurnInstruction | undefined;
  if (turnsList && turnsList.length > 0) {
    nextTurn = turnsList.find(t => t.index > nearestIdx);
  }

  return {
    isOffTrack: minDistance > offTrackThresholdM,
    distanceToTrackM: Math.round(minDistance),
    nearestPointIndex: nearestIdx,
    remainingDistanceKm: parseFloat(remainingKm.toFixed(1)),
    progressPercent: Math.min(100, Math.round(progress)),
    currentSlopePercent: nearestPoint.slopePercent ?? 0,
    nextTurn,
  };
}

