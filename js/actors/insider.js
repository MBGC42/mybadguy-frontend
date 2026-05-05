'use strict';
const ACTOR_ID = 'insider';
const A = {
  name:'Insider threat', sub:'Organizational access abuse',
  colorClass:'theme-red', avClass:'av-green', init:'IT', catLabel:'Technical threat actor',
  tBase:55, sBase:62,
  cf:{age:.1,fin:.3,tech:.2,iso:.2,pub:.4,sm:.3,role:.75},
  ds:{ip:.8,id:.7,an:.75,mc:.85,wn:.88}, mdmW:.95, lw:{home:.15,usage:.35},
  na:[],
  bio:'Employee, contractor, IT administrator, or service technician with legitimate access. This actor does not need to break in — they are already inside. Repair technicians cloning device data while it's "being serviced," family plan holders reading SMS messages, carrier employees pulling location history on behalf of a third party, or corporate IT staff accessing executive communications. The defining characteristic is trusted access combined with motivation: personal grievance, financial incentive, coercion, or simple curiosity.',
  whyIdeal:'The insider already has a foot in the door. The ideal target hands over their device trustingly, without the security awareness to detect silent data extraction or the technical knowledge to audit what was accessed.',
  ideal:[
    {key:'age',    l:'Age',             v:'25–55 — peak career / device handover frequency'},
    {key:'fin',    l:'Financial status', v:'Middle income to affluent — valuable accounts on device'},
    {key:'tech',   l:'Tech skill',      v:'Basic to moderate — unlikely to audit access logs'},
    {key:'iso',    l:'Social isolation', v:'Any environment — isolation not a factor'},
    {key:'pub',    l:'Public profile',   v:'Low to moderate — not publicly visible targets'},
    {key:'sm',     l:'Social media',     v:'Regular — rich personal data on device'},
    {key:'role',   l:'Job data',         v:'Confidential or higher — creates insider motive'},
    {key:'devices',l:'Devices',          v:'iPhone and Mac most targeted for forensic extraction'},
    {key:'loc',    l:'Location',         v:'Urban or frequent repair shop / corporate IT visits'},
  ],
  match:{
    age:p=>p.age>=25&&p.age<=55, fin:p=>p.fin>=3&&p.fin<=4, tech:p=>p.tech<=2,
    iso:()=>true,                pub:p=>p.pub<=2,            sm:p=>p.sm>=3,
    role:p=>p.role>=3,           devices:p=>p.ip||p.mc||p.wn, loc:p=>p.usage>=3||p.home>=3,
  },
  tvecs:[
    {l:'MDM profile silent device control',v:75},{l:'USB forensic extraction during service',v:72},
    {l:'Data clone during physical repair',v:70},{l:'Shared family plan call/SMS monitoring',v:68},
    {l:'Carrier account data pull',v:65},{l:'Shoulder surfing via shared workspace',v:62},
    {l:'Corporate app hidden telemetry',v:60},{l:'iCloud admin access (enterprise)',v:58},
    {l:'Rogue Wi-Fi hotspot at workplace',v:55},{l:'App Store purchase history monitoring',v:52},
  ],
  svecs:[
    {l:'Trusted access exploitation',v:80},{l:'Exploiting repair shop trust',v:75},
    {l:'Impersonating IT support',v:70},{l:'Relationship-based data request',v:68},
    {l:'Coercing via authority position',v:65},{l:'Creating fake device urgency',v:65},
    {l:'Fabricating device issue for access',v:62},{l:'Posing as carrier support rep',v:60},
    {l:'Guilt-tripping family member',v:58},{l:'Social engineering co-workers',v:55},
  ],
};
