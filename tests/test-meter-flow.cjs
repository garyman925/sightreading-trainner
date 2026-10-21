const fs=require('fs'),assert=require('assert/strict');let harness=fs.readFileSync(require('path').join(__dirname,'test-flow.cjs'),'utf8').split('(async()=>{')[0].replace('return {els,doc,nav,clocks','return {w,els,doc,nav,clocks');const setup=new Function('require','__dirname',harness+'\nreturn setup;')(require,__dirname);
(async()=>{
for(const key of ['2/4','3/4','3/8','6/8','9/8','5/8','5/4']){
 const a=setup(),e=a.els; e.grade.value='6';await e.grade.fire('change');e.meter.value=key;await e.meter.fire('change');e['cursor-step'].value='main';
 const ex=a.w.SR_EXERCISES.find(x=>x.grade===6&&x.focus==='rhythm'&&x.meter.join('/')===key),m=a.w.SRMeter.info(ex),t=a.w.SRTiming(ex,60);
 let cursor,preview;a.w.SRNotation.cursor=(el,b,visible,B)=>cursor={b,visible,B};a.w.SRNotation.preview=(el,b,on,B)=>preview={b,on,B};
 await a.click('start');assert.ok(e.meter.disabled);a.clocks[0].currentTime=4.12+t.time(m.length+.2);
 let jobs=[...a.frames.values()];a.frames.clear();jobs.forEach(fn=>fn());
 assert.equal(cursor.B,m.length);assert.ok(Math.abs(cursor.b-m.length)<1e-8);assert.equal(preview.B,m.length);assert.match(e['bar-position'].textContent,/第 2/);
 a.clocks[0].currentTime=4.12+t.duration+.01;jobs=[...a.frames.values()];a.frames.clear();jobs.forEach(fn=>fn());assert.equal(e.reflection.hidden,false);await a.click('save-session');
 await a.mode('records');assert.ok(e['records-list'].innerHTML.includes(key));await a.mode('rhythm');
 e.grade.value='2';await e.grade.fire('change');assert.ok(['2/4','3/4','4/4'].includes(e.meter.value));
}
console.log('PASS: all new meters start, advance cursor/preview into bar 2, finish at correct time, save meter metadata and reset unsupported grade choices.');
})().catch(e=>{console.error(e);process.exitCode=1;});
