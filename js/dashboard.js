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

// Version tables kept for slider display labels only — scoring uses live patchScore
const IOS_V    = [{v:'iOS 26.4.2',ps:0},{v:'iOS 26.4',ps:0},{v:'iOS 26.3.x',ps:6},{v:'iOS 26.2',ps:9},{v:'iOS 26.1',ps:14},{v:'iOS 26.0',ps:20},{v:'iOS 18.4.x',ps:32},{v:'iOS 18.3.x',ps:38},{v:'iOS 18.2',ps:44},{v:'iOS 17.x',ps:82}];
const IPAD_V   = [{v:'iPadOS 26.4.2',ps:0},{v:'iPadOS 26.4',ps:0},{v:'iPadOS 26.3.x',ps:6},{v:'iPadOS 26.2',ps:9},{v:'iPadOS 26.0-26.1',ps:17},{v:'iPadOS 18.4.x',ps:30},{v:'iPadOS 18.x',ps:52},{v:'iPadOS 17.x',ps:78},{v:'iPadOS 16.x',ps:112}];
const ANDROID_V= [{v:'Android 16',ps:0},{v:'Android 15',ps:0},{v:'Android 14',ps:28},{v:'Android 13',ps:62},{v:'Android 12',ps:98},{v:'Android 11',ps:134},{v:'Android 10',ps:178}];
const MAC_V    = [{v:'macOS 26.4.1',ps:0},{v:'macOS 26.4',ps:0},{v:'macOS 26.3.x',ps:6},{v:'macOS 26.2',ps:9},{v:'macOS 26.0-26.1',ps:17},{v:'macOS 15.4.x',ps:28},{v:'macOS 15.x',ps:48},{v:'macOS 14.x',ps:92}];
const WIN_V    = [{v:'Win 11 26H1',ps:0},{v:'Win 11 25H2',ps:0},{v:'Win 11 24H2',ps:28},{v:'Win 11 23H2',ps:66},{v:'Win 10 22H2',ps:112},{v:'Win 10 21H2',ps:186},{v:'Win 10 older',ps:248}];

