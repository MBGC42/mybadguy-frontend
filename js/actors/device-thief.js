'use strict';
const ACTOR_ID = 'thief';
const A = {
  name:'Opportunistic device thief', sub:'Street theft, device resale, and payment fraud',
  colorClass:'theme-amber', avClass:'av-grey', init:'OT', catLabel:'Financial threat actor',
  tBase:35, sBase:45,
  cf:{age:.5,fin:.6,tech:-.8,iso:.2,pub:.4,sm:.2,role:.1},
  ds:{ip:.95,id:.3,an:.90,mc:.2,wn:.15}, mdmW:.08, lw:{home:.95,usage:.90},
  na:['tech','iso','pub','sm','role','mdm'],
  bio:'Street-level criminal operating in high-density urban environments — bars, nightclubs, transit platforms, tourist areas, concerts. The attack is physical and fast: observe the passcode, grab the device, then immediately use that knowledge to lock the Apple ID, disable Find My, change the Apple ID password, drain Apple Pay and linked bank accounts — all within the first 15 minutes. Stolen Device Protection (iOS 17.3+) was Apple’s direct response. iPhones command the highest resale value ($200–600 on gray markets), making them the primary target.',
  whyIdeal:'The thief targets a moment and an environment — not a person. The ideal target is visibly distracted in a high-risk public environment, using a high-value iPhone, who entered their passcode recently within line of sight.',
  ideal:[
    {key:'age',    l:'Age',             v:'18–40 — heaviest public device use; bars, transit, events'},
    {key:'fin',    l:'Financial status', v:'Middle income to affluent — newer device, more linked payment methods'},
    {key:'tech',   l:'Tech skill',      v:'Not applicable — skill is irrelevant once passcode is observed'},
    {key:'iso',    l:'Social isolation', v:'Not applicable — targets environment and behavior, not identity'},
    {key:'pub',    l:'Public profile',   v:'Not applicable — targets device value, not identity'},
    {key:'sm',     l:'Social media',     v:'Not applicable — social activity not a factor for this actor'},
    {key:'role',   l:'Job data',         v:'Not applicable — device resale and payment accounts are the metrics'},
    {key:'devices',l:'Devices',          v:'iPhone most targeted — highest resale value; Android also targeted'},
    {key:'loc',    l:'Location',         v:'Dense urban essential — nightlife, subway, tourist areas, events'},
  ],
  match:{
    age:p=>p.age>=18&&p.age<=40, fin:p=>p.fin>=3&&p.fin<=4, tech:()=>true,
    iso:()=>true,                pub:()=>true,               sm:()=>true,
    role:()=>true,               devices:p=>p.ip||p.an,      loc:p=>p.home>=3&&p.usage>=2,
  },
  tvecs:[
    {l:'Passcode-observed unlock followed by theft',v:78},{l:'Apple ID lockout via Settings',v:72},
    {l:'Apple Pay / banking app drain',v:68},{l:'Crypto wallet app drainage',v:64},
    {l:'Disable Find My immediately post-theft',v:65},{l:'SIM swap post-theft for 2FA bypass',v:62},
    {l:'Password manager app drain',v:58},{l:'Email account pivot from device access',v:60},
    {l:'Stolen Device Recovery Key bypass attempt',v:55},{l:'Device resale via gray market',v:60},
  ],
  svecs:[
    {l:'Targeting visibly distracted users',v:72},{l:'Bump-and-grab in crowded transit',v:70},
    {l:'Collaborative distraction technique (two thieves)',v:68},{l:'Following victim from ATM or bank',v:65},
    {l:'Targeting impaired or intoxicated users',v:65},{l:'Bar / nightclub device swap or snatch',v:62},
    {l:'Unsafe environment targeting (low lighting)',v:60},{l:'Fake emergency or dropped item diversion',v:55},
    {l:'Distraction / pre-theft social approach',v:58},{l:'Posing as service staff for table access',v:52},
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
