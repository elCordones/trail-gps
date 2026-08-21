/**
 * TrailGPS Core Geometry & GPX Engine
 * Pure math and validation functions shared across PWA and native clients
 */

export const EARTH_RADIUS_METERS = 6371000;
export const MAX_GPX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_GPX_TRACK_POINTS = 25000;
export const MAX_GPX_NAME_LENGTH = 100;
export const MAX_GPX_DESC_LENGTH = 300;
export const OFF_TRACK_ENTER_DISTANCE_METERS = 40;
export const OFF_TRACK_EXIT_DISTANCE_METERS = 25;
export const OFF_TRACK_CONFIRMATION_FIXES = 2;

// GPS Quality & Sampling Thresholds
export const MAX_VALID_CYCLING_SPEED_KMH = 100;
export const MAX_VALID_CYCLING_SPEED_MPS = MAX_VALID_CYCLING_SPEED_KMH / 3.6; // ~27.78 m/s
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
 * Calculates Haversine distance in meters between two lat/lng coordinates
 */
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculates initial bearing (azimuth) from p1 to p2 in degrees (0..360)
 */
export function getBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1R = lat1 * Math.PI / 180;
  const lat2R = lat2 * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2R);
  const x = Math.cos(lat1R) * Math.sin(lat2R) - Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

/**
 * Calculates signed angle difference between two bearings (-180..+180)
 * Positive is clockwise / right turn, negative is counter-clockwise / left turn.
 */
export function angleDiff(b1, b2) {
  return ((b2 - b1 + 540) % 360) - 180;
}

/**
 * Calculates perpendicular distance from point P to segment AB in meters
 */
export function distToSegment(px, py, ax, ay, bx, by) {
  const midLat = (ax + bx) / 2;
  const kx = Math.cos(midLat * Math.PI / 180) * 111320;
  const ky = 110540;

  const pX = py * kx, pY = px * ky;
  const aX = ay * kx, aY = ax * ky;
  const bX = by * kx, bY = bx * ky;

  const dx = bX - aX, dy = bY - aY;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(pX - aX, pY - aY);

  const t = Math.max(0, Math.min(1, ((pX - aX) * dx + (pY - aY) * dy) / lenSq));
  return Math.hypot(pX - (aX + t * dx), pY - (aY + t * dy));
}

/**
 * Categorizes POI icons based on name/desc keywords
 */
export function getPoiIcon(name = '', desc = '') {
  const text = (name + ' ' + desc).toLowerCase();
  if (text.includes('font') || text.includes('aigua') || text.includes('water') || text.includes('fuente')) return '💧';
  if (text.includes('cim') || text.includes('pic') || text.includes('peak') || text.includes('summit')) return '⛰️';
  if (text.includes('mirador') || text.includes('foto') || text.includes('view')) return '📸';
  if (text.includes('perill') || text.includes('danger') || text.includes('alerta') || text.includes('atenció')) return '⚠️';
  if (text.includes('cruïlla') || text.includes('desvi') || text.includes('turn') || text.includes('cross')) return '🔀';
  if (text.includes('bar') || text.includes('refugi') || text.includes('menjar') || text.includes('rest')) return '🥪';
  return '📍';
}

/**
 * Detects turns, junctions, and roadbook cues from track points
 */
