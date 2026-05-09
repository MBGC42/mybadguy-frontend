/* MyBadGuy — actor.js
   Requires globals: A (actor config), ACTOR_ID, PR, calcScore etc (from scoring.js)
   Strict CSP compliant — zero inline styles, zero inline event handlers.
   All colours via CSS classes. Dynamic widths via data-w + applyDynamics().
*/
'use strict';

/* ── Theme: body class sets --gc/--ghbg/--ghtc via CSS ─── */
document.body.classList.add(A.colorClass || 'theme-red');

/* ── State ───────────────────────────────────────────────── */
const SCORES  = calcScore(A);
let   TAB     = 'technical';
let   REM_DATA = null;

/* ── Platform detection ──────────────────────────────────── */
function detectPlatform() {
  if (PR.ip) return 'ios';
  if (PR.id) return 'ios';
  if (PR.an) return 'android';
  if (PR.mc) return 'mac';
  if (PR.wn) return 'windows';
  return 'all';
}

/* ── Apply dynamic widths after innerHTML ─────────────────── */
function applyDynamics(el) {
  el.querySelectorAll('[data-w]').forEach(bar => {
    bar.style.width = bar.dataset.w + '%';
  });
}

/* ── Render: vector list ─────────────────────────────────── */
function renderVecs(vecs, title, score) {
  let h = `<p class="panel-title">${title} <span class="panel-title-score">— score ${score}/99</span></p>`;
  vecs.forEach(v => {
    const fc = fillClass(v.v);
    const cc = scoreClass(v.v);
    h += `<div class="vec-row">
      <span class="vec-label">${v.l}</span>
      <div class="vec-bar"><div class="vec-fill ${fc}" data-w="${v.v}"></div></div>
      <span class="vec-val ${cc}">${v.v}</span>
    </div>`;
  });
  return h;
}

/* ── Render: bio tab ─────────────────────────────────────── */
function renderBio() {
  const mc = A.ideal.filter(f => !A.na.includes(f.key) && A.match[f.key] && A.match[f.key](PR)).length;
  const illoEl = document.getElementById('actor-illo');
  const illo   = illoEl ? `<div class="illo-wrap">${illoEl.innerHTML}</div>` : '';

  let h = `<p class="panel-title panel-title-flex">
    Ideal target profile
    ${mc > 0 ? `<span class="rbadge diff-hard">${mc} field${mc > 1 ? 's' : ''} match your profile</span>` : ''}
  </p>`;
  h += illo;
  h += `<p class="bio-text">${A.bio}</p>`;
  h += `<p class="ideal-section-title">Ideal consumer target</p>`;
  h += `<div class="match-legend">
    <span><span class="leg-sw leg-match"></span>Matches your profile</span>
    <span><span class="leg-sw leg-na"></span>Not applicable to this actor</span>
  </div>`;
  h += `<div class="ideal-grid">`;
  A.ideal.forEach(f => {
    const isNA = A.na.includes(f.key);
    const isM  = !isNA && A.match[f.key] && A.match[f.key](PR);
    h += `<div class="ideal-card${isNA ? ' na' : isM ? ' match' : ''}">
      <div class="ideal-lbl">${f.l}</div>
      <div class="ideal-val">${f.v}</div>
    </div>`;
  });
  h += `</div><div class="ideal-why"><strong>Why this profile?</strong> ${A.whyIdeal}</div>`;
  return h;
}

