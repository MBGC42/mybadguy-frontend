'use strict';
const ACTOR_ID = 'broker';
const A = {
  name:'Data broker / adtech', sub:'Passive behavioral data harvesting',
  colorClass:'theme-red', avClass:'av-purple', init:'DB', catLabel:'Technical threat actor',
  tBase:42, sBase:35,
  cf:{age:.3,fin:.7,tech:-.2,iso:.1,pub:.5,sm:.85,role:.2},
  ds:{ip:.7,id:.8,an:.75,mc:.55,wn:.60}, mdmW:.10, lw:{home:.55,usage:.30},
  na:['iso','role','mdm'],
  bio:'Embeds data-harvesting SDKs inside legitimate apps downloaded by millions of users who have no idea the SDK exists. The app developer gets paid; the broker gets a comprehensive behavioral, location, and demographic profile that is sold to advertisers, insurers, political campaigns, and government agencies. Apple's App Tracking Transparency framework (2021) significantly reduced this actor's iOS reach, but cross-context aggregation from loyalty programs, email pixels, and browser fingerprinting continues at scale.',
  whyIdeal:'The broker wants volume and behavioral richness, not identity. A 28-year-old heavy social media user who grants location access to everything and uses 40 apps is worth far more than a cautious executive who uses three.',
  ideal:[
    {key:'age',    l:'Age',             v:'18–45 — heaviest app installation and usage'},
    {key:'fin',    l:'Financial status', v:'Middle income to affluent — purchasing data most valuable'},
    {key:'tech',   l:'Tech skill',      v:'Basic to moderate — less likely to audit permissions'},
    {key:'iso',    l:'Social isolation', v:'Not applicable — behavioral data is the target'},
    {key:'pub',    l:'Public profile',   v:'Moderate to high — cross-references public social data'},
    {key:'sm',     l:'Social media',     v:'Heavy user to influencer — primary data enrichment source'},
    {key:'role',   l:'Job data',         v:'Not applicable — consumer behavior is the target'},
    {key:'devices',l:'Devices',          v:'iPad highest-value; Android slightly easier post-ATT'},
    {key:'loc',    l:'Location',         v:'Urban environments make location profiles far more commercially valuable'},
  ],
  match:{
    age:p=>p.age>=18&&p.age<=45, fin:p=>p.fin>=3&&p.fin<=4, tech:p=>p.tech<=2,
    iso:()=>true,                pub:p=>p.pub>=3,            sm:p=>p.sm>=4,
    role:()=>true,               devices:p=>p.id||p.an,      loc:p=>p.home>=3,
  },
  tvecs:[
    {l:'Cross-context data aggregation via SDK network',v:72},{l:'SDK bundled inside legitimate apps',v:68},
    {l:'Health app SDK data harvesting',v:65},{l:'Device fingerprinting (IDFA/ATT bypass)',v:62},
    {l:'Email tracking pixel behavioral profiling',v:58},{l:'Location data purchased from carrier partners',v:55},
    {l:'Browser fingerprinting via WebKit APIs',v:52},{l:'Loyalty program data aggregation',v:48},
    {l:'Third-party keyboard data collection',v:45},{l:'Bluetooth beacon triangulation',v:38},
  ],
  svecs:[
    {l:'Social media login data sharing',v:65},{l:'Dark-pattern permission prompts',v:62},
    {l:'Free service in exchange for data rights',v:60},{l:'Deceptive "personalization" consent flows',v:55},
    {l:'Default opt-in settings exploitation',v:58},{l:'Free-app data trade-off consent',v:58},
    {l:'Terms of service consent laundering',v:48},{l:'Gamification rewards for data permissions',v:42},
    {l:'Survey / quiz data collection luring',v:38},{l:'Loyalty program aggregation incentives',v:32},
  ],
};
