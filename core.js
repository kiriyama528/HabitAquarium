const dateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const meals=['朝ごはん','昼ごはん','夜ごはん','間食'];
function validState(s){return s&&typeof s.started==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s.started)&&Number.isFinite(Date.parse(s.started))&&Array.isArray(s.records)&&s.records.every(r=>r&&typeof r.id==='string'&&Number.isFinite(Date.parse(r.at))&&(r.type==='meal'?meals.includes(r.meal)&&['p','f','c'].every(k=>Number.isInteger(r[k])&&r[k]>=1&&r[k]<=10):r.type==='water'&&Number.isInteger(r.amount)&&r.amount>0&&r.amount<=3000));}

function mergeRecords(current,incoming){const records=new Map(current.records.map(r=>[r.id,r]));let added=0;for(const r of incoming.records)if(!records.has(r.id)){records.set(r.id,r);added++;}return {added,state:{started:current.started<incoming.started?current.started:incoming.started,records:[...records.values()]}};}
// Count care dates rather than number of entries or water volume.
const FISH_DAYS=[0,0,3,7,14,21,30,45];
function aquariumGrowth(records){
 const days=new Set(records.map(r=>dateKey(new Date(r.at)))).size;
 const unlocked=FISH_DAYS.filter(day=>day<=days),next=FISH_DAYS.find(day=>day>days)??null,previous=unlocked[unlocked.length-1];
 return {days,count:unlocked.length,next,remaining:next===null?0:next-days,progress:next===null?1:(days-previous)/(next-previous),fish:unlocked.map((born,i)=>({born,size:Math.min(102,54+Math.max(0,days-born)*3)+(i===0?5:0)}))};
}
if(typeof module!=='undefined')module.exports={dateKey,validState,mergeRecords,aquariumGrowth};
