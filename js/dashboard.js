'use strict';

// ── LOAD PROFILE ──────────────────────────────────────────
// Reads from sessionStorage if set by detect.html, otherwise uses defaults
let PR = JSON.parse(sessionStorage.getItem('mbg_profile') || 'null') || {
  age:42, fin:3, tech:2, iso:2, sm:2,
  role:1, pub:1, mdm:1, home:2, usage:1,
  ip:true,  iosV:1,
  id:false, ipadV:1,
  an:false, anV:1,
  mc:false, mcV:1,
  wn:false, wnV:1,
  patchScore:0, wildScore:0, patchTier:'current',
};

// ── VERSION LABEL RESOLUTION ──────────────────────────────
// Primary source: p.deviceFullVersion (set during detection).
// Fallback for old sessions: fetch latest version label from
// /api/os-versions/:platform and use patchTier to pick the label.
// KV-cached in the Worker — fast, always current from D1.
const _osVerCache = {};

async function resolveVersionLabel(p) {
  // New sessions always have deviceFullVersion — return immediately.
  if (p.deviceFullVersion) return p.deviceFullVersion;

  // Legacy sessions: derive platform and fetch from API.
  const platform = p.ip ? 'ios' : p.id ? 'ipad' : p.an ? 'android' : p.mc ? 'mac' : p.wn ? 'windows' : null;
  if (!platform) return '';

  try {
    if (!_osVerCache[platform]) {
      const r = await fetch(`${API}/api/os-versions/${platform}`);
      if (!r.ok) throw new Error(r.status);
      _osVerCache[platform] = await r.json();
    }
    const data  = _osVerCache[platform];
    const tier  = p.patchTier || 'behind';
    const vers  = data.versions || [];

    if (tier === 'current') {
      // Return the latest supported version string
      return data.current || vers.find(v => v.is_current)?.latest_version || '';
    }
    if (tier === 'outdated') {
      // Return the oldest supported or first EOL version label
      const eol = vers.find(v => !v.is_supported);
      return eol ? eol.label : (vers[vers.length - 1]?.label || '');
    }
    // 'behind' — return the second-most-recent supported version label
    const supported = vers.filter(v => v.is_supported);
    return (supported[1] || supported[0])?.label || '';
  } catch (_) {
    return '';
  }
}

