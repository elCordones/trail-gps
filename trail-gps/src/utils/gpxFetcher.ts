/**
 * TrailGPS GPX Fetcher & URL Validator per a React Native / Expo
 */

export const MAX_GPX_URL_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const FETCH_TIMEOUT_MS = 12000;

export function isValidGpxUrl(urlStr: string | null | undefined): boolean {
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

export function isWikilocUrl(urlStr: string | null | undefined): boolean {
  if (typeof urlStr !== 'string') return false;
  return urlStr.toLowerCase().includes('wikiloc.com');
}

export function extractRouteNameFromUrl(urlStr: string): string {
  if (!isValidGpxUrl(urlStr)) return 'Ruta GPX Descarregada';

  try {
    const parsed = new URL(urlStr.trim());
    const pathSegs = parsed.pathname.split('/').filter(p => p.trim().length > 0);
    if (pathSegs.length === 0) return 'Ruta GPX Descarregada';

    let lastSeg = pathSegs[pathSegs.length - 1];
    lastSeg = decodeURIComponent(lastSeg.replace(/^["']|["']$/g, ''));
    lastSeg = lastSeg.replace(/\.(gpx|xml)$/i, '').replace(/[_-]+/g, ' ').trim();

    return lastSeg.length > 0 ? lastSeg.slice(0, 100) : 'Ruta GPX Descarregada';
  } catch (err) {
    return 'Ruta GPX Descarregada';
  }
}

export function isGpxContent(str: string): boolean {
  if (typeof str !== 'string') return false;
  const t = str.slice(0, 1024).toLowerCase();
  return t.includes('<gpx') || t.includes('<trk') || t.includes('<rte');
}

export async function fetchGpxFromUrl(urlStr: string, options: { timeoutMs?: number; allowProxy?: boolean } = {}): Promise<{ xml: string; name: string; fromProxy: boolean }> {
  if (!isValidGpxUrl(urlStr)) {
    throw new Error("L'enllaç proporcionat no és una URL vàlida (HTTP/HTTPS)");
  }

  const url = urlStr.trim();
  const timeoutMs = options.timeoutMs || FETCH_TIMEOUT_MS;
  const allowProxy = options.allowProxy !== false;

  let xml = '';
  let fromProxy = false;
  const defaultName = extractRouteNameFromUrl(url);

  // 1. Direct Fetch
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    const res = await fetch(url, {
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
    // Direct fetch failed
  }

  // 2. CORS Proxy Fallback
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

        const proxyRes = await fetch(proxyUrl, { signal: ctrl.signal });
        clearTimeout(timer);

        if (proxyRes.ok) {
          const text = await proxyRes.text();
          if (isGpxContent(text)) {
            xml = text;
            fromProxy = true;
            break;
          }
        }
      } catch (proxyErr) {}
    }
  }

  if (!xml) {
    if (isWikilocUrl(url)) {
      throw new Error("Els enllaçs de la web de Wikiloc requereixen sessió d'usuari per descarregar el GPX. A la web o app de Wikiloc, prem 'Descargar > Archivo > GPX' i deprés obre el fitxer amb '📂 Tria Fitxer (.gpx)'.");
    }
    throw new Error("No s'ha pogut descarregar el fitxer GPX. Comprova que l'enllaç apunti directament a un fitxer .gpx o descarrega'l manualment.");
  }

  if (xml.length > MAX_GPX_URL_SIZE_BYTES) {
    throw new Error("El fitxer GPX és massa gran (> 10 MB)");
  }

  return {
    xml,
    name: defaultName,
    fromProxy
  };
}