export function detectTrackTurns(pts, waypointsList = []) {
  const turns = [];
  if (!pts || pts.length < 3) return turns;

  const totalTrackDist = pts[pts.length - 1].distFromStartM || 0;
  const avgSegDist = totalTrackDist / Math.max(1, pts.length - 1);
  const windowMeters = Math.max(20, Math.min(60, avgSegDist * 1.1));

  const rawTurns = [];

  for (let i = 1; i < pts.length - 1; i++) {
    const cur = pts[i];

    let prevIdx = i - 1;
    while (prevIdx > 0 && (cur.distFromStartM - pts[prevIdx].distFromStartM) < windowMeters) {
      prevIdx--;
    }

    let nextIdx = i + 1;
    while (nextIdx < pts.length - 1 && (pts[nextIdx].distFromStartM - cur.distFromStartM) < windowMeters) {
      nextIdx++;
    }

    const bIn = getBearing(pts[prevIdx].lat, pts[prevIdx].lng, cur.lat, cur.lng);
    const bOut = getBearing(cur.lat, cur.lng, pts[nextIdx].lat, pts[nextIdx].lng);
    const diff = angleDiff(bIn, bOut);
    const absDiff = Math.abs(diff);

    if (absDiff >= 26) {
      let type = 'straight';
      let text = 'Recte';
      let badge = 'RECTE';
      let icon = '⬆️';
      let color = '#00E5FF';
      let severity = 'slight';

      if (absDiff >= 145) {
        type = 'u-turn';
        text = 'Canvi de sentit';
        badge = 'GIR EN U';
        icon = '🔄';
        color = '#EF4444';
        severity = 'u-turn';
      } else if (absDiff >= 100) {
        type = diff > 0 ? 'sharp-right' : 'sharp-left';
        text = diff > 0 ? 'Gir molt tancat a la dreta' : 'Gir molt tancat a l\'esquerra';
        badge = diff > 0 ? 'FORQUILLA DRETA' : 'FORQUILLA ESQ.';
        icon = diff > 0 ? '↘️' : '↙️';
        color = '#FF6600';
        severity = 'sharp';
      } else if (absDiff >= 52) {
        type = diff > 0 ? 'right' : 'left';
        text = diff > 0 ? 'Gir a la dreta' : 'Gir a l\'esquerra';
        badge = diff > 0 ? 'GIR DRETA' : 'GIR ESQUERRA';
        icon = diff > 0 ? '➡️' : '⬅️';
        color = '#00E5FF';
        severity = 'normal';
      } else {
        type = diff > 0 ? 'slight-right' : 'slight-left';
        text = diff > 0 ? 'Lleuger a la dreta' : 'Lleuger a l\'esquerra';
        badge = diff > 0 ? 'LLEUGER DRETA' : 'LLEUGER ESQ.';
        icon = diff > 0 ? '↗️' : '↖️';
        color = '#10B981';
        severity = 'slight';
      }

      if (waypointsList && waypointsList.length > 0) {
        for (const wp of waypointsList) {
          const dWp = getDistanceMeters(cur.lat, cur.lng, wp.lat, wp.lng);
          if (dWp < 45) {
            text = `${text} (${wp.name})`;
            break;
          }
        }
      }

      rawTurns.push({
        idx: i,
        lat: cur.lat,
        lng: cur.lng,
        ele: Math.round(cur.ele || 200),
        distFromStartM: cur.distFromStartM,
        angle: diff,
        absAngle: absDiff,
        type,
        badge,
        text,
        icon,
        color,
        severity
      });
    }
  }

  // Cluster nearby turns taking peak deflection
  const clusterDist = Math.max(30, Math.min(80, avgSegDist * 1.2));
  const clusteredTurns = [];
  let cluster = [];

  for (let t of rawTurns) {
    if (cluster.length === 0) {
      cluster.push(t);
    } else {
      const last = cluster[cluster.length - 1];
      if ((t.distFromStartM - last.distFromStartM) < clusterDist) {
        cluster.push(t);
      } else {
        cluster.sort((a, b) => b.absAngle - a.absAngle);
        clusteredTurns.push(cluster[0]);
        cluster = [t];
      }
    }
  }
  if (cluster.length > 0) {
    cluster.sort((a, b) => b.absAngle - a.absAngle);
    clusteredTurns.push(cluster[0]);
  }

  clusteredTurns.forEach((t, index) => {
    t.id = index + 1;
    t.alertedApproach = false;
    t.alertedImmediate = false;
  });

  return clusteredTurns;
}

/**
 * Escapes HTML characters to prevent injection
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

/**
 * Elevation Filter: EMA smoothing + deadband ascent hysteresis accumulator
 */
