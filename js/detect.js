'use strict';

// ── CONFIG ──────────────────────────────────────────────
const API = 'https://api.mybadguy.com';

// ── STATE ───────────────────────────────────────────────
let ST = 0;        // current step 0-6
let CQ = 0;        // current question screen 0|1
let DV = {};       // detected device
let TV = {};       // temp device for correction
let SC = [];       // computed scores
let SID = '';      // generated scan ID
let PR = {         // profile answers
  age:35, fin:1, tech:1, iso:1, sm:1,
  role:0, pub:0,  mdm:0, home:1, usage:0
};
let OSV = {};      // os_versions API cache keyed by platform
let DV_MAC_SILICON = null; // null=unknown, true=Apple Silicon, false=Intel
let CVE_STATS = {}; // cve-stats API cache keyed by platform

// ── DEVICE TYPE DEFINITIONS ──────────────────────────────
const DTYPES = [
  { id:'iphone',  lb:'iPhone',  ic:'📱', os:'iOS' },
  { id:'ipad',    lb:'iPad',    ic:'🟦', os:'iPadOS' },
  { id:'android', lb:'Android', ic:'🤖', os:'Android' },
  { id:'mac',     lb:'Mac',     ic:'💻', os:'macOS' },
  { id:'windows', lb:'Windows', ic:'🖥',  os:'Windows' },
];

// ── OS VERSIONS (API-driven) ────────────────────────────────
// Fetched from /api/os-versions/:platform during detection animation.
// Replaces the previous hardcoded BUILDS table.

async function fetchOsVersions(platform) {
  if (OSV[platform]) return OSV[platform];
  // iphone data is stored under 'ios' slug in the API — alias it
  const urlPlatform = platform === 'iphone' ? 'ios' : platform;
  try {
    const r = await fetch(`${API}/api/os-versions/${urlPlatform}`);
    if (!r.ok) throw new Error(r.status);
    OSV[platform] = await r.json();
  } catch (_) { OSV[platform] = { versions:[], current:null, supported:0 }; }
  return OSV[platform];
}

async function fetchCveStats(platform) {
  if (CVE_STATS[platform]) return CVE_STATS[platform];
  try {
    const r = await fetch(`${API}/api/cve-stats/${platform}`);
    if (!r.ok) throw new Error(r.status);
    CVE_STATS[platform] = await r.json();
  } catch (_) {
    // Fallback values if API unavailable — safe defaults
    CVE_STATS[platform] = {
      tiers: { current:{ps:0,wild:0}, behind:{ps:15,wild:3}, outdated:{ps:80,wild:20} }
    };
  }
  return CVE_STATS[platform];
}

function versionToPatchStatus(fullVersion, platform) {
  const data = OSV[platform];
  if (!data || !data.versions || !data.versions.length) return 'behind';
  const major = String(parseInt(fullVersion) || fullVersion.split('.')[0]);
  const cycle = data.versions.find(v => String(v.cycle) === major)
             || data.versions.find(v => String(Math.floor(parseFloat(v.cycle))) === major);
  if (!cycle)               return 'outdated'; // very old or not tracked
  if (!cycle.is_supported)  return 'outdated'; // vendor EOL

  // If user is on the latest point release of this cycle they are fully patched
  // regardless of whether a newer major version exists.
  // e.g. macOS 15.7.5 = fully patched on Sequoia even though macOS 26 exists.
  if (cycle.latest_version && fullVersion === cycle.latest_version) return 'current';
  if (cycle.is_current)     return 'current';  // newest major + no point release data

  // On a supported but not-newest cycle AND behind within that cycle
  return 'behind';
}

// Returns upgrade hint for supported-but-not-current cycles
// e.g. macOS 15.7.5 → { available: 'macOS Tahoe 26.4.1', canUpgrade: true|false|null }
function getUpgradeHint(platform, fullVersion) {
  const data = OSV[platform];
  if (!data?.versions?.length) return null;
  const major = String(parseInt(fullVersion) || fullVersion.split('.')[0]);
  const cycle = data.versions.find(v => String(v.cycle) === major);
  if (!cycle || cycle.is_current) return null; // already on current major

  const current = data.versions.find(v => v.is_current);
  if (!current) return null;

  // Platform-specific upgrade guidance
  let canUpgrade = null;
  let upgradeNote = null;

  if (platform === 'mac') {
    // Apple Silicon can upgrade; Intel cannot go past macOS 15
    canUpgrade = DV_MAC_SILICON; // true/false/null
  } else if (platform === 'iphone' || platform === 'ipad') {
    // Cannot determine model compatibility from browser — direct to Apple's page
    canUpgrade = null;
    upgradeNote = 'check';
  }

  return {
    available:   current.label || `${platform === 'ipad' ? 'iPadOS' : 'iOS'} ${current.cycle}`,
    version:     current.latest_version || current.cycle,
    canUpgrade,
    upgradeNote,
  };
}

function buildVersionCards(platform) {
  const data = OSV[platform];
  if (!data || !data.versions || !data.versions.length) return [];
  const prefix = { iphone:'iOS', ipad:'iPadOS', android:'Android', mac:'macOS', windows:'Windows' }[platform] || '';
  const cards = [];

  if (platform === 'windows') {
    // Windows: filter to consumer editions only (skip IoT and LTS)
    // Show Home (-w) and Pro (-e) editions, exclude -iot-lts, -e-lts, -iot
    const consumer = data.versions.filter(v =>
      !v.cycle.includes('iot') && !v.cycle.includes('lts')
    );
    const sorted = [...consumer].sort((a, b) => {
      if (a.is_current !== b.is_current)    return b.is_current - a.is_current;
      if (a.is_supported !== b.is_supported) return b.is_supported - a.is_supported;
      return parseFloat(b.cycle) - parseFloat(a.cycle);
    });
    sorted.forEach(v => {
      const patch   = v.is_current ? 'current' : v.is_supported ? 'behind' : 'outdated';
      const cycleLower = v.cycle.toLowerCase();
      const edition = cycleLower.endsWith('-e') ? 'Pro' : cycleLower.endsWith('-w') ? 'Home' : '';
      const buildMatch = v.cycle.match(/(\d+h\d+)/i);
      const buildTag   = buildMatch ? buildMatch[1].toUpperCase() : v.cycle;
      const winMajor   = v.cycle.startsWith('11') ? 'Windows 11' : 'Windows 10';
      const label = edition ? `${winMajor} ${edition} — ${buildTag}` : `${winMajor} — ${buildTag}`;
      const note  = v.is_current   ? 'Latest — fully patched'
                  : v.is_supported ? 'Security patches available'
                  :                  'End of life — no security patches';
      const date  = v.release_date
        ? new Date(v.release_date).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '';
      cards.push({ v: v.latest_version || v.cycle, cycle: v.cycle, l: label, p: patch, n: note, d: date });
    });
    return cards;
  }

  // iOS, iPadOS, macOS, Android
  // For supported cycles that have point releases, expand them.
  // For EOL cycles, show one entry per cycle.
  const pointReleases = data.point_releases || [];
  const supportedCycles = new Set(data.versions.filter(v => v.is_supported).map(v => v.cycle));

  // Sort cycles: current first, supported, then EOL
  const sorted = [...data.versions].sort((a, b) => {
    if (a.is_current !== b.is_current)    return b.is_current - a.is_current;
    if (a.is_supported !== b.is_supported) return b.is_supported - a.is_supported;
    return parseFloat(b.cycle) - parseFloat(a.cycle);
  });

  sorted.forEach(v => {
    const prs = pointReleases.filter(pr => pr.major_cycle === v.cycle);

    if (v.is_supported && prs.length > 0) {
      // Expand into individual point releases
      // is_latest per cycle = latest build in that cycle
      // current = is_latest AND the cycle itself is current (newest major)
      prs.forEach(pr => {
        const isLatestInCycle = pr.is_latest === 1;
        const patch = isLatestInCycle && v.is_current ? 'current'
                    : v.is_supported                  ? 'behind'
                    :                                   'outdated';
        const label = `${prefix} ${pr.version}`;
        const note  = isLatestInCycle && v.is_current ? 'Latest — fully patched'
                    : isLatestInCycle                  ? `Latest ${prefix} ${v.cycle} — older major version`
                    : v.is_supported                   ? 'Older build — security patches available'
                    :                                    'End of life — no security patches';
        const date  = pr.release_date
          ? new Date(pr.release_date).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '';
        cards.push({ v: pr.version, cycle: v.cycle, l: label, p: patch, n: note, d: date });
      });
    } else {
      // Single entry for this cycle (EOL or no point release data yet)
      const patch   = v.is_current ? 'current' : v.is_supported ? 'behind' : 'outdated';
      const display = v.latest_version || v.cycle;
      const label   = v.latest_version ? `${prefix} ${v.latest_version}` : v.label || `${prefix} ${v.cycle}`;
      const note    = v.is_current   ? 'Latest — fully patched'
                    : v.is_supported ? 'Security patches available'
                    :                  'End of life — no security patches';
      const date    = v.release_date
        ? new Date(v.release_date).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '';
      cards.push({ v: display, cycle: v.cycle, l: label, p: patch, n: note, d: date });
    }
  });

  return cards;
}

