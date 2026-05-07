'use strict';

// ── SAVE MODAL ────────────────────────────────────────
// Shared by dashboard.html and report.html.
// Uses PR from scoring.js (loaded before this script).
// Injects a modal overlay — no page navigation needed.

const SAVE_API = 'https://api.mybadguy.com';

function genSaveId() {
  const w = ['amber','arctic','atlas','azure','beacon','birch','bloom','bolt','bridge','cedar',
    'cipher','cobalt','coral','crest','crown','crystal','dawn','delta','drift','dusk',
    'echo','ember','falcon','fjord','flint','forge','frost','gale','garnet','glacier',
    'grove','haven','hawk','ivory','jade','jasper','kite','lance','lark','lava',
    'lemon','lunar','maple','marsh','mist','moss','navy','nexus','nimbus','noble',
    'north','nova','oak','opal','orbit','pearl','pine','pixel','plain','prism',
    'pulse','quartz','raven','reef','ridge','river','rune','sage','salt','sand',
    'sierra','signal','silver','slate','solar','sonic','spark','spire','steel','stone',
    'storm','stream','summit','swift','thorn','tide','timber','trace','trail','vale',
    'vault','vine','violet','vortex','wave','willow','wind','winter','zenith','zinc'];
  const pick = () => w[Math.floor(Math.random() * w.length)];
  return `${pick()} \u00b7 ${pick()} \u00b7 ${pick()} \u00b7 ${pick()}`;
}

function injectSaveCSS() {
  if (document.getElementById('save-modal-css')) return;
  const style = document.createElement('style');
  style.id = 'save-modal-css';
  style.textContent = `
    .save-overlay{position:fixed;inset:0;background:rgba(15,23,42,.85);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem;}
    .save-modal{background:#1e2d4a;border:.5px solid rgba(34,211,238,.2);border-radius:20px;padding:2rem 1.75rem;width:100%;max-width:400px;position:relative;}
    .save-modal-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:.4rem;color:#f1f5f9;}
    .save-modal-sub{font-size:13px;color:#94a3b8;line-height:1.6;margin-bottom:1.25rem;}
    .save-id-box{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;background:rgba(34,211,238,.08);border:.5px solid rgba(34,211,238,.25);border-radius:10px;padding:.85rem 1rem;text-align:center;color:#22d3ee;letter-spacing:.02em;margin-bottom:1rem;word-break:break-all;}
    .save-pin-label{font-size:12px;font-weight:500;color:#94a3b8;margin-bottom:.5rem;}
    .save-pin-row{display:flex;gap:10px;justify-content:center;margin-bottom:1rem;}
    .save-pin-box{width:52px;height:60px;background:#1a2744;border:1.5px solid rgba(255,255,255,.12);border-radius:10px;font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:#22d3ee;text-align:center;outline:none;transition:border-color .15s;}
    .save-pin-box:focus{border-color:#22d3ee;}
    .save-info{font-size:11px;color:#475569;background:rgba(255,255,255,.04);border-radius:8px;padding:.6rem .85rem;margin-bottom:1rem;line-height:1.6;}
    .save-error{font-size:12px;color:#E24B4A;text-align:center;margin-bottom:.75rem;display:none;}
    .save-btn{width:100%;padding:.85rem;border-radius:99px;background:#22d3ee;color:#0f172a;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;border:none;cursor:pointer;transition:opacity .15s;margin-bottom:.5rem;}
    .save-btn:disabled{opacity:.4;cursor:not-allowed;}
    .save-cancel{display:block;text-align:center;font-size:12px;color:#475569;cursor:pointer;padding:.4rem;background:none;border:none;width:100%;}
    .save-cancel:hover{color:#94a3b8;}
    .save-success-icon{width:56px;height:56px;border-radius:50%;background:rgba(34,211,238,.12);border:2px solid #22d3ee;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;}
    .save-copy-hint{font-size:11px;color:#475569;margin-bottom:1.5rem;}
    .save-done-btn{width:100%;padding:.85rem;border-radius:99px;background:#22d3ee;color:#0f172a;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;border:none;cursor:pointer;}
  `;
  document.head.appendChild(style);
}