export class ElevationFilter {
  constructor(options = {}) {
    this.alpha = options.alpha !== undefined ? options.alpha : ELEVATION_EMA_ALPHA;
    this.deadband = options.deadband !== undefined ? options.deadband : ELEVATION_ASCENT_DEADBAND_METERS;
    this.maxVerticalSpeedMps = options.maxVerticalSpeedMps !== undefined ? options.maxVerticalSpeedMps : MAX_VERTICAL_SPEED_MPS;

    this.smoothedEle = null;
    this.eleBaseline = null;
    this.totalAscentM = 0;
    this.lastTimestamp = null;
  }

  reset(initialEle = null) {
    this.smoothedEle = initialEle !== null && !isNaN(initialEle) ? Number(initialEle) : null;
    this.eleBaseline = this.smoothedEle;
    this.totalAscentM = 0;
    this.lastTimestamp = null;
  }

  update(rawEle, timestamp = Date.now()) {
    const ele = Number(rawEle);
    if (isNaN(ele)) {
      return {
        smoothedEle: this.smoothedEle !== null ? this.smoothedEle : 0,
        eleGain: 0,
        totalAscentM: this.totalAscentM
      };
    }

    if (this.smoothedEle === null) {
      this.smoothedEle = ele;
      this.eleBaseline = ele;
      this.lastTimestamp = timestamp;
      return {
        smoothedEle: ele,
        eleGain: 0,
        totalAscentM: 0
      };
    }

    let dtSec = 1;
    if (this.lastTimestamp !== null && timestamp > this.lastTimestamp) {
      dtSec = (timestamp - this.lastTimestamp) / 1000;
    }
    this.lastTimestamp = timestamp;

    // 1. Clamp impossible vertical spikes (e.g. sensor glitch)
    let targetEle = ele;
    const maxDelta = this.maxVerticalSpeedMps * Math.max(1, dtSec);
    if (Math.abs(targetEle - this.smoothedEle) > maxDelta) {
      targetEle = this.smoothedEle + Math.sign(targetEle - this.smoothedEle) * maxDelta;
    }

    // 2. Exponential Moving Average smoothing
    this.smoothedEle = (1 - this.alpha) * this.smoothedEle + this.alpha * targetEle;

    // 3. Deadband ascent accumulation (hysteresis)
    let eleGain = 0;
    if (this.smoothedEle > this.eleBaseline) {
      const delta = this.smoothedEle - this.eleBaseline;
      if (delta >= this.deadband) {
        eleGain = delta;
        this.totalAscentM += eleGain;
        this.eleBaseline = this.smoothedEle;
      }
    } else if (this.smoothedEle < this.eleBaseline) {
      // Lower baseline if descending
      this.eleBaseline = this.smoothedEle;
    }

    return {
      smoothedEle: Math.round(this.smoothedEle * 10) / 10,
      eleGain: Math.round(eleGain * 10) / 10,
      totalAscentM: Math.round(this.totalAscentM * 10) / 10
    };
  }
}

/**
 * GPS Quality Filter: Outlier rejection, speed checks, and stationary drift detection
 */
export class GpsQualityFilter {
  constructor(options = {}) {
    this.maxAccuracy = options.maxAccuracy || GPS_MAX_ACCEPTABLE_ACCURACY_METERS;
    this.maxSpeedKmh = options.maxSpeedKmh || MAX_VALID_CYCLING_SPEED_KMH;
    this.maxSpeedMps = this.maxSpeedKmh / 3.6;
    this.anomalousJumpMeters = options.anomalousJumpMeters || GPS_ANOMALOUS_JUMP_METERS;
  }

