/* Original, deliberately simplified coordination drills; not examination specimens. */
(() => {
  const b=(...events)=>events.map(e=>Array.isArray(e)?e:[1,e]);
  const line=bars=>{
    let beat=0;
    return bars.flatMap(bar=>bar.map(([duration,pitches])=>{
      const event={beat,duration,notes:pitches==='-'?[]:pitches.split(' ')};
      beat+=duration;return event;
    }));
  };
  const ex=(id,grade,focus,title,key,tip,preparation,right,left)=>({id,grade,focus,title,key,bars:4,meter:[4,4],tip,preparation,hands:{right:line(right),left:line(left)}});
  const RH='先輕拍節奏，再到鋼琴上演奏。右手 C4 是中央 C，左手在低一個八度。';
  window.SR_EXERCISES=[
    ex('r4a',4,'rhythm','同起，同落','C','每個起音兩手一起；先感受一個共同脈搏。',RH,
      [b('C4','D4','E4','G4'),b('F4','E4','D4','C4'),b('E4','F4','G4','E4'),b('D4','E4',[2,'C4'])],
      [b('C3','D3','E3','G3'),b('F3','E3','D3','C3'),b('E3','F3','G3','E3'),b('D3','E3',[2,'C3'])]),
    ex('r4b',4,'rhythm','長音裡的四拍','C','左手長音只在起音時拍；右手繼續，不要等左手。','先找出每小節的第 1、3 拍；留意長音期間另一手仍在移動。',
      [b('C4','D4','E4','G4'),b([2,'F4'],'E4','D4'),b('E4','G4',[2,'F4']),b('D4','E4',[2,'C4'])],
      [b([2,'C3'],[2,'G3']),b('F3','C3',[2,'G3']),b([2,'C3'],'F3','G3'),b([2,'G3'],[2,'C3'])]),
    ex('r5a',5,'rhythm','一拍，兩個小步','G','口數「1 & 2 &」；左手保持整拍，右手八分音符平均分配。','G 大調：所有 F 都是 F♯。先拍右手八分音符，再加入左手。',
      [b([.5,'G4'],[.5,'A4'],'B4','A4','G4'),b('D5',[.5,'C5'],[.5,'B4'],[2,'A4']),b([.5,'B4'],[.5,'C5'],[.5,'D5'],[.5,'B4'],'A4','F#4'),b('G4','A4',[2,'G4'])],
      [b('G3','D3',[2,'G3']),b([2,'D3'],'A3','D3'),b('G3','D3','D3','A3'),b([2,'D3'],[2,'G3'])]),
    ex('r5b',5,'rhythm','換手接力','C','換手時拍子不重來；同時起音的位置才一起拍。','觀察休止符。沒有音符的手先放鬆，數拍不要停。',
      [b('C4','-','E4','-'),b('-','F4','-','E4'),b('G4','-','E4','D4'),b('-','D4',[2,'C4'])],
      [b('-','C3','-','G3'),b('F3','-','G3','-'),b('-','C3','G3','-'),b('G3','-',[2,'C3'])]),
    ex('r6a',6,'rhythm','在半拍相遇','C','半拍後才起音的手不要搶先；用細分拍維持位置。','先口數 1 & 2 & 3 & 4 &。八分休止符代表等待半拍。',
      [b([.5,'-'],[.5,'C4'],'E4',[.5,'G4'],[.5,'E4'],'D4'),b('F4',[.5,'-'],[.5,'E4'],'D4','G4'),b([1.5,'E4'],[.5,'G4'],'F4','D4'),b([.5,'-'],[.5,'D4'],'E4',[2,'C4'])],
      [b('C3','G3',[2,'C3']),b([2,'F3'],'G3','D3'),b('C3','G3',[2,'G3']),b('G3','D3',[2,'C3'])]),
    ex('r6b',6,'rhythm','左手也會走小步','F','兩手輪流細分；避免右手一快，左手也跟著加速。','F 大調：B 為 B♭。逐小節找出八分音符在哪一隻手。',
      [b([2,'F4'],'A4','C5'),b('Bb4','A4',[2,'G4']),b([.5,'A4'],[.5,'G4'],'F4','E4','G4'),b('G4','E4',[2,'F4'])],
      [b([.5,'F3'],[.5,'C3'],'F3',[2,'C3']),b([2,'Bb2'],[.5,'C3'],[.5,'G3'],'C3'),b('F3','C3',[.5,'C3'],[.5,'G3'],'C3'),b([.5,'C3'],[.5,'G3'],'C3',[2,'F3'])]),
    ex('v4a',4,'vertical','一列，兩個落點','C','先說左手低音，再說右手音；兩手同時落鍵。','右手以中央 C 附近為中心；左手 C3、F3、G3 是主要低音。',
      [b([2,'C4'],[2,'E4']),b([2,'F4'],[2,'A4']),b([2,'G4'],[2,'D4']),b([2,'E4'],[2,'C4'])],
      [b([2,'C3'],[2,'G3']),b([2,'F3'],[2,'C3']),b([2,'G3'],[2,'G2']),b([2,'C3'],[2,'C3'])]),
    ex('v4b',4,'vertical','把音程看成形狀','C','右手兩個音視為一個形狀，和左手一起讀。','右手多為三度音程，可試用 1–3 指；先預備下一個形狀。',
      [b([2,'C4 E4'],[2,'D4 F4']),b([2,'E4 G4'],[2,'F4 A4']),b([2,'D4 G4'],[2,'B3 D4']),b([2,'C4 E4'],[2,'C4 E4'])],
      [b([2,'C3'],[2,'G3']),b([2,'C3'],[2,'F3']),b([2,'G3'],[2,'G2']),b([2,'C3'],[2,'C3'])]),
    ex('v5a',5,'vertical','三個音，一個動作','G','右手和弦不拆開讀；先找最低音，再認出整個形狀。','G 大調；右手和弦均在一個八度內。先無聲預備手形，再一起落鍵。',
      [b([2,'G4 B4 D5'],[2,'G4 B4 D5']),b([2,'G4 C5 E5'],[2,'G4 B4 D5']),b([2,'F#4 A4 D5'],[2,'F#4 A4 C5']),b([2,'G4 B4 D5'],[2,'G4 B4 D5'])],
      [b([2,'G3'],[2,'D3']),b([2,'C3'],[2,'G3']),b([2,'D3'],[2,'D3']),b([2,'G3'],[2,'G2'])]),
    ex('v5b',5,'vertical','有一隻手，繼續留住','Am','導線上的音不一定重新彈；分辨「起音」與「延續」。','A 小調，沒有調號。讀每一列時先問：哪隻手需要動？',
      [b([2,'A4 C5'],'B4','C5'),b('D5','C5',[2,'B4']),b([2,'G4 B4'],'A4','B4'),b([4,'A4 C5'])],
      [b([4,'A2']),b([2,'D3'],[2,'E3']),b([4,'E3']),b([2,'A2'],[2,'A3'])]),
    ex('v6a',6,'vertical','和弦轉位，一起換位','F','先看兩手的移動方向；不要彈完右手才找左手。','F 大調。右手三音和弦、左手單音；每次換位先看整列。',
      [b([2,'A4 C5 F5'],[2,'A4 C5 F5']),b([2,'Bb4 D5 F5'],[2,'A4 C5 F5']),b([2,'G4 C5 E5'],[2,'Bb4 C5 E5']),b([2,'A4 C5 F5'],[2,'F4 A4 C5'])],
      [b([2,'F3'],[2,'A3']),b([2,'Bb2'],[2,'C3']),b([2,'C3'],[2,'G3']),b([2,'F3'],[2,'F2'])]),
    ex('v6b',6,'vertical','上下都看見音程','C','先從最低音往上掃讀，但落鍵仍是同一刻。','雙手各有二至三個音。先預讀形狀，不急著增加速度。',
      [b([2,'E4 G4'],[2,'F4 A4']),b([2,'E4 G4 C5'],[2,'F4 A4 C5']),b([2,'D4 G4 B4'],[2,'F4 G4 B4']),b([2,'E4 G4 C5'],[2,'C4 E4 G4'])],
      [b([2,'C3 G3'],[2,'F2 C3']),b([2,'C3 E3'],[2,'F2 C3']),b([2,'G2 D3'],[2,'G2 D3']),b([2,'C3 G3'],[2,'C3 E3'])]),
    ex('s4a',4,'ladder','四小節的小散步','C','目光預先看下一拍；錯音後跟上拍子，不回頭補彈。','預讀右手旋律與左手第 1、3 拍低音。先用能連續彈完的速度。',
      [b('C4','D4','E4','G4'),b('A4','G4',[2,'F4']),b('E4','D4','G4','B3'),b('C4','E4',[2,'C4'])],
      [b([2,'C3'],[2,'G3']),b([2,'F3'],[2,'C3']),b([2,'G3'],[2,'G2']),b([2,'C3'],[2,'C3'])]),
    ex('s4b',4,'ladder','低音先找好位置','Am','把低音換位提早看見；保持同一拍的雙手一起落鍵。','A 小調。右手在 A3 至 E4 附近；左手預備 A2、D3、E3。',
      [b('A3','B3','C4','E4'),b([2,'D4'],'C4','B3'),b('E4','D4','B3','E4'),b('C4','B3',[2,'A3'])],
      [b([2,'A2'],[2,'E3']),b([2,'D3'],[2,'A2']),b([2,'E3'],[2,'E2']),b([2,'A2'],[2,'A2'])]),
    ex('s5a',5,'ladder','旋律走，低音穩','G','右手八分音符不要帶快左手；保持第 1、3 拍的共同落點。','G 大調，F 為 F♯。先默讀八分音符所在位置。',
      [b([.5,'G4'],[.5,'A4'],'B4','D5','B4'),b('C5',[.5,'B4'],[.5,'A4'],[2,'G4']),b('A4','F#4',[.5,'G4'],[.5,'A4'],'F#4'),b('G4','B4',[2,'G4'])],
      [b([2,'G3'],[2,'D3']),b([2,'C3'],[2,'G3']),b([2,'D3'],[2,'A3']),b([2,'G3'],[2,'G2'])]),
    ex('s5b',5,'ladder','讓左手流動起來','C','左手分解音繼續走，右手長音保持到足夠拍數。','每小節左手有四個均勻四分音符；先看它們的方向。',
      [b([2,'E4'],'G4','C5'),b('A4','G4',[2,'F4']),b([2,'D4'],'F4','B4'),b('G4','E4',[2,'C4'])],
      [b('C3','E3','G3','E3'),b('F2','A2','C3','A2'),b('G2','B2','D3','B2'),b('C3','G2',[2,'C3'])]),
    ex('s6a',6,'ladder','長短拍之間保持連續','F','附點四分音符等於一拍半；第二個音不要提早。','F 大調，留意 B♭。預讀附點節奏及左手低音位置。',
      [b([1.5,'F4'],[.5,'A4'],'C5','A4'),b('Bb4',[.5,'A4'],[.5,'G4'],[2,'F4']),b([1.5,'E4'],[.5,'G4'],'C5','Bb4'),b('A4','G4',[2,'F4'])],
      [b('F3','C3',[2,'F3']),b([2,'Bb2'],'F3','Bb2'),b('C3','G3',[2,'C3']),b('F3','C3',[2,'F3'])]),
    ex('s6b',6,'ladder','兩條線，一個脈搏','G','只加一小級速度；手形和節奏都穩定才繼續。','右手旋律、左手分解和弦。先預讀各小節起點，F 都是 F♯。',
      [b('G4',[.5,'A4'],[.5,'B4'],'D5','B4'),b([2,'C5'],'B4','G4'),b('A4',[.5,'G4'],[.5,'F#4'],'E4','F#4'),b('G4','B4',[2,'G4'])],
      [b('G2','B2','D3','B2'),b('C3','E3','G3','E3'),b('D3','F#3','A3','D3'),b('G2','D3',[2,'G3'])])
  ];

  // Same easy melody frees attention for expression; three tasks per selected grade.
  for(const grade of [4,5,6])for(let stage=0;stage<3;stage++){
    const item=JSON.parse(JSON.stringify(window.SR_EXERCISES.find(e=>e.id==='s4a')));
    item.id='x'+grade+['a','b','c'][stage];item.grade=grade;item.focus='expression';
    item.title=['先看見 p、mf、f','讓力度走出一條線','連與斷，都在譜裡'][stage];
    item.preparation='刻意使用簡單 C 大調旋律，把注意力留給表情記號。先不用踏板。';
    item.tip=['每小節換力度，節拍保持不變。','漸強漸弱透過後續起音改變；按住的長音不能靠加力變響。','弧線與斷奏點只標右手；左手保持原時值。'][stage];
    item.expression=[
      {marks:[{beat:0,text:'p',level:.5},{beat:4,text:'mf',level:.8},{beat:8,text:'f',level:1.15},{beat:12,text:'p',level:.5}],hairpins:[],route:'第 1 小節 p → 第 2 小節 mf → 第 3 小節 f → 第 4 小節 p。換力度時不改速度。',cues:[{beat:0,text:'p：輕聲開始'},{beat:4,text:'mf：中強'},{beat:8,text:'f：強，但不要敲擊'},{beat:12,text:'p：回到輕聲'}]},
      {marks:[{beat:0,text:'p',level:.5},{beat:8,text:'mf',level:.8},{beat:15,text:'p',level:.5}],hairpins:[{start:4,end:8,from:.5,to:.8},{start:12,end:15,from:.8,to:.5}],route:'第 1 小節 p；第 2 小節漸強，第 3 小節到 mf；第 4 小節漸弱，最後一個起音到 p。',cues:[{beat:0,text:'p：輕聲開始'},{beat:4,text:'漸強：逐步走向 mf'},{beat:8,text:'到達 mf，保持'},{beat:12,text:'漸弱：最後回到 p'}]},
      {marks:[{beat:0,text:'p',level:.5},{beat:8,text:'mf',level:.8},{beat:12,text:'p',level:.5}],hairpins:[],slurs:[{start:0,end:3},{start:4,end:6},{start:12,end:14}],staccato:[8,9,10,11],route:'第 1、2 小節右手連奏、p；第 3 小節右手斷奏、mf；第 4 小節回到連奏、p。左手維持原時值。',cues:[{beat:0,text:'p：右手連奏'},{beat:8,text:'mf：右手改為斷奏'},{beat:12,text:'p：右手回到連奏'}]}
    ][stage];
    // Put the final dynamic on the actual final attack, not during a held note.
    if(stage===1){item.expression.marks[2].beat=14;item.expression.hairpins[1].end=14;}
    window.SR_EXERCISES.push(item);
  }
  // Bounded permutations preserve rhythm, hand ranges, chord shapes and final cadence.
  const clone=value=>JSON.parse(JSON.stringify(value));
  function vary(source,seed){
    const item=clone(source);
    for(const hand of ['right','left'])for(let bar=0;bar<3;bar++){
      if(hand==='left'&&seed%2===0)continue;
      const events=item.hands[hand].filter(e=>Math.floor(e.beat/4)===bar&&e.notes.length);
      // Keep the first attack as the harmonic anchor. Permute only equal-size shapes.
      const groups=new Map();
      for(const e of events.slice(1)){const n=e.notes.length;if(!groups.has(n))groups.set(n,[]);groups.get(n).push(e);}
      for(const group of groups.values()){
        const notes=group.map(e=>e.notes);
        const offset=1+(seed+bar)%Math.max(1,group.length-1);
        group.forEach((e,i)=>e.notes=clone(notes[(i+offset)%group.length]));
      }
    }
    // Whole-bar exchanges keep both hands aligned; final tonic bar stays fixed.
    if(seed>=2){const order=seed%2?[1,0,2,3]:[0,2,1,3];for(const hand of ['right','left']){
      const old=clone(item.hands[hand]);item.hands[hand]=order.flatMap((bar,i)=>old.filter(e=>Math.floor(e.beat/4)===bar).map(e=>({...e,beat:e.beat%4+i*4})));
    }}
    // Selected repeated attacks vary coordination without expanding hand span.
    let slot=0;
    for(const hand of ['right','left']){
      item.hands[hand]=item.hands[hand].flatMap(e=>{
        if(e.beat>=12||e.beat%4!==0)return [e];
        const selected=((seed+1)>>(slot++))&1;
        if(!selected||e.duration<1||!e.notes.length)return [e];
        const duration=e.duration/2;
        if(![.5,1,1.5,2].includes(duration))return [e];
        return [{...e,duration},{...e,notes:[...e.notes],beat:e.beat+duration,duration}];
      });
    }
    return item;
  }
  const originals=window.SR_EXERCISES.slice();
  for(const grade of [4,5,6])for(const focus of ['rhythm','vertical','ladder']){
    const bases=originals.filter(e=>e.grade===grade&&e.focus===focus);
    for(let i=0;i<10;i++){
      const item=vary(bases[i%2],Math.floor(i/2));item.id=bases[i%2].id+'-study-'+i;
      item.title=bases[i%2].title+' · '+['旋律轉向','低音回應','樂句交換','雙手換位','形狀重組'][Math.floor(i/2)];
      item.preparation='先看兩手起音及換位；四小節，保持原有調性。';window.SR_EXERCISES.push(item);
    }
  }
  const dynamicLevels={pp:.32,p:.5,mp:.65,mf:.8,f:1.15,ff:1.35};
  const routes=[['pp','p','mp','pp'],['mp','mf','f','mp'],['mf','f','ff','mf'],['f','p','f','p'],['pp','mp','mf','p'],['mf','mp','p','pp'],['p','mf','p','mf'],['mp','f','mf','p'],['p','mp','f','pp']];
  for(const grade of [4,5,6])for(let i=0;i<9;i++){
    const item=vary(originals.find(e=>e.id==='s4a'),i);item.grade=grade;item.focus='expression';item.id='x'+grade+'-study-'+i;
    const texts=routes[i],marks=texts.map((text,j)=>({beat:j*4,text,level:dynamicLevels[text]}));
    item.title=['極弱到中弱','中弱到強','中強到極強','強弱對比','逐步漸強','逐步漸弱','連奏中的力度','斷奏中的力度','連斷與強弱'][i];
    item.expression={marks,hairpins:[],slurs:[],staccato:[],route:texts.join(' → '),cues:marks.map(m=>({beat:m.beat,text:m.text}))};
    if(i===4||i===5){item.expression.hairpins=[{start:0,end:4,from:marks[0].level,to:marks[1].level},{start:4,end:8,from:marks[1].level,to:marks[2].level}];item.expression.route+='；前兩小節逐步改變力度。';}
    if(i===6||i===8)item.expression.slurs=[{start:0,end:3},{start:4,end:6},{start:12,end:14}];
    if(i===7||i===8)item.expression.staccato=item.hands.right.filter(e=>e.beat>=8&&e.beat<12).map(e=>e.beat);
    item.preparation='先找起始力度、變化及連斷奏；點擊記號可查看解釋。';item.tip='力度改變時保持拍速，先不用踏板。';window.SR_EXERCISES.push(item);
  }
  // Basic dynamics remain visible in every practice mode.
  for(const item of window.SR_EXERCISES){
    if(item.expression)continue;
    const marks=[{beat:0,text:'p',level:.5},{beat:8,text:'mf',level:.8},{beat:12,text:'p',level:.5}];
    item.expression={marks,hairpins:[],slurs:[],staccato:[],route:'p → mf → p',cues:marks.map(m=>({beat:m.beat,text:m.text}))};
  }
  window.SRVariation=(source,seed)=>{const item=vary(source,seed);item.id=source.id+'-variation-'+seed;item.title=source.title+' · 變奏';return item;};
  window.SRSymbols={
    pp:['pp · 極弱','比 p 更輕，保持音色清楚；不要因為輕聲而放慢。'],p:['p · 弱','輕聲演奏，保持拍子與旋律線。'],mp:['mp · 中弱','比 p 稍強、比 mf 輕。力度是相對的。'],mf:['mf · 中強','自然、有支撐的聲音，不必用力敲擊。'],f:['f · 強','飽滿有力，同時保持放鬆和音色。'],ff:['ff · 極強','比 f 更強；保持手臂放鬆，避免僵硬敲擊。'],crescendo:['〈 · 漸強','隨後續起音逐步增加力度，速度保持不變。鋼琴長音按下後不能再加力變響。'],diminuendo:['〉 · 漸弱','隨後續起音逐步減輕力度，仍數足每一拍。'],legato:['⌒ · 連奏線','線內的不同音高要連貫，留意樂句呼吸；這不是延長同一音的連結線。'],staccato:['· · 斷奏','音符要短而輕巧；提早放鍵後仍要等到下一個起音位置。']
  };
  Object.assign(window.SRSymbols,{
    'cresc.':['cresc. · 漸強','crescendo 的常用縮寫（有時寫作 cresc 或 cres.）：逐步增加力度，不是加速。與張開的楔形記號意思相同。'],
    'dim.':['dim. · 漸弱','diminuendo：逐步減輕力度，不是減慢。與收窄的楔形記號意思相同。'],
    accent:['> · 重音','突出這個音的起音，隨後回到原本力度；不要把重音彈成提早或延長。此處標在右手音符上。'],
    tenuto:['— · 保持音值','tenuto：充分保持音值，視樂句略加分量，不等於延長拍數。此處標在右手音符上。'],
    fermata:['𝄐 · 延長記號','fermata：將音或休止延長，長度依樂句決定，沒有固定倍數。本練習示範把末音延長為原時值的 1.5 倍；延長期間不再發出節拍聲。'],
    'rit.':['rit. · 漸慢','ritardando：逐步減慢。這裡用於結尾，示範把最後一小節逐步放慢；減慢幅度並非考試指定數值。'],
    'rall.':['rall. · 漸慢','rallentando：逐步放慢，常有舒展、收束感。實際處理依樂句；這裡示範結尾漸慢。'],
    pedal:['Ped. · 右踏板','踩下右邊延音踏板，讓已放鍵的音繼續共鳴；到星號處放開。聽和聲是否混濁，再調整換踏板時間。合成琴音只近似示範延音。'],
    release:['✱ · 放開踏板','放開右踏板，停止未按住琴鍵的延音。這套短譜採用 Ped. 與星號標示踏板範圍。']
  });
  for(const grade of [4,5,6]){
    const kinds=['cresc.','dim.','accent','tenuto','fermata',...(grade>=5?['rit.','rall.']:[]),...(grade>=6?['pedal']:[])];
    for(const kind of kinds){
      const item=clone(window.SR_EXERCISES.find(e=>e.id==='s4a'));item.id='expression-g'+grade+'-'+kind.replace('.','');item.grade=grade;item.focus='expression';
      item.title=window.SRSymbols[kind][0];item.preparation='先找 '+item.title+'；點擊譜上的記號可查看解釋。';item.tip='先聽示範，再自行練習；保持雙手協調。';
      const x=item.expression={marks:[{beat:0,text:'p',level:.5}],hairpins:[],slurs:[],staccato:[],symbols:[],cues:[{beat:0,text:'p：輕聲開始'}]};
      if(kind==='cresc.'||kind==='dim.'){
        const up=kind==='cresc.';x.marks[0]={beat:0,text:up?'p':'f',level:up?.5:1.15};x.marks.push({beat:8,text:up?'f':'p',level:up?1.15:.5});
        x.hairpins=[{start:4,end:8,from:up?.5:1.15,to:up?1.15:.5,textOnly:true}];x.symbols=[{beat:4,key:kind,text:kind,y:181}];
      }else if(kind==='accent'||kind==='tenuto'){
        x[kind]=[0,4,8,12];x.symbols=x[kind].map(beat=>({beat,key:kind,text:kind==='accent'?'>':'—',y:49}));
      }else if(kind==='fermata'){
        x.fermata={start:14,end:16,factor:1.5};x.symbols=[{beat:14,key:kind,text:'𝄐',y:49}];
      }else if(kind==='rit.'||kind==='rall.'){
        x.slowing={start:12,end:16};x.symbols=[{beat:12,key:kind,text:kind,y:49}];
      }else{
        x.pedals=[{start:0,end:3.75},{start:4,end:7.75},{start:8,end:11.75},{start:12,end:15.75}];
        x.symbols=x.pedals.flatMap(p=>[{beat:p.start,key:'pedal',text:'Ped.',y:286},{beat:p.end,key:'release',text:'✱',y:286}]);
      }
      for(const mark of x.symbols)x.cues.push({beat:Math.floor(mark.beat),text:window.SRSymbols[mark.key][0]});x.cues.sort((a,b)=>a.beat-b.beat);
      window.SR_EXERCISES.push(item);
    }
  }
  // Reuse the expression curriculum on coordination studies without changing notes.
  for(const grade of [4,5,6])for(const focus of ['rhythm','vertical','ladder']){
    const templates=window.SR_EXERCISES.filter(e=>e.grade===grade&&e.focus==='expression'&&e.id.startsWith('expression-g'));
    const studies=window.SR_EXERCISES.filter(e=>e.grade===grade&&e.focus===focus);
    studies.forEach((item,index)=>{
      const template=templates[index%templates.length],x=item.expression=clone(template.expression);
      for(const kind of ['accent','tenuto'])if(x[kind]){
        x[kind]=[0,4,8,12].map(bar=>item.hands.right.find(e=>e.beat>=bar&&e.beat<bar+4&&e.notes.length)?.beat).filter(b=>b!==undefined);
        x.symbols=x[kind].map(beat=>({beat,key:kind,text:kind==='accent'?'>':'—',y:49}));
      }
      if(x.fermata){
        const finalRight=item.hands.right.at(-1),finalLeft=item.hands.left.at(-1);
        x.fermata.start=Math.max(finalRight.beat,finalLeft.beat);
        x.symbols=[{beat:finalRight.beat,key:'fermata',text:'𝄐',y:49}];
      }
      if(x.pedals){
        const starts=item.hands.left.filter(e=>e.notes.length).map(e=>e.beat);
        x.pedals=starts.map((start,i)=>({start,end:(starts[i+1]??16)-.125}));
        x.symbols=x.pedals.flatMap(p=>[{beat:p.start,key:'pedal',text:'Ped.',y:286},{beat:p.end,key:'release',text:'✱',y:286}]);
      }
      x.cues=[...x.marks.map(m=>({beat:m.beat,text:m.text})),...x.symbols.map(m=>({beat:Math.floor(m.beat),text:window.SRSymbols[m.key][0]}))].sort((a,b)=>a.beat-b.beat);
      item.tip+=' 本譜表情：'+template.title+'，點擊記號可查看解釋。';
    });
  }
  // One timeline drives notes, cursor, preview and tap scoring together.
  window.SRTiming=(ex,bpm)=>{
    const x=ex.expression||{},base=60/bpm,times=[0];
    for(let i=0;i<32;i++){
      const beat=i/2,slow=x.slowing&&beat>=x.slowing.start?1+.5*(beat+.25-x.slowing.start)/(x.slowing.end-x.slowing.start):1;
      const hold=x.fermata&&beat>=x.fermata.start&&beat<x.fermata.end?x.fermata.factor:1;
      times.push(times.at(-1)+base*.5*slow*hold);
    }
    const time=beat=>{if(beat<0)return beat*base;if(beat>=16)return times[32]+(beat-16)*base;const i=Math.floor(beat*2);return times[i]+(times[i+1]-times[i])*(beat*2-i);};
    const beat=seconds=>{if(seconds<0)return seconds/base;if(seconds>=times[32])return 16;let i=0;while(times[i+1]<=seconds)i++;return (i+(seconds-times[i])/(times[i+1]-times[i]))/2;};
    return {time,beat,duration:times[32]};
  };
  window.SRExpression={
    level(ex,beat,hand){
      const x=ex.expression;if(!x)return 1;
      const ramp=x.hairpins.find(h=>beat>=h.start&&beat<=h.end);
      if(ramp)return (ramp.from+(ramp.to-ramp.from)*(beat-ramp.start)/(ramp.end-ramp.start))*(hand==='right'&&x.accent?.includes(beat)?1.3:1);
      return (x.marks.filter(m=>m.beat<=beat).at(-1)?.level??1)*(hand==='right'&&x.accent?.includes(beat)?1.3:1);
    },
    length(ex,hand,beat){if(hand==='right'&&ex.expression?.tenuto?.includes(beat))return 1;return hand==='right'&&ex.expression?.staccato?.includes(beat)? .42 : ex.expression?.slurs?.some(s=>hand==='right'&&beat>=s.start&&beat<s.end)?1:.92;}
  };
  window.validateExercises=()=>{
    const errors=[],ids=new Set();
    for(const item of window.SR_EXERCISES){
      if(ids.has(item.id))errors.push(`${item.id}: duplicate ID`);ids.add(item.id);
      for(const hand of ['right','left']){
        let cursor=0;
        for(const event of item.hands[hand]){
          if(event.beat!==cursor)errors.push(`${item.id}/${hand}: gap at ${cursor}`);
          if(![.5,1,1.5,2,3,4].includes(event.duration))errors.push(`${item.id}: unsupported duration`);
          if(Math.floor(event.beat/4)!==Math.floor((event.beat+event.duration-.001)/4))errors.push(`${item.id}: bar crossing`);
          if(event.notes.some(n=>!/^([A-G])([#b]?)[2-5]$/.test(n)))errors.push(`${item.id}: invalid pitch`);
          cursor+=event.duration;
        }
        if(cursor!==16)errors.push(`${item.id}/${hand}: total ${cursor}`);
      }
    }
    return errors;
  };
})();
