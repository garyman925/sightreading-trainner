const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../dist');
const context={window:{}};vm.createContext(context);
for(const name of ['exercises.js','notation.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),context);
const w=context.window, errors=w.validateExercises();assert.equal(errors.length,0,errors.join('\n'));
assert.equal(w.SR_EXERCISES.length,27);
for(const grade of [4,5,6])assert.equal(w.SR_EXERCISES.filter(e=>e.grade===grade&&e.focus==='expression').length,3);
for(const grade of [4,5,6])for(const focus of ['rhythm','vertical','ladder'])assert.equal(w.SR_EXERCISES.filter(e=>e.grade===grade&&e.focus===focus).length,2);
for(const exercise of w.SR_EXERCISES){
  const svg=w.SRNotation.render(exercise,{labels:true,guide:true});
  assert.ok(svg.startsWith('<svg')&&svg.endsWith('</svg>'));
  assert.ok(!/NaN|undefined/.test(svg),exercise.id);
  for(const events of Object.values(exercise.hands))for(const event of events){
    assert.ok(event.notes.length<=3);
    assert.ok(event.beat>=0&&event.beat+event.duration<=16);
  }
}
assert.equal(w.SRNotation.pitchY('E4','right'),110);
assert.equal(w.SRNotation.pitchY('C4','right'),120);
assert.equal(w.SRNotation.pitchY('G2','left'),250);
assert.equal(w.SRNotation.pitchY('C4','left'),200);
assert.equal(w.SRNotation.pitchY('F#4','right'),w.SRNotation.pitchY('F4','right'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
for(const m of app.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.has(m[1]),`Missing element ${m[1]}`);
const ramp=w.SR_EXERCISES.find(e=>e.id==='x4b'), articulation=w.SR_EXERCISES.find(e=>e.id==='x4c');
assert.ok(w.SRExpression.level(ramp,4)<w.SRExpression.level(ramp,6));
assert.ok(w.SRExpression.level(ramp,12)>w.SRExpression.level(ramp,14));
assert.equal(w.SRExpression.level(ramp,14),.5);
assert.equal(w.SRExpression.length(articulation,'right',8),.42);
assert.equal(w.SRExpression.length(articulation,'left',8),.92);
assert.equal(w.SRExpression.length(articulation,'right',0),1);
for(const ex of w.SR_EXERCISES.filter(e=>e.expression)){
  for(const m of ex.expression.marks)assert.ok(ex.hands.right.some(e=>e.beat===m.beat),'Dynamic attached to an attack');
  assert.match(w.SRNotation.render(ex),/font-style="italic"/);
}
console.log('PASS: 27 exercises, 54 full hand parts, 12 grade/focus combinations, score markings, gradual audio levels, articulation lengths and UI bindings.');