function openSaveModal() {
  injectSaveCSS();

  const p   = PR;
  const sid = genSaveId();

  // Build device info from PR
  const deviceType = p.ip?'iphone':p.id?'ipad':p.an?'android':p.mc?'mac':'windows';
  const deviceOs   = p.ip?'iOS':p.id?'iPadOS':p.an?'Android':p.mc?'macOS':'Windows';
  const deviceMajor= p.ip||p.id ? (p.iosV||p.ipadV||'26').toString()
                   : p.an ? (p.anV||'1').toString()
                   : p.mc ? (p.mcV||'26').toString()
                   : (p.wnV||'1').toString();
  const patchTier  = p.patchTier || (p.patchScore===0?'current':p.patchScore<30?'behind':'outdated');

  const overlay = document.createElement('div');
  overlay.className = 'save-overlay';
  overlay.id = 'save-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Save your results');

  overlay.innerHTML = `
    <div class="save-modal">
      <h2 class="save-modal-title">Save your results</h2>
      <p class="save-modal-sub">This is your private ID. Only you have this phrase — we cannot see it or recover it.</p>
      <div class="save-id-box" id="saveIdDisplay">${sid}</div>
      <p class="save-pin-label">Choose a 4-digit PIN:</p>
      <div class="save-pin-row" role="group" aria-label="4-digit PIN">
        <input class="save-pin-box" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]*" aria-label="PIN digit 1" data-sidx="0">
        <input class="save-pin-box" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]*" aria-label="PIN digit 2" data-sidx="1">
        <input class="save-pin-box" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]*" aria-label="PIN digit 3" data-sidx="2">
        <input class="save-pin-box" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]*" aria-label="PIN digit 4" data-sidx="3">
      </div>
      <div class="save-info">No recovery flow. If you lose your ID or PIN, start a fresh detection. We cannot access your data — and that is the point.</div>
      <div class="save-error" id="saveError">Something went wrong. Please try again.</div>
      <button class="save-btn" id="saveConfirmBtn" disabled>Save and confirm &rarr;</button>
      <button class="save-cancel" id="saveCancelBtn">Cancel</button>
    </div>`;

  document.body.appendChild(overlay);

  // PIN navigation
  const pinBoxes = [...overlay.querySelectorAll('.save-pin-box')];
  const confirmBtn = overlay.querySelector('#saveConfirmBtn');

  pinBoxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      if (box.value.length === 1 && i < 3) pinBoxes[i + 1].focus();
      confirmBtn.disabled = pinBoxes.map(b => b.value).join('').length < 4;
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && i > 0) {
        pinBoxes[i - 1].focus();
        pinBoxes[i - 1].value = '';
        confirmBtn.disabled = true;
      }
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !confirmBtn.disabled) confirmBtn.click();
    });
  });

  // Cancel
  overlay.querySelector('#saveCancelBtn').addEventListener('click', () => {
    overlay.remove();
  });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.remove();
  });

  // Save
  confirmBtn.addEventListener('click', async () => {
    const pin = pinBoxes.map(b => b.value).join('');
    if (pin.length < 4) return;

    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Saving\u2026';
    overlay.querySelector('#saveError').style.display = 'none';

    try {
      const resp = await fetch(`${SAVE_API}/api/scan/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: sid,
          pin,
          device: {
            type:         deviceType,
            os:           deviceOs,
            major:        deviceMajor,
            patch:        patchTier,
            full_version: p.deviceFullVersion || deviceMajor,
          },
          profile: {
            age_range:        p.age,
            financial_status: p.fin,
            tech_skill:       p.tech,
            social_isolation: p.iso,
            social_media_use: p.sm,
            job_data:         p.role,
            public_profile:   p.pub,
            mdm_level:        p.mdm,
            home_environment: p.home,
            usage_context:    p.usage,
          },
        }),
      });

      if (!resp.ok) throw new Error(`${resp.status}`);

      // Success screen
      overlay.querySelector('.save-modal').innerHTML = `
        <div style="text-align:center;">
          <div class="save-success-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M5 13l6 6L21 7" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="save-modal-title">Results saved</h2>
          <p class="save-modal-sub">Return with your ID and PIN anytime to track your progress and see new threats.</p>
          <div class="save-id-box">${sid}</div>
          <p class="save-copy-hint">Store this phrase somewhere safe &mdash; a password manager, a note, or a photo.</p>
          <button class="save-done-btn" id="saveDoneBtn">Done &rarr;</button>
        </div>`;

      overlay.querySelector('#saveDoneBtn').addEventListener('click', () => {
        overlay.remove();
      });

    } catch (_) {
      const errEl = overlay.querySelector('#saveError');
      if (errEl) errEl.style.display = 'block';
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Save and confirm \u2192';
    }
  });

  // Focus first PIN box
  setTimeout(() => pinBoxes[0].focus(), 100);
}
