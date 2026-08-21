import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDistanceMeters,
  getBearing,
  angleDiff,
  distToSegment,
  getPoiIcon,
  detectTrackTurns,
  escapeHtml,
  ElevationFilter,
  GpsQualityFilter,
  BreadcrumbSampler,
  filterElevationSeries,
  getPointAtElevationProgress,
  BatteryRenderPolicy
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

test('Turn Detection: integrates nearby custom waypoints into navigation cues', () => {
  const pts = [
    { lat: 41.4000, lng: 2.1000, ele: 100, distFromStartM: 0 },
    { lat: 41.4005, lng: 2.1000, ele: 105, distFromStartM: 55 },
    { lat: 41.4010, lng: 2.1000, ele: 110, distFromStartM: 110 },
    { lat: 41.4010, lng: 2.1005, ele: 115, distFromStartM: 165 },
    { lat: 41.4010, lng: 2.1010, ele: 120, distFromStartM: 220 }
  ];

  const waypoints = [
    { lat: 41.4010, lng: 2.1000, name: 'Font de l\'Oreneta', desc: 'Aigua fresca', icon: '💧' }
  ];

  const turns = detectTrackTurns(pts, waypoints);
  assert.ok(turns.length >= 1, 'Should detect turn near waypoint');
  assert.ok(
    turns[0].text.includes('Font de l\'Oreneta'),
    'Turn text should reference the waypoint landmark'
  );
});

test('Sanitization: escapeHtml escapes hazardous characters', () => {
  const dirty = '<script>alert("xss")</script> & \'test\'';
  const clean = escapeHtml(dirty);
  assert.equal(clean, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;test&#39;');
});

test('Elevation Filter: ignores stationary altitude jitter and noise', () => {
  const filter = new ElevationFilter({ alpha: 0.25, deadband: 2.0 });
  const baseTime = 1000000;
  
  // Jitter fluctuating within 200 +/- 0.8 meters
  const jitterReadings = [200.0, 200.7, 199.4, 200.8, 199.3, 200.5, 199.8];
  let lastAscent = 0;
  
  jitterReadings.forEach((ele, idx) => {
    const res = filter.update(ele, baseTime + idx * 1000);
    lastAscent = res.totalAscentM;
  });

  assert.equal(lastAscent, 0, 'Stationary elevation jitter must produce 0m ascent');
});

test('Elevation Filter: accurately accumulates real climbing and adjusts baseline on descent', () => {
  const filter = new ElevationFilter({ alpha: 0.35, deadband: 2.0 });
  let time = 1000000;

  // Climb from 100 to 150 in realistic 0.5m/s increments
  for (let h = 100; h <= 150; h += 0.5) {
    time += 1000;
    filter.update(h, time);
  }
  for (let i = 0; i < 5; i++) {
    time += 1000;
    filter.update(150, time);
  }
  const climbAscent = filter.totalAscentM;
  assert.ok(climbAscent >= 45 && climbAscent <= 50, `Expected ~45-50m climb, got ${climbAscent}m`);

  // Descent from 150 to 110 (ascent should not increase)
  for (let h = 150; h >= 110; h -= 0.5) {
    time += 1000;
    filter.update(h, time);
  }
  for (let i = 0; i < 5; i++) {
    time += 1000;
    filter.update(110, time);
  }
  assert.equal(filter.totalAscentM, climbAscent, 'Descent must not add to ascent');

  // Second climb from 110 to 130
  for (let h = 110; h <= 130; h += 0.5) {
    time += 1000;
    filter.update(h, time);
  }
  for (let i = 0; i < 5; i++) {
    time += 1000;
    filter.update(130, time);
  }
  assert.ok(filter.totalAscentM >= climbAscent + 17, 'Second climb must be accumulated from new valley baseline');
});

test('Elevation Filter: clamps unrealistic vertical sensor spikes', () => {
  const filter = new ElevationFilter({ alpha: 0.25, maxVerticalSpeedMps: 1.5 });
  const time = 1000000;
  
  filter.update(100, time);
  // Sensor glitch jump of +300m in 1 second
  const res = filter.update(400, time + 1000);
  assert.ok(res.smoothedEle < 105, `Spike should be clamped, got ${res.smoothedEle}`);
});

test('GPS Quality Filter: rejects fixes with low accuracy', () => {
  const filter = new GpsQualityFilter({ maxAccuracy: 50 });
  const badFix = { lat: 41.40, lng: 2.10, accuracy: 75, timestamp: 1000000 };
  const res = filter.filterFix(badFix, null);
  
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'low_accuracy');
});

