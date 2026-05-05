'use strict';
const ACTOR_ID = 'stalker';
const A = {
  name:'Intimate-partner abuser', sub:'Surveillance & control through technology',
  colorClass:'theme-blue', avClass:'av-red', init:'IP', catLabel:'Social threat actor',
  tBase:58, sBase:90,
  cf:{age:.2,fin:.1,tech:-.3,iso:.9,pub:.1,sm:.5,role:.1},
  ds:{ip:.9,id:.7,an:.85,mc:.5,wn:.4}, mdmW:.05, lw:{home:-.20,usage:.10},
  na:['role','mdm'],
  bio:'This actor is typically known to the victim — an ex-partner, current spouse, family member, or caregiver. Physical proximity and emotional leverage provide access that most hackers cannot buy at any price. Apple's own ecosystem is frequently weaponized: shared iCloud accounts expose messages, photos, and location; Find My is coerced as a "condition of trust"; Screen Time controls are used to restrict who the victim can contact. If you believe you may be experiencing this, support is available at the National Domestic Violence Hotline: 1-800-799-7233 or thehotline.org.',
  whyIdeal:'Physical proximity and emotional coercion eliminate the need for technical sophistication. The ideal target is financially or emotionally dependent, isolated from their support network, and unaware of what is happening to their device.',
  ideal:[
    {key:'age',    l:'Age',             v:'18–45 — peak intimate-partner violence demographic'},
    {key:'fin',    l:'Financial status', v:'Any — financial dependence increases vulnerability significantly'},
    {key:'tech',   l:'Tech skill',      v:'Basic to no tech skill — less likely to detect monitoring'},
    {key:'iso',    l:'Social isolation', v:'High to severe — primary risk amplifier for this actor'},
    {key:'pub',    l:'Public profile',   v:'Very private — abuser controls public narrative'},
    {key:'sm',     l:'Social media',     v:'Regular — monitored and controlled by abuser'},
    {key:'role',   l:'Job data',         v:'Not applicable — personal control is the target'},
    {key:'devices',l:'Devices',          v:'iPhone most targeted; Android also heavily affected'},
    {key:'loc',    l:'Location',         v:'Rural and suburban isolation reduces access to support services'},
  ],
  match:{
    age:p=>p.age>=18&&p.age<=45, fin:()=>true,     tech:p=>p.tech<=2,  iso:p=>p.iso>=4,
    pub:p=>p.pub===1,            sm:p=>p.sm===3,   role:()=>true,      devices:p=>p.ip||p.an,
    loc:p=>p.home<=2,
  },
  tvecs:[
    {l:'AirTag covert tracking',v:88},{l:'Shared carrier plan location monitoring',v:82},
    {l:'Find My / location sharing coercion',v:85},{l:'Shared iCloud account access',v:80},
    {l:'Vehicle GPS tracker installation',v:72},{l:'Smart home device surveillance',v:70},
    {l:'Screen Time abuse as restriction mechanism',v:62},{l:'Social media location metadata mining',v:58},
    {l:'Fitness tracker location history access',v:55},{l:'Keylogger apps via physical access',v:44},
  ],
  svecs:[
    {l:'Coercing password and PIN sharing',v:94},{l:'Isolating victim from support network',v:90},
    {l:'Digital control as isolation mechanism',v:85},{l:'Monitoring messages over shoulder',v:88},
    {l:'Threatening to share private content',v:82},{l:'Intimidating into disabling Find My alerts',v:80},
    {l:'Impersonating victim to contacts',v:78},{l:'Financial control via shared accounts',v:76},
    {l:'Gaslighting about device monitoring',v:70},{l:'Using children to maintain device access',v:65},
  ],
};
