import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGpxData } from '../src/core/gpxParser.mjs';

const SAMPLE_VALID_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TrailGPS">
  <metadata>
    <name>Ruta Test Collserola</name>
  </metadata>
  <wpt lat="41.4200" lon="2.1150">
    <name>Font Groga</name>
    <desc>Aigua fresca</desc>
  </wpt>
  <trk>
    <name>Ruta Test Collserola</name>
    <trkseg>
      <trkpt lat="41.4180" lon="2.1150"><ele>160</ele></trkpt>
      <trkpt lat="41.4200" lon="2.1180"><ele>200</ele></trkpt>
      <trkpt lat="41.4220" lon="2.1200"><ele>250</ele></trkpt>
      <trkpt lat="41.4240" lon="2.1215"><ele>290</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`;

test('GPX Parser: rejects empty or non-string inputs', () => {
  assert.throws(() => parseGpxData(''), /Fitxer GPX buit/);
  assert.throws(() => parseGpxData(null), /Fitxer GPX buit/);
});

test('GPX Parser: rejects non-GPX xml or parser errors', () => {
  assert.throws(() => parseGpxData('<xml><other>data</other></xml>'), /no és un document GPX vàlid/);
  assert.throws(() => parseGpxData('<parsererror>syntax error</parsererror>'), /no és un document GPX vàlid/);
});

test('GPX Parser: parses valid GPX, calculates distance, ascent, and waypoints', () => {
  const result = parseGpxData(SAMPLE_VALID_GPX);
  assert.equal(result.name, 'Ruta Test Collserola');
  assert.equal(result.points.length, 4);
  assert.equal(result.waypoints.length, 1);
  assert.equal(result.waypoints[0].name, 'Font Groga');
  assert.equal(result.waypoints[0].icon, '💧');
  assert.ok(parseFloat(result.totalDistanceKm) > 0.5, 'Distance should be > 0.5km');
  assert.equal(result.totalAscent, 130); // 200-160 + 250-200 + 290-250 = 40 + 50 + 40 = 130
  assert.equal(result.minEle, 160);
  assert.equal(result.maxEle, 290);
});

test('GPX Parser: clamps long track names and waypoint descriptions', () => {
  const longName = 'A'.repeat(250);
  const longDesc = 'B'.repeat(500);
  const gpxWithLongStrings = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <wpt lat="41.4200" lon="2.1150">
    <name>${longName}</name>
    <desc>${longDesc}</desc>
  </wpt>
  <trk>
    <name>${longName}</name>
    <trkseg>
      <trkpt lat="41.4180" lon="2.1150"><ele>160</ele></trkpt>
      <trkpt lat="41.4200" lon="2.1180"><ele>200</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`;

  const result = parseGpxData(gpxWithLongStrings);
  assert.equal(result.name.length, 100);
  assert.equal(result.waypoints[0].name.length, 100);
  assert.equal(result.waypoints[0].desc.length, 300);
});