test('GPS Quality Filter: accepts normal movement and detects stationary drift', () => {
  const filter = new GpsQualityFilter();
  const fix1 = { lat: 41.4000, lng: 2.1000, accuracy: 5, speed: 20, timestamp: 1000000 };
  const fix2 = { lat: 41.4001, lng: 2.1000, accuracy: 5, speed: 20, timestamp: 1002000 }; // ~11m in 2s (~20 km/h)
  
  const res1 = filter.filterFix(fix1, null);
  assert.equal(res1.valid, true);

  const res2 = filter.filterFix(fix2, fix1);
  assert.equal(res2.valid, true);
  assert.equal(res2.isStationary, false);
  assert.ok(res2.distanceMeters > 9 && res2.distanceMeters < 13);

  // Stationary drift (speed 0.5 km/h, moved 0.5m)
  const fixStationary = { lat: 41.400101, lng: 2.100001, accuracy: 5, speed: 0.5, timestamp: 1003000 };
  const resStat = filter.filterFix(fixStationary, fix2);
  assert.equal(resStat.valid, true);
  assert.equal(resStat.isStationary, true);
});

test('GPS Quality Filter: detects and rejects anomalous teleportation jumps', () => {
  const filter = new GpsQualityFilter({ anomalousJumpMeters: 150 });
  const fix1 = { lat: 41.4000, lng: 2.1000, accuracy: 5, speed: 15, timestamp: 1000000 };
  // Glitch jump 500m away in 1 second
  const fixGlitch = { lat: 41.4045, lng: 2.1000, accuracy: 5, speed: 15, timestamp: 1001000 };
  
  const res = filter.filterFix(fixGlitch, fix1);
  assert.equal(res.valid, false);
  assert.equal(res.isOutlier, true);
  assert.equal(res.reason, 'anomalous_speed_jump');
});

test('Breadcrumb Sampler: samples on distance, turns, and time but suppresses stationary noise', () => {
  const sampler = new BreadcrumbSampler({ minDistanceMeters: 4.0, maxIntervalSeconds: 6, minTurnDegrees: 18 });
  
  const pt0 = { lat: 41.4000, lng: 2.1000, speed: 15, heading: 0, time: '2026-08-21T10:00:00Z' };
  const res0 = sampler.shouldSample(pt0, null);
  assert.equal(res0.sample, true);

  // Stationary / sub-threshold movement (moved 1m in 1s, speed 0.5 km/h)
  const ptJitter = { lat: 41.400009, lng: 2.1000, speed: 0.5, heading: 0, time: '2026-08-21T10:00:01Z' };
  const resJitter = sampler.shouldSample(ptJitter, pt0);
  assert.equal(resJitter.sample, false);

  // Sufficient distance moved (> 4m)
  const ptDist = { lat: 41.40005, lng: 2.1000, speed: 18, heading: 0, time: '2026-08-21T10:00:02Z' }; // ~5.5m
  const resDist = sampler.shouldSample(ptDist, pt0);
  assert.equal(resDist.sample, true);

  // Sharp turn cornering (~90 deg turn with 2.5m displacement)
  const ptTurn = { lat: 41.40007, lng: 2.10002, speed: 12, heading: 90, time: '2026-08-21T10:00:03Z' };
  const resTurn = sampler.shouldSample(ptTurn, ptDist);
  assert.equal(resTurn.sample, true);
  assert.equal(resTurn.reason, 'turn_corner');

  // Double-fix glitch suppression (< 0.45s interval e.g. 30ms rapid event)
  const ptDoubleFix = { lat: 41.40015, lng: 2.10005, speed: 15, heading: 90, time: '2026-08-21T10:00:03.030Z' };
  const resDoubleFix = sampler.shouldSample(ptDoubleFix, ptTurn);
  assert.equal(resDoubleFix.sample, false);
  assert.equal(resDoubleFix.reason, 'double_fix_suppression');

  // Anomalous speed rejection (> 100 km/h)
  const ptTeleport = { lat: 41.40500, lng: 2.10500, speed: 25, heading: 90, time: '2026-08-21T10:00:05Z' }; // 700m in 2s = 1260 km/h
  const resTeleport = sampler.shouldSample(ptTeleport, ptTurn);
  assert.equal(resTeleport.sample, false);
  assert.equal(resTeleport.reason, 'anomalous_speed');
});

