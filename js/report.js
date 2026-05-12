'use strict';

const API = 'https://api.mybadguy.com';

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

const ACTOR_WINS = {
  iphone:[
    {t:'Enable Stolen Device Protection',w:'Settings > Face ID & Passcode > Stolen Device Protection',g:'financial'},
    {t:'Enable two-factor authentication',w:'Settings > [Your Name] > Password & Security > Two-Factor Authentication',g:'financial'},
    {t:'Disable cross-app tracking',w:'Settings > Privacy & Security > Tracking > turn Off',g:'technical'},
    {t:'Update to the latest iOS',w:'Settings > General > Software Update',g:'technical'},
    {t:'Silence Unknown Callers',w:'Settings > Phone > Silence Unknown Callers > On',g:'social'},
    {t:'Restrict location to While Using only',w:'Settings > Privacy & Security > Location Services',g:'technical'},
    {t:'Use Face ID in public',w:'Never enter your passcode where someone can watch',g:'financial'},
    {t:'Use unique passwords for every account',w:'Settings > Passwords > use the built-in generator',g:'financial'},
  ],
  ipad:[
    {t:'Enable two-factor authentication',w:'Settings > [Your Name] > Password & Security > Two-Factor Authentication',g:'financial'},
    {t:'Disable cross-app tracking',w:'Settings > Privacy & Security > Tracking > turn Off',g:'technical'},
    {t:'Update to the latest iPadOS',w:'Settings > General > Software Update',g:'technical'},
    {t:'Set a strong alphanumeric passcode',w:'Settings > Face ID & Passcode > Change Passcode > Custom Alphanumeric',g:'financial'},
    {t:'Restrict location to While Using only',w:'Settings > Privacy & Security > Location Services',g:'technical'},
    {t:'Use unique passwords for every account',w:'Settings > Passwords > use the built-in generator',g:'financial'},
    {t:'Enable iCloud Backup',w:'Settings > [Your Name] > iCloud > iCloud Backup > On',g:'technical'},
  ],
  android:[
    {t:'Enable two-factor authentication',w:'Google account > Security > 2-Step Verification',g:'financial'},
    {t:'Update to the latest Android version',w:'Settings > About phone > Software update',g:'technical'},
    {t:'Use Google Play Protect',w:'Google Play Store > Profile icon > Play Protect > turn On',g:'technical'},
    {t:'Only install apps from Google Play',w:'Settings > Apps > Special app access > Install unknown apps - deny all',g:'technical'},
    {t:'Set a strong screen lock',w:'Settings > Security > Screen lock > Password or PIN (6+ digits)',g:'financial'},
    {t:'Review app permissions',w:'Settings > Privacy > Permission manager - revoke unnecessary access',g:'technical'},
    {t:'Use unique passwords for every account',w:'Settings > Passwords & accounts or use Google Password Manager',g:'financial'},
  ],
  mac:[
    {t:'Enable FileVault disk encryption',w:'System Settings > Privacy & Security > FileVault > Turn On',g:'technical'},
    {t:'Enable two-factor authentication',w:'System Settings > [Your Name] > Password & Security > Two-Factor Authentication',g:'financial'},
    {t:'Update to the latest macOS',w:'System Settings > General > Software Update',g:'technical'},
    {t:'Enable the Firewall',w:'System Settings > Network > Firewall > turn On',g:'technical'},
    {t:'Lock screen when stepping away',w:'System Settings > Lock Screen > Require password > Immediately',g:'financial'},
    {t:'Review app privacy permissions',w:'System Settings > Privacy & Security - review Camera, Microphone, Location',g:'technical'},
    {t:'Use unique passwords for every account',w:'System Settings > Passwords > use the built-in generator',g:'financial'},
  ],
  windows:[
    {t:'Enable BitLocker disk encryption',w:'Start > Settings > Privacy & Security > Device Encryption > turn On',g:'technical'},
    {t:'Enable two-factor authentication',w:'Microsoft account > Security > Advanced security > Two-step verification',g:'financial'},
    {t:'Keep Windows Update current',w:'Start > Settings > Windows Update > Check for updates',g:'technical'},
    {t:'Enable Windows Defender Firewall',w:'Start > Settings > Privacy & Security > Windows Security > Firewall',g:'technical'},
    {t:'Use unique passwords for every account',w:'Use Microsoft Edge built-in password manager or a dedicated password manager',g:'financial'},
    {t:'Lock your screen when stepping away',w:'Windows key + L to instantly lock',g:'financial'},
    {t:'Review app permissions',w:'Start > Settings > Privacy & Security > App permissions',g:'technical'},
  ],
};