// ── QUESTION SCREENS ─────────────────────────────────────
const QSETS = [
  { lb:'About you', pc:40, qs:[
    { id:'age',  t:'How old are you?', ty:'slider' },
    { id:'fin',  t:'Your financial situation?', ty:'pills',
      o:['Struggling','Working class','Middle income','Doing well','High wealth'], v:[1,2,3,4,5] },
    { id:'tech', t:'Tech comfort level?', ty:'pills',
      o:['Not at all','Basic user','Moderate','Tech-savvy','Expert / IT'], v:[1,2,3,4,5] },
    { id:'iso',  t:'How connected are you socially?', ty:'pills',
      o:['Very isolated','Somewhat isolated','Active','Well connected','Community leader'], v:[1,2,3,4,5] },
    { id:'sm',   t:'Social media activity?', ty:'pills',
      o:['Never use it','Occasional','Regular','Heavy user','Influencer / public'], v:[1,2,3,4,5] },
  ]},
  { lb:'Your context', pc:80, qs:[
    { id:'role', t:'Work-related data on this device?', ty:'pills',
      o:['No work data','Some work apps','Work email & files','Sensitive / regulated','Executive / gov'], v:[0,1,2,3,4] },
    { id:'pub',  t:'How public is your online presence?', ty:'pills',
      o:['Very private','Low profile','Moderate','High visibility','Very public'], v:[0,1,2,3,4] },
    { id:'mdm',  t:'How is this device used for work?', ty:'pills',
      o:['Personal only','Work apps installed','Work email linked','Corporate account','MDM enrolled'], v:[0,1,2,3,4] },
    { id:'home', t:'Where do you primarily live?', ty:'pills',
      o:['Rural','Suburban','Urban','Dense urban'], v:[1,2,3,4] },
    { id:'usage',t:'Where do you usually use your phone?', ty:'pills',
      o:['Mostly at home','Work / commute','Often in public','Frequent travel','International'], v:[0,1,2,3,4] },
  ]},
];

// ── SCORING ENGINE ────────────────────────────────────────
// Uses calcScore() from scoring.js (loaded before detect.js in detect.html).
// Actor configs are identical to the individual actor JS files so detect
// preview scores and dashboard scores always match.
// ── SCORING ENGINE ────────────────────────────────────────
// calcScore() mirrors scoring.js exactly so detect preview and dashboard
// scores always match. PR here is the detect.js live profile object.
function calcScore(a) {
  const p  = PR;
  const ps = p.patchScore || 0;
  const ws = p.wildScore  || 0;
  const effectivePs = (ps - ws) + (ws * 1.5);
  let db = 0;
  if (p.ip) db += effectivePs * a.ds.ip * 0.25;
  if (p.id) db += effectivePs * a.ds.id * 0.18;
  if (p.an) db += effectivePs * a.ds.an * 0.22;
  if (p.mc) db += effectivePs * a.ds.mc * 0.16;
  if (p.wn) db += effectivePs * a.ds.wn * 0.20;
  db = Math.round(db);
  const mb = Math.round(((p.mdm - 1) / 4) * a.mdmW * 22);

  const hn = (p.home  - 1) / 3;
  const un = (p.usage - 1) / 4;
  const hc = a.lw.home < 0
    ? Math.round((1 - hn) * Math.abs(a.lw.home) * 14)
    : Math.round(hn * a.lw.home * 14);
  const lb = Math.max(0, hc + Math.round(un * a.lw.usage * 18));

  const f   = a.cf;
  const an2 = p.age <= 25 ? (25 - p.age) / 12 : p.age >= 65 ? (p.age - 65) / 20 : 0;
  const cb  = Math.round(
    f.age  * (an2 * 12)        +
    f.fin  * (p.fin  - 1) * 3  +
    f.tech * (3 - p.tech) * 3  +
    f.iso  * (p.iso  - 1) * 4  +
    f.pub  * (p.pub  - 1) * 3  +
    f.sm   * (p.sm   - 1) * 3  +
    f.role * (p.role - 1) * 5
  );

  const t = Math.min(99, Math.max(1, a.tBase + Math.round(cb * .5) + db + mb + lb));
  const s = Math.min(99, Math.max(1, a.sBase + Math.round(cb * .5)));
  return { t, s, cb, db, mb, lb, co: Math.round((t + s) / 2) };
}

