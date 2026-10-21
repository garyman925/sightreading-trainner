const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),c={window:{}};vm.createContext(c);for(const f of ['exercises.js','meter.js','genres.js','arrangement.js','notation.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/')+'/'+f,'utf8'),c);const w=c.window,A=w.SRArrangement;let count=0;
for(const source of w.SR_EXERCISES){
 const signatures=[];
 for(const genre of ['baroque','classical','romantic','jazz']){
  const e=A.apply(source,{genre}),m=w.SRMeter.info(e);count++;
  signatures.push(JSON.stringify(e.hands));assert.ok(e.id.endsWith(genre));assert.equal(e.genre,genre);
  for(const hand of ['right','left']){let end=0;const diatonic=[];for(const n of e.hands[hand]){
   assert.equal(n.beat,end);assert.ok([.5,1,1.5,2,3,4].includes(n.duration));assert.equal(Math.floor(n.beat/m.length),Math.floor((n.beat+n.duration-.001)/m.length));end+=n.duration;
   assert.ok(n.notes.length<=(e.grade===2?1:2));for(const pitch of n.notes){const p=A.parse(pitch);diatonic.push(p.oct*7+p.letter);assert.ok(A.midi(pitch)>=36&&A.midi(pitch)<=88);}
  }assert.equal(end,m.total);if(e.grade===2)assert.ok(Math.max(...diatonic)-Math.min(...diatonic)<=4,source.id+'/'+genre+'/'+hand);}
  if(e.grade<5)for(const r of e.hands.right)for(const l of e.hands.left)if(r.beat<l.beat+l.duration&&l.beat<r.beat+r.duration)assert.ok(r.notes.length+l.notes.length<=3);
  for(const compact of [false,true]){const svg=w.SRNotation.render(e,{compact});assert.ok(!/NaN|undefined/.test(svg));}
  const t=w.SRTiming(e,60);for(let b=0;b<m.total;b+=.5)assert.ok(Math.abs(t.beat(t.time(b))-b)<1e-8);
  if(genre==='romantic')assert.ok(e.handBalance.left<e.handBalance.right);
  if(genre==='jazz'&&e.grade>=5)assert.ok(e.hands.right.some(n=>n.beat%1===.5&&n.duration>=1),'syncopation '+source.id);
 }
 assert.equal(new Set(signatures).size,4,'distinct writing '+source.id);
}
for(const grade of [2,3,4,5,6])for(const key of A.allowed(grade))for(const genre of ['baroque','classical','romantic','jazz'])for(const texture of ['single','chords']){
 const source=w.SR_EXERCISES.find(e=>e.grade===grade&&e.focus==='rhythm'),e=A.apply(source,{genre,key,texture});
 for(const hand of ['right','left'])for(const n of e.hands[hand]){assert.ok(n.notes.length<=(texture==='single'||grade===2?1:2));assert.ok(n.notes.every(p=>Number.isFinite(A.midi(p))));}
}
console.log('PASS: '+count+' style scores; distinct writing, Grade 2 five-finger ranges, duration sums, chord caps, visual data, jazz syncopation, balance, transposition and texture combinations.');
