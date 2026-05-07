'use strict';

const API = 'https://api.mybadguy.com';

// ── ACTOR DEFINITIONS ─────────────────────────────────
const ACTORS = [
  { id:'apt',          name:'Nation-state / APT',   sub:'Espionage & intelligence', page:'actors/apt.html',
    g:'technical', gc:'#E24B4A', ab:'#D1ECF1', ac:'#0C447C', ini:'NS',
    tBase:97, sBase:52, cf:{age:.1,fin:.2,tech:.1,iso:.1,pub:.7,sm:.4,role:.95},
    ds:{ip:.95,id:.75,an:.85,mc:.80,wn:.90}, mdmW:.90, lw:{home:.10,usage:.85} },
  { id:'insider',      name:'Insider threat',        sub:'Org access abuse',         page:'actors/insider.html',
    g:'technical', gc:'#E24B4A', ab:'#EAF3DE', ac:'#27500A', ini:'IT',
    tBase:55, sBase:62, cf:{age:.1,fin:.3,tech:.2,iso:.2,pub:.4,sm:.3,role:.75},
    ds:{ip:.8,id:.7,an:.75,mc:.85,wn:.88}, mdmW:.95, lw:{home:.15,usage:.35} },
  { id:'broker',       name:'Data broker / adtech',  sub:'Passive data harvesting',  page:'actors/data-broker.html',
    g:'technical', gc:'#E24B4A', ab:'#E2D9F3', ac:'#3C3489', ini:'DB',
    tBase:42, sBase:35, cf:{age:.3,fin:.7,tech:-.2,iso:.1,pub:.5,sm:.85,role:.2},
    ds:{ip:.7,id:.8,an:.75,mc:.55,wn:.60}, mdmW:.10, lw:{home:.55,usage:.30} },
  { id:'stalker',      name:'Partner abuser',        sub:'Control & surveillance',   page:'actors/partner-abuser.html',
    g:'social',    gc:'#378ADD', ab:'#F8D7DA', ac:'#791F1F', ini:'IP',
    tBase:58, sBase:90, cf:{age:.2,fin:.1,tech:-.3,iso:.9,pub:.1,sm:.5,role:.1},
    ds:{ip:.9,id:.7,an:.85,mc:.5,wn:.4}, mdmW:.05, lw:{home:-.20,usage:.10} },
  { id:'scammer',      name:'Elder scammer',         sub:'Fraud & impersonation',    page:'actors/elder-scammer.html',
    g:'social',    gc:'#378ADD', ab:'#FDE8D8', ac:'#712B13', ini:'ES',
    tBase:22, sBase:88, cf:{age:.95,fin:.7,tech:-.9,iso:.85,pub:.1,sm:.3,role:.05},
    ds:{ip:.9,id:.6,an:.7,mc:.5,wn:.55}, mdmW:.02, lw:{home:.05,usage:.05} },
  { id:'cybercriminal',name:'Cybercriminal',          sub:'Financial gain',           page:'actors/cybercriminal.html',
    g:'financial', gc:'#EF9F27', ab:'#FFF3CD', ac:'#854F0B', ini:'CC',
    tBase:78, sBase:72, cf:{age:.6,fin:.9,tech:-.7,iso:.5,pub:.3,sm:.7,role:.2},
    ds:{ip:.85,id:.55,an:.80,mc:.70,wn:.75}, mdmW:.35, lw:{home:.35,usage:.45} },
  { id:'thief',        name:'Device thief',          sub:'Device theft & resale',    page:'actors/device-thief.html',
    g:'financial', gc:'#EF9F27', ab:'#F1EFE8', ac:'#444441', ini:'OT',
    tBase:35, sBase:45, cf:{age:.5,fin:.6,tech:-.8,iso:.2,pub:.4,sm:.2,role:.1},
    ds:{ip:.95,id:.3,an:.90,mc:.2,wn:.15}, mdmW:.08, lw:{home:.95,usage:.90} },
];

// ── ACTOR WINS ────────────────────────────────────────
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