const ACTOR_CONFIGS = [
  { nm:'Nation-state / APT',  g:'technical',
    tBase:97, sBase:52,
    cf:{age:.1,fin:.2,tech:.1,iso:.1,pub:.7,sm:.4,role:.95},
    ds:{ip:.95,id:.75,an:.85,mc:.80,wn:.90}, mdmW:.90, lw:{home:.10,usage:.85} },
  { nm:'Cybercriminal',       g:'financial',
    tBase:78, sBase:72,
    cf:{age:.6,fin:.9,tech:-.7,iso:.5,pub:.3,sm:.7,role:.2},
    ds:{ip:.85,id:.55,an:.80,mc:.70,wn:.75}, mdmW:.35, lw:{home:.35,usage:.45} },
  { nm:'Data broker',         g:'technical',
    tBase:42, sBase:35,
    cf:{age:.3,fin:.7,tech:-.2,iso:.1,pub:.5,sm:.85,role:.2},
    ds:{ip:.7,id:.8,an:.75,mc:.55,wn:.60}, mdmW:.10, lw:{home:.55,usage:.30} },
  { nm:'Insider threat',      g:'technical',
    tBase:55, sBase:62,
    cf:{age:.1,fin:.3,tech:.2,iso:.2,pub:.4,sm:.3,role:.75},
    ds:{ip:.8,id:.7,an:.75,mc:.85,wn:.88}, mdmW:.95, lw:{home:.15,usage:.35} },
  { nm:'Elder scammer',       g:'social',
    tBase:22, sBase:88,
    cf:{age:.95,fin:.7,tech:-.9,iso:.85,pub:.1,sm:.3,role:.05},
    ds:{ip:.9,id:.6,an:.7,mc:.5,wn:.55}, mdmW:.02, lw:{home:.05,usage:.05} },
  { nm:'Partner abuser',      g:'social',
    tBase:58, sBase:90,
    cf:{age:.2,fin:.1,tech:-.3,iso:.9,pub:.1,sm:.5,role:.1},
    ds:{ip:.9,id:.7,an:.85,mc:.5,wn:.4}, mdmW:.05, lw:{home:-.20,usage:.10} },
  { nm:'Device thief',        g:'financial',
    tBase:35, sBase:45,
    cf:{age:.5,fin:.6,tech:-.8,iso:.2,pub:.4,sm:.2,role:.1},
    ds:{ip:.95,id:.3,an:.90,mc:.2,wn:.15}, mdmW:.08, lw:{home:.95,usage:.90} },
];

function calcScores() {
  const results = ACTOR_CONFIGS.map(a => {
    const r = calcScore(a); // uses scoring.js engine
    return { nm:a.nm, g:a.g, t:r.t, s:r.s, co:r.co };
  });
  results.sort((a,b) => b.co - a.co);
  return results;
}

function getTopWins() {
  const type = DV.type || 'iphone';
  const topG  = SC.slice(0,3).map(a => a.g);

  const ALL = {
    iphone: [
      { t:'Enable Stolen Device Protection',        w:'Settings → Face ID & Passcode → Stolen Device Protection', g:'financial', r:10 },
      { t:'Enable two-factor authentication',       w:'Settings → [Your Name] → Password & Security → Two-Factor Authentication', g:'financial', r:9 },
      { t:'Disable cross-app tracking',             w:'Settings → Privacy & Security → Tracking → turn Off', g:'technical', r:9 },
      { t:'Update to the latest iOS',               w:'Settings → General → Software Update', g:'technical', r:9 },
      { t:'Silence Unknown Callers',                w:'Settings → Phone → Silence Unknown Callers → On', g:'social', r:8 },
      { t:'Restrict location to While Using only',  w:'Settings → Privacy & Security → Location Services', g:'technical', r:8 },
      { t:'Use Face ID in public',                  w:'Never enter your passcode where someone can watch — if Face ID fails, move somewhere private', g:'financial', r:9 },
      { t:'Use unique passwords for every account', w:'Settings → Passwords → use the built-in generator', g:'financial', r:9 },
    ],
    ipad: [
      { t:'Enable two-factor authentication',       w:'Settings → [Your Name] → Password & Security → Two-Factor Authentication', g:'financial', r:9 },
      { t:'Disable cross-app tracking',             w:'Settings → Privacy & Security → Tracking → turn Off', g:'technical', r:9 },
      { t:'Update to the latest iPadOS',            w:'Settings → General → Software Update', g:'technical', r:9 },
      { t:'Set a strong alphanumeric passcode',     w:'Settings → Face ID & Passcode → Change Passcode → Passcode Options → Custom Alphanumeric', g:'financial', r:10 },
      { t:'Restrict location to While Using only',  w:'Settings → Privacy & Security → Location Services', g:'technical', r:8 },
      { t:'Use unique passwords for every account', w:'Settings → Passwords → use the built-in generator', g:'financial', r:9 },
      { t:'Enable iCloud Backup',                   w:'Settings → [Your Name] → iCloud → iCloud Backup → On', g:'technical', r:8 },
    ],
    android: [
      { t:'Enable two-factor authentication',       w:'Google account → Security → 2-Step Verification', g:'financial', r:9 },
      { t:'Update to the latest Android version',   w:'Settings → About phone → Software update', g:'technical', r:9 },
      { t:'Use Google Play Protect',                w:'Google Play Store → Profile icon → Play Protect → turn On', g:'technical', r:9 },
      { t:'Only install apps from Google Play',     w:'Settings → Apps → Special app access → Install unknown apps — deny all', g:'technical', r:10 },
      { t:'Set a strong screen lock',               w:'Settings → Security → Screen lock → Password or PIN (6+ digits)', g:'financial', r:10 },
      { t:'Review app permissions',                 w:'Settings → Privacy → Permission manager — revoke unnecessary access', g:'technical', r:8 },
      { t:'Use unique passwords for every account', w:'Settings → Passwords & accounts or use Google Password Manager', g:'financial', r:9 },
    ],
    mac: [
      { t:'Enable FileVault disk encryption',       w:'System Settings → Privacy & Security → FileVault → Turn On', g:'technical', r:10 },
      { t:'Enable two-factor authentication',       w:'System Settings → [Your Name] → Password & Security → Two-Factor Authentication', g:'financial', r:9 },
      { t:'Update to the latest macOS',             w:'System Settings → General → Software Update', g:'technical', r:9 },
      { t:'Enable the Firewall',                    w:'System Settings → Network → Firewall → turn On', g:'technical', r:9 },
      { t:'Lock screen when stepping away',         w:'System Settings → Lock Screen → Require password → Immediately', g:'financial', r:8 },
      { t:'Review app privacy permissions',         w:'System Settings → Privacy & Security — review Camera, Microphone, Location', g:'technical', r:8 },
      { t:'Use unique passwords for every account', w:'System Settings → Passwords → use the built-in generator', g:'financial', r:9 },
    ],
    windows: [
      { t:'Enable BitLocker disk encryption',       w:'Start → Settings → Privacy & Security → Device Encryption → turn On', g:'technical', r:10 },
      { t:'Enable two-factor authentication',       w:'Microsoft account → Security → Advanced security → Two-step verification', g:'financial', r:9 },
      { t:'Keep Windows Update current',            w:'Start → Settings → Windows Update → Check for updates', g:'technical', r:9 },
      { t:'Enable Windows Defender Firewall',       w:'Start → Settings → Privacy & Security → Windows Security → Firewall', g:'technical', r:9 },
      { t:'Use unique passwords for every account', w:'Use Microsoft Edge built-in password manager or a dedicated password manager', g:'financial', r:9 },
      { t:'Lock your screen when stepping away',    w:'Windows key + L to instantly lock — make it a habit', g:'financial', r:8 },
      { t:'Review app permissions',                 w:'Start → Settings → Privacy & Security → App permissions — review Camera, Microphone, Location', g:'technical', r:8 },
    ],
  };

  const wins = ALL[type] || ALL.iphone;
  return wins.filter(w => topG.includes(w.g)).slice(0, 3);
}

