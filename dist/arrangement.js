(() => {
  const letters='CDEFGAB',natural=[0,2,4,5,7,9,11];
  const specs={C:[0,false],G:[1,false],D:[2,false],A:[3,false],E:[4,false],F:[-1,false],Bb:[-2,false],Eb:[-3,false],Ab:[-4,false],Am:[0,true],Em:[1,true],Bm:[2,true],'F#m':[3,true],'C#m':[4,true],Dm:[-1,true],Gm:[-2,true],Cm:[-3,true],Fm:[-4,true]};
  const styles={original:'原譜',singing:'歌唱',light:'輕巧',bold:'雄健'};
  const textures={auto:'依程度',single:'單音',chords:'含和弦'};
  const allowed=grade=>['C','G','F','D','Am','Dm','Em','Gm',...(grade>=3?['A','Bb','Eb','Bm']:[]),...(grade>=5?['E','Ab','F#m','Cm']:[]),...(grade>=6?['C#m','Fm']:[])];
  function signature(key){const [count]=specs[key]||specs.C,map={};const order=count>=0?'FCGDAEB':'BEADGCF';for(const letter of order.slice(0,Math.abs(count)))map[letter]=count>=0?'#':'b';return map;}
  const label=key=>key.replace('m','').replace('#','♯').replace('b','♭')+(specs[key]?.[1]?' 小調':' 大調');
  const parse=p=>{const m=p.match(/^([A-G])([#b]*)(\d)$/);return {letter:letters.indexOf(m[1]),acc:[...m[2]].reduce((s,c)=>s+(c==='#'?1:-1),0),oct:Number(m[3])};};
  const midi=p=>{const n=parse(p);return (n.oct+1)*12+natural[n.letter]+n.acc;};
  const spell=(index,acc)=>letters[((index%7)+7)%7]+(acc>0?'#'.repeat(acc):'b'.repeat(-acc))+Math.floor(index/7);
  function inKey(index,key){const l=letters[((index%7)+7)%7],acc=signature(key)[l];return spell(index,acc==='#'?1:acc==='b'?-1:0);}
  function transpose(p,from,to){
    const a=parse(from.replace('m','')+'4'),b=parse(to.replace('m','')+'4'),n=parse(p);
    let delta=b.letter-a.letter;const semitones=midi(to.replace('m','')+'4')-midi(from.replace('m','')+'4');
    if(semitones>6)delta-=7;else if(semitones< -6)delta+=7;
    const expected=signature(from)[letters[n.letter]],alter=n.acc-(expected==='#'?1:expected==='b'?-1:0);
    const index=n.oct*7+n.letter+delta,base=parse(inKey(index,to));return spell(index,base.acc+alter);
  }
  function apply(source,{key='original',texture='auto',style='original',genre='original'}={}){
    const ex=genre==='original'?JSON.parse(JSON.stringify(source)):window.SRGenres.generate(source,genre),target=key==='original'?source.key:key;
    if(!specs[target])throw Error('Unsupported key '+target);
    for(const hand of ['right','left']){
      for(const event of ex.hands[hand])event.notes=event.notes.map(n=>transpose(genre==='jazz'&&specs[target][1]&&n.startsWith('Eb')?n.replace('Eb','E'):n,ex.key,target));
      const all=ex.hands[hand].flatMap(e=>e.notes).map(midi),min=hand==='right'?55:36,max=hand==='right'?88:67;
      let shift=0;if(Math.min(...all)<min&&Math.max(...all)+12<=max)shift=7;else if(Math.max(...all)>max&&Math.min(...all)-12>=min)shift=-7;
      if(shift)for(const event of ex.hands[hand])event.notes=event.notes.map(p=>{const n=parse(p);return spell(n.oct*7+n.letter+shift,n.acc);});
      for(const event of ex.hands[hand]){
        if(!event.notes.length)continue;
        event.notes.sort((a,b)=>midi(a)-midi(b));
        const melody=hand==='right'?event.notes.at(-1):event.notes[0];
        if(texture==='single'||ex.grade===2)event.notes=[melody];
        else if(texture==='chords'){
          if(genre!=='original'&&event.beat%window.SRMeter.info(ex).length!==0&&event!==ex.hands[hand].at(-1)){event.notes=[melody];continue;}
          // A third below the melody; root/fifth in the bass. At G3–4 only RH is doubled.
          const n=parse(melody),partner=inKey(n.oct*7+n.letter+(hand==='right'?-2:4),target);
          event.notes=hand==='left'&&ex.grade<5?[melody]:[melody,partner].sort((a,b)=>midi(a)-midi(b));
        }else event.notes=hand==='right'?event.notes.slice(-2):event.notes.slice(0,2);
      }
    }
    // Below G5 avoid a four-note texture, including sustained notes in the other hand.
    if(ex.grade<5)for(const e of ex.hands.left)if(e.notes.length>1&&ex.hands.right.some(r=>r.notes.length>1&&r.beat<e.beat+e.duration&&r.beat+r.duration>e.beat))e.notes=e.notes.slice(0,1);
    ex.key=target;
    const x=ex.expression,m=window.SRMeter.info(ex),right=ex.hands.right.filter(e=>e.notes.length);
    if(style!=='original'){
      x.slurs=[];x.staccato=[];delete x.accent;delete x.tenuto;x.symbols=(x.symbols||[]).filter(s=>!['accent','tenuto'].includes(s.key));
      if(style==='singing'){
        for(let bar=0;bar<ex.bars;bar++){const notes=right.filter(e=>Math.floor(e.beat/m.length)===bar);if(notes.length>1)x.slurs.push({start:notes[0].beat,end:notes.at(-1).beat});}
      }else if(style==='light'){x.staccato=right.filter(e=>!x.fermata||e.beat<x.fermata.start).map(e=>e.beat);delete x.pedals;x.symbols=x.symbols.filter(s=>!['pedal','release'].includes(s.key));}
      else{x.accent=Array.from({length:ex.bars},(_,b)=>right.find(e=>e.beat>=b*m.length&&e.beat<(b+1)*m.length)?.beat).filter(b=>b!==undefined);x.symbols.push(...x.accent.map(beat=>({beat,key:'accent',text:'>',y:49})));}
      const wording={singing:'旋律連貫，左手輕聲支持',light:'右手輕巧斷奏，拍子保持',bold:'突出每小節起點，避免搶拍'}[style];
      x.cues=[...x.marks.map(m=>({beat:m.beat,text:m.text})),...x.symbols.map(m=>({beat:m.beat,text:window.SRSymbols[m.key][0]})),...x.hairpins.map(h=>({beat:h.start,text:h.to>h.from?'漸強':'漸弱'}))];
      x.cues.push({beat:0,text:wording});x.cues.sort((a,b)=>a.beat-b.beat);ex.tip+=' '+wording+'。';
    }
    ex.arrangement={key:target,texture,style,genre};
    if(key!=='original'||texture!=='auto'||style!=='original'||genre!=='original')ex.id=source.id+'~'+target+'~'+texture+'~'+style+(genre==='original'?'':'~'+genre);
    return ex;
  }
  window.SRArrangement={allowed,signature,label,styles,textures,apply,midi,parse,specs};
})();