  filterFix(newFix, prevFix) {
    if (!newFix || typeof newFix.lat !== 'number' || typeof newFix.lng !== 'number') {
      return { valid: false, reason: 'invalid_coordinates', isOutlier: true };
    }

    // 1. Accuracy threshold check
    const accuracy = typeof newFix.accuracy === 'number' ? newFix.accuracy : 10;
    if (accuracy > this.maxAccuracy) {
      return {
        valid: false,
        reason: 'low_accuracy',
        accuracy,
        isOutlier: true
      };
    }

    // Baseline for initial fix
    if (!prevFix || typeof prevFix.lat !== 'number' || typeof prevFix.lng !== 'number') {
      const reportedSpeed = typeof newFix.speed === 'number' ? newFix.speed : 0;
      return {
        valid: true,
        isOutlier: false,
        isStationary: false,
        distanceMeters: 0,
        calculatedSpeedKmh: reportedSpeed,
        filteredSpeedKmh: Math.min(reportedSpeed, this.maxSpeedKmh),
        reason: 'initial_fix'
      };
    }

    const dist = getDistanceMeters(prevFix.lat, prevFix.lng, newFix.lat, newFix.lng);
    const newTime = newFix.timestamp || Date.now();
    const prevTime = prevFix.timestamp || (newTime - 1000);
    const dtSec = Math.max(0.1, (newTime - prevTime) / 1000);

    // Large time gap: resume tracking without rejecting
    if (dtSec > 60) {
      return {
        valid: true,
        isOutlier: false,
        isStationary: false,
        distanceMeters: dist,
        calculatedSpeedKmh: 0,
        filteredSpeedKmh: Math.min(newFix.speed || 0, this.maxSpeedKmh),
        reason: 'resume_after_gap'
      };
    }

    const calculatedSpeedMps = dist / dtSec;
    const calculatedSpeedKmh = calculatedSpeedMps * 3.6;

    // 2. Anomalous teleportation / GPS jump check
    if (calculatedSpeedMps > this.maxSpeedMps && dist > this.anomalousJumpMeters) {
      return {
        valid: false,
        isOutlier: true,
        isStationary: false,
        distanceMeters: dist,
        calculatedSpeedKmh,
        reason: 'anomalous_speed_jump'
      };
    }

    // 3. Stationary jitter check
    const reportedSpeed = typeof newFix.speed === 'number' ? newFix.speed : calculatedSpeedKmh;
    const isStationary = reportedSpeed < MIN_MOVING_SPEED_KMH && dist < 2.5;

    // 4. Filtered speed calculation (capped at max realistic speed)
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
      reason: isStationary ? 'stationary' : 'valid_moving'
    };
  }
}

/**
 * Breadcrumb Sampler: Smart sampling for recorded GPX tracks
 */
export class BreadcrumbSampler {
  constructor(options = {}) {
    this.minDist = options.minDistanceMeters || MIN_RECORD_DISTANCE_METERS;
    this.maxIntervalSec = options.maxIntervalSeconds || MAX_RECORD_INTERVAL_SECONDS;
    this.turnAngleDeg = options.minTurnDegrees || MIN_RECORD_TURN_DEGREES;
    this.lastRecordedHeading = null;
  }

  shouldSample(newPoint, lastPoint) {
    if (!lastPoint) {
      this.lastRecordedHeading = newPoint.heading !== undefined ? newPoint.heading : null;
      return { sample: true, reason: 'first_point' };
    }

    const dist = getDistanceMeters(lastPoint.lat, lastPoint.lng, newPoint.lat, newPoint.lng);
    const newTime = (newPoint.time || newPoint.timestamp) ? new Date(newPoint.time || newPoint.timestamp).getTime() : Date.now();
    const prevTime = (lastPoint.time || lastPoint.timestamp) ? new Date(lastPoint.time || lastPoint.timestamp).getTime() : (newTime - 1000);
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

    // 1. Stationary filter: don't record jitter if standing still
    if (speed < MIN_MOVING_SPEED_KMH && dist < this.minDist) {
      return { sample: false, reason: 'stationary_idle' };
    }

    // 2. Cornering / turn detection (preserve switchbacks)
    if (this.lastRecordedHeading !== null && newPoint.heading !== undefined && newPoint.heading !== null && dist >= 2.0) {
      const headingDiff = Math.abs(angleDiff(this.lastRecordedHeading, newPoint.heading));
      if (headingDiff >= this.turnAngleDeg) {
        this.lastRecordedHeading = newPoint.heading;
        return { sample: true, reason: 'turn_corner' };
      }
    }

    // 3. Distance threshold
    if (dist >= this.minDist) {
      if (newPoint.heading !== undefined && newPoint.heading !== null) {
        this.lastRecordedHeading = newPoint.heading;
      }
      return { sample: true, reason: 'distance_threshold' };
    }

    // 4. Time interval fallback (if moving)
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
 * Filters an entire series of elevation points (e.g. from an imported GPX track)
 */
export function filterElevationSeries(points, options = {}) {
  if (!Array.isArray(points) || points.length === 0) return { points: [], totalAscent: 0 };
  const deadband = options.deadband !== undefined ? options.deadband : ELEVATION_ASCENT_DEADBAND_METERS;

  // Step 1: Weighted moving average window smoothing (1:2:1)
  const smoothedArr = [];
  for (let i = 0; i < points.length; i++) {
    const prev = points[Math.max(0, i - 1)].ele || 200;
    const cur = points[i].ele || 200;
    const next = points[Math.min(points.length - 1, i + 1)].ele || 200;
    const smoothed = (prev + 2 * cur + next) / 4;
    smoothedArr.push(smoothed);
  }

  // Step 2: Deadband ascent accumulation
  const resultPoints = [];
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
      ele: Math.round(sEle * 10) / 10,
      rawEle: points[i].ele
    });
  }

  return {
    points: resultPoints,
    totalAscent: Math.round(totalAscent)
  };
}

