const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../dist'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const storage=new Map();
function setup(){
  class Element{
    constructor(id){this.id=id;this.value='';this.disabled=false;this.hidden=false;this.checked=false;this.textContent='';this.innerHTML='';this.dataset={};this.listeners={};this.tagName='DIV';this.clientWidth=800;this.scrollLeft=0;this.classList={add(){},remove(){},toggle(){}};}
    addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
    async fire(type,extra={}){for(const fn of this.listeners[type]||[])await fn({target:this,preventDefault(){},...extra});await Promise.resolve();}
    setAttribute(){} querySelector(){return null;} scrollIntoView(){} focus(){} append(){} remove(){} click(){return this.fire('click');} showModal(){this.open=true;} close(){this.open=false;}
  }
  const els={};
  for(const m of html.matchAll(/<([a-z-]+)[^>]*\bid="([^"]+)"[^>]*>/g)){
    const el=els[m[2]]=new Element(m[2]);el.tagName=m[1].toUpperCase();el.value=m[0].match(/\bvalue="([^"]*)"/)?.[1]||'';el.checked=/\bchecked\b/.test(m[0]);el.hidden=/\bhidden\b/.test(m[0]);
  }
  Object.assign(els.grade,{value:'4'});els['demo-hands'].value='both';els.coordination.value='steady';els['record-filter'].value='all';els['ladder-step'].value='4';
  const nav=['rhythm','vertical','ladder','expression','records'].map(mode=>{const el=new Element(mode);el.dataset.mode=mode;return el;});
  const beats=Array.from({length:4},()=>new Element('beat')),bpms=[new Element('bpm')],brand=new Element('brand');
  const doc=new Element('document');doc.getElementById=id=>els[id];doc.querySelectorAll=s=>s==='[data-mode]'?nav:s==='.beats i'?beats:s==='.bpm-text'?bpms:[];doc.querySelector=s=>s==='.brand'?brand:null;doc.createElement=()=>new Element('download');doc.body=new Element('body');
  const clocks=[],frames=new Map(),intervals=new Map();let count=0,lastBlob;
  class AudioContext{
    constructor(){this.currentTime=0;this.state='running';this.destination={};clocks.push(this);}
    async resume(){} createOscillator(){return {frequency:{value:0},connect(){return this;},start(){},stop(){},disconnect(){}};}
    createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;},disconnect(){}};}
  }
  const w={AudioContext,crypto:{randomUUID:()=>`test-${++count}`}};
  const context={window:w,document:doc,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},console,Blob,URL:{createObjectURL:b=>{lastBlob=b;return 'blob:test';},revokeObjectURL(){}},setTimeout:()=>++count,clearTimeout(){},setInterval:fn=>{const id=++count;intervals.set(id,fn);return id;},clearInterval:id=>intervals.delete(id),requestAnimationFrame:fn=>{const id=++count;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),confirm:()=>true};
  vm.createContext(context);
  for(const file of ['exercises.js','notation.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
  return {els,doc,nav,clocks,frames,intervals,getBlob:()=>lastBlob,click:async id=>{await els[id].click();await Promise.resolve();},mode:async name=>nav.find(e=>e.dataset.mode===name).click(),finish:()=>{const ctx=clocks[0];ctx.currentTime+=20*60/Number(els['bpm-number'].value)+.2;for(const fn of [...intervals.values()])fn();const jobs=[...frames.values()];frames.clear();jobs.forEach(fn=>fn());}};
}
(async()=>{
 const app=setup(),e=app.els;
 assert.ok(e.score.innerHTML.includes('<svg'));
 await app.click('start');assert.ok(e.start.disabled);assert.ok(!e.stop.disabled);
 await app.click('stop');assert.ok(!e.start.disabled);assert.ok(e.reflection.hidden);
 await app.mode('vertical');assert.ok(!e['vertical-panel'].hidden);await app.click('reveal-column');assert.ok(!e['column-answer'].hidden);assert.match(e['column-answer'].textContent,/右手：彈 C4/);await app.click('next-column');assert.ok(e['column-answer'].hidden);
 await app.mode('rhythm');await app.click('start');
 const base=app.clocks[0].currentTime;app.clocks[0].currentTime=base+4.12;
 await app.doc.fire('keydown',{code:'KeyF',target:{tagName:'BODY'}});await app.doc.fire('keydown',{code:'KeyJ',target:{tagName:'BODY'}});
 app.finish();assert.ok(!e.reflection.hidden);assert.match(e['tap-summary'].textContent,/按鍵命中 2 \/ 30/);
 await app.click('save-session');assert.ok(e.reflection.hidden);
 let records=JSON.parse(storage.get('hepai-practice-v1'));assert.equal(records.length,1);assert.equal(records[0].tap.hits,2);assert.equal(records[0].bpm,60);
 await app.mode('ladder');
 for(let i=0;i<2;i++){await app.click('start');app.finish();await app.click('save-session');}
 assert.equal(e['bpm-number'].value,64);assert.equal(e['ladder-streak'].textContent,'本級達標 0 / 2 次');
 await app.click('start');app.finish();e.accuracy.value='70';await app.click('save-session');assert.equal(e['bpm-number'].value,60);
 await app.click('demo');app.finish();assert.ok(e.reflection.hidden);assert.equal(JSON.parse(storage.get('hepai-practice-v1')).length,4);
 await app.click('start');app.finish();e.accuracy.value='101';await app.click('save-session');assert.ok(!e.reflection.hidden);assert.equal(JSON.parse(storage.get('hepai-practice-v1')).length,4);
 await app.click('discard-session');e.accuracy.value='90';
 await app.click('start');app.doc.hidden=true;await app.doc.fire('visibilitychange');assert.ok(!e.start.disabled);assert.ok(e.reflection.hidden);
 await app.mode('records');assert.equal(e['stat-count'].textContent,4);await app.click('export-records');assert.ok((await app.getBlob().text()).includes('BPM'));
 const fresh=setup();await fresh.mode('records');assert.equal(fresh.els['stat-count'].textContent,4);
 app.doc.hidden=false;
 await app.mode('expression');assert.ok(!e['expression-panel'].hidden);assert.ok(e['expression-route'].hidden);
 await app.click('expression-reveal');assert.match(e['expression-route'].textContent,/mf/);assert.ok(!e['expression-route'].hidden);
 await app.click('start');app.finish();assert.ok(!e['expression-review'].hidden);assert.equal(e['expression-start'].checked,false);
 e['expression-start'].checked=true;e['expression-change'].checked=true;
 await app.click('save-session');
 records=JSON.parse(storage.get('hepai-practice-v1'));assert.equal(records[0].expression.end,false);assert.equal(records[0].passed,false);
 await app.click('start');app.finish();
 for(const id of ['expression-start','expression-change','expression-end'])e[id].checked=true;
 await app.click('save-session');records=JSON.parse(storage.get('hepai-practice-v1'));assert.equal(records[0].passed,true);
 await app.mode('records');assert.match(e['records-list'].innerHTML,/表情 3 \/ 3/);await app.click('export-records');assert.match(await app.getBlob().text(),/表情開頭/);
 const updated=setup();await updated.mode('records');assert.equal(updated.els['stat-count'].textContent,6);
 console.log('PASS: previous practice flows plus expression route reveal, unchecked self-assessment, partial/full expression pass rules, backward-compatible records, reload and extended CSV.');
})().catch(error=>{console.error(error);process.exitCode=1;});
