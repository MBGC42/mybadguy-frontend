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

// Version tables replaced by live patchScore from /api/cve-stats/:platform

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
function updateChips() {
  const p = PR;
  function ageS(v){return v<=17||v>=65?'background:#FCEBEB;color:#A32D2D':v<=25||v>=55?'background:#FAEEDA;color:#854F0B':'background:#EAF3DE;color:#27500A';}
  sc('c-age',  p.age,        ageS(p.age));
  sc('c-fin',  FIN_L[p.fin],  FIN_S[p.fin]);
  sc('c-tech', TECH_L[p.tech],TECH_S[p.tech]);
  sc('c-iso',  ISO_L[p.iso],  ISO_S[p.iso]);
  sc('c-sm',   SM_L[p.sm],    SM_S[p.sm]);
  sc('c-role', ROLE_L[p.role],ROLE_S[p.role]);
  sc('c-pub',  PUB_L[p.pub],  PUB_S[p.pub]);
  sc('c-mdm',  MDM_L[p.mdm],  MDM_S[p.mdm]);
  sc('c-home', HOME_L[p.home],HOME_S[p.home]);
  sc('c-usage',USAGE_L[p.usage],USAGE_S[p.usage]);
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

  // ── PROFILE CARD ──────────────────────────────────────
  h += `<div class="eyebrow" style="margin-top:.25rem;">Your profile</div>
  <div class="profile-card">
    <div class="profile-title">
      <span>Consumer profile</span>
      <span class="profile-title-sub">Adjust sliders to explore how your scores change</span>
    </div>
    <div class="profile-grid">
      <div class="sl-sub">Personal</div><div></div>
      <div class="sl-row"><span class="sl-label">Age</span><input type="range" min="13" max="85" value="${p.age}" oninput="PR.age=+this.value;updateChips();render()"><span class="sl-chip" id="c-age">${p.age}</span></div>
      <div class="sl-row"><span class="sl-label">Financial status</span><input type="range" min="1" max="5" value="${p.fin}" oninput="PR.fin=+this.value;updateChips();render()"><span class="sl-chip" id="c-fin">${FIN_L[p.fin]}</span></div>
      <div class="sl-row"><span class="sl-label">Tech skill</span><input type="range" min="1" max="5" value="${p.tech}" oninput="PR.tech=+this.value;updateChips();render()"><span class="sl-chip" id="c-tech">${TECH_L[p.tech]}</span></div>
      <div class="sl-row"><span class="sl-label">Social isolation</span><input type="range" min="1" max="5" value="${p.iso}" oninput="PR.iso=+this.value;updateChips();render()"><span class="sl-chip" id="c-iso">${ISO_L[p.iso]}</span></div>
      <div class="sl-row"><span class="sl-label">Social media</span><input type="range" min="1" max="5" value="${p.sm}" oninput="PR.sm=+this.value;updateChips();render()"><span class="sl-chip" id="c-sm">${SM_L[p.sm]}</span></div>
      <div></div>
      <div class="profile-divider"></div>
      <div class="sl-sub">Work</div><div></div>
      <div class="sl-row"><span class="sl-label">Job data</span><input type="range" min="1" max="5" value="${p.role}" oninput="PR.role=+this.value;updateChips();render()"><span class="sl-chip" id="c-role">${ROLE_L[p.role]}</span></div>
      <div class="sl-row"><span class="sl-label">Public profile</span><input type="range" min="1" max="5" value="${p.pub}" oninput="PR.pub=+this.value;updateChips();render()"><span class="sl-chip" id="c-pub">${PUB_L[p.pub]}</span></div>
      <div class="sl-row" style="grid-column:1/-1;"><span class="sl-label">Device / MDM</span><input type="range" min="1" max="5" value="${p.mdm}" oninput="PR.mdm=+this.value;updateChips();render()"><span class="sl-chip" id="c-mdm">${MDM_L[p.mdm]}</span></div>
      <div class="profile-divider"></div>
      <div class="sl-sub">Location</div><div></div>
      <div class="sl-row"><span class="sl-label">Home environment</span><input type="range" min="1" max="4" value="${p.home}" oninput="PR.home=+this.value;updateChips();render()"><span class="sl-chip" id="c-home">${HOME_L[p.home]}</span></div>
      <div class="sl-row"><span class="sl-label">Usage context</span><input type="range" min="1" max="5" value="${p.usage}" oninput="PR.usage=+this.value;updateChips();render()"><span class="sl-chip" id="c-usage">${USAGE_L[p.usage]}</span></div>
    </div>
    <div class="dev-section">
      <div class="dev-section-title">Devices</div>
      <div class="dev-row">
        <label class="dev-cb"><input type="checkbox" ${p.ip?'checked':''} onchange="PR.ip=this.checked;render()"> iPhone</label>
        <span class="dev-ver" style="background:#E6F1FB;color:#0C447C;${p.ip?'':'opacity:.4;'}">${IOS_V[p.iosV-1]?.v||'iOS'}</span>
        <input type="range" min="1" max="${IOS_V.length}" value="${p.iosV}" ${p.ip?'':'disabled'} style="flex:1;accent-color:var(--cyan);" oninput="PR.iosV=+this.value;render()">
        <span class="dev-patch" style="background:${p.ip&&IOS_V[p.iosV-1]?.ps>0?'rgba(226,75,74,.12)':p.ip?'rgba(34,197,94,.12)':'var(--mid)'};color:${p.ip&&IOS_V[p.iosV-1]?.ps>0?'#E24B4A':p.ip?'#22c55e':'var(--dim)'};">${p.ip?(IOS_V[p.iosV-1]?.ps===0?'Current':IOS_V[p.iosV-1]?.ps+' CVEs'):'Off'}</span>
      </div>
      <div class="dev-row">
        <label class="dev-cb"><input type="checkbox" ${p.id?'checked':''} onchange="PR.id=this.checked;render()"> iPad</label>
        <span class="dev-ver" style="background:#EEEDFE;color:#3C3489;${p.id?'':'opacity:.4;'}">${IPAD_V[p.ipadV-1]?.v||'iPadOS'}</span>
        <input type="range" min="1" max="${IPAD_V.length}" value="${p.ipadV}" ${p.id?'':'disabled'} style="flex:1;accent-color:var(--cyan);" oninput="PR.ipadV=+this.value;render()">
        <span class="dev-patch" style="background:${p.id&&IPAD_V[p.ipadV-1]?.ps>0?'rgba(226,75,74,.12)':'var(--mid)'};color:${p.id&&IPAD_V[p.ipadV-1]?.ps>0?'#E24B4A':'var(--dim)'};">${p.id?(IPAD_V[p.ipadV-1]?.ps===0?'Current':IPAD_V[p.ipadV-1]?.ps+' CVEs'):'Off'}</span>
      </div>
      <div class="dev-row">
        <label class="dev-cb"><input type="checkbox" ${p.an?'checked':''} onchange="PR.an=this.checked;render()"> Android</label>
        <span class="dev-ver" style="background:#EAF3DE;color:#27500A;${p.an?'':'opacity:.4;'}">${ANDROID_V[p.anV-1]?.v||'Android'}</span>
        <input type="range" min="1" max="${ANDROID_V.length}" value="${p.anV}" ${p.an?'':'disabled'} style="flex:1;accent-color:var(--cyan);" oninput="PR.anV=+this.value;render()">
        <span class="dev-patch" style="background:${p.an&&ANDROID_V[p.anV-1]?.ps>0?'rgba(226,75,74,.12)':'var(--mid)'};color:${p.an&&ANDROID_V[p.anV-1]?.ps>0?'#E24B4A':'var(--dim)'};">${p.an?(ANDROID_V[p.anV-1]?.ps===0?'Current':ANDROID_V[p.anV-1]?.ps+' CVEs'):'Off'}</span>
      </div>
      <div class="dev-row">
        <label class="dev-cb"><input type="checkbox" ${p.mc?'checked':''} onchange="PR.mc=this.checked;render()"> Mac</label>
        <span class="dev-ver" style="background:#FAEEDA;color:#854F0B;${p.mc?'':'opacity:.4;'}">${MAC_V[p.mcV-1]?.v||'macOS'}</span>
        <input type="range" min="1" max="${MAC_V.length}" value="${p.mcV}" ${p.mc?'':'disabled'} style="flex:1;accent-color:var(--cyan);" oninput="PR.mcV=+this.value;render()">
        <span class="dev-patch" style="background:${p.mc&&MAC_V[p.mcV-1]?.ps>0?'rgba(226,75,74,.12)':'var(--mid)'};color:${p.mc&&MAC_V[p.mcV-1]?.ps>0?'#E24B4A':'var(--dim)'};">${p.mc?(MAC_V[p.mcV-1]?.ps===0?'Current':MAC_V[p.mcV-1]?.ps+' CVEs'):'Off'}</span>
      </div>
      <div class="dev-row">
        <label class="dev-cb"><input type="checkbox" ${p.wn?'checked':''} onchange="PR.wn=this.checked;render()"> Windows</label>
        <span class="dev-ver" style="background:#F1EFE8;color:#444441;${p.wn?'':'opacity:.4;'}">${WIN_V[p.wnV-1]?.v||'Windows'}</span>
        <input type="range" min="1" max="${WIN_V.length}" value="${p.wnV}" ${p.wn?'':'disabled'} style="flex:1;accent-color:var(--cyan);" oninput="PR.wnV=+this.value;render()">
        <span class="dev-patch" style="background:${p.wn&&WIN_V[p.wnV-1]?.ps>0?'rgba(226,75,74,.12)':'var(--mid)'};color:${p.wn&&WIN_V[p.wnV-1]?.ps>0?'#E24B4A':'var(--dim)'};">${p.wn?(WIN_V[p.wnV-1]?.ps===0?'Current':WIN_V[p.wnV-1]?.ps+' CVEs'):'Off'}</span>
      </div>
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