// ── ID GENERATOR ─────────────────────────────────────────
function genId() {
  const words = ['ocean','violet','thunder','mercury','silver','falcon','ember',
                 'cedar','lunar','drift','prism','cinder','vortex','haven',
                 'nexus','cobalt','amber','cipher','delta','echo','frost',
                 'glacier','horizon','indigo','jasper','kestrel','lantern'];
  const pick = () => words[Math.floor(Math.random() * words.length)];
  return `${pick()} · ${pick()} · ${pick()} · ${pick()}`;
}

// ── DEVICE DETECTION ─────────────────────────────────────
function detectDevice() {
  const ua = navigator.userAgent;
  const pl = navigator.platform || '';
  const tp = navigator.maxTouchPoints || 0;
  let type = 'windows', os = 'Windows', major = '11', fullVersion = '', icon = '🖥';

  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && tp > 1)) {
    type = 'ipad'; os = 'iPadOS'; icon = '🟦';
    const m = ua.match(/CPU OS (\d+[_\d]*)/);
    if (m) { fullVersion = m[1].replace(/_/g,'.'); major = m[1].split('_')[0]; }
  } else if (/iPhone/.test(ua)) {
    type = 'iphone'; os = 'iOS'; icon = '📱';
    const m = ua.match(/CPU iPhone OS (\d+[_\d]*)/);
    if (m) { fullVersion = m[1].replace(/_/g,'.'); major = m[1].split('_')[0]; }
  } else if (/Android/.test(ua)) {
    type = 'android'; os = 'Android'; icon = '🤖';
    const m = ua.match(/Android (\d+(?:\.\d+)?)/);
    if (m) { fullVersion = m[1]; major = m[1].split('.')[0]; }
  } else if (/Macintosh|MacIntel/.test(pl) && tp === 0) {
    type = 'mac'; os = 'macOS'; icon = '💻';
    const m = ua.match(/Mac OS X (\d+[_\d]*)/);
    if (m) {
      const parts = m[1].split('_');
      if (parts[0] === '10') {
        // Intel era UA: 10_15_7 means macOS minor version is parts[1]
        major = parts[1] || '15';
        fullVersion = major + (parts[2] ? '.' + parts[2] : '');
      } else {
        major = parts[0]; fullVersion = parts.join('.');
      }
    }
    // UA only gives major.minor (e.g. 15.7) — patch digit is omitted by browsers.
    // Enrich with latest_version from OSV if the cycle matches and has more detail.
    const macData = OSV['mac'];
    if (macData?.versions) {
      const cycle = macData.versions.find(v => String(v.cycle) === major);
      if (cycle?.latest_version && cycle.latest_version.startsWith(fullVersion)) {
        fullVersion = cycle.latest_version;
      }
    }
  }
  // Windows: UA always says NT 10.0 for both Win10 and Win11
  // User must self-select via the correction flow
  if (type === 'windows') fullVersion = 'Windows';

  // macOS: detect Apple Silicon vs Intel via WebGL renderer string
  // Used only to show upgrade hint — not stored anywhere
  if (type === 'mac') {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (ext) {
          const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '';
          // Apple Silicon reports "Apple M1", "Apple M2", "Apple M3", "Apple M4" etc
          // Intel reports "Intel Iris", "AMD Radeon", "ANGLE (Intel" etc
          DV_MAC_SILICON = /Apple M\d/i.test(renderer);
        }
      }
    } catch (_) {}
  }

  const patch = versionToPatchStatus(fullVersion || major, type);
  const NAMES = { iphone:'iPhone', ipad:'iPad', android:'Android phone', mac:'Mac', windows:'Windows PC' };
  return { type, os, major, fullVersion: fullVersion || major, icon, patch, name: NAMES[type] || 'Device' };
}

// ── PROGRESS DOTS ─────────────────────────────────────────
function renderDots() {
  const el = document.getElementById('stepDots');
  let h = '';
  for (let i = 0; i < 6; i++) {
    const cls = i === ST ? 'active' : i < ST ? 'done' : '';
    h += `<div class="step-dot ${cls}" aria-hidden="true"></div>`;
  }
  el.innerHTML = h;
  el.setAttribute('aria-valuenow', ST);
}

// ── STEP 0: SCAN ANIMATION ────────────────────────────────

const CHECKS = [
  'Reading device type…',
  'Checking OS version…',
  'Checking CVE database…',
  'Analyzing patch status…',
  'Profiling threat surface…',
];

function renderScan() {
  // Two-element crossfade: set new text on the HIDDEN element first,
  // then swap opacities. Text never changes while visible — fixes iOS overlap.
  document.getElementById('app').innerHTML = `
    <div class="screen" style="text-align:center;">
      <div class="scan-eye-wrap" aria-hidden="true">
        <svg width="200" height="120" viewBox="0 0 100 60" aria-hidden="true">
          <path d="M3,30 Q22,4 50,4 L50,56 Q22,56 3,30 Z" fill="rgba(34,211,238,.18)"/>
          <path d="M50,4 Q78,4 97,30 Q78,56 50,56 Z" fill="none" stroke="rgba(34,211,238,.28)" stroke-width="2"/>
          <circle cx="50" cy="30" r="9" fill="none" stroke="rgba(34,211,238,.35)" stroke-width="1.5"/>
          <circle cx="50" cy="30" r="3.5" fill="rgba(34,211,238,.55)"/>
        </svg>
        <div class="scan-ring scan-ring-1"></div>
        <div class="scan-ring scan-ring-2"></div>
        <div class="scan-line"></div>
      </div>
      <h1 style="font-family:'Syne',sans-serif;font-size:22px;font-weight:700;margin-bottom:.6rem;">
        Detecting your device
      </h1>
      <div class="scan-status-wrap" role="status" aria-live="polite">
        <p class="scan-status" id="scanStatusA" style="opacity:1;">${CHECKS[0]}</p>
        <p class="scan-status" id="scanStatusB" style="opacity:0;" aria-hidden="true"></p>
      </div>
    </div>`;

  let idx = 0;
  let active = 'A'; // which element is currently visible

  const iv = setInterval(() => {
    idx++;
    if (idx >= CHECKS.length) {
      clearInterval(iv);
      setTimeout(async () => {
        const _ua = navigator.userAgent, _tp = navigator.maxTouchPoints||0;
        let _pt = 'windows';
        if (/iPad/.test(_ua)||(/Macintosh/.test(_ua)&&_tp>1)) _pt='ipad';
        else if (/iPhone/.test(_ua))  _pt='iphone';
        else if (/Android/.test(_ua)) _pt='android';
        else if (/Macintosh|MacIntel/.test(navigator.platform||'')&&_tp===0) _pt='mac';
        await Promise.all([fetchOsVersions(_pt), fetchCveStats(_pt)]);
        DV = detectDevice(); ST = 1; render();
      }, 300);
      return;
    }
    const elA = document.getElementById('scanStatusA');
    const elB = document.getElementById('scanStatusB');
    if (!elA || !elB) return;

    if (active === 'A') {
      // B is hidden — safely write new text then crossfade
      elB.textContent = CHECKS[idx];
      elB.removeAttribute('aria-hidden');
      elA.setAttribute('aria-hidden', 'true');
      elA.style.opacity = '0';
      elB.style.opacity = '1';
      active = 'B';
    } else {
      // A is hidden — safely write new text then crossfade
      elA.textContent = CHECKS[idx];
      elA.removeAttribute('aria-hidden');
      elB.setAttribute('aria-hidden', 'true');
      elB.style.opacity = '0';
      elA.style.opacity = '1';
      active = 'A';
    }
  }, 600);
}


