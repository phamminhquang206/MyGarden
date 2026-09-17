import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES,freshState,isUnlocked,startSession,settleSession,cancelSession,totalMinutes,validState} from '../garden-core.js';
const progress=minutes=>{const s=freshState();s.plots[0]={id:'old',species:'pine',minutes,completedAt:0};return s;};
test('three additional species unlock at each five-hour milestone',()=>{
 for(const minutes of [0,299,300,599,600,899,900,1199,1200]){
  const s=minutes?progress(minutes):freshState();
  assert.equal(SPECIES.filter(sp=>isUnlocked(s,sp.id)).length,6+3*Math.min(4,Math.floor(minutes/300)));
 }
});
test('locked species cannot start a session or remain selected after restore',()=>{
 const s=progress(299);assert.equal(startSession(s,1,'palm',1,0,'locked'),false);
 s.selectedSpecies='palm';assert.equal(validState(s).selectedSpecies,'pine');
 s.plots[0].minutes=300;assert.equal(startSession(s,1,'palm',1,0,'open'),true);
});
test('cancelled and active minutes do not unlock; completion does',()=>{
 const s=progress(299);startSession(s,1,'pine',1,0,'a');assert.equal(totalMinutes(s),299);cancelSession(s);assert.equal(isUnlocked(s,'palm'),false);
 startSession(s,1,'pine',1,0,'b');settleSession(s,60000);assert.equal(totalMinutes(s),300);assert.equal(isUnlocked(s,'palm'),true);
});