// ── PROFILE DISPLAY LABELS ───────────────────────────────
// Fallback arrays — used if /api/questions is unavailable.
// Primary labels loaded from D1 via loadQuestions() at init.
const FIN_L  =['','Struggling','Working class','Middle income','Doing well','High wealth'];
const TECH_L =['','Not at all','Basic user','Moderate','Tech-savvy','Expert / IT'];
const ISO_L  =['','Very isolated','Somewhat isolated','Active','Well connected','Community leader'];
const SM_L   =['','Never use it','Occasional','Regular','Heavy user','Influencer / public'];
const ROLE_L =['','No work data','Some work apps','Work email & files','Sensitive / regulated','Executive / gov'];
const PUB_L  =['','Very private','Low profile','Moderate','High visibility','Very public'];
const MDM_L  =['','Personal only','Work apps installed','Work email linked','Corporate account','MDM enrolled'];
const HOME_L =['','Rural','Suburban','Urban','Dense urban'];
const USAGE_L=['','Mostly at home','Work / commute','Often in public','Frequent travel','International'];

// Dynamic label map from /api/questions
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
  } catch (_) {}
}

function qLabel(id, value, fallbackArr) {
  if (Q_LABELS[id] && Q_LABELS[id][value] !== undefined) return Q_LABELS[id][value];
  return fallbackArr[value] || String(value);
}

// ── VERSION LABEL RESOLUTION ──────────────────────────────
// Primary source: p.deviceFullVersion (set during detection).
// Fallback for old sessions: fetch latest version label from
// /api/os-versions/:platform — always current from D1.
const _osVerCache = {};

async function resolveVersionLabel(p) {
  if (p.deviceFullVersion) return p.deviceFullVersion;
  const platform = p.ip ? 'iphone' : p.id ? 'ipad' : p.an ? 'android' : p.mc ? 'mac' : p.wn ? 'windows' : null;
  if (!platform) return '';
  try {
    if (!_osVerCache[platform]) {
      const r = await fetch(`${API}/api/os-versions/${platform}`);
      if (!r.ok) throw new Error(r.status);
      _osVerCache[platform] = await r.json();
    }
    const data = _osVerCache[platform];
    const tier = p.patchTier || 'behind';
    const vers = data.versions || [];
    if (tier === 'current')  return data.current || vers.find(v => v.is_current)?.latest_version || '';
    if (tier === 'outdated') {
      const eol = vers.find(v => !v.is_supported);
      return eol ? eol.label : (vers[vers.length - 1]?.label || '');
    }
    const supported = vers.filter(v => v.is_supported);
    return (supported[1] || supported[0])?.label || '';
  } catch (_) { return ''; }
}

function scoreColor(v){ return v>=70?'#E24B4A':v>=45?'#EF9F27':'#22c55e'; }

const TACTIC_LABELS={
  'initial-access':'Initial Access','execution':'Execution','persistence':'Persistence',
  'privilege-escalation':'Privilege Escalation','defense-evasion':'Defense Evasion',
  'credential-access':'Credential Access','discovery':'Discovery','collection':'Collection',
  'command-and-control':'Command & Control','exfiltration':'Exfiltration','impact':'Impact',
  'remote-access':'Remote Access','anti-behavioral-detection':'Anti-Detection','network-effects':'Network Effects',
};
const TACTIC_URLS = {
  'initial-access':            'https://attack.mitre.org/tactics/TA0001/',
  'execution':                 'https://attack.mitre.org/tactics/TA0002/',
  'persistence':               'https://attack.mitre.org/tactics/TA0003/',
  'privilege-escalation':      'https://attack.mitre.org/tactics/TA0004/',
  'defense-evasion':           'https://attack.mitre.org/tactics/TA0005/',
  'credential-access':         'https://attack.mitre.org/tactics/TA0006/',
  'discovery':                 'https://attack.mitre.org/tactics/TA0007/',
  'collection':                'https://attack.mitre.org/tactics/TA0009/',
  'command-and-control':       'https://attack.mitre.org/tactics/TA0011/',
  'exfiltration':              'https://attack.mitre.org/tactics/TA0010/',
  'impact':                    'https://attack.mitre.org/tactics/TA0040/',
  'remote-access':             'https://attack.mitre.org/tactics/TA0036/',
  'anti-behavioral-detection': 'https://attack.mitre.org/tactics/TA0037/',
  'network-effects':           'https://attack.mitre.org/tactics/TA0038/',
};

