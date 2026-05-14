/* MyBadGuy — browser.js
   Shared browser detection used by Detect and Siteview.
   Returns: { id, name, engine, frozen, version }

   id      — machine-readable: 'safari' | 'chrome' | 'edge' | 'firefox' |
             'duckduckgo' | 'brave' | 'opera' | 'samsung' | 'other'
   name    — display name: 'Safari', 'Chrome', etc.
   engine  — rendering engine: 'webkit' | 'blink' | 'gecko'
   frozen  — true when Safari/iOS freezes the reported version for fingerprinting
             protection. All iOS browsers are frozen because they all use WebKit
             under Apple's App Store policy.
   version — browser app version reported in UA (not the engine version)

   When detection returns id:'other' the UA is anonymously logged to D1 so we
   can update the regexes when browser vendors change their UA tokens
   (e.g. DuckDuckGo went from 'DuckDuckGo/' to 'Ddg/' in iOS 26.x).
   The logger is fire-and-forget — never blocks rendering.
*/

const BROWSER_LOG_API = 'https://api.mybadguy.com/api/log-unknown-browser';

function logUnknownBrowser(ua) {
  // Fire-and-forget, throttled server-side. Never await.
  try {
    fetch(BROWSER_LOG_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ua }),
      keepalive: true
    }).catch(() => {});
  } catch (_) {}
}

function detectBrowser() {
  const ua = navigator.userAgent;
  // Expose for debugging — open browser console and run: console.log(window.__lastUA)
  window.__lastUA = ua;
  const isIOSPlatform = /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);

  // iOS app detection — order matters: each browser identifies its own token
  // before falling through to Safari (the default iOS browser).
  if (isIOSPlatform) {
    let m;
    if ((m = ua.match(/CriOS\/([\d.]+)/)))                  return { id:'chrome',     name:'Chrome',     engine:'webkit', frozen:true, version:m[1] };
    if ((m = ua.match(/EdgiOS\/([\d.]+)/)))                 return { id:'edge',       name:'Edge',       engine:'webkit', frozen:true, version:m[1] };
    if ((m = ua.match(/FxiOS\/([\d.]+)/)))                  return { id:'firefox',    name:'Firefox',    engine:'webkit', frozen:true, version:m[1] };
    if ((m = ua.match(/(?:Ddg|DuckDuckGo)\/([\d.]+)/)))     return { id:'duckduckgo', name:'DuckDuckGo', engine:'webkit', frozen:true, version:m[1] };
    if ((m = ua.match(/OPT\/([\d.]+)/)))                    return { id:'opera',      name:'Opera',      engine:'webkit', frozen:true, version:m[1] };
    if ((m = ua.match(/Version\/([\d.]+).*Mobile.*Safari/))) return { id:'safari', name:'Safari', engine:'webkit', frozen:true, version:m[1] };
    // No iOS browser token matched — likely Safari, but could be a new
    // app that hasn't shipped a recognized UA token yet. Log so we can
    // update detection if a pattern emerges.
    logUnknownBrowser(ua);
    return { id:'safari', name:'Safari', engine:'webkit', frozen:true, version:'' };
  }

  // Desktop and Android — UAs are honest about which browser
  let m;
  if ((m = ua.match(/Edg\/([\d.]+)/)))        return { id:'edge',       name:'Edge',       engine:'blink',  frozen:false, version:m[1] };
  if ((m = ua.match(/OPR\/([\d.]+)/)))        return { id:'opera',      name:'Opera',      engine:'blink',  frozen:false, version:m[1] };
  if ((m = ua.match(/SamsungBrowser\/([\d.]+)/))) return { id:'samsung',    name:'Samsung Internet', engine:'blink',  frozen:false, version:m[1] };
  if ((m = ua.match(/Firefox\/([\d.]+)/)))    return { id:'firefox',    name:'Firefox',    engine:'gecko',  frozen:false, version:m[1] };
  if ((m = ua.match(/(?:Ddg|DuckDuckGo)\/([\d.]+)/))) return { id:'duckduckgo', name:'DuckDuckGo', engine:'blink',  frozen:false, version:m[1] };
  // Chrome detection — must come AFTER Edge/Opera/Brave since they all include "Chrome" in UA
  if ((m = ua.match(/Chrome\/([\d.]+)/)))     return { id:'chrome',     name:'Chrome',     engine:'blink',  frozen:false, version:m[1] };
  if ((m = ua.match(/Version\/([\d.]+).*Safari/))) return { id:'safari', name:'Safari', engine:'webkit', frozen:false, version:m[1] };
  // Unknown browser — log the UA anonymously so we can update detection
  logUnknownBrowser(ua);
  return { id:'other', name:'Unknown browser', engine:'unknown', frozen:false, version:'' };
}

// Expose globally for use in Detect, Siteview, and Dashboard
window.detectBrowser = detectBrowser;
