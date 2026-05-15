/* MyBadGuy — browser.js
   Shared browser detection used by Detect and Siteview.

   ARCHITECTURE:
   Detection tokens are sourced from /api/browser-tokens, which is
   populated monthly by the uap-core drift check. When a browser vendor
   changes their UA token (e.g. DuckDuckGo: 'DuckDuckGo/' to 'Ddg/'),
   the API automatically reflects the change — no deploy required.

   FALLBACK:
   If the API is unreachable, detection falls back to hardcoded tokens
   that mirror the last known-good state. Detect never breaks even if
   the API is temporarily down.

   Returns: { id, name, engine, frozen, version }
   - id      — 'safari' | 'chrome' | 'edge' | 'firefox' | 'duckduckgo' | 'opera' | 'samsung' | 'other'
   - name    — display label: 'Safari', 'Chrome', etc.
   - engine  — 'webkit' | 'blink' | 'gecko'
   - frozen  — true on all iOS browsers (Apple WebKit policy)
   - version — browser app version from UA
*/

const BROWSER_API     = 'https://api.mybadguy.com/api/browser-tokens';
const BROWSER_LOG_API = 'https://api.mybadguy.com/api/log-unknown-browser';

// Hardcoded fallback tokens — used when /api/browser-tokens is unreachable.
// Updated manually only when the monthly drift check fires a missing_tokens alert.
const FALLBACK_TOKENS = {
  os_iphone:       ['CPU iPhone OS', 'iPhone OS'],
  os_ipad:         ['CPU iPad OS', 'iPad/'],
  os_mac:          ['Mac OS X'],
  os_windows:      ['Windows NT'],
  os_android:      ['Android'],
  br_chrome_ios:   ['CriOS'],
  br_edge_ios:     ['EdgiOS'],
  br_firefox_ios:  ['FxiOS'],
  br_ddg:          ['Ddg', 'DuckDuckGo'],
  br_safari_ios:   ['Mobile Safari'],
  br_chrome_desk:  ['Chrome/'],
  br_edge_desk:    ['Edg/', 'Edge/'],
  br_firefox_desk: ['Firefox/'],
  br_safari_desk:  ['Version/', 'Safari/'],
  br_opera_touch:  ['OPT/'],
  br_samsung:      ['SamsungBrowser'],
};

// Session-level token cache — one fetch per page load, reused for 30 min
let _tokens = null;
let _tokensFetchedAt = 0;
const TOKEN_CACHE_MS = 30 * 60 * 1000;

async function loadTokens() {
  const now = Date.now();
  if (_tokens && (now - _tokensFetchedAt) < TOKEN_CACHE_MS) return _tokens;
  try {
    const r = await fetch(BROWSER_API, { cf: { cacheTtl: 3600 } });
    if (!r.ok) throw new Error(r.status);
    const data = await r.json();
    _tokens = { ...FALLBACK_TOKENS, ...data.tokens };
    _tokensFetchedAt = now;
  } catch (_) {
    _tokens = FALLBACK_TOKENS;
    _tokensFetchedAt = now;
  }
  return _tokens;
}

function logUnknownBrowser(ua) {
  try {
    fetch(BROWSER_LOG_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ua }),
      keepalive: true
    }).catch(() => {});
  } catch (_) {}
}

