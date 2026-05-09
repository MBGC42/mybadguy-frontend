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

const FIN_L  =['','Minimal assets','Some savings','Moderate wealth','Significant wealth','High net worth'];
const TECH_L =['','Beginner','Basic','Intermediate','Advanced','Expert'];
const ISO_L  =['','Severely isolated','Some isolation','Socially active','Well connected','Community leader'];
const SM_L   =['','Never','Rarely','Sometimes','Often','Constantly'];
const ROLE_L =['','No sensitive data','Some work data','Regular work data','Sensitive work data','Highly sensitive data'];
const PUB_L  =['','Very private','Mostly private','Some public presence','Notable presence','Highly public'];
const MDM_L  =['','Personal only','Work apps','Work email','Corp account','MDM enrolled'];
const HOME_L =['','Rural','Suburban','Urban','Dense urban'];
const USAGE_L=['','At home','Mostly home','Mixed','Mostly public','Always public'];

// ── VERSION LABEL RESOLUTION ──────────────────────────────
// Primary source: p.deviceFullVersion (set during detection).
// Fallback for old sessions: fetch latest version label from
// /api/os-versions/:platform — always current from D1.
const _osVerCache = {};

async function resolveVersionLabel(p) {
  if (p.deviceFullVersion) return p.deviceFullVersion;
  const platform = p.ip ? 'ios' : p.id ? 'ipad' : p.an ? 'android' : p.mc ? 'mac' : p.wn ? 'windows' : null;
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



async function renderReport(){
  const p=PR;
  if(!p||(!p.ip&&!p.id&&!p.an&&!p.mc&&!p.wn)){
    document.getElementById('report').innerHTML='<div class="loading"><p>No detection profile found.</p><p style="margin-top:.75rem;"><a href="detect.html">Run a detection first</a></p></div>';
    return;
  }
  const devName=p.ip?'iPhone':p.id?'iPad':p.an?'Android':p.mc?'Mac':p.wn?'Windows PC':'Unknown';
  const platform=p.ip?'iphone':p.id?'ipad':p.an?'android':p.mc?'mac':'windows';
  const patchTier=p.patchTier||(p.patchScore===0?'current':p.patchScore<30?'behind':'outdated');
  const patchColor=patchTier==='current'?'#22c55e':patchTier==='behind'?'#EF9F27':'#E24B4A';
  const patchLabel=patchTier==='current'?'Up to date':patchTier==='behind'?'Update available':'End of life';
  const patchBg=patchTier==='current'?'rgba(34,197,94,.12)':patchTier==='behind'?'rgba(239,159,39,.12)':'rgba(226,75,74,.12)';
  const devVer = await resolveVersionLabel(p);
  const chip=(label,val)=>`<div class="ro-row"><span class="ro-label">${label}</span><span class="ro-val">${val}</span></div>`;

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
  h+=`<p class="eyebrow">Full report</p>
  <h1 style="font-family:'Syne',sans-serif;font-size:clamp(22px,4vw,30px);font-weight:700;margin-bottom:.4rem;letter-spacing:-.01em;">
    ${devName}${devVer?` <span style="color:${patchColor};">${devVer}</span>`:''} &middot; <span style="color:${scoreColor(overall)};">${overall}</span> <span style="color:var(--slate);">combined risk</span>
  </h1>
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;margin-bottom:1.75rem;">
    <p style="font-size:13px;color:var(--muted);margin:0;">${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
    <button onclick="openSaveModal()" style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;padding:8px 20px;border-radius:99px;background:transparent;color:var(--slate);border:1.5px solid rgba(255,255,255,.18);cursor:pointer;transition:border-color .15s;white-space:nowrap;">Save results</button>
  </div>`;

  h+=`<p class="eyebrow">Detection</p>
  <div class="report-card">
    <div class="report-card-hdr"><span class="report-card-title">Device &amp; profile</span></div>
    <div class="dev-summary">
      <span class="dev-name-badge">${devName}</span>
      ${devVer?`<span class="dev-ver-badge" style="background:${patchBg};color:${patchColor};">${devVer} · ${patchLabel}</span>`:`<span class="dev-patch-badge" style="background:${patchBg};color:${patchColor};">${patchLabel}</span>`}
      ${p.patchScore>0?`<span class="dev-name-badge">Vulnerabilities</span><span class="dev-patch-badge" style="background:${patchBg};color:${patchColor};">${p.patchScore} CVEs</span>`:''}
    </div>
    <div class="ro-grid">
      <div class="ro-section" style="grid-column:1/-1;">Personal</div>
      ${chip('Age',p.age)}${chip('Financial',FIN_L[p.fin]||p.fin)}${chip('Tech skill',TECH_L[p.tech]||p.tech)}${chip('Social',ISO_L[p.iso]||p.iso)}${chip('Social media',SM_L[p.sm]||p.sm)}
      <div class="profile-divider" style="grid-column:1/-1;margin:.5rem 0;"></div>
      <div class="ro-section" style="grid-column:1/-1;padding-top:0;">Work &amp; context</div>
      ${chip('Job data',ROLE_L[p.role+1]||'No work data')}${chip('Public profile',PUB_L[p.pub+1]||'Very private')}${chip('Work / MDM',MDM_L[p.mdm+1]||'Personal only')}${chip('Home',HOME_L[p.home]||'Rural')}${chip('Usage',USAGE_L[p.usage+1]||'At home')}
    </div>
  </div>`;

  // ── ACTOR LINKS ───────────────────────────────────────
  h += `<p class="eyebrow" style="margin-top:1.5rem;">Threat actor profiles</p>
  <div class="report-card">
    <p style="font-size:12px;color:var(--muted);margin-bottom:.85rem;">Explore the full profile, tactics, and remediations for each threat actor.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;">
      ${ranked.map(a => {
        const cc  = scoreColor(a.co);
        const cbg = a.co>=70?'rgba(226,75,74,.08)':a.co>=45?'rgba(239,159,39,.08)':'rgba(34,197,94,.08)';
        return `<a href="${a.page}" style="display:flex;align-items:center;gap:8px;padding:.6rem .85rem;border-radius:10px;border:.5px solid rgba(255,255,255,.08);background:${cbg};text-decoration:none;transition:border-color .15s;"
          onmouseover="this.style.borderColor='rgba(255,255,255,.2)'" onmouseout="this.style.borderColor='rgba(255,255,255,.08)'">
          <div style="width:24px;height:24px;border-radius:50%;background:${a.ab};color:${a.ac};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;">${a.ini}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;font-weight:500;color:var(--slate);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.name}</div>
            <div style="font-size:10px;color:${cc};font-weight:600;">${a.co} / 99</div>
          </div>
          <span style="font-size:11px;color:var(--dim);">&rsaquo;</span>
        </a>`;
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
  <p style="font-size:12px;color:var(--dim);margin-bottom:1rem;">Sorted from easiest to hardest across all threat actors. Tap any card to expand.</p>`;

  let globalNum = 1;
  ['easy','medium','hard'].forEach(diff => {
    const items = diffGroups[diff];
    if (!items.length) return;
    h += `<div class="pri-group" style="margin-bottom:6px;">
      <div class="pri-hdr ${diffPriClass[diff]}">
        <span class="pri-title">${diffLabels[diff]}</span>
        <span class="pri-count">${items.length} step${items.length > 1 ? 's' : ''}</span>
      </div>`;
    items.forEach(r => {
      const a   = r.actor;
      const nc  = numClass[r.priority] || 'rem-num-3';
      const url = r.source_url   || '#';
      const lbl = r.source_label || 'Source';
      h += `<div class="rem-card" data-rem="all-${globalNum}">
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
    h += '</div>';
  });

  h+=`<p class="eyebrow" style="margin-top:1.25rem;">Quick wins</p>
  <div class="report-card">
    <div class="report-card-hdr">
      <span class="report-card-title">Top quick wins for your ${devName}</span>
      <span class="report-card-sub">Zero usage impact</span>
    </div>`;
  wins.forEach((w,i)=>{
    h+=`<div class="win-row"><div class="win-num">${i+1}</div><div><div class="win-title">${w.t}</div><div class="win-where">${w.w}</div></div></div>`;
  });
  h+='</div>';

  h+='<div class="attribution">This product uses data from the NVD API but is not endorsed or certified by the NVD.</div>';

  document.getElementById('report').innerHTML=h;

  document.getElementById('report').addEventListener('click',e=>{
    const card=e.target.closest('.rem-card');
    if(card) card.classList.toggle('open');
  });
}

renderReport().catch(err=>{
  console.error('Report error:',err);
  document.getElementById('report').innerHTML=`<div class="loading"><p style="color:#E24B4A;">Error: ${err.message}</p><p style="margin-top:.75rem;"><a href="dashboard.html">Back to dashboard</a></p></div>`;
});
