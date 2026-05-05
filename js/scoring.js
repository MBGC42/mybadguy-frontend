/* MyBadGuy — scoring.js
   Loaded before actor.js. Defines:
     PR          — user profile from sessionStorage (or defaults)
     IOS_V …     — CVE patch score tables per platform version
     calcScore(a)— score engine using global PR + actor config A
     scoreClass  — CSS class helpers for score levels
*/
'use strict';

const PR = JSON.parse(sessionStorage.getItem('mbg_profile') || 'null') || {
  age:42, fin:3, tech:2, iso:2, sm:2, role:1, pub:1, mdm:1, home:2, usage:1,
  ip:true, iosV:1, id:false, ipadV:1,
  an:false, anV:1, mc:false, mcV:1, wn:false, wnV:1,
};

/* Patch score tables — higher index = older OS = more unpatched CVEs */
const IOS_V     = [{ps:0},{ps:0},{ps:6},{ps:9},{ps:14},{ps:20},{ps:32},{ps:38},{ps:44},{ps:82}];
const IPAD_V    = [{ps:0},{ps:0},{ps:6},{ps:9},{ps:17},{ps:30},{ps:52},{ps:78},{ps:112}];
const ANDROID_V = [{ps:0},{ps:28},{ps:62},{ps:98},{ps:134},{ps:178},{ps:224}];
const MAC_V     = [{ps:0},{ps:0},{ps:6},{ps:9},{ps:17},{ps:28},{ps:48},{ps:92}];
const WIN_V     = [{ps:0},{ps:28},{ps:66},{ps:104},{ps:112},{ps:186},{ps:248}];

function calcScore(a) {
  const p = PR;
  let db = 0;
  if (p.ip) db += (IOS_V[p.iosV     - 1]?.ps || 0) * a.ds.ip * 0.25;
  if (p.id) db += (IPAD_V[p.ipadV   - 1]?.ps || 0) * a.ds.id * 0.18;
  if (p.an) db += (ANDROID_V[p.anV  - 1]?.ps || 0) * a.ds.an * 0.22;
  if (p.mc) db += (MAC_V[p.mcV      - 1]?.ps || 0) * a.ds.mc * 0.16;
  if (p.wn) db += (WIN_V[p.wnV      - 1]?.ps || 0) * a.ds.wn * 0.20;
  db = Math.round(db);

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

/* CSS class helpers — use these instead of inline style colors */
function scoreClass(v) { return v >= 70 ? 'c-high' : v >= 45 ? 'c-med' : 'c-low'; }
function fillClass(v)  { return v >= 70 ? 'fill-high' : v >= 45 ? 'fill-med' : 'fill-low'; }
function chipCoClass(v){ return v >= 70 ? 'chip-hi' : v >= 45 ? 'chip-mi' : 'chip-lo'; }
function scoreLabel(v) { return v >= 70 ? 'High' : v >= 45 ? 'Medium' : 'Lower'; }
