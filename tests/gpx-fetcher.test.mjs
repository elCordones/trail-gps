import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidGpxUrl,
  extractRouteNameFromUrl,
  isGpxContent,
  fetchGpxFromUrl,
  isWikilocUrl,
  MAX_GPX_URL_SIZE_BYTES
} from '../src/core/gpxFetcher.mjs';

test('GPX Fetcher: isValidGpxUrl validates HTTP and HTTPS schemes', () => {
  assert.equal(isValidGpxUrl('https://example.com/track.gpx'), true);
  assert.equal(isValidGpxUrl('http://public.org/ruta.gpx'), true);
  assert.equal(isValidGpxUrl('ftp://example.com'), false);
  assert.equal(isValidGpxUrl('javascript:alert(1)'), false);
  assert.equal(isValidGpxUrl('data:text/plain;base64,XXX'), false);
  assert.equal(isValidGpxUrl('file:///C:/ruta.gpx'), false);
  assert.equal(isValidGpxUrl(''), false);
  assert.equal(isValidGpxUrl(null), false);
});

test('GPX Fetcher: extractRouteNameFromUrl cleans slugs and decodes URI', () => {
  assert.equal(
    extractRouteNameFromUrl('https://example.com/tracks/collserola-btt-curta.gpx'),
    'collserola btt curta'
  );
  assert.equal(
    extractRouteNameFromUrl('https://example.com/Ruta%20dels%20Tres%20Palaus.gpx'),
    'Ruta dels Tres Palaus'
  );
  assert.equal(extractRouteNameFromUrl('https://example.com/'), 'Ruta GPX Descarregada');
});

test('GPX Fetcher: isGpxContent detects GPX xml vs HTML', () => {
  assert.equal(isGpxContent('<?xml version="1.0"?><gpx></trk></gpx>'), true);
  assert.equal(isGpxContent('<trk><trkseg></trkseg></trk>'), true);
  assert.equal(isGpxContent('<!DOCTYPE html><html><head></head><body>404 Not Found</body></html>'), false);
  assert.equal(isGpxContent('{"error": "Not found"}'), false);
  assert.equal(isGpxContent(''), false);
});

test('GPX Fetcher: fetchGpxFromUrl succeeds on direct fetch', async () => {
  const sampleGpx = '<gpx><trk><name>Direct Track</name></trk></gpx>';
  const mockFetch = async (url) => {
    return {
      ok: true,
      text: async () => sampleGpx
    };
  };

  const res = await fetchGpxFromUrl('https://mytrails.org/gpx/sample-track.gpx', {
    fetch: mockFetch
  });

  assert.equal(res.xml, sampleGpx);
  assert.equal(res.name, 'sample track');
  assert.equal(res.fromProxy, false);
});

test('GPX Fetcher: fetchGpxFromUrl falls back to CORS proxy when direct fetch fails', async () => {
  const sampleGpx = '<gpx><trk><name>Proxy Track</name></trk></gpx>';
  const mockFetch = async (url) => {
    if (url.includes('api.allorigins.win')) {
      return {
        ok: true,
        text: async () => sampleGpx
      };
    }
    throw new Error('Failed to fetch (CORS)');
  };

  const res = await fetchGpxFromUrl('https://wikiloc.com/track/route-btt.gpx', {
    fetch: mockFetch
  });

  assert.equal(res.xml, sampleGpx);
  assert.equal(res.name, 'route btt');
  assert.equal(res.fromProxy, true);
});

test('GPX Fetcher: isWikilocUrl identifies Wikiloc web links', () => {
  assert.equal(isWikilocUrl('https://es.wikiloc.com/rutas-mountain-bike/riudellots-22804843'), true);
  assert.equal(isWikilocUrl('https://wikiloc.com/track.gpx'), true);
  assert.equal(isWikilocUrl('https://strava.com/routes/123'), false);
  assert.equal(isWikilocUrl(''), false);
});

test('GPX Fetcher: fetchGpxFromUrl throws informative error on protected Wikiloc web pages', async () => {
  const mockFetch = async () => ({
    ok: false,
    text: async () => '<html>login required</html>'
  });

  await assert.rejects(
    async () => await fetchGpxFromUrl('https://es.wikiloc.com/rutas-mountain-bike/riudellots-22804843', {
      fetch: mockFetch
    }),
    /Els enllaços de la web de Wikiloc requereixen sessió d'usuari/
  );
});

test('GPX Fetcher: fetchGpxFromUrl throws on invalid URL protocol', async () => {
  await assert.rejects(
    async () => await fetchGpxFromUrl('javascript:alert(1)'),
    /L'enllaç proporcionat no és una URL/
  );
});