// ── LABEL TABLES ─────────────────────────────────────
const FIN_L  = ['','Minimal assets','Some savings','Moderate wealth','Significant wealth','High net worth'];
const TECH_L = ['','Beginner','Basic','Intermediate','Advanced','Expert'];
const ISO_L  = ['','Severely isolated','Some isolation','Socially active','Well connected','Community leader'];
const SM_L   = ['','Never','Rarely','Sometimes','Often','Constantly'];
const ROLE_L = ['','No sensitive data','Some work data','Regular work data','Sensitive work data','Highly sensitive data'];
const PUB_L  = ['','Very private','Mostly private','Some public presence','Notable presence','Highly public'];
const MDM_L  = ['','Personal only','Work apps','Work email','Corp account','MDM enrolled'];
const HOME_L = ['','Rural','Suburban','Urban','Dense urban'];
const USAGE_L= ['','At home','Mostly home','Mixed','Mostly public','Always public'];

// ── SCORING ───────────────────────────────────────────
// Uses calcScore() from scoring.js (loaded before report.js)
function scoreColor(v) { return v>=70?'#E24B4A':v>=45?'#EF9F27':'#22c55e'; }
function score(a)  { return calcScore(a); }
function combo(a)  { return calcScore(a).co; }

function getWins(ranked) {
  const p = PR;
  const type = p.ip?'iphone':p.id?'ipad':p.an?'android':p.mc?'mac':p.wn?'windows':'iphone';
  const all  = ACTOR_WINS[type] || ACTOR_WINS.iphone;
  const topGroups = ranked.slice(0,3).map(a => a.g);
  return all
    .filter(w => topGroups.includes(w.g))
    .filter(w => {
      if ((p.patchTier === 'current' || p.patchScore === 0) &&
          w.t.toLowerCase().includes('update to the latest')) return false;
      return true;
    })
    .slice(0, 3);
}

// ── FETCH REMEDIATIONS ────────────────────────────────
async function fetchRem(actorId, platform) {
  const plt = platform === 'iphone' ? 'ios'
            : platform === 'ipad'   ? 'ipad'
            : platform === 'android'? 'android'
            : platform === 'mac'    ? 'mac'
            : 'windows';
  try {
    const r = await fetch(`${API}/api/actor/${actorId}/remediations?platform=${plt}&limit=8`);
    if (!r.ok) return [];
    const d = await r.json();
    return d.remediations || [];
  } catch (_) { return []; }
}