// ── STEP 1: DEVICE CONFIRM ───────────────────────────────
function renderDevice() {
  // Windows: browser UA always reports NT 10.0 — we cannot detect version or build.
  // Skip the confirm card and go straight to the version picker.
  if (DV.type === 'windows') {
    TV = { type: 'windows', os: 'Windows' };
    renderCorrectBuilds().catch(console.error);
    return;
  }

  const pc = DV.patch === 'current' ? '#22c55e' : DV.patch === 'behind' ? '#EF9F27' : '#E24B4A';
  const pb = DV.patch === 'current' ? 'rgba(34,197,94,.12)' : DV.patch === 'behind' ? 'rgba(239,159,39,.12)' : 'rgba(226,75,74,.12)';
  const pl = DV.patch === 'current' ? 'Up to date' : DV.patch === 'behind' ? 'Update available' : 'Outdated — scores elevated';
  const warn = DV.patch !== 'current'
    ? `<p class="patch-warn">Unpatched CVEs give threat actors open exploit windows. Your technical scores reflect this.</p>`
    : '';

  // Upgrade hint for fully patched but not on newest major (e.g. macOS 15.7.5 when 26 exists)
  const hint  = getUpgradeHint(DV.type, DV.fullVersion || DV.major);
  let upgradeNote = '';
  if (hint) {
    const INFO_STYLE = 'background:rgba(34,211,238,.06);border-color:rgba(34,211,238,.2);color:var(--muted);';
    if (hint.canUpgrade === true) {
      // Apple Silicon Mac — can upgrade
      upgradeNote = `<p class="patch-warn" style="${INFO_STYLE}">
        You\u2019re fully patched on this version. ${hint.available} (${hint.version}) is available and your Mac supports it.
      </p>`;
    } else if (hint.canUpgrade === false) {
      // Intel Mac — cannot upgrade past macOS 15
      upgradeNote = `<p class="patch-warn" style="${INFO_STYLE}">
        You\u2019re fully patched on this version. ${hint.available} requires Apple Silicon \u2014 your Intel Mac is at its maximum supported OS.
      </p>`;
    } else if (hint.upgradeNote === 'check') {
      // iPhone or iPad — can't determine model compatibility
      const deviceWord = DV.type === 'ipad' ? 'iPad' : 'iPhone';
      upgradeNote = `<p class="patch-warn" style="${INFO_STYLE}">
        You\u2019re fully patched on this version. ${hint.available} (${hint.version}) is available \u2014
        <a href="https://support.apple.com/en-us/105113" target="_blank" rel="noopener noreferrer" style="color:var(--cyan);">check if your ${deviceWord} is compatible</a>.
      </p>`;
    } else {
      // Generic fallback
      upgradeNote = `<p class="patch-warn" style="${INFO_STYLE}">
        You\u2019re fully patched on this version. ${hint.available} (${hint.version}) is also available.
      </p>`;
    }
  }

  document.getElementById('app').innerHTML = `
    <div class="screen">
      <p class="eyebrow">Device detected</p>
      <div class="device-card" role="region" aria-label="Detected device information">
        <div class="device-icon-wrap" aria-hidden="true">${DV.icon}</div>
        <h1 class="device-name">${DV.name}</h1>
        <p class="device-meta">${DV.os} ${DV.fullVersion || DV.major}</p>
        <span class="patch-badge" style="background:${pb};color:${pc};">${pl}</span>
        ${warn}
        ${upgradeNote}
      </div>
      <p style="font-size:14px;color:var(--muted);text-align:center;margin-bottom:1.25rem;">Is this your device?</p>
      <div class="btn-row">
        <button class="btn-primary" data-action="confirm-device">Yes, continue →</button>
        <button class="btn-outline" data-action="correct-device">Correct it</button>
      </div>
    </div>`;
}

// ── DEVICE CORRECTION — STEP A: TYPE ─────────────────────
function renderCorrect() {
  renderDots();
  const btns = DTYPES.map(dt => `
    <div class="dtype-card${TV.type===dt.id?' sel':''}"
         role="button" tabindex="0"
         aria-pressed="${TV.type===dt.id}"
         data-action="select-dtype"
         data-type="${dt.id}"
         data-os="${dt.os}"
         aria-label="${dt.lb}">
      <span class="di" aria-hidden="true">${dt.ic}</span>
      <span>${dt.lb}</span>
    </div>`).join('');

  document.getElementById('app').innerHTML = `
    <div class="screen">
      <p class="eyebrow">Correct your device</p>
      <h1 class="sec-title">What type of device is this?</h1>
      <p style="font-size:13px;color:var(--muted);margin-bottom:1.5rem;">
        Select your device — we'll then ask for the exact build version.
      </p>
      <div class="dtype-grid" role="group" aria-label="Device type selection">${btns}</div>
      <div class="btn-row">
        <button class="btn-ghost" data-action="back-to-device">← Back to detected device</button>
      </div>
    </div>`;
}