// ── CHIP DISPLAY ──────────────────────────────────────────
const FIN_L  =['','Struggling','Working class','Middle income','Affluent','High wealth'];
const FIN_S  =['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];
const TECH_L =['','No tech skills','Basic user','Moderate','Tech-savvy','Expert / IT'];
const TECH_S =['','background:#FCEBEB;color:#A32D2D','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A'];
const ISO_L  =['','Severely isolated','Some isolation','Socially active','Well connected','Community leader'];
const ISO_S  =['','background:#FCEBEB;color:#A32D2D','background:#FAEEDA;color:#854F0B','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A'];
const SM_L   =['','Never uses','Casual','Regular','Heavy user','Influencer'];
const SM_S   =['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];
const ROLE_L =['','No work data','Some work apps','Confidential','Regulated','Gov / exec'];
const ROLE_S =['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];
const PUB_L  =['','Very private','Low','Moderate','High','Very public'];
const PUB_S  =['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];
const MDM_L  =['','Personal only','Work apps','Work email','Corp account','MDM enrolled'];
const MDM_S  =['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];
const HOME_L =['','Rural','Suburban','Urban','Dense urban'];
const HOME_S =['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];
const USAGE_L=['','At home','Work/commute','Public use','Travel','International'];
const USAGE_S=['','background:#EAF3DE;color:#27500A','background:#EAF3DE;color:#27500A','background:#FAEEDA;color:#854F0B','background:#FAEEDA;color:#854F0B','background:#FCEBEB;color:#A32D2D'];

// ── ACTOR DEFINITIONS (scores only — full detail in actor pages) ──
const ACTORS = [
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
function scoreColor(v) { return v>=70?'#E24B4A':v>=45?'#EF9F27':'#22c55e'; }

// ── TOP QUICK WINS ────────────────────────────────────────
function getWins(ranked) {
  const all = [
    {t:'Enable Stolen Device Protection',     w:'Settings → Face ID & Passcode → Stolen Device Protection', g:'financial'},
    {t:'Enable two-factor authentication',    w:'Settings → [Name] → Password & Security → 2FA',           g:'financial'},
    {t:'Disable cross-app tracking',          w:'Settings → Privacy & Security → Tracking → Off',           g:'technical'},
    {t:'Update to latest OS version',         w:'Settings → General → Software Update',                     g:'technical'},
    {t:'Enable Silence Unknown Callers',      w:'Settings → Phone → Silence Unknown Callers → On',          g:'social'},
    {t:'Set all location to While Using or Never', w:'Settings → Privacy & Security → Location Services',   g:'technical'},
    {t:'Use Face ID in public — never enter passcode in view', w:'Behavioral practice',                      g:'financial'},
    {t:'Use unique passwords for every account',  w:'Settings → Passwords → use built-in generator',        g:'financial'},
  ];
  const topGroups = ranked.slice(0,3).map(a=>a.g);
  return all.filter(w=>topGroups.includes(w.g)).slice(0,3);
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
function render() {
  saveProfile();
  const p = PR;

  // Score and rank all actors
  const ranked = ACTORS.map(a => ({...a, sc:score(a), co:combo(a)}))
                        .sort((a,b)=>b.co-a.co);
  const overall = Math.round(ranked.reduce((s,a)=>s+a.co,0)/ranked.length);
  const overallColor = scoreColor(overall);
  const overallLabel = overall>=70?'High risk profile':overall>=45?'Elevated risk profile':'Lower risk profile';
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
      <p style="font-size:13px;color:var(--muted);line-height:1.6;max-width:440px;">
        ${overall>=70?'Several threat actors have strong interest in your profile. Review each actor below and work through their remediation steps.':
          overall>=45?'Some threat actors find your profile moderately attractive. Start with the highest-scored actors.':
          'Your profile is less attractive to most threat actors. A few targeted changes close the remaining gaps.'}
      </p>
      <div style="margin-top:.75rem;display:flex;gap:8px;flex-wrap:wrap;">
        ${ranked.slice(0,3).map(a=>`<span style="font-size:11px;padding:3px 9px;border-radius:99px;background:${a.gc}22;color:${a.gc};font-weight:500;">${a.name}: ${a.co}</span>`).join('')}
      </div>
    </div>
  </div>`;

  // ── PROFILE CARD (read-only) ──────────────────────────
  // Determine device display
  const devName = p.ip?'iPhone':p.id?'iPad':p.an?'Android':p.mc?'Mac':p.wn?'Windows PC':'Unknown';
  const devVer  = p.deviceFullVersion || (p.ip?IOS_V[p.iosV-1]?.v:p.id?IPAD_V[p.ipadV-1]?.v:p.an?ANDROID_V[p.anV-1]?.v:p.mc?MAC_V[p.mcV-1]?.v:p.wn?WIN_V[p.wnV-1]?.v:'') || '';
  const patchTier = p.patchTier || (p.patchScore===0?'current':p.patchScore<30?'behind':'outdated');
  const patchColor = patchTier==='current'?'#22c55e':patchTier==='behind'?'#EF9F27':'#E24B4A';
  const patchLabel = patchTier==='current'?'Up to date':patchTier==='behind'?'Update available':'End of life';
  const patchBg    = patchTier==='current'?'rgba(34,197,94,.12)':patchTier==='behind'?'rgba(239,159,39,.12)':'rgba(226,75,74,.12)';

  const chip = (label, val) => `<div class="ro-row"><span class="ro-label">${label}</span><span class="ro-val">${val}</span></div>`;

  h += `<div class="eyebrow" style="margin-top:.25rem;">Your profile</div>
  <div class="profile-card">
    <div class="profile-title">
      <span>Detection profile</span>
      <a href="detect.html" class="update-pill">Update profile →</a>
    </div>

    <div class="dev-summary">
      <span class="dev-name-badge">${devName}</span>
      ${devVer ? `<span class="dev-ver-badge">${devVer}</span>` : ''}
      <span class="dev-patch-badge" style="background:${patchBg};color:${patchColor};">${patchLabel}</span>
      ${p.patchScore > 0 ? `<span class="dev-name-badge" style="color:var(--muted);font-weight:400;">Vulnerabilities</span><span class="dev-patch-badge" style="background:${patchBg};color:${patchColor};">${p.patchScore} CVEs</span>` : ''}
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

  // ── ACTOR GROUPS ──────────────────────────────────────
  h += `<div class="eyebrow" style="margin-top:.25rem;">Threat actors — ranked by your score</div>`;
  groups.forEach(g => {
    const groupActors = ranked.filter(a=>a.g===g.id);
    const avgScore = Math.round(groupActors.reduce((s,a)=>s+a.co,0)/groupActors.length);
    h += `<div class="group-block">
      <div class="group-hdr" style="background:${g.hbg};border-left-color:${g.bc};">
        <span class="group-hdr-label" style="color:${g.htc};">${g.label}</span>
        <span class="group-hdr-avg" style="color:${g.htc};">avg ${avgScore}/99</span>
      </div>`;
    groupActors.forEach(a => {
      const cc = scoreColor(a.co);
      h += `<a class="actor-row" href="${a.page}" onclick="saveProfile()">
        <div class="actor-avatar" style="background:${a.ab};color:${a.ac};">${a.ini}</div>
        <div class="actor-info">
          <div class="actor-name">${a.name}</div>
          <div class="actor-sub">${a.sub}</div>
        </div>
        <div class="actor-bars">
          <div class="bar-line">
            <span class="bar-label" style="color:#A32D2D;">Technical</span>
            <div class="bar-track"><div class="bar-fill" style="width:${a.sc.t}%;background:#E24B4A;"></div></div>
            <span class="bar-val" style="color:#A32D2D;">${a.sc.t}</span>
          </div>
          <div class="bar-line">
            <span class="bar-label" style="color:#185FA5;">Social</span>
            <div class="bar-track"><div class="bar-fill" style="width:${a.sc.s}%;background:#378ADD;"></div></div>
            <span class="bar-val" style="color:#185FA5;">${a.sc.s}</span>
          </div>
        </div>
        <div class="actor-combo">
          <span class="combo-score" style="color:${cc};">${a.co}</span>
          <span style="font-size:10px;padding:2px 7px;border-radius:99px;background:${cc}22;color:${cc};font-weight:500;">${a.co>=70?'High':a.co>=45?'Medium':'Lower'}</span>
        </div>
        <span class="actor-arrow">→</span>
      </a>`;
    });
    h += `</div>`;
  });

  // ── QUICK WINS ────────────────────────────────────────
  h += `<div class="eyebrow" style="margin-top:.25rem;">Top quick wins — zero usage impact</div>
  <div class="wins-card">`;
  wins.forEach((w,i) => {
    h += `<div class="win-row">
      <div class="win-num">${i+1}</div>
      <div>
        <div class="win-title">${w.t}</div>
        <div class="win-where">${w.w}</div>
      </div>
    </div>`;
  });
  h += `</div>`;

  h += `<div class="attribution">This product uses data from the NVD API but is not endorsed or certified by the NVD.</div>`;

  document.getElementById('page').innerHTML = h;
}

render();
