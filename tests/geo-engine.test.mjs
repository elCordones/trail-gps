import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDistanceMeters,
  getBearing,
  angleDiff,
  distToSegment,
  getPoiIcon,
  detectTrackTurns,
  escapeHtml
} from '../src/core/geoEngine.mjs';

test('Geometry: getDistanceMeters returns 0 for identical points', () => {
  const d = getDistanceMeters(41.42, 2.12, 41.42, 2.12);
  assert.equal(d, 0);
});

test('Geometry: getDistanceMeters computes accurate Haversine distance', () => {
  // Distance from Plaça Catalunya (41.3870, 2.1700) to Tibidabo (41.4225, 2.1186) ~5.7km
  const d = getDistanceMeters(41.3870, 2.1700, 41.4225, 2.1186);
  assert.ok(d > 5500 && d < 6000, `Expected ~5.7km, got ${d}m`);
});

test('Geometry: getBearing calculates correct cardinal and ordinal bearings', () => {
  const north = getBearing(41.0, 2.0, 42.0, 2.0);
  assert.ok(Math.abs(north - 0) < 1e-4 || Math.abs(north - 360) < 1e-4, `Expected North (0/360), got ${north}`);

  const east = getBearing(41.0, 2.0, 41.0, 3.0);
  assert.ok(Math.abs(east - 90) < 1, `Expected East (90), got ${east}`);

  const south = getBearing(42.0, 2.0, 41.0, 2.0);
  assert.ok(Math.abs(south - 180) < 1, `Expected South (180), got ${south}`);

  const west = getBearing(41.0, 3.0, 41.0, 2.0);
  assert.ok(Math.abs(west - 270) < 1, `Expected West (270), got ${west}`);
});

test('Geometry: angleDiff correctly handles transitions across 0/360 degrees', () => {
  assert.equal(angleDiff(0, 90), 90);
  assert.equal(angleDiff(90, 0), -90);
  assert.equal(angleDiff(350, 10), 20);
  assert.equal(angleDiff(10, 350), -20);
  assert.equal(angleDiff(180, 180), 0);
});

test('Geometry: distToSegment calculates perpendicular distance and endpoint clamping', () => {
  // Segment along latitude line from (41.0, 2.0) to (41.0, 2.01)
  const aLat = 41.0, aLon = 2.0;
  const bLat = 41.0, bLon = 2.01;

  // Point exactly on the midpoint of segment
  const onSegDist = distToSegment(41.0, 2.005, aLat, aLon, bLat, bLon);
  assert.ok(onSegDist < 0.1, `Point on segment should be ~0m, got ${onSegDist}`);

  // Point offset by approx 0.001 deg lat (approx 111m north)
  const offsetDist = distToSegment(41.001, 2.005, aLat, aLon, bLat, bLon);
  assert.ok(offsetDist > 105 && offsetDist < 120, `Expected ~111m, got ${offsetDist}`);
});

test('POI: getPoiIcon matches keywords correctly', () => {
  assert.equal(getPoiIcon('Font de la Budellera'), '💧');
  assert.equal(getPoiIcon('Cim del Tibidabo'), '⛰️');
  assert.equal(getPoiIcon('Mirador dels bombers'), '📸');
  assert.equal(getPoiIcon('Perill pedra solta'), '⚠️');
  assert.equal(getPoiIcon('Cruïlla de corriols'), '🔀');
  assert.equal(getPoiIcon('Refugi o Bar restaurant'), '🥪');
  assert.equal(getPoiIcon('Altre punt qualsevol'), '📍');
});

test('Turn Detection: detectTrackTurns identifies normal, sharp, and U-turns', () => {
  // 1. Normal 90 deg right turn
  const ptsRight = [
    { lat: 41.4000, lng: 2.1000, ele: 100, distFromStartM: 0 },
    { lat: 41.4005, lng: 2.1000, ele: 105, distFromStartM: 55 },
    { lat: 41.4010, lng: 2.1000, ele: 110, distFromStartM: 110 },
    { lat: 41.4010, lng: 2.1005, ele: 115, distFromStartM: 155 },
    { lat: 41.4010, lng: 2.1010, ele: 120, distFromStartM: 200 }
  ];
  const turnsRight = detectTrackTurns(ptsRight, []);
  assert.ok(turnsRight.length >= 1, 'Should detect right turn');
  assert.equal(turnsRight[0].badge, 'GIR DRETA');

  // 2. Sharp hairpin turn (~120 deg right)
  const ptsSharp = [
    { lat: 41.4000, lng: 2.1000, ele: 100, distFromStartM: 0 },
    { lat: 41.4005, lng: 2.1000, ele: 105, distFromStartM: 55 },
    { lat: 41.4010, lng: 2.1000, ele: 110, distFromStartM: 110 },
    { lat: 41.4007, lng: 2.1005, ele: 115, distFromStartM: 165 },
    { lat: 41.4004, lng: 2.1010, ele: 120, distFromStartM: 220 }
  ];
  const turnsSharp = detectTrackTurns(ptsSharp, []);
  assert.ok(turnsSharp.length >= 1, 'Should detect sharp hairpin turn');
  assert.equal(turnsSharp[0].badge, 'FORQUILLA DRETA');

  // 3. U-turn (>145 deg)
  const ptsUTurn = [
    { lat: 41.4000, lng: 2.1000, ele: 100, distFromStartM: 0 },
    { lat: 41.4005, lng: 2.1000, ele: 105, distFromStartM: 55 },
    { lat: 41.4010, lng: 2.1000, ele: 110, distFromStartM: 110 },
    { lat: 41.4005, lng: 2.1001, ele: 115, distFromStartM: 165 },
    { lat: 41.4000, lng: 2.1002, ele: 120, distFromStartM: 220 }
  ];
  const turnsUTurn = detectTrackTurns(ptsUTurn, []);
  assert.ok(turnsUTurn.length >= 1, 'Should detect U-turn');
  assert.equal(turnsUTurn[0].badge, 'GIR EN U');
});

test('Sanitization: escapeHtml escapes hazardous characters', () => {
  const dirty = '<script>alert("xss")</script> & \'test\'';
  const clean = escapeHtml(dirty);
  assert.equal(clean, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;test&#39;');
});
