import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,startSession,isUnlocked} from '../garden-core.js';
import {exportBackup,importBackup} from '../backup.js';
test('backup round trip preserves garden, settings, progress and active session',()=>{
 const s=freshState();s.plots[0]={id:'old',species:'pine',minutes:180,completedAt:100};s.plots[1]={id:'old2',species:'cat',minutes:120,completedAt:100};s.selectedSpecies='palm';s.volume=81;s.sound='stream';startSession(s,4,'palm',35,200,'running');
 const r=importBackup(exportBackup(s));assert.deepEqual(r.state,s);assert.equal(isUnlocked(r.state,'palm'),true);
});
test('reject unrelated files, unsupported versions and corrupt plots or sessions',()=>{
 assert.throws(()=>importBackup('bad'));assert.throws(()=>importBackup('{}'));
 const value=JSON.parse(exportBackup(freshState()));value.backupVersion=2;assert.throws(()=>importBackup(JSON.stringify(value)));
 value.backupVersion=1;value.state.plots[0]={id:'a',species:'fish',minutes:25,completedAt:0};assert.throws(()=>importBackup(JSON.stringify(value)));
 value.state.plots[0]=null;value.state.session={id:'a',species:'pine',plot:100,minutes:25,startedAt:0,endsAt:1500000};assert.throws(()=>importBackup(JSON.stringify(value)));
});
test('empty garden is a valid backup and oversized files are rejected',()=>{
 assert.deepEqual(importBackup(exportBackup(freshState())).state,freshState());
 assert.throws(()=>importBackup(' '.repeat(5*1024*1024+1)),/quá lớn/);
});
