const {test}=require('node:test');const assert=require('node:assert/strict');const {validState,mergeRecords,dateKey}=require('./core.js');
const meal={id:'old-1',type:'meal',at:'2026-09-12T23:45:00+09:00',meal:'夜ごはん',p:8,f:3,c:5};
const old={started:'2026-09-01',records:[meal]};
test('v1 records remain readable',()=>assert.ok(validState(old)));
test('invalid nutrition and water records are rejected',()=>{for(const r of [{...meal,p:11},{...meal,f:0},{...meal,c:1.5},{...meal,at:'broken'},{id:'w',at:meal.at,type:'water',amount:0},{id:'w',at:meal.at,type:'water',amount:3001}])assert.equal(validState({...old,records:[r]}),false);});
test('backup merge is additive and repeated imports are idempotent',()=>{const incoming={started:'2026-08-01',records:[{...meal,p:1},{id:'w',at:meal.at,type:'water',amount:200}]};const result=mergeRecords(old,incoming);assert.equal(result.added,1);assert.equal(result.state.records.length,2);assert.equal(result.state.records[0].p,8);assert.equal(result.state.started,'2026-08-01');assert.equal(mergeRecords(result.state,incoming).added,0);assert.equal(old.records.length,1);});
test('local calendar date is not shifted by UTC conversion',()=>assert.equal(dateKey(new Date(2026,8,13,0,5)),'2026-09-13'));
const {aquariumGrowth}=require('./core.js');
function careRecords(n){return Array.from({length:n},(_,i)=>({...meal,id:String(i),at:new Date(2026,0,i+1,12).toISOString()}));}
test('always keeps exactly two fish, including long existing histories',()=>{for(const days of [0,1,3,7,14,21,30,45,100,365]){const g=aquariumGrowth(careRecords(days));assert.equal(g.count,2);assert.equal(g.fish.length,2);}});
test('fish grow gradually, with a capped adult size',()=>{const start=aquariumGrowth([]),young=aquariumGrowth(careRecords(7)),adult=aquariumGrowth(careRecords(16));assert.ok(start.fish[0].size<young.fish[0].size);assert.ok(young.fish[0].size<adult.fish[0].size);assert.deepEqual(adult.fish,aquariumGrowth(careRecords(365)).fish);assert.equal(adult.progress,1);});
test('same-day records and reloads do not accelerate or reset growth',()=>{const one=careRecords(1);assert.deepEqual(aquariumGrowth([...one,...one,...one]),aquariumGrowth(one));const records=careRecords(7);assert.deepEqual(aquariumGrowth(JSON.parse(JSON.stringify(records))),aquariumGrowth(records));});