test('filterElevationSeries: removes high frequency noise and calculates clean ascent', () => {
  const noisyPoints = [
    { lat: 41.40, lng: 2.10, ele: 100 },
    { lat: 41.40, lng: 2.10, ele: 100.8 },
    { lat: 41.40, lng: 2.10, ele: 99.4 },
    { lat: 41.40, lng: 2.10, ele: 100.6 },
    { lat: 41.40, lng: 2.10, ele: 99.7 },
    { lat: 41.40, lng: 2.10, ele: 110.0 }, // +10m climb
    { lat: 41.40, lng: 2.10, ele: 120.0 }  // +10m climb
  ];

  const res = filterElevationSeries(noisyPoints, { deadband: 2.0 });
  assert.ok(res.totalAscent >= 15 && res.totalAscent <= 21, `Expected ~18-20m ascent, got ${res.totalAscent}m`);
  assert.equal(res.points.length, noisyPoints.length);
});

test('Elevation Scrubbing: getPointAtElevationProgress resolves exact point, km, and stats', () => {
  const points = [
    { lat: 41.40, lng: 2.10, ele: 100, distFromStartM: 0, slope: 0 },
    { lat: 41.41, lng: 2.11, ele: 200, distFromStartM: 2500, slope: 4 },
    { lat: 41.42, lng: 2.12, ele: 450, distFromStartM: 5000, slope: 10 }
  ];

  // Start (0%)
  const start = getPointAtElevationProgress(points, 0.0);
  assert.equal(start.index, 0);
  assert.equal(start.distKm, '0.0');
  assert.equal(start.eleM, 100);
  assert.equal(start.slope, 0);

  // Mid (50%)
  const mid = getPointAtElevationProgress(points, 0.5);
  assert.equal(mid.index, 1);
  assert.equal(mid.distKm, '2.5');
  assert.equal(mid.eleM, 200);
  assert.equal(mid.slope, 4);

  // End (100%)
  const end = getPointAtElevationProgress(points, 1.0);
  assert.equal(end.index, 2);
  assert.equal(end.distKm, '5.0');
  assert.equal(end.eleM, 450);
  assert.equal(end.slope, 10);
});

test('Battery & Render Policy: throttles map updates and heading when stationary or in eco mode', () => {
  const policy = new BatteryRenderPolicy({
    minMovingSpeedKmh: 2.5,
    normalThrottleMs: 250,
    stationaryThrottleMs: 1500,
    ecoThrottleMs: 2000
  });

  const now = 100000;

  // 1. Moving normal mode (15 km/h)
  assert.equal(policy.shouldUpdateMapPosition(15.0, now - 100, now), false, 'Should throttle fast updates < 250ms');
  assert.equal(policy.shouldUpdateMapPosition(15.0, now - 300, now), true, 'Should allow update after 300ms');

  // 2. Stationary normal mode (0.5 km/h)
  assert.equal(policy.shouldUpdateMapPosition(0.5, now - 500, now), false, 'Should throttle stationary updates < 1500ms');
  assert.equal(policy.shouldUpdateMapPosition(0.5, now - 1600, now), true, 'Should allow stationary update after 1600ms');

  // 3. Eco mode active
  policy.setEcoMode(true);
  assert.equal(policy.shouldUpdateMapPosition(20.0, now - 1000, now), false, 'Should throttle eco updates < 2000ms');
  assert.equal(policy.shouldUpdateMapPosition(20.0, now - 2100, now), true, 'Should allow eco update after 2100ms');

  // 4. Heading throttle & delta filtering
  policy.setEcoMode(false);
  assert.equal(policy.shouldUpdateHeading(100, 102, now - 500, now), false, 'Should suppress small heading jitter (<4 deg)');
  assert.equal(policy.shouldUpdateHeading(100, 115, now - 500, now), true, 'Should accept clear heading change (15 deg)');

  // 5. Auto Eco evaluation
  assert.equal(policy.evaluateAutoEco(0.15, false), true, 'Should trigger auto eco under 20% when not charging');
  assert.equal(policy.evaluateAutoEco(0.15, true), false, 'Should not trigger auto eco when charging');
  assert.equal(policy.evaluateAutoEco(0.85, false), false, 'Should not trigger auto eco on high battery');
});

