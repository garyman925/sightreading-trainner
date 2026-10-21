const fs=require('fs'),assert=require('assert/strict');const harness=fs.readFileSync(require('path').join(__dirname,'test-flow.cjs'),'utf8').split('(async()=>{')[0];const setup=new Function('require','__dirname',harness+'\nreturn setup;')(require,__dirname);
(async()=>{
 const a=setup(),e=a.els;e.grade.value='6';await e.grade.fire('change');e['key-choice'].value='Dm';await e['key-choice'].fire('change');
 const scores=new Set();for(const genre of ['baroque','classical','romantic','jazz']){e['genre-choice'].value=genre;await e['genre-choice'].fire('change');scores.add(e.score.innerHTML);assert.match(e['exercise-key'].textContent,/D 小調/);assert.equal(e['style-choice'].value,'original');}
 assert.equal(scores.size,4);await a.click('start');assert.equal(e['genre-choice'].disabled,true);a.finish();await a.click('save-session');await a.mode('records');assert.match(e['records-list'].innerHTML,/Jazz／Blues/);await a.click('export-records');assert.match(await a.getBlob().text(),/jazz/);
 await a.mode('vertical');await a.click('reveal-column');assert.ok(!e['column-answer'].hidden);await a.click('new-variation');assert.equal(e['genre-choice'].value,'jazz');assert.equal(e['key-choice'].value,'Dm');await a.mode('ladder');assert.match(e['exercise-key'].textContent,/Jazz／Blues/);
 console.log('PASS: four genre selections, distinct rendered scores, key preservation, playback lock, records/CSV, vertical mode and ladder.');
})().catch(e=>{console.error(e);process.exitCode=1;});
