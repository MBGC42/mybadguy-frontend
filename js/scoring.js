/* MyBadGuy — scoring.js
   Loaded before actor.js. Defines:
     PR          — user profile from sessionStorage (or defaults)
     calcScore(a)— score engine using global PR + actor config A
     scoreClass  — CSS class helpers for score levels

   v2.0 — patchScore is now live data from /api/cve-stats/:platform
   (fetched during detection in detect.js, stored in sessionStorage profile)
   Legacy IOS_V/WIN_V tables removed — patchScore replaces them.
*/
'use strict';

const PR = JSON.parse(sessionStorage.getItem('mbg_profile') || 'null') || {
  age:42, fin:3, tech:2, iso:2, sm:2, role:1, pub:1, mdm:1, home:2, usage:1,
  ip:true, iosV:1, id:false, ipadV:1,
  an:false, anV:1, mc:false, mcV:1, wn:false, wnV:1,
  patchScore:0, wildScore:0, patchTier:'current',
};

function calcScore(a) {
  const p = PR;

  // Device boost — uses live CVE patch score instead of hardcoded arrays.
  // patchScore = actual unpatched CVE count for the user's patch tier.
  // wildScore  = of those, how many are confirmed in-wild (KEV/Apple).
  // KEV CVEs count 1.5× — confirmed exploitation vs theoretical.
  const ps = p.patchScore || 0;
  const ws = p.wildScore  || 0;
  const effectivePs = (ps - ws) + (ws * 1.5); // wild CVEs weighted higher

  // Actor platform weight determines how much CVEs matter for this actor type
  // (APTs rely heavily on CVEs; elder scammers barely use them)
  let platformWeight = 0;
  if (p.ip) platformWeight = a.ds.ip;
  if (p.id) platformWeight = a.ds.id;
  if (p.an) platformWeight = a.ds.an;
  if (p.mc) platformWeight = a.ds.mc;
  if (p.wn) platformWeight = a.ds.wn;

  // Scale: effectivePs of ~200 at full weight → db contribution ~50
  // 200 × 0.25 (scale) × 1.0 (weight) = 50 — reasonable ceiling
  const db = Math.round(effectivePs * platformWeight * 0.25);

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
    f.age  * (an2 * 12)     +
    f.fin  * (p.fin  - 1) * 3 +
    f.tech * (3 - p.tech) * 3 +
    f.iso  * (p.iso  - 1) * 4 +
    f.pub  * (p.pub  - 1) * 3 +
    f.sm   * (p.sm   - 1) * 3 +
    f.role * (p.role - 1) * 5
  );

  const t  = Math.min(99, Math.max(1, a.tBase + Math.round(cb * .5) + db + mb + lb));
  const s  = Math.min(99, Math.max(1, a.sBase + Math.round(cb * .5)));
  return { t, s, cb, db, mb, lb, co: Math.round((t + s) / 2) };
}

/* CSS class helpers */
function scoreClass(v) { return v >= 70 ? 'c-high' : v >= 45 ? 'c-med' : 'c-low'; }
function fillClass(v)  { return v >= 70 ? 'fill-high' : v >= 45 ? 'fill-med' : 'fill-low'; }
function chipCoClass(v){ return v >= 70 ? 'chip-hi' : v >= 45 ? 'chip-mi' : 'chip-lo'; }
function scoreLabel(v) { return v >= 70 ? 'High' : v >= 45 ? 'Medium' : 'Lower'; }