function detectFromTokens(ua, tokens) {
  const t = tokens;
  const isIOSPlatform = /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);

  if (isIOSPlatform) {
    let m;
    if (t.br_chrome_ios?.some(tok => ua.includes(tok))) {
      m = ua.match(/CriOS\/([\d.]+)/);
      return { id:'chrome',     name:'Chrome',     engine:'webkit', frozen:true, version:m?.[1]||'' };
    }
    if (t.br_edge_ios?.some(tok => ua.includes(tok))) {
      m = ua.match(/EdgiOS\/([\d.]+)/);
      return { id:'edge',       name:'Edge',       engine:'webkit', frozen:true, version:m?.[1]||'' };
    }
    if (t.br_firefox_ios?.some(tok => ua.includes(tok))) {
      m = ua.match(/FxiOS\/([\d.]+)/);
      return { id:'firefox',    name:'Firefox',    engine:'webkit', frozen:true, version:m?.[1]||'' };
    }
    if (t.br_ddg?.some(tok => ua.includes(tok))) {
      m = ua.match(/(?:Ddg|DuckDuckGo)\/([\d.]+)/);
      return { id:'duckduckgo', name:'DuckDuckGo', engine:'webkit', frozen:true, version:m?.[1]||'' };
    }
    if (t.br_opera_touch?.some(tok => ua.includes(tok))) {
      m = ua.match(/OPT\/([\d.]+)/);
      return { id:'opera',      name:'Opera',      engine:'webkit', frozen:true, version:m?.[1]||'' };
    }
    m = ua.match(/Version\/([\d.]+).*Mobile.*Safari/);
    if (m) return { id:'safari', name:'Safari', engine:'webkit', frozen:true, version:m[1] };
    logUnknownBrowser(ua);
    return { id:'safari', name:'Safari', engine:'webkit', frozen:true, version:'' };
  }

  let m;
  if (t.br_edge_desk?.some(tok => ua.includes(tok))) {
    m = ua.match(/Edg\/([\d.]+)/);
    return { id:'edge',       name:'Edge',           engine:'blink',  frozen:false, version:m?.[1]||'' };
  }
  if (t.br_opera_touch?.some(tok => ua.includes(tok))) {
    m = ua.match(/OPR\/([\d.]+)/);
    return { id:'opera',      name:'Opera',          engine:'blink',  frozen:false, version:m?.[1]||'' };
  }
  if (t.br_samsung?.some(tok => ua.includes(tok))) {
    m = ua.match(/SamsungBrowser\/([\d.]+)/);
    return { id:'samsung',    name:'Samsung Internet',engine:'blink',  frozen:false, version:m?.[1]||'' };
  }
  if (t.br_firefox_desk?.some(tok => ua.includes(tok))) {
    m = ua.match(/Firefox\/([\d.]+)/);
    return { id:'firefox',    name:'Firefox',        engine:'gecko',  frozen:false, version:m?.[1]||'' };
  }
  if (t.br_ddg?.some(tok => ua.includes(tok))) {
    m = ua.match(/(?:Ddg|DuckDuckGo)\/([\d.]+)/);
    return { id:'duckduckgo', name:'DuckDuckGo',     engine:'blink',  frozen:false, version:m?.[1]||'' };
  }
  if (t.br_chrome_desk?.some(tok => ua.includes(tok))) {
    m = ua.match(/Chrome\/([\d.]+)/);
    return { id:'chrome',     name:'Chrome',         engine:'blink',  frozen:false, version:m?.[1]||'' };
  }
  if (t.br_safari_desk?.some(tok => ua.includes(tok))) {
    m = ua.match(/Version\/([\d.]+).*Safari/);
    return { id:'safari',     name:'Safari',         engine:'webkit', frozen:false, version:m?.[1]||'' };
  }

  logUnknownBrowser(ua);
  return { id:'other', name:'Unknown browser', engine:'unknown', frozen:false, version:'' };
}

// Async — fetches API tokens. Use this in page init (can await).
async function detectBrowserAsync() {
  const ua     = navigator.userAgent;
  window.__lastUA = ua;
  const tokens = await loadTokens();
  return detectFromTokens(ua, tokens);
}

// Sync — uses cached tokens or fallback. Safe without await.
function detectBrowser() {
  const ua     = navigator.userAgent;
  window.__lastUA = ua;
  const tokens = _tokens || FALLBACK_TOKENS;
  return detectFromTokens(ua, tokens);
}

window.detectBrowser      = detectBrowser;
window.detectBrowserAsync = detectBrowserAsync;
window.loadBrowserTokens  = loadTokens;
