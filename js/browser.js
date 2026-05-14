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
*/

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
    if ((m = ua.match(/CriOS\/([\d.]+)/)))      { window.__brDbg='ios-chrome';      return { id:'chrome',     name:'Chrome',     engine:'webkit', frozen:true, version:m[1] }; }
    if ((m = ua.match(/EdgiOS\/([\d.]+)/)))     { window.__brDbg='ios-edge';        return { id:'edge',       name:'Edge',       engine:'webkit', frozen:true, version:m[1] }; }
    if ((m = ua.match(/FxiOS\/([\d.]+)/)))      { window.__brDbg='ios-firefox';     return { id:'firefox',    name:'Firefox',    engine:'webkit', frozen:true, version:m[1] }; }
    if ((m = ua.match(/DuckDuckGo\/([\d.]+)/))) { window.__brDbg='ios-duckduckgo';  return { id:'duckduckgo', name:'DuckDuckGo', engine:'webkit', frozen:true, version:m[1] }; }
    if ((m = ua.match(/OPT\/([\d.]+)/)))        { window.__brDbg='ios-opera';       return { id:'opera',      name:'Opera',      engine:'webkit', frozen:true, version:m[1] }; }
    if ((m = ua.match(/Version\/([\d.]+).*Mobile.*Safari/))) { window.__brDbg='ios-safari'; return { id:'safari', name:'Safari', engine:'webkit', frozen:true, version:m[1] }; }
    window.__brDbg = 'ios-safari-fallback';
    return { id:'safari', name:'Safari', engine:'webkit', frozen:true, version:'' };
  }

  // Desktop and Android — UAs are honest about which browser
  let m;
  if ((m = ua.match(/Edg\/([\d.]+)/)))        return { id:'edge',       name:'Edge',       engine:'blink',  frozen:false, version:m[1] };
  if ((m = ua.match(/OPR\/([\d.]+)/)))        return { id:'opera',      name:'Opera',      engine:'blink',  frozen:false, version:m[1] };
  if ((m = ua.match(/SamsungBrowser\/([\d.]+)/))) return { id:'samsung',    name:'Samsung Internet', engine:'blink',  frozen:false, version:m[1] };
  if ((m = ua.match(/Firefox\/([\d.]+)/)))    return { id:'firefox',    name:'Firefox',    engine:'gecko',  frozen:false, version:m[1] };
  if ((m = ua.match(/DuckDuckGo\/([\d.]+)/))) return { id:'duckduckgo', name:'DuckDuckGo', engine:'blink',  frozen:false, version:m[1] };
  // Chrome detection — must come AFTER Edge/Opera/Brave since they all include "Chrome" in UA
  if ((m = ua.match(/Chrome\/([\d.]+)/)))     return { id:'chrome',     name:'Chrome',     engine:'blink',  frozen:false, version:m[1] };
  if ((m = ua.match(/Version\/([\d.]+).*Safari/))) return { id:'safari', name:'Safari', engine:'webkit', frozen:false, version:m[1] };
  return { id:'other', name:'Unknown browser', engine:'unknown', frozen:false, version:'' };
}

// Expose globally for use in Detect, Siteview, and Dashboard
window.detectBrowser = detectBrowser;