/* ── Render: weighted tab ────────────────────────────────── */
function renderWeighted(sc) {
  const factors = [
    { l:'Age sensitivity',          w: A.cf.age  },
    { l:'Financial attractiveness', w: A.cf.fin  },
    { l:'Low tech skill (inverse)', w: Math.max(0, -A.cf.tech) },
    { l:'Social isolation',         w: A.cf.iso  },
    { l:'Public profile',           w: A.cf.pub  },
    { l:'Social media use',         w: A.cf.sm   },
    { l:'Job data sensitivity',     w: A.cf.role },
    { l:'MDM enrollment',           w: A.mdmW    },
    { l:'Home environment',         w: Math.abs(A.lw.home)  },
    { l:'Usage context',            w: A.lw.usage },
  ];

  let h = `<p class="panel-title">Consumer attraction factors</p><div class="cf-grid">`;
  factors.forEach(f => {
    const pct = Math.round(f.w * 100);
    const fc  = pct >= 70 ? 'fill-high' : pct >= 40 ? 'fill-med' : 'fill-low';
    const cc  = pct >= 70 ? 'c-high'    : pct >= 40 ? 'c-med'    : 'c-low';
    h += `<div class="cf-card">
      <div class="cf-name">${f.l}</div>
      <div class="cf-bar"><div class="cf-fill ${fc}" data-w="${pct}"></div></div>
      <div class="cf-val ${cc}">${pct}%</div>
    </div>`;
  });
  h += `</div><div class="boost-grid">`;

  [
    { l:'Consumer profile boost', v: sc.cb },
    { l:'Device OS boost',        v: sc.db },
    { l:'MDM boost',              v: sc.mb },
    { l:'Location boost',         v: sc.lb },
  ].forEach(b => {
    const cls = b.v > 0 ? 'boost-pos' : b.v === 0 ? 'boost-zero' : 'boost-neg';
    const txt = b.v > 0 ? `+${b.v} pts` : b.v === 0 ? 'No boost' : `${b.v} pts`;
    h += `<div class="boost-card">
      <div class="boost-lbl">${b.l}</div>
      <div class="boost-val ${cls}">${txt}</div>
    </div>`;
  });
  h += `</div>`;
  return h;
}

/* ── Render: remediation tab (API-driven) ─────────────────── */
function renderRemediationLoading() {
  return `<div class="rem-loading"><div class="rem-spinner"></div>Loading your personalised plan…</div>`;
}

function renderRemediationError() {
  return `<div class="rem-error">
    <p>Unable to load remediation recommendations right now.</p>
    <p class="rem-error-note">These are backed by CIS Controls v8.1, NIST CSF 2.0, and FBI IC3 2024. Check <a href="../sources.html">our data sources</a>.</p>
  </div>`;
}

// ── TACTIC LABEL MAP ────────────────────────────────
const TACTIC_LABELS = {
  'initial-access':             'Initial Access',
  'execution':                  'Execution',
  'persistence':                'Persistence',
  'privilege-escalation':       'Privilege Escalation',
  'defense-evasion':            'Defense Evasion',
  'credential-access':          'Credential Access',
  'discovery':                  'Discovery',
  'collection':                 'Collection',
  'command-and-control':        'Command & Control',
  'exfiltration':               'Exfiltration',
  'impact':                     'Impact',
  'remote-access':              'Remote Access',
  'anti-behavioral-detection':  'Anti-Detection',
  'network-effects':            'Network Effects',
};

function parseTactics(tagsJson) {
  try {
    const tags = JSON.parse(tagsJson || '[]');
    return tags.map(t => TACTIC_LABELS[t] || t).filter(Boolean);
  } catch (_) { return []; }
}

function renderRemediationCards(data) {
  if (!data || !data.remediations || !data.remediations.length) return renderRemediationError();

  const groups = { 1:[], 2:[], 3:[], 4:[] };
  data.remediations.forEach(r => { (groups[r.priority] || groups[4]).push(r); });

  const priLabels = { 1:'Critical — do these first', 2:'High — do these next', 3:'Medium — when you have time', 4:'Additional' };
  const priClass  = { 1:'pri-hdr-1', 2:'pri-hdr-2', 3:'pri-hdr-3', 4:'pri-hdr-3' };
  const numClass  = { 1:'rem-num-1', 2:'rem-num-2', 3:'rem-num-3', 4:'rem-num-3' };
  const diffClass = { easy:'diff-easy', medium:'diff-medium', hard:'diff-hard' };
  const diffLabel = { easy:'Easy', medium:'Medium', hard:'Hard' };

  let h   = `<p class="panel-title">Your remediation plan — ${data.platform === 'all' ? 'all platforms' : data.platform}</p>`;
  let num = 1;

  [1,2,3,4].forEach(pri => {
    const items = groups[pri];
    if (!items.length) return;
    h += `<div class="pri-group">
      <div class="pri-hdr ${priClass[pri]}">
        <span class="pri-title">${priLabels[pri]}</span>
        <span class="pri-count">${items.length} step${items.length > 1 ? 's' : ''}</span>
      </div>`;
    items.forEach(r => {
      const dc  = diffClass[r.difficulty] || 'diff-easy';
      const dl  = diffLabel[r.difficulty] || 'Easy';
      const nc  = numClass[pri];
      const url    = r.source_url   || '#';
      const lbl    = r.source_label || 'Source';
      const tactics = parseTactics(r.tactic_tags);
      h += `<div class="rem-card" data-rem="${num}">
        <div class="rem-card-hdr">
          <div class="rem-num ${nc}">${num++}</div>
          <div class="rem-title-wrap">
            <div class="rem-title">${r.title}</div>
            <div class="rem-badges"><span class="rbadge ${dc}">${dl}</span></div>
          </div>
          <span class="rem-expand">▾</span>
        </div>
        <div class="rem-body">
          <div class="rem-action-label">Steps to take</div>
          <div class="rem-action">${r.action}</div>
          <div class="rem-why-label">Why this matters</div>
          <div class="rem-why">${r.why}</div>
          <div class="rem-pills">
            ${tactics.map(t => `<span class="rem-tactic">Tactic: ${t}</span>`).join('')}
            <a href="${url}" class="rem-source" target="_blank" rel="noopener noreferrer">📋 ${lbl}</a>
          </div>
        </div>
      </div>`;
    });
    h += `</div>`;
  });
  return h;
}

