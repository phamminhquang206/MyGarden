import {test} from 'node:test';
import assert from 'node:assert/strict';
import {minutesFromPoint,dialPosition} from '../duration-dial.js';
test('dial maps lower-left to zero, top to thirty and lower-right to sixty',()=>{
 assert.equal(minutesFromPoint(-1,1,0,0),0);assert.equal(minutesFromPoint(0,-1,0,0),30);assert.equal(minutesFromPoint(1,1,0,0),60);
 assert.equal(minutesFromPoint(-1,0,0,0),10);assert.equal(minutesFromPoint(1,0,0,0),50);
});
test('every minute maps back from its handle position',()=>{
 for(let minutes=0;minutes<=60;minutes++){const p=dialPosition(minutes);assert.equal(minutesFromPoint(p.x,p.y,50,50),minutes);}
});
test('bottom gap snaps to nearest endpoint',()=>{
 assert.equal(minutesFromPoint(-.1,1,0,0),0);assert.equal(minutesFromPoint(.1,1,0,0),60);
});
