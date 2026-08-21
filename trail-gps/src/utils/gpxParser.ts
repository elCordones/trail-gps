import { XMLParser } from 'fast-xml-parser';
import { GpxPoint, GpxTrack, GpxBounds } from '../types';
import { haversineDistanceMeters } from './geoMath';

export function parseGpxString(xmlContent: string): GpxTrack {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
  });

  const parsed = parser.parse(xmlContent);
  const gpx = parsed.gpx || parsed;

  let rawPoints: any[] = [];
  let trackName = 'Ruta BTT';

  // Cercar nom del track
  if (gpx.trk) {
    const trk = Array.isArray(gpx.trk) ? gpx.trk[0] : gpx.trk;
    if (trk.name) trackName = String(trk.name);
    
    if (trk.trkseg) {
      const segs = Array.isArray(trk.trkseg) ? trk.trkseg : [trk.trkseg];
      for (const seg of segs) {
        if (seg.trkpt) {
          const pts = Array.isArray(seg.trkpt) ? seg.trkpt : [seg.trkpt];
          rawPoints.push(...pts);
        }
      }
    }
  } else if (gpx.rte && gpx.rte.rtept) {
    if (gpx.rte.name) trackName = String(gpx.rte.name);
    const pts = Array.isArray(gpx.rte.rtept) ? gpx.rte.rtept : [gpx.rte.rtept];
    rawPoints.push(...pts);
  } else if (gpx.wpt) {
    const pts = Array.isArray(gpx.wpt) ? gpx.wpt : [gpx.wpt];
    rawPoints.push(...pts);
  }

  if (rawPoints.length === 0) {
    throw new Error('No s\'han trobat punts de traçat (<trkpt>) al fitxer GPX.');
  }

  let totalDistMeters = 0;
  let eleGain = 0;
  let eleLoss = 0;
  let eleGainBaseline: number | undefined;
  let eleLossBaseline: number | undefined;
  let minEle = Infinity;
  let maxEle = -Infinity;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  const points: GpxPoint[] = [];

  for (let i = 0; i < rawPoints.length; i++) {
    const p = rawPoints[i];
    const lat = Number(p['@_lat'] ?? p.lat);
    const lng = Number(p['@_lon'] ?? p['@_lng'] ?? p.lon ?? p.lng);
    const ele = p.ele !== undefined ? Number(p.ele) : undefined;

    if (isNaN(lat) || isNaN(lng)) continue;

    // Bounds
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;

    // Distància acumulada
    if (points.length > 0) {
      const prev = points[points.length - 1];
      const dist = haversineDistanceMeters(prev.latitude, prev.longitude, lat, lng);
      totalDistMeters += dist;

      // Desnivell acumulat amb llindar de deadband per filtrar soroll GPS
      if (ele !== undefined && prev.altitude !== undefined) {
        if (eleGainBaseline === undefined) eleGainBaseline = prev.altitude;
        if (eleLossBaseline === undefined) eleLossBaseline = prev.altitude;

        if (ele > eleGainBaseline) {
          const delta = ele - eleGainBaseline;
          if (delta >= 1.5) {
            eleGain += delta;
            eleGainBaseline = ele;
          }
        } else if (ele < eleGainBaseline) {
          eleGainBaseline = ele;
        }

        if (ele < eleLossBaseline) {
          const delta = eleLossBaseline - ele;
          if (delta >= 1.5) {
            eleLoss += delta;
            eleLossBaseline = ele;
          }
        } else if (ele > eleLossBaseline) {
          eleLossBaseline = ele;
        }
      }
    } else if (ele !== undefined) {
      eleGainBaseline = ele;
      eleLossBaseline = ele;
    }

    if (ele !== undefined) {
      if (ele < minEle) minEle = ele;
      if (ele > maxEle) maxEle = ele;
    }

    points.push({
      latitude: lat,
      longitude: lng,
      altitude: ele !== undefined && !isNaN(ele) ? Math.round(ele) : undefined,
      distanceFromStartKm: parseFloat((totalDistMeters / 1000).toFixed(2)),
    });
  }

  // Càlcul del pendent % suavitzat
  for (let i = 0; i < points.length; i++) {
    const lookAheadIdx = Math.min(points.length - 1, i + 5);
    const p1 = points[i];
    const p2 = points[lookAheadIdx];

    if (p1.altitude !== undefined && p2.altitude !== undefined && p1.distanceFromStartKm !== undefined && p2.distanceFromStartKm !== undefined) {
      const distDiffM = (p2.distanceFromStartKm - p1.distanceFromStartKm) * 1000;
      if (distDiffM > 10) {
        const eleDiff = p2.altitude - p1.altitude;
        p1.slopePercent = Math.round((eleDiff / distDiffM) * 100);
      } else {
        p1.slopePercent = 0;
      }
    } else {
      p1.slopePercent = 0;
    }
  }

  const bounds: GpxBounds = {
    minLat: minLat === Infinity ? 0 : minLat,
    maxLat: maxLat === -Infinity ? 0 : maxLat,
    minLng: minLng === Infinity ? 0 : minLng,
    maxLng: maxLng === -Infinity ? 0 : maxLng,
  };

  return {
    name: trackName,
    points,
    totalDistanceKm: parseFloat((totalDistMeters / 1000).toFixed(1)),
    elevationGainM: Math.round(eleGain),
    elevationLossM: Math.round(eleLoss),
    minElevation: minEle === Infinity ? 0 : minEle,
    maxElevation: maxEle === -Infinity ? 0 : maxEle,
    bounds,
  };
}
