const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const c={window:{}};vm.createContext(c);for(const f of ['exercises.js','meter.js','notation.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/')+'/'+f,'utf8'),c);const w=c.window;
assert.equal(w.validateExercises().length,0);
for(const grade of [2,3,4,5,6])for(const focus of ['rhythm','vertical','ladder','expression'])for(const key of w.SRMeter.allowed(grade)){
 const bank=w.SR_EXERCISES.filter(e=>e.grade===grade&&e.focus===focus&&e.meter.join('/')===key);
 assert.ok(bank.length>=12);assert.equal(new Set(bank.map(e=>JSON.stringify([e.hands,e.expression]))).size,bank.length,grade+'/'+focus+'/'+key);
}
for(const e of w.SR_EXERCISES){const m=w.SRMeter.info(e),t=w.SRTiming(e,60);
 for(let beat=-1;beat<m.total;beat+=.125)assert.ok(Math.abs(t.beat(t.time(beat))-beat)<1e-8,e.id);
 for(const compact of [false,true]){const svg=w.SRNotation.render(e,{compact});assert.ok(!/NaN|undefined/.test(svg),e.id);assert.ok(svg.includes('>'+m.n+'</text>'));}
 for(const hand of ['left','right'])for(const group of w.SRNotation.beamGroups(e.hands[hand],m.groups,m.length)){
  assert.ok(group.length>=2);const notes=group.map(i=>e.hands[hand][i]);assert.ok(notes.every(n=>n.duration===.5&&n.notes.length));assert.equal(Math.floor(notes[0].beat/m.length),Math.floor(notes.at(-1).beat/m.length));
 }
}
const ev=Array.from({length:6},(_,i)=>({beat:i*.5,duration:.5,notes:['C4']}));
assert.equal(JSON.stringify(w.SRNotation.beamGroups(ev,[1.5,1.5],3)),JSON.stringify([[0,1,2],[3,4,5]]));
assert.equal(JSON.stringify(w.SRNotation.beamGroups(ev,[1,1,1],3)),JSON.stringify([[0,1],[2,3],[4,5]]));
const six=w.SR_EXERCISES.find(e=>e.meter.join('/')==='6/8'&&!e.expression.slowing&&!e.expression.fermata);assert.ok(Math.abs(w.SRTiming(six,60).duration-8)<1e-8);
console.log('PASS: '+w.SR_EXERCISES.length+' scores, all grade/mode/meter pools, unique studies, beat sums, SVG, beaming boundaries and reversible playback timeline.');