// ── DEVICE CORRECTION — STEP B: BUILD VERSION ────────────
async function renderCorrectBuilds() {
  renderDots();
  // Show loading state while fetching if not already cached
  if (!OSV[TV.type]) {
    document.getElementById('app').innerHTML = `<div class="screen" style="text-align:center;padding:3rem 1rem;">
      <div class="rem-spinner" style="width:24px;height:24px;border:2px solid rgba(255,255,255,.1);border-top-color:#22d3ee;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 1rem;"></div>
      <p style="color:var(--muted);font-size:14px;">Loading version data…</p></div>`;
    await fetchOsVersions(TV.type);
  }
  const builds = buildVersionCards(TV.type);
  const dt     = DTYPES.find(d => d.id === TV.type);
  const NC = { current:'#22c55e', behind:'#EF9F27', outdated:'#E24B4A' };

  const cards = builds.map(b => {
    const sel = TV.build === b.v;
    return `
      <div class="ver-card${sel?' sel':''}"
           role="button" tabindex="0"
           aria-pressed="${sel}"
           data-action="select-build"
           data-v="${b.v}"
           data-p="${b.p}"
           aria-label="${b.l}, ${b.n}, released ${b.d}">
        <span class="ver-label">${b.l}</span>
        <span class="ver-note" style="color:${sel?'rgba(15,23,42,.65)':NC[b.p]};">${b.n}</span>
        <span class="ver-date">Released ${b.d}</span>
      </div>`;
  }).join('');

  // Platform-specific step-by-step instructions
  const VERSION_STEPS = {
    iphone:  ['Open <strong>Settings</strong>', 'Tap <strong>General</strong>', 'Tap <strong>About</strong>', 'Look for <strong>Software Version</strong>'],
    ipad:    ['Open <strong>Settings</strong>', 'Tap <strong>General</strong>', 'Tap <strong>About</strong>', 'Look for <strong>Software Version</strong>'],
    android: ['Open <strong>Settings</strong>', 'Scroll down and tap <strong>About phone</strong>', 'Tap <strong>Software information</strong>', 'Look for <strong>Android version</strong>'],
    mac:     ['Click the <strong>ἴE Apple menu</strong> (top-left corner)', 'Click <strong>About This Mac</strong>', 'Your macOS version is shown at the top'],
    windows: ['Click <strong>Start</strong>', 'Click <strong>Settings</strong> (gear icon)', 'Click <strong>System</strong>', 'Click <strong>About</strong>', 'Look for <strong>Windows 11</strong> or <strong>Windows 10</strong> and the version number (e.g. 24H2)'],
  };

  const steps = VERSION_STEPS[TV.type] || VERSION_STEPS.iphone;
  const stepsHtml = steps.map((s, i) =>
    `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:5px;">
       <span style="flex-shrink:0;width:18px;height:18px;border-radius:50%;background:rgba(34,211,238,.15);color:#22d3ee;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;">${i+1}</span>
       <span style="font-size:12px;color:var(--muted);line-height:1.5;">${s}</span>
     </div>`
  ).join('');

  const eyebrow = TV.type === 'windows' ? 'Windows version' : 'Correct your device';
  const heading = TV.type === 'windows'
    ? 'Which version of Windows are you running?'
    : `Which ${dt ? dt.os : 'OS'} version?`;

  document.getElementById('app').innerHTML = `
    <div class="screen">
      <p class="eyebrow">${eyebrow}</p>
      <h1 class="sec-title">${heading}</h1>
      <details style="margin-bottom:1rem;background:rgba(34,211,238,.05);border:.5px solid rgba(34,211,238,.15);border-radius:8px;padding:.6rem .85rem;">
        <summary style="font-size:12px;font-weight:500;color:#22d3ee;cursor:pointer;user-select:none;list-style:none;">
          How to find your version &darr;
        </summary>
        <div style="margin-top:.65rem;">${stepsHtml}</div>
      </details>
      <div class="ver-grid" role="group" aria-label="OS version selection">${cards}</div>
      <div class="btn-row">
        <button class="btn-ghost" data-action="change-dtype">← Change device type</button>
        <button id="cfmBtn" class="btn-primary" ${TV.build?'':'disabled'} data-action="confirm-build">
          Confirm →
        </button>
      </div>
    </div>`;
}

function selectBuild(v, p, cardEl) {
  TV.build = v;
  TV.fullVersion = v;
  // For Windows cycles like '11-26h1-e', extract '11' as major
  // For normal versions like '26.4.2', extract '26'
  const numMatch = v.match(/^(\d+)/);
  TV.major = numMatch ? numMatch[1] : v;
  TV.patch = p;
  // Clear selection on all cards
  document.querySelectorAll('.ver-card').forEach(c => {
    c.classList.remove('sel');
    c.setAttribute('aria-pressed','false');
  });
  // Apply selection to the clicked card via passed element (not event.currentTarget)
  if (cardEl) {
    cardEl.classList.add('sel');
    cardEl.setAttribute('aria-pressed','true');
  }
  const btn = document.getElementById('cfmBtn');
  if (btn) btn.disabled = false;
}

function applyCorrection() {
  const dt = DTYPES.find(d => d.id === TV.type);
  const NAMES = { iphone:'iPhone', ipad:'iPad', android:'Android phone', mac:'Mac', windows:'Windows PC' };
  DV = { type:TV.type, os:TV.os, major:TV.major, fullVersion:TV.fullVersion||TV.major, icon:dt?dt.ic:'📱', patch:TV.patch, name:NAMES[TV.type]||'Device' };
  // Windows auto-skips ST=1 (renderDevice), so go straight to questions
  ST = DV.type === 'windows' ? 2 : 1;
  render();
}

// ── STEPS 2-3: PROFILE QUESTIONS ─────────────────────────
function renderQuestions() {
  const qs = QSETS[CQ];
  let h = `
    <div class="screen">
      <p class="eyebrow">${qs.lb}</p>
      <div class="q-progress" role="progressbar" aria-valuenow="${qs.pc}" aria-valuemin="0" aria-valuemax="100" aria-label="Profile completion ${qs.pc}%">
        <div class="q-progress-fill" style="width:${qs.pc}%"></div>
      </div>`;

  qs.qs.forEach(q => {
    const cur = PR[q.id] !== undefined ? PR[q.id] : (q.id==='age'?35:q.v?q.v[0]:0);
    h += `<div class="q-block">`;
    h += `<p class="q-label" id="q-${q.id}">${q.t}</p>`;

    if (q.ty === 'slider') {
      h += `
        <div class="age-row" role="group" aria-labelledby="q-${q.id}">
          <input type="range" min="13" max="85" value="${cur}" step="1"
                 aria-label="Age" aria-valuemin="13" aria-valuemax="85" aria-valuenow="${cur}"
                 data-action="age-slider">
          <span class="age-val" id="ageVal" aria-live="polite">${cur}</span>
        </div>
        <div class="age-range-labels" aria-hidden="true"><span>13</span><span>85+</span></div>`;
    } else {
      h += `<div class="q-pills" role="group" aria-labelledby="q-${q.id}">`;
      q.o.forEach((o, i) => {
        const v   = q.v[i];
        const sel = cur === v;
        h += `
          <button class="q-pill${sel?' sel':''}"
                  aria-pressed="${sel}"
                  data-action="select-pill"
                  data-qid="${q.id}"
                  data-val="${v}"
          >${o}</button>`;
      });
      h += `</div>`;
    }
    h += `</div>`;
  });

  h += `
      <div class="btn-row">
        ${CQ > 0 ? '<button class="btn-ghost" data-action="q-back">← Back</button>' : ''}
        <button class="btn-primary" data-action="q-next">
          ${CQ === 0 ? 'Continue →' : 'Calculate my risk →'}
        </button>
      </div>
    </div>`;

  document.getElementById('app').innerHTML = h;
}

