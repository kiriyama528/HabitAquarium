const {test}=require('node:test');const assert=require('node:assert/strict');const {validState,mergeRecords,dateKey}=require('./core.js');
const meal={id:'old-1',type:'meal',at:'2026-09-12T23:45:00+09:00',meal:'夜ごはん',p:8,f:3,c:5};
const old={started:'2026-09-01',records:[meal]};
test('v1 records remain readable',()=>assert.ok(validState(old)));
test('invalid nutrition and water records are rejected',()=>{for(const r of [{...meal,p:11},{...meal,f:0},{...meal,c:1.5},{...meal,at:'broken'},{id:'w',at:meal.at,type:'water',amount:0},{id:'w',at:meal.at,type:'water',amount:3001}])assert.equal(validState({...old,records:[r]}),false);});
test('backup merge is additive and repeated imports are idempotent',()=>{const incoming={started:'2026-08-01',records:[{...meal,p:1},{id:'w',at:meal.at,type:'water',amount:200}]};const result=mergeRecords(old,incoming);assert.equal(result.added,1);assert.equal(result.state.records.length,2);assert.equal(result.state.records[0].p,8);assert.equal(result.state.started,'2026-08-01');assert.equal(mergeRecords(result.state,incoming).added,0);assert.equal(old.records.length,1);});
test('local calendar date is not shifted by UTC conversion',()=>assert.equal(dateKey(new Date(2026,8,13,0,5)),'2026-09-13'));
const {aquariumGrowth}=require('./core.js');
function careRecords(n){return Array.from({length:n},(_,i)=>({...meal,id:String(i),at:new Date(2026,0,i+1,12).toISOString()}));}
test('starts with two small fish and unlocks at care milestones',()=>{for(const [days,count] of [[0,2],[2,2],[3,3],[6,3],[7,4],[14,5],[21,6],[30,7],[45,8],[100,8]])assert.equal(aquariumGrowth(careRecords(days)).count,count);assert.ok(aquariumGrowth([]).fish[0].size<70);});
test('multiple records on one date do not accelerate growth',()=>{const one=careRecords(1);assert.equal(aquariumGrowth([...one,...one,...one]).days,1);assert.equal(aquariumGrowth(one).remaining,2);});
test('new arrivals are smaller and rest days never reset progress',()=>{const records=careRecords(7),g=aquariumGrowth(records);assert.ok(g.fish[3].size<g.fish[0].size);assert.deepEqual(aquariumGrowth(JSON.parse(JSON.stringify(records))),g);assert.equal(aquariumGrowth([records[0],records[3],records[6]]).count,3);assert.equal(aquariumGrowth(careRecords(45)).next,null);});
