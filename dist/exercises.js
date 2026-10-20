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
  window.SRExpression={
    level(ex,beat){
      const x=ex.expression;if(!x)return 1;
      const ramp=x.hairpins.find(h=>beat>=h.start&&beat<=h.end);
      if(ramp)return ramp.from+(ramp.to-ramp.from)*(beat-ramp.start)/(ramp.end-ramp.start);
      return x.marks.filter(m=>m.beat<=beat).at(-1)?.level??1;
    },
    length(ex,hand,beat){return hand==='right'&&ex.expression?.staccato?.includes(beat)? .42 : ex.expression?.slurs?.some(s=>hand==='right'&&beat>=s.start&&beat<s.end)?1:.92;}
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
