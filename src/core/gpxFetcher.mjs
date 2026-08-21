/**
 * TrailGPS URL GPX Fetcher & Validator
 * Supports direct downloads, CORS proxy fallback, and GPX sanitization
 */

export const MAX_GPX_URL_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const FETCH_TIMEOUT_MS = 12000;

	/**
 * Validates whether a string is a valid HTTP/HTTPS URL
 */
export function isValidGpxUrl(urlStr) {
  if (typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  if (trimmed.length === 0) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

/**
 * Extracts a readable route name from a GPX URL pathname
 */
export function extractRouteNameFromUrl(urlStr) {
  if (!isValidGpxUrl(urlStr)) return 'Ruta GPX Descarregada';

  try {
    const parsed = new URL(urlStr.trim());
    const pathSegs = parsed.pathname.split('/').filter(p => p.trim().length > 0);
    if (pathSegs.length === 0) return 'Ruta GPX Descarregada';

    let lastSeg = pathSegs[pathSegs.length - 1];
    lastSeg = decodeURIKey(unquote(lastSeg));
    lastSeg = lastSeg.replace(/\.(gpx|xml)$/i, '').replace(/[_-]+/g, ' ').trim();

    return lastSeg.length > 0 ? lastSeg.slice(0, 100) : 'Ruta GPX Descarregada';
  } catch (err) {
    return 'Ruta GPX Descarregada';
  }
}

function unquote(str) {
  return str.replace(/^["']|["']$/g, '');
}

function decodeURIKey(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return str;
  }
}

/**
 * Checks whether a URL is from Wikiloc
 */
export function isWikilocUrl(urlStr) {
  if (typeof urlStr !== 'string') return false;
  return urlStr.toLowerCase().includes('wikiloc.com');
}

/**
 * Checks whether a response string looks like a GPX xml document
 */
export function isGpxContent(str) {
  if (typeof str !== 'string') return false;
  const t = str.slice(0, 1024).toLowerCase();
  return t.includes('<gpx') || t.includes('<trk') || t.includes('<rte');
}

/**
 * Fetches GPX content from a URL directly or via CORS proxy if needed
 */
export async function fetchGpxFromUrl(urlStr, options = {}) {
  if (!isValidGpxUrl(urlStr)) {
    throw new Error('L\'enllaç proporcionat no és una URL vàlida (HTTP/HTTPS)');
  }

  const url = urlStr.trim();
  const fetchFn = options.fetch || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchFn) {
    throw new Error('No hi ha suport per a peticions xarxa (Internet) en aquest entorn');
  }

  const timeoutMs = options.timeoutMs || FETCH_TIMEOUT_MS;
  const allowProxy = options.allowProxy !== false;

  let xml = '';
  let fromProxy = false;

  // Save default name
  const defaultName = extractRouteNameFromUrl(url);

  // 1. Attempt Direct Fetch
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    const res = await fetchFn(url, {
      signal: ctrl.signal,
      headers: {
        'Accept': 'application/gpx+xml, application/xml, text/xml, */*'
      }
    });
    clearTimeout(timer);

    if (res.ok) {
      const text = await res.text();
      if (isGpxContent(text)) {
        xml = text;
      }
    }
  } catch (directErr) {
    // Direct fetch failed (e.g. CORS restriction or network error)
  }

  // 2. Attempt CORS Proxy Fallback if Direct Fetch Did Not Succeed
  if (!xml && allowProxy) {
    const proxyList = [
      'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
      'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url)
    ];

    for (const proxyUrl of proxyList) {
      if (xml) break;
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), timeoutMs);

        const proxyRes = await fetchFn(proxyUrl, {
          signal: ctrl.signal
        });
        clearTimeout(timer);

        if (proxyRes.ok) {
          const text = await proxyRes.text();
          if (isGpxContent(text)) {
            xml = text;
            fromProxy = true;
            break;
          }
        }
      } catch (proxyErr) {
        // Continue to next proxy
      }
    }
  }

  if (!xml) {
    if (isWikilocUrl(url)) {
      throw new Error('Els enllaços de la web de Wikiloc requereixen sessió d\'usuari per descarregar el GPX. A la web o app de Wikiloc, prem "Descargar > Archivo > GPX" i després obre el fitxer amb "📂 Tria Fitxer (.gpx)".');
    }
    throw new Error('No s\'ha pogut descarregar el fitxer GPX. Comprova que l\'enllaç apunti directament a un fitxer .gpx o descarrega\'l manualment.');
  }

  if (xml.length > MAX_GPX_URL_SIZE_BYTES) {
    throw new Error('El fitxer GPX és massa gran (> 10 MB)');
  }

  return {
    xml,
    name: defaultName,
    fromProxy
  };
}