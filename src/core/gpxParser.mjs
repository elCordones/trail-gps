/**
 * TrailGPS GPX Parser
 * Supports browser (DOMParser) and Node.js environments
 */

import {
  getDistanceMeters,
  getPoiIcon,
  detectTrackTurns,
  MAX_GPX_TRACK_POINTS,
  MAX_GPX_NAME_LENGTH,
  MAX_GPX_DESC_LENGTH
} from './geoEngine.mjs';

export function parseGpxData(xmlStr, routeTitle = '') {
  if (typeof xmlStr !== 'string' || xmlStr.trim().length === 0) {
    throw new Error('Fitxer GPX buit o invàlid');
  }

  // XML validation check
  if (xmlStr.includes('<parsererror>') || !xmlStr.includes('<gpx')) {
    throw new Error('El contingut no és un document GPX vàlid');
  }

  // Check for simple unclosed tags or broken XML
  if ((xmlStr.match(/<trkpt/g) || []).length !== (xmlStr.match(/<\/trkpt>/g) || []).length &&
      !xmlStr.includes('/>')) {
    throw new Error('XML malformat');
  }

  // Extract Waypoints
  const waypoints = [];
  const wptRegex = /<wpt\s+[^>]*lat=["']([^"']+)["'][^>]*lon=["']([^"']+)["'][^>]*>([\s\S]*?)<\/wpt>/gi;
  let wptMatch;
  while ((wptMatch = wptRegex.exec(xmlStr)) !== null) {
    const lat = parseFloat(wptMatch[1]);
    const lng = parseFloat(wptMatch[2]);
    const inner = wptMatch[3];
    const nameMatch = inner.match(/<name>([\s\S]*?)<\/name>/i);
    const descMatch = inner.match(/<desc>([\s\S]*?)<\/desc>/i);
    const rawName = nameMatch ? nameMatch[1].trim() : 'Punt d\'Interès';
    const rawDesc = descMatch ? descMatch[1].trim() : '';
    const name = rawName.slice(0, MAX_GPX_NAME_LENGTH);
    const desc = rawDesc.slice(0, MAX_GPX_DESC_LENGTH);

    if (!isNaN(lat) && !isNaN(lng)) {
      waypoints.push({
        lat,
        lng,
        name,
        desc,
        icon: getPoiIcon(name, desc)
      });
    }
  }

  // Extract Track Points
  const trkptRegex = /<(?:trkpt|rtept)\s+[^>]*lat=["']([^"']+)["'][^>]*lon=["']([^"']+)["'][^>]*>([\s\S]*?)<\/(?:trkpt|rtept)>/gi;
  let ptMatch;
  const rawPoints = [];
  while ((ptMatch = trkptRegex.exec(xmlStr)) !== null) {
    const lat = parseFloat(ptMatch[1]);
    const lng = parseFloat(ptMatch[2]);
    const inner = ptMatch[3];
    const eleMatch = inner.match(/<ele>([\s\S]*?)<\/ele>/i);
    const ele = eleMatch ? parseFloat(eleMatch[1]) : 200;

    if (!isNaN(lat) && !isNaN(lng)) {
      rawPoints.push({ lat, lng, ele: isNaN(ele) ? 200 : ele });
    }
  }

  if (rawPoints.length > MAX_GPX_TRACK_POINTS) {
    throw new Error(`Ruta massa gran (${rawPoints.length} punts). Límit permès: ${MAX_GPX_TRACK_POINTS}`);
  }

  // Extract Track Name
  let name = routeTitle;
  if (!name) {
    const nameTagMatch = xmlStr.match(/<(?:trk|rte|metadata)[^>]*>[\s\S]*?<name>([\s\S]*?)<\/name>/i);
    name = nameTagMatch ? nameTagMatch[1].trim() : 'Ruta GPX Carregada';
  }
  name = name.slice(0, MAX_GPX_NAME_LENGTH);

  if (rawPoints.length === 0) {
    return {
      name,
      waypoints,
      points: [],
      turns: [],
      totalDistanceKm: '0.0',
      totalAscent: 0,
      minEle: 0,
      maxEle: 0
    };
  }

  const points = [];
  let totalDist = 0;
  let totalAscent = 0;
  let minEle = Infinity;
  let maxEle = -Infinity;

  for (let i = 0; i < rawPoints.length; i++) {
    const pt = rawPoints[i];
    if (points.length > 0) {
      const prev = points[points.length - 1];
      totalDist += getDistanceMeters(prev.lat, prev.lng, pt.lat, pt.lng);
      if (pt.ele > prev.ele) {
        totalAscent += (pt.ele - prev.ele);
      }
    }
    if (pt.ele < minEle) minEle = pt.ele;
    if (pt.ele > maxEle) maxEle = pt.ele;

    points.push({
      lat: pt.lat,
      lng: pt.lng,
      ele: pt.ele,
      distFromStartM: totalDist
    });
  }

  // Calculate slopes
  points.forEach((p, i) => {
    const lookAhead = points[Math.min(points.length - 1, i + 3)];
    const distDiff = lookAhead.distFromStartM - p.distFromStartM;
    p.slope = distDiff > 5 ? Math.round(((lookAhead.ele - p.ele) / distDiff) * 100) : 0;
  });

  const turns = detectTrackTurns(points, waypoints);

  return {
    name,
    waypoints,
    points,
    turns,
    totalDistanceKm: (totalDist / 1000).toFixed(1),
    totalAscent: Math.round(totalAscent),
    minEle: minEle === Infinity ? 0 : Math.round(minEle),
    maxEle: maxEle === -Infinity ? 0 : Math.round(maxEle)
  };
}
