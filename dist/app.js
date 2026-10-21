(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const MODES={
    expression:{name:'表情記號',title:'看見記號，也讓耳朵聽見。',description:'先找表情路線，再讓力度與連斷奏成為雙手視譜的一部分。',method:'開頭、變化、終點',steps:['先用 15 秒找譜上的力度與奏法，點擊記號可查看解釋。','第一遍可只彈右手；熟悉後加入左手。提示會提早一拍提醒下一個變化。','關閉提醒再彈一遍，錄音回聽，完成後勾選實際做到的三個部分。'],note:'三個程度都先用簡單旋律，把注意力留給記號。表情由你自評；系統不會聆聽或量度鋼琴音量。'},
    rhythm:{name:'雙手節奏',title:'讓雙手，落在同一拍。',description:'先不追音高。把左右手的節奏，放進同一條時間線。',method:'把左右手放在同一拍',steps:['先看兩手在哪一拍一起起音；長音只拍一下，休止符不拍。','聽 4 拍預備拍，兩手拍桌，或按 F（左）與 J（右）。','即使錯一拍，也跟著下一拍繼續。先保持連續，再修正錯處。'],note:'熟悉節奏後，再把同一份譜搬到鋼琴上。雙手保持小動作，不必抬高手腕。'},
    vertical:{name:'垂直讀譜',title:'一眼，看見兩隻手。',description:'把上下譜表讀成一列，讓左右手成為同一個動作。',method:'先讀整列，再一起落鍵',steps:['不播放，先沿導線看右手與左手；找出同時起音的音或和弦。','說出這一列兩手的音，按「顯示音名」核對，再在琴上一起彈。','逐列練過後，關閉音名，按「開始練習」連續彈完 4 小節。'],note:'「延續」的音要繼續按住，不要重新彈。C4 是中央 C；音名旁的數字代表八度。'},
    ladder:{name:'速度階梯',title:'穩定之後，再快一點。',description:'每次只加一小步，讓雙手在新速度下仍然一起前進。',method:'連續兩次穩定，再升一級',steps:['選一個能不停頓完成的 BPM，設定目標速度及每級增幅。','彈完後自行記錄準確度、停頓次數及雙手是否同步。','同一速度連續兩次達標便升級。到達目標後，換新譜試一次。'],note:'重複同一短譜是在練協調。測試視奏時換一份新譜，預讀 20–30 秒，先不要聽示範。'}
  };
  const STORAGE='hepai-practice-v1';
  let records=[], storageAvailable=true;
  try {
    const raw=JSON.parse(localStorage.getItem(STORAGE)||'[]');
    if(Array.isArray(raw))records=raw.filter(r=>r&&typeof r.id==='string'&&typeof r.title==='string'&&Object.hasOwn(MODES,r.mode)&&Number.isFinite(r.bpm)&&Number.isFinite(r.seconds)&&Number.isFinite(r.accuracy)&&Number.isFinite(r.pauses)&&typeof r.date==='string').slice(0,2000);
  }catch{storageAvailable=false;}
  let meterKey='4/4',selectedKey='original',texture='auto',style='original',genre='original',arrangedCache=null;
  let mode='rhythm', grade=4, exIndex=0, bpm=60, running=false, demo=false, ctx=null, timer=null, raf=null;
  let timeline=null;
  let queue=[], queueIndex=0, startTime=0, lastBeat=-99, activeNodes=[], pending=null, sessionSnapshot=null;
  let columnIndex=0, columnAnswer=false, streak=0, target=80, step=4, taps=null, toastTimer;
  const seen=new Map(), demoed=new Set(), viewed=new Set();
  let variation=null, variationSeed=0;
  const practiced=new Set();
  try{const saved=JSON.parse(localStorage.getItem('hepai-practiced-v1')||'[]');if(Array.isArray(saved))saved.filter(x=>typeof x==='string').forEach(x=>practiced.add(x));}catch{}
  const remember=id=>{practiced.add(id);try{localStorage.setItem('hepai-practiced-v1',JSON.stringify([...practiced]));}catch{}};
  records.forEach(r=>seen.set(r.exerciseId,(seen.get(r.exerciseId)||0)+1));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pool=()=>window.SR_EXERCISES.filter(ex=>ex.grade===grade&&ex.focus===mode&&ex.meter.join('/')===meterKey);
  const exercise=()=>{
    const source=variation||pool()[exIndex%pool().length],cacheKey=source.id+'|'+selectedKey+'|'+texture+'|'+style+'|'+genre;
    if(arrangedCache?.key!==cacheKey)arrangedCache={key:cacheKey,value:window.SRArrangement.apply(source,{key:selectedKey,texture,style,genre})};
    return arrangedCache.value;
  };
  function arrangementOptions(){
    const keys=window.SRArrangement.allowed(grade);if(selectedKey!=='original'&&!keys.includes(selectedKey))selectedKey='original';
    if(grade===2&&texture==='chords')texture='single';
    $('key-choice').innerHTML='<option value="original">原調</option>'+keys.map(k=>'<option value="'+k+'">'+window.SRArrangement.label(k)+'</option>').join('');$('key-choice').value=selectedKey;
    $('texture-choice').innerHTML='<option value="auto">依程度</option><option value="single">單音</option>'+(grade>=3?'<option value="chords">含和弦</option>':'');$('texture-choice').value=texture;$('style-choice').value=style;$('genre-choice').value=genre;
  }
  const meterInfo=()=>window.SRMeter.info(exercise());
  const drawCursor=(container,beat,visible)=>window.SRNotation.cursor(container,beat,visible,meterInfo().length);
  const drawPreview=(container,beat,enabled)=>window.SRNotation.preview(container,beat,enabled,meterInfo().length);
  function meterOptions(){
    arrangementOptions();
    const choices=window.SRMeter.allowed(grade);if(!choices.includes(meterKey))meterKey='4/4';
    $('meter').innerHTML=choices.map(k=>'<option value="'+k+'">'+k+'</option>').join('');$('meter').value=meterKey;
  }
  const notify=text=>{clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,6500);};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function syncBpm(){
    $('bpm-number').value=bpm;
    document.querySelectorAll('.bpm-text').forEach(el=>el.textContent=bpm);
    renderLadder();
  }
  function setBpm(value,manual=true){
    if(running)return;
    const n=Number(value);
    if(!Number.isFinite(n)||String(value).trim()===''){syncBpm();return;}
    const next=clamp(Math.round(n),30,160);
    if(manual&&next!==bpm)streak=0;
    bpm=next;
    if(mode==='ladder'&&bpm>target){target=bpm;$('ladder-target').value=target;}
    syncBpm();
  }
  function renderLadder(){
    const values=[...new Set([Math.max(30,bpm-step),bpm,Math.min(target,bpm+step),Math.min(target,bpm+step*2)].filter(v=>v<=target))].sort((a,b)=>b-a);
    $('ladder-rungs').innerHTML=values.map(v=>`<div class="rung ${v===bpm?'current':''}"><span>${v} BPM</span><span>${v===bpm?'目前':v===target?'目標':v<bpm?'上一級':'下一級'}</span></div>`).join('');
    $('ladder-streak').textContent=bpm>=target&&streak>=2?'目標已達成 ✓':`本級達標 ${streak} / 2 次`;
  }
  function attackColumns(){
    return [...new Set(Object.values(exercise().hands).flat().filter(e=>e.notes.length).map(e=>e.beat))].sort((a,b)=>a-b);
  }
  function describeHand(hand,beat){
    const event=exercise().hands[hand].find(e=>e.beat<=beat&&e.beat+e.duration>beat);
    if(!event||!event.notes.length)return '休止';
    const names=event.notes.map(n=>n.replaceAll('#','♯').replaceAll('b','♭')).join(' ＋ ');
    return (event.beat===beat?'彈 ':'延續 ')+names;
  }
  function renderColumn(){
    if(mode!=='vertical')return;
    const cols=attackColumns();columnIndex%=cols.length;
    const b=cols[columnIndex];
    $('column-question').textContent=`第 ${Math.floor(b/meterInfo().length)+1} 小節，第 ${(b%meterInfo().length)/meterInfo().unit+1} 拍 · 第 ${columnIndex+1} / ${cols.length} 列`;
    $('column-answer').textContent=`右手：${describeHand('right',b)}　／　左手：${describeHand('left',b)}`;
    $('column-answer').hidden=!columnAnswer;
    $('reveal-column').textContent=columnAnswer?'隱藏音名':'顯示音名';
    if(!running)drawCursor($('score'),b,true);
  }
  const compactScore=()=>window.matchMedia?.('(max-width: 620px)').matches??false;
  function renderScore(){
    $('score').innerHTML=window.SRNotation.render(exercise(),{labels:$('note-labels').checked,guide:$('guide').checked,compact:compactScore()});
    if(mode==='vertical')renderColumn();
  }
  function renderExercise(){
    const ex=exercise();viewed.add(ex.id);
    $('exercise-number').textContent=`練習 ${exIndex+1} / ${pool().length}`;
    $('exercise-title').textContent=ex.title;
    $('exercise-key').textContent=window.SRArrangement.label(ex.key)+(texture==='auto'?'':' · '+window.SRArrangement.textures[texture])+(genre==='original'?'':' · '+window.SRGenres.names[genre])+' · '+meterKey+(meterKey==='5/8'?'（'+ex.grouping.map(g=>g*2).join('＋')+'）':meterKey==='5/4'?'（3＋2）':'');
    $('exercise-preparation').textContent=ex.preparation;
    $('exercise-tip').textContent=ex.tip;
    $('play-status').textContent='待開始';
    $('bar-position').textContent='4 小節';$('tempo-unit').textContent=meterInfo().label+'＝';
    $('left-hit').textContent='等待開始';$('right-hit').textContent='等待開始';
    $('tap-summary').textContent='';
    renderScore();renderSymbols();
    $('expression-cue').textContent='';
  }
  function switchMode(next){
    if(running)stop('已停止；可以選擇新的練習。');
    if(pending&&next!=='records')notify('上一遍未儲存；可回到原項目完成評估。');
    mode=next;variation=null;exIndex=0;columnIndex=0;columnAnswer=false;streak=0;
    $('practice-view').hidden=mode==='records';$('records-view').hidden=mode!=='records';
    document.querySelectorAll('[data-mode]').forEach(el=>{el.classList.toggle('active',el.dataset.mode===mode);el.setAttribute('aria-current',el.dataset.mode===mode?'page':'false');});
    if(mode==='records'){renderRecords();return;}
    const data=MODES[mode];
    $('mode-title').textContent=data.name;$('mode-description').textContent=data.description;
    $('method-title').textContent=data.method;
    $('method-steps').innerHTML=data.steps.map(s=>`<li>${esc(s)}</li>`).join('');
    $('practice-note').textContent=data.note;
    $('tap-panel').hidden=mode!=='rhythm';$('vertical-panel').hidden=mode!=='vertical';$('ladder-panel').hidden=mode!=='ladder';
    if(mode==='ladder'&&target<bpm){target=bpm;$('ladder-target').value=target;}
    renderExercise();syncBpm();renderPending();
  }
  function lockControls(locked){
    ['grade','meter','key-choice','texture-choice','style-choice','genre-choice','new-variation','next-exercise','bpm-number','cursor-step','bpm-minus','bpm-plus','ladder-target','ladder-step','reset-ladder','demo-hands','next-column','reveal-column','expression-coach','start','demo'].forEach(id=>$(id).disabled=locked);
    $('stop').disabled=!locked;
  }
  function clickSound(time,accent=false){
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type='sine';osc.frequency.value=accent?1150:780;
    gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(accent?.15:.10,time+.003);gain.gain.exponentialRampToValueAtTime(.001,time+.065);
    osc.connect(gain).connect(ctx.destination);osc.start(time);osc.stop(time+.075);
    trackNode(osc,gain);
  }
  function trackNode(osc,gain){
    activeNodes.push(osc);
    osc.onended=()=>{osc.disconnect();gain.disconnect();activeNodes=activeNodes.filter(n=>n!==osc);};
  }
  const midi=pitch=>window.SRArrangement.midi(pitch);
  function piano(pitch,time,duration,volume){
    const hz=440*2**((midi(pitch)-69)/12);
    [1,2,3].forEach((harmonic,i)=>{
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.type='sine';osc.frequency.value=hz*harmonic;
      const v=volume*[1,.27,.10][i];
      gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(v,time+.008);
      gain.gain.exponentialRampToValueAtTime(Math.max(.001,v*.25),time+Math.max(.04,duration*.8));
      gain.gain.exponentialRampToValueAtTime(.0001,time+duration+.09);
      osc.connect(gain).connect(ctx.destination);osc.start(time);osc.stop(time+duration+.11);trackNode(osc,gain);
    });
  }
  function schedule(){
    if(!running)return;
    const horizon=ctx.currentTime+.12;
    while(queueIndex<queue.length&&queue[queueIndex].time<horizon){
      const q=queue[queueIndex++];
      if(q.kind==='click'){
        if($('metronome').checked||q.beat<0)clickSound(q.time,q.accent??q.beat%meterInfo().length===0);
      }else q.notes.forEach(note=>piano(note,q.time,q.duration,.095*(q.level??1)/Math.sqrt(q.notes.length)));
    }
  }
  function cursorBeat(beat){
    const hold=exercise().expression?.fermata;if(hold&&beat>=hold.start&&beat<hold.end)return hold.start;
    if($('cursor-step').value==='main'){const m=meterInfo();const bar=Math.floor(beat/m.length),local=beat-bar*m.length;return bar*m.length+(m.starts.filter(b=>b<=local).at(-1)??0);}
    const value=Number($('cursor-step').value);
    const step=[0.5,1,2].includes(value)?value:1;
    return Math.floor(beat/step)*step;
  }
  function frame(){
    if(!running)return;
    const elapsedBeat=timeline.beat(ctx.currentTime-startTime);
    if(elapsedBeat>=meterInfo().total){finish();return;}
    const beat=Math.floor(elapsedBeat*2)/2;
    if(beat!==lastBeat){
      lastBeat=beat;
      if(exercise().expression){
        const cues=exercise().expression.cues;
        const next=cues.find(c=>c.beat===beat+meterInfo().unit);
        const current=cues.filter(c=>c.beat<=beat).at(-1);
        $('expression-cue').textContent=!$('expression-coach').checked?'':next?'下一拍：'+next.text:current?current.text:'預備：'+cues[0].text;
      }
      const m=meterInfo(),beatInBar=Math.floor(((beat%m.length)+m.length)%m.length/m.unit);
      document.querySelectorAll('.beats i').forEach((el,i)=>{el.hidden=i>=(beat<0?4:Math.ceil(m.length/m.unit));el.classList.toggle('active',i===beatInBar&&beat>=-4*m.unit);el.classList.toggle('count-in',beat<0);});
      if(beat<0){$('play-status').textContent=`預備拍 ${clamp(Math.floor(beat/m.unit)+5,1,4)} / 4`;$('bar-position').textContent=demo?'示範即將開始':'準備雙手';}
      else{$('play-status').textContent=demo?'示範播放中':'播放中';$('bar-position').textContent=`第 ${Math.floor(beat/m.length)+1} / 4 小節 · 第 ${beatInBar+1} 拍`;}
    }
    drawPreview($('score'),elapsedBeat,$('read-ahead-toggle').checked);
    const guideBeat=cursorBeat(elapsedBeat);
    drawCursor($('score'),guideBeat,elapsedBeat>=0&&($('guide').checked||mode==='vertical'));
    if(elapsedBeat>=0&&$('guide').checked&&!compactScore()){
      const wrapper=$('score-scroll'), targetX=window.SRNotation.beatX(guideBeat,meterInfo().length)*$('score').clientWidth/window.SRNotation.width;
      if(targetX-wrapper.scrollLeft>wrapper.clientWidth-55)wrapper.scrollLeft=targetX-wrapper.clientWidth*.35;
    }
    raf=requestAnimationFrame(frame);
  }
  async function start(isDemo=false){
    if(running||mode==='records')return;
    if(pending){notify('先儲存或略過上一遍的紀錄，再開始下一遍。');$('reflection').scrollIntoView({behavior:'smooth',block:'nearest'});return;}
    running=true;demo=isDemo;lockControls(true);
    try{
      ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
      await ctx.resume();
      if(ctx.state!=='running')throw new Error('audio blocked');
    }catch{
      running=false;lockControls(false);notify('聲音未能啟動。請用一般瀏覽器開啟，並允許此頁播放聲音。');return;
    }
    if(!running)return;
    const ex=exercise(), secondsPerBeat=60/bpm;timeline=window.SRTiming(ex,bpm);
    startTime=ctx.currentTime+4*secondsPerBeat+.12;lastBeat=-99;
    queue=[];queueIndex=0;taps={left:{hits:[],extra:0},right:{hits:[],extra:0}};
    remember(ex.id);
    if(demo)demoed.add(ex.id);
    else{
      const count=(seen.get(ex.id)||0)+1;seen.set(ex.id,count);
      sessionSnapshot={exerciseId:ex.id,title:ex.title,mode,grade,key:ex.key,texture,style,genre,meter:meterKey,tempoUnit:meterInfo().label,bpm,seconds:timeline.duration,firstRead:count===1&&!demoed.has(ex.id),target,step,expressionCoach:$('expression-coach').checked};
    }
    const m=meterInfo();
    for(let count=-4;count<0;count++)queue.push({kind:'click',time:startTime+count*secondsPerBeat,beat:count*m.unit,accent:count===-4});
    for(let beat=0;beat<m.total;beat+=m.unit){if(ex.expression?.fermata&&beat>=ex.expression.fermata.start)continue;const local=beat%m.length;queue.push({kind:'click',time:startTime+timeline.time(beat),beat,accent:local===0||(meterKey==='5/8'&&m.starts.includes(local))||(meterKey==='5/4'&&local===3)});}
    if(demo)for(const hand of ['left','right']){
      if($('demo-hands').value!=='both'&&$('demo-hands').value!==hand)continue;
      ex.hands[hand].filter(e=>e.notes.length).forEach(e=>{
        const pedal=ex.expression?.pedals?.find(p=>e.beat>=p.start&&e.beat<p.end);
        const end=Math.max(e.beat+e.duration,pedal?.end??0);
        queue.push({kind:'note',time:startTime+timeline.time(e.beat),notes:e.notes,duration:(timeline.time(end)-timeline.time(e.beat))*(pedal?1:window.SRExpression.length(ex,hand,e.beat)),level:window.SRExpression.level(ex,e.beat,hand)*(ex.handBalance?.[hand]??1)});
      });
    }
    queue.sort((a,b)=>a.time-b.time);
    $('score-scroll').scrollLeft=0;$('left-hit').textContent='等預備拍';$('right-hit').textContent='等預備拍';
    $('tap-summary').textContent=demo?'示範不計入紀錄':'';
    schedule();timer=setInterval(schedule,25);raf=requestAnimationFrame(frame);
  }
  function silence(){
    drawPreview($('score'),-1,false);
    clearInterval(timer);cancelAnimationFrame(raf);timer=null;raf=null;
    activeNodes.forEach(osc=>{try{osc.stop();}catch{}});activeNodes=[];
    document.querySelectorAll('.beats i').forEach(el=>el.classList.remove('active','count-in'));
  }
  function stop(message='已停止。按開始可重新從預備拍練習。'){
    running=false;silence();lockControls(false);drawCursor($('score'),0,false);
    $('play-status').textContent=message;$('bar-position').textContent='未完成，沒有新增紀錄';
    if(mode==='vertical')renderColumn();
  }
  function getTapResult(){
    const ex=exercise();let used=0,total=0,hits=0,extra=0,offsets=[];
    for(const hand of ['left','right']){
      const part=taps[hand];const count=ex.hands[hand].filter(e=>e.notes.length).length;
      total+=count;hits+=part.hits.length;extra+=part.extra;used+=part.hits.length+part.extra;
      offsets.push(...part.hits.map(h=>Math.abs(h.offset)));
    }
    return used?{hits,total,extra,meanMs:offsets.length?Math.round(offsets.reduce((a,b)=>a+b,0)/offsets.length*1000):null}:null;
  }
  function finish(){
    const wasDemo=demo;
    running=false;silence();lockControls(false);
    drawCursor($('score'),15.5,false);
    $('bar-position').textContent='4 / 4 小節完成';
    if(wasDemo){$('play-status').textContent='示範結束。現在換你試一次。';if(mode==='vertical')renderColumn();return;}
    pending={...sessionSnapshot,tap:mode==='rhythm'?getTapResult():null,date:new Date().toISOString(),id:window.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`};
    $('play-status').textContent='完成！先記下這一遍的感覺。';
    if(pending.tap){const t=pending.tap;$('tap-summary').textContent=`按鍵命中 ${t.hits} / ${t.total} 次；多按 ${t.extra} 次${t.meanMs!==null?`；平均起音偏差 ${t.meanMs} 毫秒`:''}。未按到的起音計為漏拍。`;}
    else if(mode==='rhythm')$('tap-summary').textContent='無按鍵資料；請自行評估。';
    ['expression-start','expression-change','expression-end'].forEach(id=>$(id).checked=false);
    renderPending();
    $('reflection').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function renderPending(){
    $('reflection').hidden=!pending;
    $('expression-review').hidden=pending?.mode!=='expression';
    if(pending)$('completion-detail').textContent=`${pending.bpm} BPM · ${MODES[pending.mode].name}`;
  }
  function tap(hand){
    const el=$('tap-'+hand);el.classList.add('pressed');setTimeout(()=>el.classList.remove('pressed'),100);
    if(!running||demo||mode!=='rhythm'){notify('先按「開始練習」，聽完預備拍後再按鍵。');return;}
    const now=ctx.currentTime-startTime;
    if(now<-.18){$(hand+'-hit').textContent='等預備拍';return;}
    const events=exercise().hands[hand].filter(e=>e.notes.length), part=taps[hand];
    let nearest=-1,delta=Infinity;
    events.forEach((e,i)=>{const diff=now-timeline.time(e.beat);if(!part.hits.some(h=>h.index===i)&&Math.abs(diff)<Math.abs(delta)){nearest=i;delta=diff;}});
    if(nearest>=0&&Math.abs(delta)<=.18){
      part.hits.push({index:nearest,offset:delta});$(hand+'-hit').textContent=Math.abs(delta)<.06?'對齊 ✓':`${delta<0?'早':'遲'} ${Math.round(Math.abs(delta)*1000)} ms`;
    }else{part.extra++;$(hand+'-hit').textContent='未對上起音';}
  }
  function persist(){
    try{localStorage.setItem(STORAGE,JSON.stringify(records));storageAvailable=true;return true;}
    catch{storageAvailable=false;notify('此瀏覽器無法儲存資料。紀錄暫留本頁，請到練習紀錄匯出 CSV。');return false;}
  }
  function saveSession(){
    if(!pending)return;
    const accuracy=Number($('accuracy').value), pauses=Number($('pauses').value);
    if($('accuracy').value===''||!Number.isFinite(accuracy)||accuracy<0||accuracy>100){notify('請輸入 0 至 100 之間的準確度。');$('accuracy').focus();return;}
    if($('pauses').value===''||!Number.isInteger(pauses)||pauses<0||pauses>99){notify('請輸入 0 至 99 之間的整數停頓次數。');$('pauses').focus();return;}
    const result={...pending,accuracy,pauses,coordination:$('coordination').value,note:$('session-note').value.trim()};
    if(result.mode==='expression')result.expression={start:$('expression-start').checked,change:$('expression-change').checked,end:$('expression-end').checked,coach:result.expressionCoach};
    result.passed=(!result.expression||(result.expression.start&&result.expression.change&&result.expression.end))&&accuracy>=90&&pauses===0&&result.coordination==='steady';
    records.unshift(result);records=records.slice(0,2000);
    const saved=persist();let message=saved?'已儲存這次練習。':'紀錄暫留本頁；請匯出 CSV 備份。';
    if(result.mode==='ladder'&&mode==='ladder'&&exercise().id===result.exerciseId&&bpm===result.bpm&&target===result.target&&step===result.step){
      if(result.passed){
        streak=Math.min(2,streak+1);
        if(streak>=2){
          if(bpm>=target)message+=' 目標已達成！可換一份新譜測試。';
          else{bpm=Math.min(target,bpm+step);streak=0;message+=` 連續兩次達標，下次 ${bpm} BPM。`;}
        }else message+=' 本級已達標 1 次，再穩定完成 1 次即可升級。';
      }else{bpm=Math.max(30,bpm-step);streak=0;message+=` 先在 ${bpm} BPM 找回穩定。`;}
      syncBpm();
    }
    pending=null;$('session-note').value='';renderPending();notify(message);renderRecords();
  }
  function renderRecords(){
    $('stat-count').textContent=records.length;
    $('stat-minutes').textContent=(records.reduce((a,r)=>a+r.seconds,0)/60).toFixed(1);
    const passed=records.filter(r=>r.passed);$('stat-bpm').textContent=passed.length?Math.max(...passed.map(r=>r.bpm)):'—';
    const filter=$('record-filter').value, rows=records.filter(r=>filter==='all'||r.mode===filter);
    $('export-records').disabled=records.length===0;$('clear-records').disabled=records.length===0;
    if(!rows.length){$('records-list').innerHTML=`<div class="empty-records"><h3>${records.length?'這個項目還未有紀錄':'你的第一頁練習日誌'}</h3><p>完成一遍短譜，填寫自評並儲存，就會在這裡看見進步。</p></div>`;return;}
    $('records-list').innerHTML=`<div class="record-table-wrap"><table class="record-table"><thead><tr><th scope="col">時間／練習</th><th scope="col">速度</th><th scope="col">自評</th><th scope="col">節奏按鍵</th><th scope="col">筆記</th><th scope="col">操作</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.title)}<small>${esc(new Date(r.date).toLocaleString('zh-HK',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}))} · G${r.grade} · ${esc(MODES[r.mode].name)}</small><small>${r.firstRead?'未聽示範的首次練習':'重複／已聽示範'}</small></td><td><strong>${r.bpm}</strong> BPM<small>${esc(r.meter||'4/4')} · ${esc(r.tempoUnit||'♩')}${r.key?' · '+esc(window.SRArrangement.label(r.key)):''}${r.genre&&r.genre!=='original'?' · '+esc(window.SRGenres.names[r.genre]):''}${r.style&&r.style!=='original'?' · '+esc(window.SRArrangement.styles[r.style]):''}</small></td><td><span class="${r.passed?'record-pass':'record-fail'}">${r.accuracy}% · ${r.passed?'達標':'繼續練習'}</span><small>停頓 ${r.pauses} 次 · ${r.coordination==='steady'?'雙手穩定':'配合待改善'}</small></td><td>${r.tap?`${Number(r.tap.hits)} / ${Number(r.tap.total)}<small>多按 ${Number(r.tap.extra)} 次</small>`:'—'}</td><td class="note-cell">${r.expression?`<small>表情 ${[r.expression.start,r.expression.change,r.expression.end].filter(Boolean).length} / 3 · ${r.expression.coach?'有提醒':'無提醒'}</small>`:''}${esc(r.note)||'—'}</td><td><button class="delete-one" data-delete="${esc(r.id)}" aria-label="刪除 ${esc(r.title)} 這次紀錄">刪除</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  function exportRecords(){
    const safe=value=>{let s=String(value??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
    const rows=[['時間（ISO）','練習','項目','程度','BPM','演奏秒數','準確度（自評%）','停頓次數','雙手穩定','達標','首次未聽示範','按鍵命中','預期起音','多按','平均偏差ms','表情開頭','表情變化','表情結尾','表情提醒','筆記','拍號','速度單位','調性','音型','演奏性格','音樂風格'],...records.map(r=>[r.date,r.title,MODES[r.mode].name,r.grade,r.bpm,r.seconds.toFixed(1),r.accuracy,r.pauses,r.coordination==='steady'?'是':'否',r.passed?'是':'否',r.firstRead?'是':'否',r.tap?.hits,r.tap?.total,r.tap?.extra,r.tap?.meanMs,...['start','change','end','coach'].map(k=>r.expression?(r.expression[k]?'是':'否'):''),r.note,r.meter||'4/4',r.tempoUnit||'♩',r.key||'',r.texture||'auto',r.style||'original',r.genre||'original'])];
    const blob=new Blob(['\ufeff'+rows.map(row=>row.map(safe).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`合拍練習紀錄-${new Date().toLocaleDateString('sv-SE')}.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>switchMode(el.dataset.mode)));
  document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();switchMode('rhythm');});
  function showSymbol(key){
    const entry=window.SRSymbols[key];if(!entry)return;
    if(running)stop('已停止；關閉解釋後可重新開始。');
    $('symbol-title').textContent=entry[0];$('symbol-description').textContent=entry[1];$('symbol-dialog').showModal();
  }
  function renderSymbols(){
    const x=exercise().expression;const keys=x?[...new Set([...x.marks.map(m=>m.text),...(x.symbols||[]).map(m=>m.key),...x.hairpins.map(h=>h.to>h.from?'crescendo':'diminuendo'),...(x.slurs?.length?['legato']:[]),...(x.staccato?.length?['staccato']:[])])]:[];
    $('symbol-buttons').hidden=!keys.length;
    $('symbol-buttons').innerHTML=keys.map(k=>'<button class="symbol-button" data-symbol="'+k+'" aria-label="解釋 '+esc(window.SRSymbols[k][0])+'">'+esc(window.SRSymbols[k][0].split(' · ')[0])+'</button>').join('');
  }
  $('symbol-buttons').addEventListener('click',e=>{const button=e.target.closest('[data-symbol]');if(button)showSymbol(button.dataset.symbol);});
  $('score').addEventListener('click',e=>{const mark=e.target.closest('[data-symbol]');if(mark)showSymbol(mark.dataset.symbol);});
  $('score').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const mark=e.target.closest('[data-symbol]');if(mark){e.preventDefault();showSymbol(mark.dataset.symbol);}}});
  $('symbol-close').addEventListener('click',()=>$('symbol-dialog').close());
  $('new-variation').addEventListener('click',()=>{variation=window.SRVariation(pool()[exIndex],++variationSeed);columnIndex=0;columnAnswer=false;streak=0;renderExercise();renderLadder();});
  $('expression-coach').addEventListener('change',()=>{$('expression-cue').textContent=$('expression-coach').checked?'':'';});
  for(const id of ['key-choice','texture-choice','style-choice','genre-choice'])$(id).addEventListener('change',()=>{
    selectedKey=$('key-choice').value;texture=$('texture-choice').value;style=$('style-choice').value;genre=$('genre-choice').value;arrangedCache=null;columnIndex=0;columnAnswer=false;streak=0;renderExercise();renderLadder();
  });
  $('meter').addEventListener('change',()=>{meterKey=$('meter').value;variation=null;exIndex=0;columnIndex=0;columnAnswer=false;streak=0;renderExercise();renderLadder();});
  $('grade').addEventListener('change',()=>{variation=null;grade=Number($('grade').value);meterOptions();exIndex=0;columnIndex=0;columnAnswer=false;streak=0;renderExercise();renderLadder();});
  $('next-exercise').addEventListener('click',()=>{variation=null;const items=pool();const candidates=items.map((base,i)=>({e:window.SRArrangement.apply(base,{key:selectedKey,texture,style,genre}),i})).filter(x=>x.i!==exIndex);candidates.sort((a,b)=>Number(practiced.has(a.e.id)||seen.has(a.e.id))-Number(practiced.has(b.e.id)||seen.has(b.e.id))||Number(viewed.has(a.e.id))-Number(viewed.has(b.e.id)));exIndex=candidates[0]?.i??0;columnIndex=0;columnAnswer=false;streak=0;renderExercise();renderLadder();notify('已換短譜。先預讀 20–30 秒，再開始。');});
  $('bpm-number').addEventListener('change',e=>setBpm(e.target.value));
  $('bpm-minus').addEventListener('click',()=>setBpm(bpm-2));$('bpm-plus').addEventListener('click',()=>setBpm(bpm+2));
  $('read-ahead-toggle').addEventListener('change',()=>{drawPreview($('score'),running?timeline.beat(ctx.currentTime-startTime):-1,$('read-ahead-toggle').checked);});
  $('guide').addEventListener('change',renderScore);$('note-labels').addEventListener('change',renderScore);
  $('start').addEventListener('click',()=>start(false));$('demo').addEventListener('click',()=>start(true));$('stop').addEventListener('click',()=>stop());
  $('tap-left').addEventListener('pointerdown',e=>{e.preventDefault();tap('left');});$('tap-right').addEventListener('pointerdown',e=>{e.preventDefault();tap('right');});
  for(const hand of ['left','right'])$('tap-'+hand).addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&!e.repeat){e.preventDefault();tap(hand);}});
  document.addEventListener('keydown',e=>{
    if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||$('help-dialog').open||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;
    if(e.code==='Space'&&e.target.tagName!=='BUTTON'){e.preventDefault();running?stop():start(false);}
    if(mode==='rhythm'&&(e.code==='KeyF'||e.code==='KeyJ')){e.preventDefault();tap(e.code==='KeyF'?'left':'right');}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){stop('已暫停離開頁面的播放；回來後重新開始。');notify('頁面已離開前景，播放停止；這一遍未儲存。');}});
  $('reveal-column').addEventListener('click',()=>{columnAnswer=!columnAnswer;renderColumn();});
  $('next-column').addEventListener('click',()=>{columnIndex++;columnAnswer=false;renderColumn();const b=attackColumns()[columnIndex];const wrapper=$('score-scroll');wrapper.scrollLeft=compactScore()?0:Math.max(0,window.SRNotation.beatX(b,meterInfo().length)*$('score').clientWidth/window.SRNotation.width-wrapper.clientWidth/2);});
  $('ladder-target').addEventListener('change',()=>{const v=Number($('ladder-target').value);target=clamp(Number.isFinite(v)?Math.round(v):80,30,160);$('ladder-target').value=target;streak=0;if(bpm>target)setBpm(target,false);renderLadder();});
  $('ladder-step').addEventListener('change',()=>{step=Number($('ladder-step').value);streak=0;renderLadder();});
  $('reset-ladder').addEventListener('click',()=>{streak=0;renderLadder();notify('本級進度已重設，已儲存的紀錄會保留。');});
  $('save-session').addEventListener('click',saveSession);$('discard-session').addEventListener('click',()=>{pending=null;renderPending();notify('已略過這一遍的紀錄。');});
  $('record-filter').addEventListener('change',renderRecords);$('export-records').addEventListener('click',exportRecords);
  $('records-list').addEventListener('click',e=>{const button=e.target.closest('[data-delete]');if(button&&confirm('刪除這一筆練習紀錄？')){records=records.filter(r=>r.id!==button.dataset.delete);persist();renderRecords();}});
  $('clear-records').addEventListener('click',()=>{if(confirm(`確定清除全部 ${records.length} 筆紀錄？此動作無法復原。`)){records=[];persist();renderRecords();notify('已清除全部練習紀錄。');}});
  const help=()=>{if(running)stop('已停止，方便閱讀使用說明。');$('help-dialog').showModal();};
  ['help-open','quick-help'].forEach(id=>$(id).addEventListener('click',help));
  ['help-close','help-ready'].forEach(id=>$(id).addEventListener('click',()=>$('help-dialog').close()));
  $('help-dialog').addEventListener('click',e=>{if(e.target===$('help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  window.matchMedia?.('(max-width: 620px)').addEventListener('change',()=>{if(mode!=='records'){renderScore();if(running){const beat=timeline.beat(ctx.currentTime-startTime);drawCursor($('score'),cursorBeat(beat),beat>=0&&($('guide').checked||mode==='vertical'));drawPreview($('score'),beat,$('read-ahead-toggle').checked);}}});
  meterOptions();switchMode('rhythm');
  if(!storageAvailable)notify('未能讀取本機紀錄。你仍可練習，並匯出 CSV 保留結果。');
})();
