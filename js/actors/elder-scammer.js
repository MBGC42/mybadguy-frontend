'use strict';
const ACTOR_ID = 'scammer';
const A = {
  name:'Elder-targeting scammer', sub:'Fraud through authority impersonation',
  colorClass:'theme-blue', avClass:'av-orange', init:'ES', catLabel:'Social threat actor',
  tBase:22, sBase:88,
  cf:{age:.95,fin:.7,tech:-.9,iso:.85,pub:.1,sm:.3,role:.05},
  ds:{ip:.9,id:.6,an:.7,mc:.5,wn:.55}, mdmW:.02, lw:{home:.05,usage:.05},
  na:['loc'],
  bio:'Organized call centers — primarily in Southeast Asia, Eastern Europe, and West Africa — running Apple support impersonation, IRS/Social Security fraud, "grandparent emergency" scams, and cryptocurrency investment frauds targeting adults 65 and older. FBI IC3 data shows adults 60+ reported $4.8 billion in fraud losses in 2024 — the highest of any age group. This actor’s primary weapon is not technology but psychology: manufactured fear, urgency, authority, and isolation from the support network that would otherwise intervene.',
  whyIdeal:'The scammer hunts a psychology, not a demographic. Accumulated savings, cognitive changes, social isolation, deep trust in authority figures (IRS, Apple, law enforcement), and reduced familiarity with digital fraud patterns create a vulnerability that technical defenses alone cannot address.',
  ideal:[
    {key:'age',    l:'Age',             v:'65 and older — FBI IC3 highest-loss demographic'},
    {key:'fin',    l:'Financial status', v:'Middle income to high wealth — retirement savings are the target'},
    {key:'tech',   l:'Tech skill',      v:'No tech skills to basic — unfamiliar with how scams work'},
    {key:'iso',    l:'Social isolation', v:'High to severe — no one to verify the story with'},
    {key:'pub',    l:'Public profile',   v:'Very private — scammers source details from data brokers'},
    {key:'sm',     l:'Social media',     v:'Casual to never — limited awareness of digital fraud patterns'},
    {key:'role',   l:'Job data',         v:'No work data — retired population is primary target'},
    {key:'devices',l:'Devices',          v:'iPhone strongly preferred — scammers impersonate Apple support specifically'},
    {key:'loc',    l:'Location',         v:'Not applicable — call centers operate globally by phone'},
  ],
  match:{
    age:p=>p.age>=65,   fin:p=>p.fin>=3,   tech:p=>p.tech<=2, iso:p=>p.iso>=4,
    pub:p=>p.pub===1,   sm:p=>p.sm<=2,     role:p=>p.role===1,devices:p=>p.ip,   loc:()=>false,
  },
  tvecs:[
    {l:'Caller ID spoofing to appear as Apple/IRS/police',v:65},{l:'IRS/law enforcement impersonation',v:65},
    {l:'Fake bank account security text alert',v:62},{l:'iMessage impersonating Apple Support',v:55},
    {l:'Remote screen share via fake support call',v:52},{l:'Fake government benefit or refund call',v:58},
    {l:'Grandchild emergency scenario SMS',v:50},{l:'Fake Apple security alert push notification',v:48},
    {l:'Gift card payment instruction via Safari',v:40},{l:'Simulated device virus / breach alert',v:45},
  ],
  svecs:[
    {l:'Authority impersonation (IRS / Apple / police)',v:92},{l:'Fear and urgency manufacture',v:90},
    {l:'Fabricating legal jeopardy (arrest threat)',v:85},{l:'Grandparent scenario exploitation',v:85},
    {l:'Isolation from family verification',v:80},{l:'Repeated contact / grooming campaign',v:78},
    {l:'Building false rapport over multiple calls',v:75},{l:'Exploiting grief, loneliness, and isolation',v:72},
    {l:'Using real personal info from data breaches',v:70},{l:'Promising prizes / lottery rewards',v:65},
  ],
};
