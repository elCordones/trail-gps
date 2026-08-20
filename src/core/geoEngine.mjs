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