function parseTactics(tagsJson){
  try{ return JSON.parse(tagsJson||'[]').map(t=>TACTIC_LABELS[t]||t).filter(Boolean); }
  catch(_){ return []; }
}

function getWins(ranked){
  const p=PR, type=p.ip?'iphone':p.id?'ipad':p.an?'android':p.mc?'mac':p.wn?'windows':'iphone';
  const all=ACTOR_WINS[type]||ACTOR_WINS.iphone;
  const topG=ranked.slice(0,3).map(a=>a.g);
  return all.filter(w=>topG.includes(w.g))
            .filter(w=>!((p.patchTier==='current'||p.patchScore===0)&&w.t.toLowerCase().includes('update to the latest')))
            .slice(0,3);
}

async function fetchRem(actorId, platform, cveStats){
  const plt=platform==='iphone'?'ios':platform;
  const p=PR;
  const tier=p.patchTier==='current'?'current':p.patchTier==='behind'?'behind':'outdated';
  const t=cveStats?.tiers?.[tier]||{};
  const ctx=cveStats?.threat_context||{};
  const params=new URLSearchParams({
    platform: plt,
    limit:   '12',
    wild:    String(t.wild||0),
    ps:      String(t.ps||0),
    samples: String(ctx.malware_samples||0),
    iocs:    String(ctx.active_iocs||0),
  });
  try{
    const r=await fetch(`${API}/api/actor/${actorId}/remediations?${params}`);
    if(!r.ok) return null;
    return await r.json();
  } catch(_){ return null; }
}



// CVE exposure badge — shows user's CVE exposure vs latest
async function fetchCveDelta(platform, userVersion, latestVersion, patchBg, patchColor, badgeId, API_BASE) {
  const badge = document.getElementById(badgeId);
  if (!badge) return;

  const isCurrent = !userVersion || userVersion === latestVersion;
  const isPartial = userVersion && userVersion.split('.').length < 3 && latestVersion && latestVersion.split('.').length >= 3;

  try {
    if (isCurrent) {
      // On latest — show total CVEs on this platform/version
      const r = await fetch(`${API_BASE}/api/cve-count/${platform}/${encodeURIComponent(userVersion || latestVersion)}`);
      const d = r.ok ? await r.json() : null;
      if (!d || d.total === 0) {
        badge.innerHTML = `<span style="background:#D4EDDA;color:#007A53;font-size:14px;padding:4px 12px;border-radius:99px;font-weight:600;">✓ Up to date · No unpatched CVEs detected</span>`;
      } else {
        badge.innerHTML = `<span style="background:#D4EDDA;color:#007A53;font-size:14px;padding:4px 12px;border-radius:99px;font-weight:600;">✓ Up to date · ${d.total} platform CVEs${d.in_wild>0?` · ${d.in_wild} actively exploited`:''}</span>`;
      }
      return;
    }

    if (isPartial) {
      // Partial version (e.g. macOS 15.7 from UA) — can't compute exact delta
      // Just show that update is available
      badge.innerHTML = `<span style="background:${patchBg};color:${patchColor};font-size:14px;padding:4px 12px;border-radius:99px;font-weight:600;">Update available — use Correct it to see exact CVE count for your build</span>`;
      return;
    }

    // Behind on a known full version — fetch both and show delta
    const [userRes, latestRes] = await Promise.all([
      fetch(`${API_BASE}/api/cve-count/${platform}/${encodeURIComponent(userVersion)}`),
      fetch(`${API_BASE}/api/cve-count/${platform}/${encodeURIComponent(latestVersion)}`),
    ]);
    const ud = userRes.ok   ? await userRes.json()   : null;
    const ld = latestRes.ok ? await latestRes.json() : null;
    if (!ud) return;

    const fixedTotal = Math.max(0, (ud.total   ||0) - (ld?.total   ||0));
    const fixedWild  = Math.max(0, (ud.in_wild ||0) - (ld?.in_wild ||0));

    if (fixedTotal > 0) {
      badge.innerHTML = `<span style="background:${patchBg};color:${patchColor};font-size:14px;padding:4px 12px;border-radius:99px;font-weight:600;">Updating to ${latestVersion} patches ${fixedTotal} CVE${fixedTotal>1?'s':''}${fixedWild>0?` · including ${fixedWild} actively exploited`:''}</span>`;
    } else {
      // Same count — still behind, just no measurable delta at version-range level
      badge.innerHTML = `<span style="background:${patchBg};color:${patchColor};font-size:14px;padding:4px 12px;border-radius:99px;font-weight:600;">Update available — ${latestVersion} available · ${ud.total} CVEs on this platform</span>`;
    }
  } catch(_) {}
}