// ── STEP 4: CALCULATING ───────────────────────────────────
function renderCalc() {
  document.getElementById('app').innerHTML = `
    <div class="screen" style="text-align:center;">
      <div class="calc-ring" aria-hidden="true">
        <svg width="50" height="30" viewBox="0 0 100 60" aria-hidden="true">
          <path d="M3,30 Q22,4 50,4 L50,56 Q22,56 3,30 Z" fill="rgba(34,211,238,.3)"/>
          <path d="M50,4 Q78,4 97,30 Q78,56 50,56 Z" fill="none" stroke="rgba(34,211,238,.4)" stroke-width="3"/>
          <circle cx="50" cy="30" r="7" fill="rgba(34,211,238,.5)"/>
        </svg>
      </div>
      <h1 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:.5rem;">
        Calculating your risk profile
      </h1>
      <p style="font-size:13px;color:var(--muted);" aria-live="polite">
        Matching your profile against 7 threat actor models…
      </p>
    </div>`;
  setTimeout(() => {
    // Apply device flags and live patchScore to PR before scoring.
    // buildProfile() sets ip/id/an/mc/wn flags and patchScore — without this
    // the detect preview computes db=0 (no device boost) while dashboard gets
    // the full profile, causing a score mismatch.
    Object.assign(PR, buildProfile());
    SC = calcScores();
    ST = 5;
    render();
  }, 2000);
}

// ── STEP 5: RESULTS ───────────────────────────────────────
function renderResults() {
  const overall = Math.round(SC.reduce((s,a) => s + a.co, 0) / SC.length);
  const rc = overall >= 70 ? '#E24B4A' : overall >= 45 ? '#EF9F27' : '#22c55e';
  const rl = overall >= 70 ? 'High risk profile' : overall >= 45 ? 'Elevated risk profile' : 'Lower risk profile';
  const rd = overall >= 70
    ? 'Several threat actors have strong interest in your profile. Start with the quick wins below.'
    : overall >= 45
    ? 'Some threat actors find your profile moderately attractive. A few targeted changes will meaningfully reduce your exposure.'
    : 'Your profile is less attractive to most threat actors. These quick wins close the remaining gaps.';

  const GC = { technical:'#E24B4A', social:'#378ADD', financial:'#EF9F27' };
  const wins = getTopWins();

  let actorRows = SC.map(a => `
    <div class="actor-row">
      <div class="actor-dot" style="background:${GC[a.g]}" aria-hidden="true"></div>
      <span class="actor-name">${a.nm}</span>
      <div class="actor-bar-wrap" role="presentation">
        <div class="actor-bar-fill" style="width:${a.co}%;background:${GC[a.g]}"></div>
      </div>
      <span class="actor-score" style="color:${GC[a.g]}" aria-label="Score ${a.co} out of 99">${a.co}</span>
    </div>`).join('');

  let winCards = wins.map((w,i) => `
    <div class="win-card">
      <div class="win-num" aria-hidden="true">${i+1}</div>
      <div>
        <p class="win-title">${w.t}</p>
        <p class="win-where">${w.w}</p>
        <div class="win-chips">
          <span class="win-chip" style="background:rgba(34,211,238,.1);color:var(--cyan)">Risk: ${w.r}/10</span>
          <span class="win-chip" style="background:rgba(34,197,94,.1);color:var(--green)">Impact: None</span>
        </div>
      </div>
    </div>`).join('');

  document.getElementById('app').innerHTML = `
    <div class="screen" style="padding-bottom:2rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
        <p class="eyebrow" style="margin:0;">Your risk profile</p>
        <p style="font-size:11px;color:var(--muted);">${DV.name} · ${DV.os} ${DV.major}</p>
      </div>

      <div class="score-hero" role="region" aria-label="Overall risk score">
        <div class="score-ring" style="border-color:${rc}" aria-label="Risk score ${overall} out of 99">
          <span class="score-num" style="color:${rc}">${overall}</span>
          <span class="score-of">of 99</span>
        </div>
        <div>
          <h1 style="font-family:'Syne',sans-serif;font-size:17px;font-weight:700;margin-bottom:.3rem;">${rl}</h1>
          <p style="font-size:13px;color:var(--muted);line-height:1.55;">${rd}</p>
        </div>
      </div>

      <p class="eyebrow" style="margin:.75rem 0 .5rem;">Threat actor scores</p>
      <div class="actor-list" role="list" aria-label="Threat actor scores ranked by interest in your profile">
        ${actorRows}
      </div>

      <p class="wins-title">Top quick wins for your ${DV.name} — zero usage impact</p>
      ${winCards}

      <div class="btn-row" style="margin-top:1.5rem;">
        <button class="btn-primary" data-action="go-dashboard">Full plan →</button>
        <button class="btn-outline" data-action="go-save">Save results</button>
        <button class="btn-ghost" data-action="go-home">← Home</button>
      </div>
      <p style="text-align:center;margin-top:1rem;font-size:11px;color:var(--dim);">
        All calculations happen in your browser · Scores update as new CVEs are published
      </p>
    </div>`;
}

// ── STEP 6: SAVE ─────────────────────────────────────────
function renderSave() {
  if (!SID) SID = genId();
  document.getElementById('app').innerHTML = `
    <div class="screen">
      <div class="save-card">
        <h1 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:.4rem;">
          Save your results
        </h1>
        <p style="font-size:13px;color:var(--muted);line-height:1.6;">
          This is your private ID. Only you have this phrase — we cannot see it.
        </p>
        <div class="save-id-display" aria-label="Your private ID phrase">${SID}</div>
        <p style="font-size:12px;color:var(--muted);margin-bottom:.65rem;">Choose a 4-digit PIN:</p>
        <div class="pin-row" role="group" aria-label="4-digit PIN entry">
          <input class="pin-box" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]*"
                 aria-label="PIN digit 1" data-action="pin-input" data-idx="0">
          <input class="pin-box" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]*"
                 aria-label="PIN digit 2" data-action="pin-input" data-idx="1">
          <input class="pin-box" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]*"
                 aria-label="PIN digit 3" data-action="pin-input" data-idx="2">
          <input class="pin-box" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]*"
                 aria-label="PIN digit 4" data-action="pin-input" data-idx="3">
        </div>
        <div class="info-box">
          No recovery flow. If you lose your ID, start a fresh detection. We cannot access
          your data — and that's the point.
        </div>
        <div id="saveError" class="error-msg" role="alert">
          Something went wrong saving your results. Please try again.
        </div>
        <button class="btn-primary" style="width:100%;" data-action="do-save">
          Save and confirm →
        </button>
        <div style="margin-top:.65rem;">
          <button class="btn-ghost" style="font-size:12px;" data-action="skip-save">
            Skip — view results without saving
          </button>
        </div>
      </div>
    </div>`;
}

function moveFocus(el, idx) {
  if (el.value.length === 1) {
    const boxes = [...document.querySelectorAll('.pin-box')];
    if (idx < 3) boxes[idx + 1].focus();
    else el.blur();
  }
}