/**
 * Resolves the exact track point and stats at a given progress ratio (0 to 1)
 */
export function getPointAtElevationProgress(points, ratio) {
  if (!Array.isArray(points) || points.length === 0) return null;
  const clampedRatio = Math.max(0, Math.min(1, Number(ratio) || 0));
  const idx = Math.min(points.length - 1, Math.round(clampedRatio * (points.length - 1)));
  const pt = points[idx];
  return {
    point: pt,
    index: idx,
    progressPercent: Math.round(clampedRatio * 100),
    distKm: pt.distFromStartM !== undefined ? (pt.distFromStartM / 1000).toFixed(1) : '0.0',
    eleM: Math.round(pt.ele || 0),
    slope: pt.slope || 0
  };
}

/**
 * Battery & Adaptive Render Policy Evaluator
 */
export class BatteryRenderPolicy {
  constructor(options = {}) {
    this.ecoMode = options.ecoMode || false;
    this.minMovingSpeedKmh = options.minMovingSpeedKmh || 2.5;
    this.stationaryThrottleMs = options.stationaryThrottleMs || 1500;
    this.normalThrottleMs = options.normalThrottleMs || 250;
    this.ecoThrottleMs = options.ecoThrottleMs || 2000;
    this.minHeadingDeltaDeg = options.minHeadingDeltaDeg || 4.0;
  }

  setEcoMode(enabled) {
    this.ecoMode = Boolean(enabled);
  }

  shouldUpdateMapPosition(speedKmh, lastUpdateTime, now = Date.now()) {
    const isMoving = Number(speedKmh) >= this.minMovingSpeedKmh;
    const elapsed = now - (lastUpdateTime || 0);

    if (this.ecoMode) {
      return elapsed >= this.ecoThrottleMs;
    }
    if (!isMoving) {
      return elapsed >= this.stationaryThrottleMs;
    }
    return elapsed >= this.normalThrottleMs;
  }

  shouldUpdateHeading(lastHeading, newHeading, lastUpdateTime, now = Date.now()) {
    if (lastHeading === null || lastHeading === undefined) return true;
    const elapsed = now - (lastUpdateTime || 0);
    const minInterval = this.ecoMode ? 1000 : 300;
    if (elapsed < minInterval) return false;

    let diff = Math.abs((Number(newHeading) || 0) - (Number(lastHeading) || 0)) % 360;
    if (diff > 180) diff = 360 - diff;

    const threshold = this.ecoMode ? (this.minHeadingDeltaDeg * 2) : this.minHeadingDeltaDeg;
    return diff >= threshold;
  }

  evaluateAutoEco(batteryLevel, isCharging) {
    if (isCharging) return false;
    if (batteryLevel !== null && batteryLevel !== undefined && Number(batteryLevel) <= 0.20) {
      return true;
    }
    return false;
  }
}