// ── RENDER ────────────────────────────────────────────
async function renderReport() {
  const p = PR;
  if (!p || (!p.ip && !p.id && !p.an && !p.mc && !p.wn)) {
    document.getElementById('report').innerHTML = `
      <div class="loading">
        <p>No detection profile found.</p>
        <p style="margin-top:.75rem;"><a href="detect.html">Run a detection first →</a></p>
      </div>`;
    return;
  }

  const devName   = p.ip?'iPhone':p.id?'iPad':p.an?'Android':p.mc?'Mac':p.wn?'Windows PC':'Unknown';
  const platform  = p.ip?'iphone':p.id?'ipad':p.an?'android':p.mc?'mac':'windows';
  const patchTier = p.patchTier || (p.patchScore===0?'current':p.patchScore<30?'behind':'outdated');
  const patchColor= patchTier==='current'?'#22c55e':patchTier==='behind'?'#EF9F27':'#E24B4A';
  const patchLabel= patchTier==='current'?'Up to date':patchTier==='behind'?'Update available':'End of life';
  const patchBg   = patchTier==='current'?'rgba(34,197,94,.12)':patchTier==='behind'?'rgba(239,159,39,.12)':'rgba(226,75,74,.12)';

  const IOS_V  = [{v:'iOS 26.4.2'},{v:'iOS 26.4'},{v:'iOS 26.3.x'},{v:'iOS 26.2'},{v:'iOS 26.1'},{v:'iOS 26.0'},{v:'iOS 18.4.x'},{v:'iOS 18.3.x'},{v:'iOS 18.2'},{v:'iOS 17.x'}];
  const IPAD_V = [{v:'iPadOS 26.4.2'},{v:'iPadOS 26.4'},{v:'iPadOS 26.3.x'},{v:'iPadOS 26.2'},{v:'iPadOS 26.0-26.1'},{v:'iPadOS 18.4.x'},{v:'iPadOS 18.x'},{v:'iPadOS 17.x'},{v:'iPadOS 16.x'}];
  const ANDROID_V=[{v:'Android 16'},{v:'Android 15'},{v:'Android 14'},{v:'Android 13'},{v:'Android 12'},{v:'Android 11'},{v:'Android 10'}];
  const MAC_V  = [{v:'macOS 26.4.1'},{v:'macOS 26.4'},{v:'macOS 26.3.x'},{v:'macOS 26.2'},{v:'macOS 26.0-26.1'},{v:'macOS 15.4.x'},{v:'macOS 15.x'},{v:'macOS 14.x'}];
  const WIN_V  = [{v:'Win 11 26H1'},{v:'Win 11 25H2'},{v:'Win 11 24H2'},{v:'Win 11 23H2'},{v:'Win 10 22H2'},{v:'Win 10 21H2'},{v:'Win 10 older'}];

  const devVer = p.deviceFullVersion || (p.ip?IOS_V[p.iosV-1]?.v:p.id?IPAD_V[p.ipadV-1]?.v:p.an?ANDROID_V[p.anV-1]?.v:p.mc?MAC_V[p.mcV-1]?.v:p.wn?WIN_V[p.wnV-1]?.v:'') || '';
  const chip   = (label, val) => `<div class="ro-row"><span class="ro-label">${label}</span><span class="ro-val">${val}</span></div>`;

  // Score all actors
  const ranked = ACTORS.map(a => ({...a, sc:score(a), co:combo(a)})).sort((a,b)=>b.co-a.co);
  const wins   = getWins(ranked);

  // Fetch all remediations in parallel
  const remData = await Promise.all(ACTORS.map(a => fetchRem(a.id, platform)));
  const REM = {};
  ACTORS.forEach((a, i) => { REM[a.id] = remData[i]; });

  let h = '';

  // ── PAGE HEADER ───────────────────────────────────────
  h += `<p class="eyebrow">Your full report</p>
  <h1 style="font-family:'Syne',sans-serif;font-size:clamp(22px,4vw,30px);font-weight:700;margin-bottom:.4rem;letter-spacing:-.01em;">
    ${devName} · <span style="color:${scoreColor(Math.round(ranked.reduce((s,a)=>s+a.co,0)/ranked.length))};">${Math.round(ranked.reduce((s,a)=>s+a.co,0)/ranked.length)}</span> overall
  </h1>
  <p style="font-size:13px;color:var(--muted);margin-bottom:1.75rem;">
    Generated from your detection on ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
  </p>`;

  // ── DETECTION SUMMARY ─────────────────────────────────
  h += `<p class="eyebrow">Detection</p>
  <div class="report-card">
    <div class="report-card-hdr"><span class="report-card-title">Device &amp; profile</span></div>
    <div class="dev-summary">
      <span class="dev-name-badge">${devName}</span>
      ${devVer ? `<span class="dev-ver-badge">${devVer}</span>` : ''}
      <span class="dev-patch-badge" style="background:${patchBg};color:${patchColor};">${patchLabel}</span>
      ${p.patchScore > 0 ? `<span class="dev-name-badge">Vulnerabilities</span><span class="dev-patch-badge" style="background:${patchBg};color:${patchColor};">${p.patchScore} CVEs</span>` : ''}
    </div>
    <div class="ro-grid">
      <div class="ro-section" style="grid-column:1/-1;">Personal</div>
      ${chip('Age', p.age)}
      ${chip('Financial', FIN_L[p.fin]||p.fin)}
      ${chip('Tech skill', TECH_L[p.tech]||p.tech)}
      ${chip('Social', ISO_L[p.iso]||p.iso)}
      ${chip('Social media', SM_L[p.sm]||p.sm)}
      <div class="profile-divider" style="grid-column:1/-1;margin:.5rem 0;"></div>
      <div class="ro-section" style="grid-column:1/-1;padding-top:0;">Work &amp; context</div>
      ${chip('Job data', ROLE_L[p.role+1]||'No work data')}
      ${chip('Public profile', PUB_L[p.pub+1]||'Very private')}
      ${chip('Work / MDM', MDM_L[p.mdm+1]||'Personal only')}
      ${chip('Home', HOME_L[p.home]||'Rural')}
      ${chip('Usage', USAGE_L[p.usage+1]||'At home')}
    </div>
  </div>`;

  // ── QUICK WINS ────────────────────────────────────────
  h += `<p class="eyebrow" style="margin-top:1.25rem;">Quick wins</p>
  <div class="report-card">
    <div class="report-card-hdr">
      <span class="report-card-title">Top quick wins for your ${devName}</span>
      <span class="report-card-sub">Zero usage impact</span>
    </div>`;
  wins.forEach((w, i) => {
    h += `<div class="win-row">
      <div class="win-num">${i+1}</div>
      <div>
        <div class="win-title">${w.t}</div>
        <div class="win-where">${w.w}</div>
      </div>
    </div>`;
  });
  h += `</div>`;

  // ── PER-ACTOR REPORTS ─────────────────────────────────
  h += `<p class="eyebrow" style="margin-top:1.25rem;">Threat actor recommendations</p>`;
  ranked.forEach(a => {
    const cc  = scoreColor(a.co);
    const cbg = a.co>=70?'rgba(226,75,74,.08)':a.co>=45?'rgba(239,159,39,.08)':'rgba(34,197,94,.08)';
    const lbl = a.co>=70?'High interest':a.co>=45?'Moderate interest':'Lower interest';
    const rems = REM[a.id] || [];

    h += `<div class="report-card" style="border-left:3px solid ${cc};margin-bottom:10px;">
      <div class="report-card-hdr">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="actor-avatar" style="background:${a.ab};color:${a.ac};">${a.ini}</div>
          <div>
            <span class="report-card-title">${a.name}</span>
            <span class="report-card-sub">${a.sub}</span>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:${cc};line-height:1;">${a.co}</div>
          <span style="font-size:10px;padding:2px 8px;border-radius:99px;background:${cbg};color:${cc};font-weight:600;">${lbl}</span>
        </div>
      </div>
      ${rems.length ? `
        <div style="margin-top:.85rem;">
          <div style="font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);margin-bottom:.5rem;">Recommendations</div>
          ${rems.map((r, i) => `
            <div class="rem-row">
              <div class="rem-num" style="background:${cbg};color:${cc};">${i+1}</div>
              <div style="flex:1;min-width:0;">
                <div class="win-title">${r.title}</div>
                <div class="win-where">${r.action}</div>
                ${r.why ? `<div style="font-size:11px;color:var(--dim);margin-top:2px;">${r.why}</div>` : ''}
              </div>
              ${r.source_label ? `<div style="font-size:10px;color:var(--dim);flex-shrink:0;padding-left:8px;text-align:right;max-width:80px;">${r.source_label}</div>` : ''}
            </div>`).join('')}
        </div>` : `
        <p style="margin-top:.65rem;font-size:12px;color:var(--dim);">No recommendations available for this actor.</p>`}
      <div style="margin-top:.85rem;text-align:right;">
        <a href="${a.page}" style="font-size:12px;color:var(--cyan);font-weight:500;">Full ${a.name} profile →</a>
      </div>
    </div>`;
  });

  h += `<div class="attribution">This product uses data from the NVD API but is not endorsed or certified by the NVD.</div>`;

  document.getElementById('report').innerHTML = h;
}

renderReport().catch(err => { console.error("Report error:", err); document.getElementById("report").innerHTML = `<div class="loading"><p>Error building report: ${err.message}</p><p style="margin-top:.75rem;"><a href="dashboard.html">← Back to dashboard</a></p></div>`; });