// ── SAVE TO API ───────────────────────────────────────────
async function doSave() {
  const pin = [...document.querySelectorAll('.pin-box')].map(b => b.value).join('');
  if (pin.length < 4) {
    document.querySelector('.pin-box').focus();
    return;
  }

  const btn = document.querySelector('.save-card .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  try {
    const resp = await fetch(`${API}/api/scan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scan_id: SID,
        pin,
        device: {
          type:         DV.type,
          os:           DV.os,
          major:        DV.major,
          patch:        DV.patch,
          full_version: DV.fullVersion || DV.major,
        },
        profile: {
          age_range:        PR.age,
          financial_status: PR.fin,
          tech_skill:       PR.tech,
          social_isolation: PR.iso,
          social_media_use: PR.sm,
          job_data:         PR.role,
          public_profile:   PR.pub,
          mdm_level:        PR.mdm,
          home_environment: PR.home,
          usage_context:    PR.usage,
        },
      }),
    });

    if (!resp.ok) throw new Error(`API returned ${resp.status}`);

    // Success — show confirmation
    document.getElementById('app').innerHTML = `
      <div class="screen" style="text-align:center;">
        <div style="width:60px;height:60px;border-radius:50%;background:rgba(34,211,238,.12);border:2px solid var(--cyan);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <path d="M5 13l6 6L21 7" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 style="font-family:'Syne',sans-serif;font-size:22px;font-weight:700;margin-bottom:.5rem;">Results saved</h1>
        <p style="font-size:13px;color:var(--muted);max-width:300px;margin:0 auto 1.5rem;line-height:1.65;">
          Return with your ID and PIN anytime to track completed remediations and see new threats.
        </p>
        <div class="save-id-display" aria-label="Your private ID: ${SID}">${SID}</div>
        <p style="font-size:11px;color:var(--dim);margin-bottom:1.5rem;">
          Store this phrase somewhere safe — a password manager, a note, or a photo.
        </p>
        <button class="btn-primary" data-action="go-dashboard">View my full plan →</button>
      </div>`;

  } catch (err) {
    console.error('Save failed:', err);
    const errEl = document.getElementById('saveError');
    if (errEl) errEl.style.display = 'block';
    if (btn) { btn.disabled = false; btn.textContent = 'Save and confirm →'; }
  }
}

// ── SESSION PROFILE BUILDER ───────────────────────────────
// Maps detect.html state (PR + DV) into the format dashboard.html and
// actor pages read from sessionStorage. Called before any navigation
// to dashboard.html or an actor detail page.
function buildProfile() {
  // Copy all 10 profile slider values
  const profile = { ...PR };

  // Store full OS version string for display and scoring
  profile.deviceFullVersion = DV.fullVersion || DV.major;

  // Default all device flags off
  profile.ip = false; profile.iosV = 1;
  profile.id = false; profile.ipadV = 1;
  profile.an = false; profile.anV  = 1;
  profile.mc = false; profile.mcV  = 1;
  profile.wn = false; profile.wnV  = 1;

  // Get live CVE stats for this platform — use actual patch score
  const stats  = CVE_STATS[DV.type] || {};
  const tiers  = stats.tiers || { current:{ps:0}, behind:{ps:15}, outdated:{ps:80} };
  const tier   = DV.patch === 'current' ? 'current' : DV.patch === 'behind' ? 'behind' : 'outdated';
  const livePs = tiers[tier]?.ps ?? 0;
  const liveWild = tiers[tier]?.wild ?? 0;

  // Store the actual patch score — replaces hardcoded version index tables in scoring.js
  profile.patchScore = livePs;
  profile.wildScore  = liveWild;
  profile.patchTier  = tier;

  // Keep legacy version indices for backward compatibility
  const vIdx = DV.patch === 'current' ? 1 : DV.patch === 'behind' ? 3 : 6;

  if (DV.type === 'iphone')  { profile.ip = true; profile.iosV  = vIdx; }
  if (DV.type === 'ipad')    { profile.id = true; profile.ipadV = vIdx; }
  if (DV.type === 'android') { profile.an = true; profile.anV   = vIdx; }
  if (DV.type === 'mac')     { profile.mc = true; profile.mcV   = vIdx; }
  if (DV.type === 'windows') { profile.wn = true; profile.wnV   = vIdx; }

  return profile;
}

function goToDashboard() {
  sessionStorage.setItem('mbg_profile', JSON.stringify(buildProfile()));
  window.location.href = 'dashboard.html';
}

// ── EVENT DELEGATION ─────────────────────────────────────
// Replaces all inline onclick/oninput/onkeydown handlers.
// CSP-compliant — no unsafe-inline in script-src needed.

document.addEventListener('click', e => {
  const el     = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  // Device confirm screen
  if (action === 'confirm-device') { ST = 2; render(); return; }
  if (action === 'correct-device') { TV = {}; renderCorrect(); return; }

  // Device type selection
  if (action === 'select-dtype') {
    TV.type = el.dataset.type;
    TV.os   = el.dataset.os;
    renderCorrectBuilds().catch(console.error);
    return;
  }

  // Version picker
  if (action === 'select-build') {
    selectBuild(el.dataset.v, el.dataset.p, el);
    return;
  }
  if (action === 'change-dtype') { renderCorrect(); return; }
  if (action === 'confirm-build') { applyCorrection(); return; }
  if (action === 'back-to-device') { ST = 1; render(); return; }

  // Profile questions
  if (action === 'select-pill') {
    const qid = el.dataset.qid;
    const val = +el.dataset.val;
    PR[qid] = val;
    el.closest('.q-pills').querySelectorAll('.q-pill').forEach(p => {
      p.classList.remove('sel');
      p.setAttribute('aria-pressed', 'false');
    });
    el.classList.add('sel');
    el.setAttribute('aria-pressed', 'true');
    return;
  }
  if (action === 'q-back') { CQ = 0; ST = 2; render(); return; }
  if (action === 'q-next') {
    if (CQ === 0) { CQ = 1; ST = 3; render(); }
    else          { ST = 4; render(); }
    return;
  }

  // Results screen
  if (action === 'go-dashboard') { goToDashboard(); return; }
  if (action === 'go-save')      { SID = genId(); ST = 6; render(); return; }
  if (action === 'go-home')      { window.location.href = '/'; return; }

  // Save screen
  if (action === 'do-save')   { doSave(); return; }
  if (action === 'skip-save') { ST = 5; render(); return; }
});

// Keyboard support for role=button elements (dtype-card, ver-card)
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const role = el.getAttribute('role');
  if (role === 'button') {
    e.preventDefault();
    el.click();
  }
});

// Age slider — uses input event not click
document.addEventListener('input', e => {
  if (e.target.dataset.action === 'age-slider') {
    PR.age = +e.target.value;
    const lbl = document.getElementById('ageVal');
    if (lbl) lbl.textContent = e.target.value;
    e.target.setAttribute('aria-valuenow', e.target.value);
    return;
  }
  if (e.target.dataset.action === 'pin-input') {
    moveFocus(e.target, +e.target.dataset.idx);
  }
});
function render() {
  renderDots();
  CQ = ST === 3 ? 1 : 0;

  if      (ST === 0) renderScan();
  else if (ST === 1) renderDevice();
  else if (ST === 2) { CQ = 0; renderQuestions(); }
  else if (ST === 3) { CQ = 1; renderQuestions(); }
  else if (ST === 4) renderCalc();
  else if (ST === 5) renderResults();
  else if (ST === 6) renderSave();
}

// ── BOOT ─────────────────────────────────────────────────
render();