// ── CHIP DISPLAY ──────────────────────────────────────────
// ── PROFILE DISPLAY LABELS ───────────────────────────────
// Fallback arrays — used if /api/questions is unavailable.
// Primary labels are loaded from D1 via loadQuestions() at init.
// To change a label: update D1 profile_answers table. No code deploy needed.
const FIN_L  =['','Struggling','Working class','Middle income','Doing well','High wealth'];
const FIN_S  =['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];
const TECH_L =['','Not at all','Basic user','Moderate','Tech-savvy','Expert / IT'];
const TECH_S =['','background:#FCEBEB;color:#A32D2D','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A'];
const ISO_L  =['','Very isolated','Somewhat isolated','Active','Well connected','Community leader'];
const ISO_S  =['','background:#FCEBEB;color:#A32D2D','background:#FAEEDA;color:#854F0B','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A'];
const SM_L   =['','Never use it','Occasional','Regular','Heavy user','Influencer / public'];
const SM_S   =['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];
const ROLE_L =['','No work data','Some work apps','Work email & files','Sensitive / regulated','Executive / gov'];
const ROLE_S =['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];
const PUB_L  =['','Very private','Low profile','Moderate','High visibility','Very public'];
const PUB_S  =['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];
const MDM_L  =['','Personal only','Work apps installed','Work email linked','Corporate account','MDM enrolled'];
const MDM_S  =['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];
const HOME_L =['','Rural','Suburban','Urban','Dense urban'];
const HOME_S =['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];
const USAGE_L=['','Mostly at home','Work / commute','Often in public','Frequent travel','International'];
const USAGE_S=['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];

// ── DYNAMIC LABEL LOADER ──────────────────────────────────
// Q_LABELS is populated from /api/questions at init.
// Maps question_id → { value: label } for O(1) lookup.
let Q_LABELS = {};

async function loadQuestions() {
  try {
    const r = await fetch('https://api.mybadguy.com/api/questions');
    if (!r.ok) return;
    const data = await r.json();
    for (const [qid, answers] of Object.entries(data.answers || {})) {
      Q_LABELS[qid] = {};
      for (const a of answers) { Q_LABELS[qid][a.value] = a.label; }
    }
  } catch (_) { /* use fallback arrays */ }
}

// Get label for a profile field — API first, fallback to static array
function qLabel(id, value, fallbackArr) {
  if (Q_LABELS[id] && Q_LABELS[id][value] !== undefined) return Q_LABELS[id][value];
  return fallbackArr[value] || String(value);
}


// ── ACTOR DEFINITIONS (scores only — full detail in actor pages) ──
// ── ACTOR CONFIGS (live from API, fallback to hardcoded) ──
const ACTORS_FALLBACK = [
  { id:'apt',          name:'Nation-state / APT',      sub:'Espionage & intelligence', page:'actors/apt.html',
    g:'technical', gc:'#E24B4A', ab:'#D1ECF1', ac:'#0C447C', ini:'NS',
    tBase:97, sBase:52, cf:{age:.1,fin:.2,tech:.1,iso:.1,pub:.7,sm:.4,role:.95},
    ds:{ip:.95,id:.75,an:.85,mc:.80,wn:.90}, mdmW:.90, lw:{home:.10,usage:.85} },
  { id:'insider',      name:'Insider threat',          sub:'Org access abuse',         page:'actors/insider.html',
    g:'technical', gc:'#E24B4A', ab:'#EAF3DE', ac:'#27500A', ini:'IT',
    tBase:55, sBase:62, cf:{age:.1,fin:.3,tech:.2,iso:.2,pub:.4,sm:.3,role:.75},
    ds:{ip:.8,id:.7,an:.75,mc:.85,wn:.88}, mdmW:.95, lw:{home:.15,usage:.35} },
  { id:'broker',       name:'Data broker / adtech',    sub:'Passive data harvesting',  page:'actors/data-broker.html',
    g:'technical', gc:'#E24B4A', ab:'#E2D9F3', ac:'#3C3489', ini:'DB',
    tBase:42, sBase:35, cf:{age:.3,fin:.7,tech:-.2,iso:.1,pub:.5,sm:.85,role:.2},
    ds:{ip:.7,id:.8,an:.75,mc:.55,wn:.60}, mdmW:.10, lw:{home:.55,usage:.30} },
  { id:'stalker',      name:'Partner abuser',          sub:'Control & surveillance',   page:'actors/partner-abuser.html',
    g:'social', gc:'#378ADD', ab:'#F8D7DA', ac:'#791F1F', ini:'IP',
    tBase:58, sBase:90, cf:{age:.2,fin:.1,tech:-.3,iso:.9,pub:.1,sm:.5,role:.1},
    ds:{ip:.9,id:.7,an:.85,mc:.5,wn:.4}, mdmW:.05, lw:{home:-.20,usage:.10} },
  { id:'scammer',      name:'Elder scammer',           sub:'Fraud & impersonation',    page:'actors/elder-scammer.html',
    g:'social', gc:'#378ADD', ab:'#FDE8D8', ac:'#712B13', ini:'ES',
    tBase:22, sBase:88, cf:{age:.95,fin:.7,tech:-.9,iso:.85,pub:.1,sm:.3,role:.05},
    ds:{ip:.9,id:.6,an:.7,mc:.5,wn:.55}, mdmW:.02, lw:{home:.05,usage:.05} },
  { id:'cybercriminal',name:'Cybercriminal',            sub:'Financial gain',           page:'actors/cybercriminal.html',
    g:'financial', gc:'#EF9F27', ab:'#FFF3CD', ac:'#854F0B', ini:'CC',
    tBase:78, sBase:72, cf:{age:.6,fin:.9,tech:-.7,iso:.5,pub:.3,sm:.7,role:.2},
    ds:{ip:.85,id:.55,an:.80,mc:.70,wn:.75}, mdmW:.35, lw:{home:.35,usage:.45} },
  { id:'thief',        name:'Device thief',            sub:'Device theft & resale',    page:'actors/device-thief.html',
    g:'financial', gc:'#EF9F27', ab:'#F1EFE8', ac:'#444441', ini:'OT',
    tBase:35, sBase:45, cf:{age:.5,fin:.6,tech:-.8,iso:.2,pub:.4,sm:.2,role:.1},
    ds:{ip:.95,id:.3,an:.90,mc:.2,wn:.15}, mdmW:.08, lw:{home:.95,usage:.90} },
];

// ── SCORING ENGINE ────────────────────────────────────────
function devBoost(a) {
  const p = PR;
  const ps = p.patchScore || 0;
  const ws = p.wildScore  || 0;
  const effectivePs = (ps - ws) + (ws * 1.5);
  let b = 0;
  if (p.ip) b += effectivePs * a.ds.ip * 0.25;
  if (p.id) b += effectivePs * a.ds.id * 0.18;
  if (p.an) b += effectivePs * a.ds.an * 0.22;
  if (p.mc) b += effectivePs * a.ds.mc * 0.16;
  if (p.wn) b += effectivePs * a.ds.wn * 0.20;
  return Math.round(b);
}
function mdmBoost(a) { return Math.round(((PR.mdm-1)/4) * a.mdmW * 22); }
function locBoost(a) {
  const hn=(PR.home-1)/3, un=(PR.usage-1)/4;
  const hc=a.lw.home<0?Math.round((1-hn)*Math.abs(a.lw.home)*14):Math.round(hn*a.lw.home*14);
  return Math.max(0, hc + Math.round(un*a.lw.usage*18));
}
function conBoost(a) {
  const p=PR,f=a.cf;
  const an=p.age<=25?(25-p.age)/12:p.age>=65?(p.age-65)/20:0;
  return Math.round(f.age*an*12+f.fin*(p.fin-1)*3+f.tech*(3-p.tech)*3+f.iso*(p.iso-1)*4+f.pub*(p.pub-1)*3+f.sm*(p.sm-1)*3+f.role*(p.role-1)*5);
}
function score(a) {
  const cb=conBoost(a),db=devBoost(a),mb=mdmBoost(a),lb=locBoost(a);
  return {
    t: Math.min(99,Math.max(1, a.tBase + Math.round(cb*.5) + db + mb + lb)),
    s: Math.min(99,Math.max(1, a.sBase + Math.round(cb*.5))),
  };
}
function combo(a) { const s=score(a); return Math.round((s.t+s.s)/2); }
function scoreColor(v) { return v>=70?'#C41230':v>=45?'#7a4e00':'#007A53'; }

// ── TOP QUICK WINS ────────────────────────────────────────
const ACTOR_WINS = {
  iphone: [
    {t:'Enable Stolen Device Protection',        w:'Settings → Face ID & Passcode → Stolen Device Protection', g:'financial'},
    {t:'Enable two-factor authentication',       w:'Settings → [Your Name] → Password & Security → Two-Factor Authentication', g:'financial'},
    {t:'Disable cross-app tracking',             w:'Settings → Privacy & Security → Tracking → turn Off', g:'technical'},
    {t:'Update to the latest iOS',               w:'Settings → General → Software Update', g:'technical'},
    {t:'Silence Unknown Callers',                w:'Settings → Phone → Silence Unknown Callers → On', g:'social'},
    {t:'Restrict location to While Using only',  w:'Settings → Privacy & Security → Location Services', g:'technical'},
    {t:'Use Face ID in public',                  w:'Never enter your passcode where someone can watch', g:'financial'},
    {t:'Use unique passwords for every account', w:'Settings → Passwords → use the built-in generator', g:'financial'},
  ],
  ipad: [
    {t:'Enable two-factor authentication',       w:'Settings → [Your Name] → Password & Security → Two-Factor Authentication', g:'financial'},
    {t:'Disable cross-app tracking',             w:'Settings → Privacy & Security → Tracking → turn Off', g:'technical'},
    {t:'Update to the latest iPadOS',            w:'Settings → General → Software Update', g:'technical'},
    {t:'Set a strong alphanumeric passcode',     w:'Settings → Face ID & Passcode → Change Passcode → Custom Alphanumeric', g:'financial'},
    {t:'Restrict location to While Using only',  w:'Settings → Privacy & Security → Location Services', g:'technical'},
    {t:'Use unique passwords for every account', w:'Settings → Passwords → use the built-in generator', g:'financial'},
    {t:'Enable iCloud Backup',                   w:'Settings → [Your Name] → iCloud → iCloud Backup → On', g:'technical'},
  ],
  android: [
    {t:'Enable two-factor authentication',       w:'Google account → Security → 2-Step Verification', g:'financial'},
    {t:'Update to the latest Android version',   w:'Settings → About phone → Software update', g:'technical'},
    {t:'Use Google Play Protect',                w:'Google Play Store → Profile icon → Play Protect → turn On', g:'technical'},
    {t:'Only install apps from Google Play',     w:'Settings → Apps → Special app access → Install unknown apps — deny all', g:'technical'},
    {t:'Set a strong screen lock',               w:'Settings → Security → Screen lock → Password or PIN (6+ digits)', g:'financial'},
    {t:'Review app permissions',                 w:'Settings → Privacy → Permission manager — revoke unnecessary access', g:'technical'},
    {t:'Use unique passwords for every account', w:'Settings → Passwords & accounts or use Google Password Manager', g:'financial'},
  ],
  mac: [
    {t:'Enable FileVault disk encryption',       w:'System Settings → Privacy & Security → FileVault → Turn On', g:'technical'},
    {t:'Enable two-factor authentication',       w:'System Settings → [Your Name] → Password & Security → Two-Factor Authentication', g:'financial'},
    {t:'Update to the latest macOS',             w:'System Settings → General → Software Update', g:'technical'},
    {t:'Enable the Firewall',                    w:'System Settings → Network → Firewall → turn On', g:'technical'},
    {t:'Lock screen when stepping away',         w:'System Settings → Lock Screen → Require password → Immediately', g:'financial'},
    {t:'Review app privacy permissions',         w:'System Settings → Privacy & Security — review Camera, Microphone, Location', g:'technical'},
    {t:'Use unique passwords for every account', w:'System Settings → Passwords → use the built-in generator', g:'financial'},
  ],
  windows: [
    {t:'Enable BitLocker disk encryption',       w:'Start → Settings → Privacy & Security → Device Encryption → turn On', g:'technical'},
    {t:'Enable two-factor authentication',       w:'Microsoft account → Security → Advanced security → Two-step verification', g:'financial'},
    {t:'Keep Windows Update current',            w:'Start → Settings → Windows Update → Check for updates', g:'technical'},
    {t:'Enable Windows Defender Firewall',       w:'Start → Settings → Privacy & Security → Windows Security → Firewall', g:'technical'},
    {t:'Use unique passwords for every account', w:'Use Microsoft Edge built-in password manager or a dedicated password manager', g:'financial'},
    {t:'Lock your screen when stepping away',    w:'Windows key + L to instantly lock', g:'financial'},
    {t:'Review app permissions',                 w:'Start → Settings → Privacy & Security → App permissions — review Camera, Microphone, Location', g:'technical'},
  ],
};

function getWins(ranked) {
  const p = PR;
  const type = p.ip?'iphone':p.id?'ipad':p.an?'android':p.mc?'mac':p.wn?'windows':'iphone';
  const all  = ACTOR_WINS[type] || ACTOR_WINS.iphone;
  const topGroups = ranked.slice(0,3).map(a => a.g);
  return all
    .filter(w => topGroups.includes(w.g))
    .filter(w => {
      // Don't suggest updating the OS if already fully patched
      if ((p.patchTier === 'current' || p.patchScore === 0) &&
          w.t.toLowerCase().includes('update to the latest')) return false;
      return true;
    })
    .slice(0, 3);
}

// ── PROFILE CHIP UPDATE ───────────────────────────────────
function sc(id, text, style) {
  const el = document.getElementById(id);
  if (el) { el.textContent = text; el.style.cssText = style; }
}

// ── SAVE PROFILE TO SESSION ───────────────────────────────
function saveProfile() {
  sessionStorage.setItem('mbg_profile', JSON.stringify(PR));
}

// ── MAIN RENDER ───────────────────────────────────────────
async function render() {
  saveProfile();
  const p = PR;

  // Score and rank all actors
  const ranked = ACTORS.map(a => ({...a, sc:score(a), co:combo(a)}))
                        .sort((a,b)=>b.co-a.co);
  const overall = Math.round(ranked.reduce((s,a)=>s+a.co,0)/ranked.length);
  const overallColor = scoreColor(overall);
  const overallLabel = overall>=70?'High combined risk profile':overall>=45?'Medium combined risk profile':'Low combined risk profile';
  const wins = getWins(ranked);

  // Group actors
  const groups = [
    {id:'technical',label:'Technical threat actors',bc:'#E24B4A',hbg:'#FCEBEB',htc:'#791F1F'},
    {id:'social',   label:'Social threat actors',   bc:'#378ADD',hbg:'#E6F1FB',htc:'#0C447C'},
    {id:'financial',label:'Financial threat actors', bc:'#EF9F27',hbg:'#FAEEDA',htc:'#633806'},
  ];

  let h = '';

  // ── OVERALL SCORE ─────────────────────────────────────
  h += `<div class="eyebrow">Threat dashboard</div>
  <div class="score-hero">
    <div class="score-ring" style="border-color:${overallColor};">
      <span class="score-num" style="color:${overallColor};">${overall}</span>
      <span class="score-of">of 99</span>
    </div>
    <div>
      <h1 style="font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:.3rem;">${overallLabel}</h1>
      <p style="font-size:13px;color:#555;line-height:1.6;max-width:440px;">
        ${overall>=70?'Several threat actors have strong interest in your profile. Review each actor below and work through their remediation steps.':
          overall>=45?'Some threat actors find your profile moderately attractive. Start with the highest-scored actors.':
          'Your profile is less attractive to most threat actors. A few targeted changes close the remaining gaps.'}
      </p>
      <div style="margin-top:.75rem;display:flex;gap:8px;flex-wrap:wrap;">
        ${ranked.slice(0,3).map(a=>`<span style="font-size:13px;padding:3px 9px;border-radius:99px;background:${a.gc}22;color:${a.gc};font-weight:500;">${a.name}: ${a.co}</span>`).join('')}
      </div>
    </div>
  </div>`;

  // Device/patch vars
  const devName   = p.ip?'iPhone':p.id?'iPad':p.an?'Android':p.mc?'Mac':p.wn?'Windows PC':'Unknown';
  const devVer    = await resolveVersionLabel(p);
  const patchTier = p.patchTier || (p.patchScore===0?'current':p.patchScore<30?'behind':'outdated');
  const patchColor= patchTier==='current'?'#007A53':patchTier==='behind'?'#7a4e00':'#C41230';
  const patchLabel= patchTier==='current'?'Up to date':patchTier==='behind'?'Update available':'End of life';
  const patchBg   = patchTier==='current'?'rgba(34,197,94,.12)':patchTier==='behind'?'rgba(239,159,39,.12)':'rgba(226,75,74,.12)';
  const chip = (label, val) => `<div class="ro-row"><span class="ro-label">${label}</span><span class="ro-val">${val}</span></div>`;

  // ── PROFILE CARD ──────────────────────────────────────
  h += `<div class="eyebrow" style="margin-top:.25rem;">Your profile</div>
  <div class="profile-card">
    <div class="profile-title">
      <span>Detection profile</span>
      <a href="detect.html" class="update-pill">Update profile →</a>
    </div>
    <div class="dev-summary">
      <span class="dev-name-badge">${devName}</span>
      ${devVer ? `<span class="dev-ver-badge" style="background:${patchBg};color:${patchColor};">${devVer} · ${patchLabel}</span>` : `<span class="dev-patch-badge" style="background:${patchBg};color:${patchColor};">${patchLabel}</span>`}
      <span id="dash-cve-badge"></span>
    </div>
    <div class="ro-grid">
      <div class="ro-section" style="grid-column:1/-1;">Personal</div>
      ${chip('Age', p.age)}
      ${chip('Financial',    qLabel('fin',   p.fin,   FIN_L))}
      ${chip('Tech skill',   qLabel('tech',  p.tech,  TECH_L))}
      ${chip('Social',       qLabel('iso',   p.iso,   ISO_L))}
      ${chip('Social media', qLabel('sm',    p.sm,    SM_L))}
      <div class="profile-divider" style="grid-column:1/-1;margin:.5rem 0;"></div>
      <div class="ro-section" style="grid-column:1/-1;padding-top:0;">Work &amp; context</div>
      ${chip('Job data',   qLabel('role',  p.role,  ROLE_L))}
      ${chip('Public profile', qLabel('pub', p.pub, PUB_L))}
      ${chip('Work / MDM', qLabel('mdm', p.mdm,  MDM_L))}
      ${chip('Home',         qLabel('home',  p.home,  HOME_L))}
      ${chip('Usage',        qLabel('usage', p.usage, USAGE_L))}
    </div>
  </div>`;

  // ── ACTOR GROUPS ──────────────────────────────────────
  h += `<div class="eyebrow" style="margin-top:.25rem;">Threat actors — tap any card for details and remediations</div>`;
  groups.forEach(g => {
    const groupActors = ranked.filter(a => a.g === g.id);
    if (!groupActors.length) return;
    h += `<div class="group-block">
      <div class="group-hdr" style="background:${g.hbg};border-left-color:${g.bc};">
        <span class="group-hdr-label" style="color:${g.htc};">${g.label}</span>
        <span class="group-hdr-avg" style="color:${g.htc};">${groupActors.length} actor${groupActors.length>1?'s':''}</span>
      </div>
      <div class="actor-grid">`;
    groupActors.forEach(a => {
      const cc  = scoreColor(a.co);
      const cbg = a.co>=70?'rgba(226,75,74,.1)':a.co>=45?'rgba(239,159,39,.1)':'rgba(34,197,94,.1)';
      const lbl = a.co>=70?'High':a.co>=45?'Medium':'Low';
      const isTop = a === ranked[0]; // highest overall actor gets accent border
      h += `<a class="actor-card${isTop?' actor-card-top':''}" href="${a.page}"
          style="${isTop?`border-color:${cc};border-width:2px;`:''}"
          onclick="saveProfile()">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.65rem;">
            <div class="actor-avatar" style="background:${a.ab};color:${a.ac};">${a.ini}</div>
            <span style="font-size:12px;padding:2px 8px;border-radius:99px;background:${cbg};color:${cc};font-weight:600;">${lbl}</span>
          </div>
          <div class="actor-score" style="color:${cc};">${a.co}</div>
          <div class="actor-name" style="margin:.15rem 0 .1rem;">${a.name}</div>
          <div class="actor-sub">${a.sub}</div>
          <div style="margin-top:.75rem;height:3px;background:#dde3ea;border-radius:99px;overflow:hidden;">
            <div style="height:100%;width:${a.co}%;background:${cc};border-radius:99px;"></div>
          </div>
          <div style="font-size:13px;color:#003F72;font-weight:500;margin-top:.65rem;text-align:center;">Tap for details →</div>
        </a>`;
    });
    h += `</div></div>`;
  });

  // ── FULL REPORT CTA ──────────────────────────────────
  h += `<div class="eyebrow" style="margin-top:.25rem;">Actions</div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1.25rem;">
    <a href="report.html" onclick="saveProfile()" style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;padding:10px 22px;border-radius:99px;background:#e8f0f8;color:#003F72;text-decoration:none;transition:opacity .15s;white-space:nowrap;">Combined Risk Details →</a>
    <button onclick="openSaveModal()" style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;padding:10px 22px;border-radius:99px;background:transparent;color:#1a1a1a;border:1.5px solid rgba(255,255,255,.18);cursor:pointer;transition:border-color .15s;white-space:nowrap;">Save results</button>
    <a href="detect.html" style="font-family:'Syne',sans-serif;font-size:13px;font-weight:500;padding:10px 22px;border-radius:99px;background:transparent;color:#555;border:1.5px solid #dde3ea;text-decoration:none;white-space:nowrap;">New detection →</a>
  </div>`;

  h += `<div class="attribution">This product uses data from the NVD API but is not endorsed or certified by the NVD.</div>`;

  document.getElementById('page').innerHTML = h;

  // Fetch version-specific CVE count after DOM is ready
  const _dashPlatform = p.ip?'iphone':p.id?'ipad':p.an?'android':p.mc?'mac':'windows';
  const _dashVersion  = p.deviceFullVersion || null;
  if (_dashVersion && _dashPlatform) {
    let latestVer = _dashVersion;
    try {
      const ovResp = await fetch(`https://api.mybadguy.com/api/os-versions/${_dashPlatform}`);
      if (ovResp.ok) {
        const ovData = await ovResp.json();
        const major  = String(parseInt(_dashVersion));
        const cycle  = (ovData.versions || []).find(v => String(v.cycle) === major);
        if (cycle?.latest_version) latestVer = cycle.latest_version;
      }
    } catch(_) {}
    fetchCveDelta(_dashPlatform, _dashVersion, latestVer, patchBg, patchColor, 'dash-cve-badge', 'https://api.mybadguy.com');
  }
}

// ── ASYNC INIT ────────────────────────────────────────────
// Fetches actor scoring configs from D1 via API.
// Falls back to hardcoded ACTORS_FALLBACK if API unavailable.
// Configs are cached in sessionStorage for the session duration.
let ACTORS = ACTORS_FALLBACK;

async function init() {
  try {
    const cached = sessionStorage.getItem('mbg_actor_configs');
    if (cached) {
      const parsed = JSON.parse(cached);
      // Merge API scoring fields into ACTORS_FALLBACK (preserving page/gc/ab/ac/ini display props)
      ACTORS = mergeConfigs(ACTORS_FALLBACK, parsed);
    } else {
      const r = await fetch('https://api.mybadguy.com/api/actor-configs');
      if (r.ok) {
        const apiConfigs = await r.json();
        sessionStorage.setItem('mbg_actor_configs', JSON.stringify(apiConfigs));
        ACTORS = mergeConfigs(ACTORS_FALLBACK, apiConfigs);
      }
    }
  } catch (_) {
    // API unavailable — ACTORS already set to ACTORS_FALLBACK
  }
  await loadQuestions();
  await render();
}

// Merge live scoring weights into the full actor display objects.
// The API returns {id,tBase,sBase,cf,ds,mdmW,lw} per actor.
// ACTORS_FALLBACK has those plus display props (page, gc, ab, ac, ini, name, sub).
function mergeConfigs(fallback, apiConfigs) {
  return fallback.map(actor => {
    const live = apiConfigs.find(c => c.id === actor.id);
    if (!live) return actor;
    return { ...actor, tBase: live.tBase, sBase: live.sBase,
             cf: live.cf, ds: live.ds, mdmW: live.mdmW, lw: live.lw };
  });
}

init();