async function fetchCveDelta(platform, userVersion, latestVersion, patchBg, patchColor, badgeId, API_BASE) {
  const badge = document.getElementById(badgeId);
  if (!badge) return;
  if (!userVersion) return;
  if (userVersion === latestVersion) {
    badge.innerHTML = `<span style="background:#D4EDDA;color:#007A53;font-size:14px;padding:4px 12px;border-radius:99px;font-weight:600;">✓ Up to date — no additional CVEs from updates</span>`;
    return;
  }
  try {
    const [userRes, latestRes] = await Promise.all([
      fetch(`${API_BASE}/api/cve-count/${platform}/${encodeURIComponent(userVersion)}`),
      latestVersion ? fetch(`${API_BASE}/api/cve-count/${platform}/${encodeURIComponent(latestVersion)}`) : Promise.resolve(null),
    ]);
    const userData   = userRes.ok    ? await userRes.json()   : null;
    const latestData = latestRes?.ok ? await latestRes.json() : null;
    if (!userData) return;
    const fixedTotal = Math.max(0, (userData.total   || 0) - (latestData?.total   || 0));
    const fixedWild  = Math.max(0, (userData.in_wild || 0) - (latestData?.in_wild || 0));
    if (fixedTotal === 0) {
      badge.innerHTML = `<span style="background:#D4EDDA;color:#007A53;font-size:14px;padding:4px 12px;border-radius:99px;font-weight:600;">✓ No additional CVEs fixed by updating to ${latestVersion}</span>`;
    } else {
      badge.innerHTML = `<span style="background:${patchBg};color:${patchColor};font-size:14px;padding:4px 12px;border-radius:99px;font-weight:600;">Updating to ${latestVersion} would patch ${fixedTotal} CVE${fixedTotal>1?'s':''}${fixedWild>0?` · including ${fixedWild} actively exploited`:''}</span>`;
    }
  } catch(_) {}
}
async function renderReport(){
  await loadQuestions();
  const p=PR;
  if(!p||(!p.ip&&!p.id&&!p.an&&!p.mc&&!p.wn)){
    document.getElementById('report').innerHTML='<div class="loading"><p>No detection profile found.</p><p style="margin-top:.75rem;"><a href="detect.html">Run a detection first</a></p></div>';
    return;
  }
  const devName=p.ip?'iPhone':p.id?'iPad':p.an?'Android':p.mc?'Mac':p.wn?'Windows PC':'Unknown';
  const platform=p.ip?'iphone':p.id?'ipad':p.an?'android':p.mc?'mac':'windows';
  const patchTier=p.patchTier||(p.patchScore===0?'current':p.patchScore<30?'behind':'outdated');
  const patchColor=patchTier==='current'?'#007A53':patchTier==='behind'?'#7a4e00':'#C41230';
  const patchLabel=patchTier==='current'?'Up to date':patchTier==='behind'?'Update available':'End of life';
  const patchBg=patchTier==='current'?'#D4EDDA':patchTier==='behind'?'#FFF3CD':'#FCEBEB';
  const devVer = await resolveVersionLabel(p);
  const chip=(label,val)=>`<div class="ro-row"><span class="ro-label">${label}</span><span class="ro-val">${val}</span></div>`;

  // Fetch version-specific CVE count in the background and populate badge
  // Must run AFTER innerHTML=h so the badge element exists in the DOM
  // Use raw version number for CVE count API — not the display label
  const _cvePlatform = platform;
  const _cveVersion  = p.deviceFullVersion || null; // e.g. '15.7.5', not 'macOS 15'

  const ranked=ACTORS.map(a=>({...a,sc:calcScore(a),co:calcScore(a).co})).sort((a,b)=>b.co-a.co);
  const overall=Math.round(ranked.reduce((s,a)=>s+a.co,0)/ranked.length);
  const wins=getWins(ranked);

  // Fetch live CVE stats first — used to signal-rank remediations
  let cveStats = null;
  try {
    const csResp = await fetch(`${API}/api/cve-stats/${platform==='iphone'?'iphone':platform}`);
    if (csResp.ok) cveStats = await csResp.json();
  } catch(_) {}

  const remData=await Promise.all(ACTORS.map(a=>fetchRem(a.id,platform,cveStats)));
  const REM={};
  ACTORS.forEach((a,i)=>{REM[a.id]=remData[i];});

  let h='';

  const displayVer = devVer ? `${devName} ${devVer}` : devName;
  h+=`<div class="mbg-disclaimer" role="note" aria-label="Important disclaimer">
      <p class="mbg-disclaimer-title">⚠️ Important disclaimer</p>
      <p class="mbg-disclaimer-body">This site is built with the assistance of artificial intelligence and may occasionally provide information that is inaccurate or out of date. All results are general in nature and based on publicly available threat intelligence data. <strong>You are solely responsible for validating any changes you make to your device or accounts.</strong> Before making any changes to your device settings or accounts, create a backup of your device. MyBadGuy is a free security awareness tool, not a professional security assessment. For a professional assessment, consult a qualified cybersecurity professional.</p>
    </div>
  <p class="eyebrow">Full report</p>
  <h1 style="font-family:'Syne',sans-serif;font-size:clamp(24px,4vw,32px);font-weight:700;color:#1a1a1a;margin-bottom:.4rem;letter-spacing:-.01em;">
    ${devName}${devVer?` · <span style="color:#1a1a1a;">${devVer}</span>`:''} · <span style="color:${scoreColor(overall)};">${overall} combined risk</span>
  </h1>
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;margin-bottom:1.75rem;">
    <p style="font-size:15px;color:#555;margin:0;">${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
    <button class="report-save-btn" data-action="save">Save results</button>
  </div>`;

  h+=`<p class="eyebrow">Detection Profile</p>
  <div class="report-card">
    <div class="report-card-hdr"><span class="report-card-title">Your Profile</span></div>
    <div class="dev-summary">
      <span class="dev-name-badge">${devName}</span>
      ${devVer?`<span class="dev-ver-badge" style="background:${patchBg};color:${patchColor};">${devVer} · ${patchLabel}</span>`:`<span class="dev-patch-badge" style="background:${patchBg};color:${patchColor};">${patchLabel}</span>`}
      <span id="cve-count-badge"></span>
    </div>
    <div class="ro-grid">
      <div class="ro-section" style="grid-column:1/-1;">Personal</div>
      ${chip('Age',p.age)}${chip('Financial',    qLabel('fin',  p.fin,  FIN_L))}${chip('Tech skill',   qLabel('tech', p.tech, TECH_L))}${chip('Social',       qLabel('iso',  p.iso,  ISO_L))}${chip('Social media', qLabel('sm',   p.sm,   SM_L))}
      <div class="profile-divider" style="grid-column:1/-1;margin:.5rem 0;"></div>
      <div class="ro-section" style="grid-column:1/-1;padding-top:0;">Work &amp; context</div>
      ${chip('Job data',qLabel('role',p.role,ROLE_L))}${chip('Public profile',qLabel('pub',p.pub,PUB_L))}${chip('Work / MDM',qLabel('mdm',p.mdm,MDM_L))}${chip('Home',qLabel('home',p.home,HOME_L))}${chip('Usage',qLabel('usage',p.usage,USAGE_L))}
    </div>
  </div>`;

  // ── ACTOR FILTER CHECKBOXES ──────────────────────────
  h += `<p class="eyebrow" style="margin-top:1.5rem;">Threat actor profiles</p>
  <div class="report-card">
    <p style="font-size:15px;color:#555;margin-bottom:4px;">All actors selected. Uncheck any you want to exclude from the recommendations below.</p>
    <p style="font-size:13px;color:#888;margin-bottom:1rem;">Tap an actor name to learn more about them.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">
      ${ranked.map(a => {
        const cc  = scoreColor(a.co);
        const cbg = a.co>=70?'#FCEBEB':a.co>=45?'#FFF3CD':'#D4EDDA';
        const bdr = a.co>=70?'#f7c1c1':a.co>=45?'#f0c070':'#c3e6cb';
        return `<div style="display:flex;align-items:center;gap:10px;padding:.85rem 1rem;border-radius:10px;border:1.5px solid ${bdr};background:${cbg};transition:opacity .2s;" id="actor-card-${a.id}">
          <input type="checkbox" id="actor-chk-${a.id}" checked
            style="width:20px;height:20px;cursor:pointer;accent-color:#003F72;flex-shrink:0;"
            data-actor-toggle="${a.id}"
            aria-label="Include ${a.name} recommendations">
          <div style="width:34px;height:34px;border-radius:50%;background:${a.ab};color:${a.ac};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0;">${a.ini}</div>
          <div style="flex:1;min-width:0;">
            <a href="${a.page}" style="font-size:15px;font-weight:600;color:#1a1a1a;text-decoration:none;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.name}</a>
            <div style="font-size:15px;color:${cc};font-weight:700;">${a.co} / 99</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // ── UNIFIED SORTED RECOMMENDATIONS ──────────────────
  // Collect all rems across all actors, tag with actor info, sort easy > medium > hard
  const diffOrder = {easy:0, medium:1, hard:2};
  const allRems = [];
  ranked.forEach(a => {
    const data = REM[a.id];
    if (!data || !data.remediations) return;
    data.remediations.forEach(r => {
      allRems.push({...r, actor: a});
    });
  });
  // Sort: difficulty first (easy>medium>hard), then priority (1>2>3>4)
  allRems.sort((a, b) => {
    const da = diffOrder[a.difficulty] ?? 1;
    const db = diffOrder[b.difficulty] ?? 1;
    if (da !== db) return da - db;
    return (a.priority || 4) - (b.priority || 4);
  });

  const diffGroups = {easy:[], medium:[], hard:[]};
  allRems.forEach(r => { (diffGroups[r.difficulty] || diffGroups.medium).push(r); });

  const diffLabels = {easy:'Easy wins', medium:'Medium effort', hard:'Harder steps'};
  const diffPriClass = {easy:'pri-hdr-1', medium:'pri-hdr-2', hard:'pri-hdr-3'};
  const numClass = {1:'rem-num-1', 2:'rem-num-2', 3:'rem-num-3', 4:'rem-num-3'};

  h += `<p class="eyebrow" style="margin-top:1.25rem;">All recommendations</p>
  <p style="font-size:15px;color:#666;margin-bottom:1rem;">Sorted from easiest to hardest across all threat actors. Tap a section header to expand.</p>`;

  let globalNum = 1;
  ['easy','medium','hard'].forEach(diff => {
    const items = diffGroups[diff];
    if (!items.length) return;
    const groupId = `pri-group-${diff}`;
    h += `<div class="pri-group" style="margin-bottom:8px;">
      <div class="pri-hdr ${diffPriClass[diff]}" data-toggle-group="${groupId}">
        <span class="pri-title">${diffLabels[diff]}</span>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="pri-count">${items.length} step${items.length > 1 ? 's' : ''}</span>
          <span id="${groupId}-chevron" class="pri-chevron">&#9654;</span>
        </div>
      </div>
      <div class="pri-body" id="${groupId}">`;
    items.forEach(r => {
      const a   = r.actor;
      const nc  = numClass[r.priority] || 'rem-num-3';
      const url = r.source_url   || '#';
      const lbl = r.source_label || 'Source';
      h += `<div class="rem-card" data-rem="all-${globalNum}" data-actor="${r.actor.id}">
        <div class="rem-card-hdr">
          <div class="rem-num ${nc}">${globalNum++}</div>
          <div class="rem-title-wrap">
            <div class="rem-title">${r.title}</div>
            <div class="rem-badges">
              <span class="rbadge" style="background:${a.ab};color:${a.ac};">${a.name}</span>
            </div>
          </div>
          <span class="rem-expand">&#9662;</span>
        </div>
        <div class="rem-body">
          <div class="rem-action-label">Steps to take</div>
          <div class="rem-action">${r.action}</div>
          <div class="rem-why-label">Why this matters</div>
          <div class="rem-why">${r.why || ''}</div>
          <div class="rem-pills">
            ${parseTactics(r.tactic_tags).map(t=>{
              const key=Object.keys(TACTIC_LABELS).find(k=>TACTIC_LABELS[k]===t);
              const url=key?TACTIC_URLS[key]:'';
              return url
                ?`<a class="rem-tactic" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="MITRE ATT&CK: Tactic ${t}">Tactic: ${t}</a>`
                :`<span class="rem-tactic">Tactic: ${t}</span>`;
            }).join('')}
            <a href="${url}" class="rem-source" target="_blank" rel="noopener noreferrer">Source: ${lbl}</a>
          </div>
        </div>
      </div>`;
    });
    h += '</div></div>'; // close group body + pri-group
  });

  h+='<div class="attribution">This product uses data from the NVD API but is not endorsed or certified by the NVD.</div>';

  document.getElementById('report').innerHTML=h;

  // Now that the DOM is set, fetch version-specific CVE count and populate badge
  // Get latest version for this platform/cycle to compute delta
  if (_cveVersion && _cvePlatform) {
    let latestVer = _cveVersion;
    try {
      const ovResp = await fetch(`${API}/api/os-versions/${_cvePlatform}`);
      if (ovResp.ok) {
        const ovData = await ovResp.json();
        const major  = String(parseInt(_cveVersion));
        const cycle  = (ovData.versions || []).find(v => String(v.cycle) === major);
        if (cycle?.latest_version) latestVer = cycle.latest_version;
      }
    } catch(_) {}
    fetchCveDelta(_cvePlatform, _cveVersion, latestVer, patchBg, patchColor, 'cve-count-badge', API);
  }

  document.getElementById('report').addEventListener('click', e => {
    // Group header toggle
    const groupHdr = e.target.closest('[data-toggle-group]');
    if (groupHdr) {
      e.stopPropagation();
      const id      = groupHdr.dataset.toggleGroup;
      const body    = document.getElementById(id);
      const chevron = document.getElementById(id + '-chevron');
      if (!body) return;
      const isOpen  = body.classList.contains('open');
      body.classList.toggle('open', !isOpen);
      if (chevron) chevron.classList.toggle('open', !isOpen);
      return;
    }
    // Actor checkbox toggle
    const chk = e.target.closest('input[data-actor-toggle]');
    if (chk) {
      toggleActor(chk.dataset.actorToggle, chk.checked);
      return;
    }

    // Save button
    if (e.target.closest('[data-action="save"]')) {
      openSaveModal();
      return;
    }
    // Rem card expand
    const card = e.target.closest('.rem-card');
    if (card) card.classList.toggle('open');
  });

  // Group toggle via event delegation — no inline handlers, CSP safe

  // Toggle all recommendations for a given actor
  window.toggleActor = function(actorId, checked) {
    // Dim the actor card
    const card = document.getElementById('actor-card-' + actorId);
    if (card) card.style.opacity = checked ? '1' : '0.45';

    // Show/hide all rem-cards for this actor using data-hidden attribute
    document.querySelectorAll(`.rem-card[data-actor="${actorId}"]`).forEach(el => {
      el.classList.toggle('rem-hidden', !checked);
      el.dataset.hidden = checked ? '' : '1';
    });

    // Update step counts — query ALL rem-cards in the group (even if group is collapsed)
    // by using the group ID directly, not the inner body div
    ['easy','medium','hard'].forEach(diff => {
      const body    = document.getElementById(`pri-group-${diff}`);
      const countEl = document.querySelector(`#pri-group-${diff}-chevron`)?.closest('.pri-hdr')?.querySelector('.pri-count');
      if (!body || !countEl) return;
      const visible = body.querySelectorAll('.rem-card:not([data-hidden="1"])').length;
      countEl.textContent = `${visible} step${visible !== 1 ? 's' : ''}`;
    });
  };
}

renderReport().catch(err=>{
  console.error('Report error:',err);
  document.getElementById('report').innerHTML=`<div class="loading"><p style="color:#E24B4A;">Error: ${err.message}</p><p style="margin-top:.75rem;"><a href="dashboard.html">Back to dashboard</a></p></div>`;
});
