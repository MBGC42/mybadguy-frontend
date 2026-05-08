'use strict';
const ACTOR_ID = 'cybercriminal';
const A = {
  name:'Cybercriminal', sub:'Financial gain through fraud and account takeover',
  colorClass:'theme-amber', avClass:'av-amber', init:'CC', catLabel:'Financial threat actor',
  tBase:78, sBase:72,
  cf:{age:.6,fin:.9,tech:-.7,iso:.5,pub:.3,sm:.7,role:.2},
  ds:{ip:.85,id:.55,an:.80,mc:.70,wn:.75}, mdmW:.35, lw:{home:.35,usage:.45},
  na:['role','mdm'],
  bio:'Loosely organized criminal networks — often operating as ransomware-as-a-service or phishing-kit franchises — motivated entirely by speed and scale of monetization. Selling stolen Apple IDs on darknet markets ($15–100 each), committing Apple Pay fraud, draining linked bank and crypto accounts. Phishing kits targeting Apple ID credentials cost under $50 on Telegram channels. At scale, a single campaign compromising 10,000 accounts generates millions in fraud revenue even at low per-account value.',
  whyIdeal:'The cybercriminal optimizes for speed and scale. The ideal target has multiple financial accounts linked to their device, reuses passwords across services, and has no MFA on critical accounts — making credential stuffing a near-automatic path to monetization.',
  ideal:[
    {key:'age',    l:'Age',             v:'25–55 — peak digital banking activity'},
    {key:'fin',    l:'Financial status', v:'Middle income to high wealth — more accounts, higher balances'},
    {key:'tech',   l:'Tech skill',      v:'Basic to moderate — unlikely to detect account access'},
    {key:'iso',    l:'Social isolation', v:'Moderate — less likely to have someone notice the fraud'},
    {key:'pub',    l:'Public profile',   v:'Low to moderate — less scrutiny on financial activity'},
    {key:'sm',     l:'Social media',     v:'Regular to heavy — exposed to social engineering vectors'},
    {key:'role',   l:'Job data',         v:'Not applicable — financial accounts are the primary target'},
    {key:'devices',l:'Devices',          v:'iPhone and Android equally targeted; Windows for credential phishing'},
    {key:'loc',    l:'Location',         v:'Urban with public wifi — higher phishing and relay attack exposure'},
  ],
  match:{
    age:p=>p.age>=25&&p.age<=55, fin:p=>p.fin>=3, tech:p=>p.tech<=2,
    iso:p=>p.iso>=2&&p.iso<=3,   pub:p=>p.pub<=2, sm:p=>p.sm>=3,
    role:()=>true,               devices:p=>p.ip||p.an||p.wn, loc:p=>p.home>=3||p.usage>=3,
  },
  tvecs:[
    {l:'iCloud credential phishing',v:88},{l:'SMS smishing / MFA bypass',v:82},
    {l:'Credential stuffing from breach databases',v:80},{l:'SIM swapping to bypass SMS 2FA',v:78},
    {l:'App Store malware / fake app installs',v:74},{l:'Apple Pay / tap-to-pay relay attack',v:72},
    {l:'Stalkerware purchase and deployment',v:70},{l:'Fake WiFi / evil twin hotspot attack',v:65},
    {l:'Malicious QR code phishing redirect',v:62},{l:'Jailbreak exploit kits',v:60},
  ],
  svecs:[
    {l:'Fake tech support call / callback lure',v:80},{l:'Fake Apple ID reset / account suspended',v:78},
    {l:'Urgent "account will be closed" message',v:74},{l:'Romance / pig-butchering investment scam',v:75},
    {l:'Fraudulent investment scheme on social platforms',v:70},{l:'Gift card / crypto payment luring',v:72},
    {l:'Dating app financial manipulation',v:68},{l:'Social media account impersonation',v:68},
    {l:'Phishing via compromised contact’s message',v:65},{l:'Fake prize / lottery notification',v:60},
  ],
};

// ── LIVE SCORING CONFIG ───────────────────────────────────
// Merge live scoring weights from D1 over the static A object.
// Bio, vecs, ideal, and match stay hardcoded — only the 6 scoring
// fields (tBase, sBase, cf, ds, mdmW, lw) come from the database.
// Uses mbg_actor_configs from sessionStorage (set by detect.js / dashboard.js).
(function mergeActorConfig() {
  try {
    const cached = sessionStorage.getItem('mbg_actor_configs');
    if (!cached) return;
    const configs = JSON.parse(cached);
    const live = configs.find(c => c.id === ACTOR_ID);
    if (!live) return;
    if (live.tBase !== undefined) A.tBase = live.tBase;
    if (live.sBase !== undefined) A.sBase = live.sBase;
    if (live.cf)   A.cf   = live.cf;
    if (live.ds)   A.ds   = live.ds;
    if (live.mdmW !== undefined) A.mdmW = live.mdmW;
    if (live.lw)   A.lw   = live.lw;
  } catch (_) {
    // sessionStorage unavailable or malformed — keep static A values
  }
})();
