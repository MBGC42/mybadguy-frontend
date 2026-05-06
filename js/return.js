'use strict';

const API = 'https://api.mybadguy.com';

// ── DOM REFS ──────────────────────────────────────────────
const scanIdEl  = document.getElementById('scanId');
const pinBoxes  = [...document.querySelectorAll('.pin-box')];
const returnBtn = document.getElementById('returnBtn');
const statusMsg = document.getElementById('statusMsg');
const threatsBanner = document.getElementById('threatsBanner');

// ── HELPERS ───────────────────────────────────────────────
function getPin() { return pinBoxes.map(b => b.value).join(''); }

function getScanId() {
  // Normalise: accept any separator (space, dot, middot, comma, dash).
  // Always convert to the canonical ' · ' format the API expects.
  return scanIdEl.value.trim().toLowerCase()
    .replace(/\s*[·•\.\-,_|/]+\s*/g, ' ')  // collapse any separator to a space
    .replace(/\s+/g, ' ')                       // collapse multiple spaces
    .split(' ')
    .filter(Boolean)
    .join(' · ');                            // join with ' · '
}

function validate() {
  const id  = getScanId();
  const pin = getPin();
  // Accept 4 words separated by any whitespace or punctuation
  const rawWords = scanIdEl.value.trim().toLowerCase().split(/[\s·•.,\-_|/]+/).filter(Boolean);
  const idOk  = rawWords.length === 4 && rawWords.every(w => /^[a-z]{3,12}$/.test(w));
  const pinOk = /^\d{4}$/.test(pin);
  returnBtn.disabled = !(idOk && pinOk);
}

function showError(msg) {
  statusMsg.textContent = msg;
  statusMsg.className = 'status-msg error';
  statusMsg.style.display = 'block';
  returnBtn.disabled = false;
  returnBtn.textContent = 'View my profile →';
}

function showLoading(msg) {
  statusMsg.textContent = msg;
  statusMsg.className = 'status-msg loading';
  statusMsg.style.display = 'block';
}

// ── PIN NAVIGATION ────────────────────────────────────────
pinBoxes.forEach((box, i) => {
  box.addEventListener('input', () => {
    if (box.value.length === 1 && i < 3) pinBoxes[i + 1].focus();
    validate();
  });
  box.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !box.value && i > 0) {
      pinBoxes[i - 1].focus();
      pinBoxes[i - 1].value = '';
      validate();
    }
  });
});

scanIdEl.addEventListener('input', validate);

// Allow pasting a full ID string
scanIdEl.addEventListener('paste', () => {
  setTimeout(validate, 0);
});

// ── PROFILE BUILDER ───────────────────────────────────────
// Maps DB field names back to the PR format dashboard.js expects.
function buildProfileFromScan(scan, cveStats) {
  const tiers  = cveStats?.tiers || { current:{ps:0,wild:0}, behind:{ps:15,wild:3}, outdated:{ps:80,wild:20} };
  const tier   = scan.device_patch === 'current' ? 'current'
               : scan.device_patch === 'behind'  ? 'behind'
               : 'outdated';
  const ps     = tiers[tier]?.ps   ?? 0;
  const ws     = tiers[tier]?.wild ?? 0;

  // Map device type to device flags
  const ip = scan.device_type === 'iphone';
  const id = scan.device_type === 'ipad';
  const an = scan.device_type === 'android';
  const mc = scan.device_type === 'mac';
  const wn = scan.device_type === 'windows';
  const vIdx = tier === 'current' ? 1 : tier === 'behind' ? 3 : 6;

  return {
    // 10 profile answers — map DB column names to PR keys
    age:   scan.age_range        || 35,
    fin:   scan.financial_status || 1,
    tech:  scan.tech_skill       || 1,
    iso:   scan.social_isolation || 1,
    sm:    scan.social_media_use || 1,
    role:  scan.job_data         || 0,
    pub:   scan.public_profile   || 0,
    mdm:   scan.mdm_level        || 0,
    home:  scan.home_environment || 1,
    usage: scan.usage_context    || 0,

    // Device flags
    ip, id, an, mc, wn,
    iosV: vIdx, ipadV: vIdx, anV: vIdx, mcV: vIdx, wnV: vIdx,

    // Live patch scoring
    patchScore:        ps,
    wildScore:         ws,
    patchTier:         tier,
    deviceFullVersion: scan.device_full_version || scan.device_major || '',

    // Meta
    scanId:       scan.id,
    returnedAt:   new Date().toISOString(),
  };
}

// ── RETURN FLOW ───────────────────────────────────────────
async function doReturn() {
  returnBtn.disabled  = true;
  returnBtn.textContent = 'Looking up your profile…';
  statusMsg.style.display = 'none';
  threatsBanner.style.display = 'none';

  const scan_id = getScanId();
  const pin     = getPin();

  // 1. Retrieve saved scan
  showLoading('Retrieving your profile…');
  let scanData;
  try {
    const r = await fetch(`${API}/api/scan/retrieve?scan_id=${encodeURIComponent(scan_id)}&pin=${encodeURIComponent(pin)}`);
    if (r.status === 429) { showError('Too many attempts. Please wait a minute and try again.'); return; }
    if (r.status === 401) { showError('ID or PIN not recognised. Please check and try again.'); return; }
    if (!r.ok)            { showError('Something went wrong. Please try again.'); return; }
    scanData = await r.json();
  } catch (_) {
    showError('Could not connect. Please check your connection and try again.');
    return;
  }

  const scan   = scanData.scan;
  const newCVEs = scanData.new_threats_since_last_scan || 0;

  // 2. Fetch live CVE stats for their platform
  showLoading('Refreshing threat data…');
  let cveStats = null;
  try {
    const r = await fetch(`${API}/api/cve-stats/${scan.device_type}`);
    if (r.ok) cveStats = await r.json();
  } catch (_) {}

  // 3. Build PR and store in sessionStorage
  const profile = buildProfileFromScan(scan, cveStats);
  sessionStorage.setItem('mbg_profile', JSON.stringify(profile));

  // 4. Show new threats banner briefly if there are new CVEs since last visit
  if (newCVEs > 0) {
    threatsBanner.textContent = `⚠️ ${newCVEs} new threat${newCVEs === 1 ? '' : 's'} published since your last visit. Your scores have been updated.`;
    threatsBanner.style.display = 'block';
    showLoading('New threats detected — loading your updated dashboard…');
    await new Promise(r => setTimeout(r, 1800));
  } else {
    showLoading('Loading your dashboard…');
    await new Promise(r => setTimeout(r, 400));
  }

  // 5. Navigate to dashboard
  window.location.href = 'dashboard.html';
}

// ── EVENT LISTENERS ───────────────────────────────────────
returnBtn.addEventListener('click', doReturn);

// Submit on Enter key from PIN or ID field
[scanIdEl, ...pinBoxes].forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !returnBtn.disabled) doReturn();
  });
});