async function fetchRemediations() {
  if (REM_DATA) {
    document.getElementById('panel').innerHTML = renderRemediationCards(REM_DATA);
    return;
  }
  document.getElementById('panel').innerHTML = renderRemediationLoading();
  try {
    const resp = await fetch(`https://api.mybadguy.com/api/actor/${ACTOR_ID}/remediations?platform=${detectPlatform()}`);
    if (!resp.ok) throw new Error(`${resp.status}`);
    REM_DATA = await resp.json();
    document.getElementById('panel').innerHTML = renderRemediationCards(REM_DATA);
  } catch (_) {
    document.getElementById('panel').innerHTML = renderRemediationError();
  }
}

/* ── Tab rendering ───────────────────────────────────────── */
function setPanel(html) {
  const panel = document.getElementById('panel');
  panel.innerHTML = html;
  applyDynamics(panel);
}

function renderPanel(sc) {
  if (TAB === 'technical')   return renderVecs(A.tvecs, 'Technical attack vectors', sc.t);
  if (TAB === 'social')      return renderVecs(A.svecs, 'Social engineering vectors', sc.s);
  if (TAB === 'bio')         return renderBio();
  if (TAB === 'weighted')    return renderWeighted(sc);
  return '';
}

function renderTabs() {
  const tabs = ['technical','social','bio','weighted','remediation'];
  return tabs.map(t =>
    `<button class="tab${t === TAB ? ' on' : ''}" data-tab="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</button>`
  ).join('');
}

/* ── Event delegation — no inline handlers ────────────────── */
document.addEventListener('click', e => {
  const tabBtn = e.target.closest('[data-tab]');
  if (tabBtn) {
    TAB = tabBtn.dataset.tab;
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
    tabBtn.classList.add('on');
    TAB === 'remediation' ? fetchRemediations() : setPanel(renderPanel(SCORES));
    return;
  }
  const remCard = e.target.closest('.rem-card');
  if (remCard) remCard.classList.toggle('open');
});

/* ── Initial render ──────────────────────────────────────── */
function init() {
  const sc  = SCORES;
  const coc = chipCoClass(sc.co);

  document.getElementById('page').innerHTML = `
    <div class="actor-hdr">
      <div class="actor-avatar ${A.avClass || 'av-cyan'}" id="actor-av">${A.init}</div>
      <div class="actor-hdr-meta">
        <div class="actor-cat">${A.catLabel}</div>
        <div class="actor-hdr-name">${A.name}</div>
        <div class="actor-hdr-sub">${A.sub}</div>
        <div class="score-chips">
          <span class="score-chip chip-t">Technical: ${sc.t}/99</span>
          <span class="score-chip chip-s">Social: ${sc.s}/99</span>
          <span class="score-chip ${coc}">Combined: ${sc.co}/99 — ${scoreLabel(sc.co)}</span>
        </div>
      </div>
    </div>
    <div class="tabs">${renderTabs()}</div>
    <div class="panel" id="panel">${renderPanel(sc)}</div>
    <div class="attribution">This product uses data from the NVD API but is not endorsed or certified by the NVD.</div>
  `;

  applyDynamics(document.getElementById('panel'));
}

init();
